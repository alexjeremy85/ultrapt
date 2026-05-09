import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Use service_role para bypassar RLS no webhook
function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

type AsaasEvent = {
  event: string;
  payment?: {
    id: string;
    customer: string;
    subscription?: string;
    status: string;
    value: number;
    externalReference?: string;
  };
  subscription?: {
    id: string;
    customer: string;
    status: string;
    externalReference?: string;
  };
};

export async function POST(request: Request) {
  // Token obrigatorio. Fail-closed se a env nao estiver configurada
  // (impede bypass por config drift).
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expected) {
    console.error("[asaas-webhook] ASAAS_WEBHOOK_TOKEN nao configurado");
    return NextResponse.json(
      { error: "server misconfigured" },
      { status: 500 }
    );
  }
  const got = request.headers.get("asaas-access-token");
  if (got !== expected) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  let body: AsaasEvent;
  try {
    body = (await request.json()) as AsaasEvent;
  } catch (e) {
    console.error("[asaas-webhook] invalid json", { err: (e as Error).message });
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  console.log("[asaas-webhook] received", {
    event: body.event,
    paymentId: body.payment?.id,
    paymentStatus: body.payment?.status,
    subscriptionId: body.subscription?.id,
  });

  const supabase = adminClient();

  // Log bruto
  const { error: rawLogErr } = await supabase
    .from("billing_events")
    .insert({
      event_type: body.event,
      payload: body,
      processed: false,
    });
  if (rawLogErr) {
    console.error("[asaas-webhook] billing_events insert failed", {
      event: body.event,
      code: rawLogErr.code,
      message: rawLogErr.message,
    });
  }

  // Defense-in-depth: pra eventos que ELEVAM status (active), exigimos
  // externalReference. Se rolasse vazamento do ASAAS_WEBHOOK_TOKEN, atacante
  // ainda precisaria do trainer.id (UUID) pra forjar ativacao. Customer
  // fallback fica apenas pra eventos de queda de status (atraso/cancelamento)
  // onde forjar nao da vantagem ao atacante (e ate prejudicaria ele).
  const ref =
    body.payment?.externalReference || body.subscription?.externalReference;
  const customer = body.payment?.customer || body.subscription?.customer;

  const elevatingEvents = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);
  const isElevating = elevatingEvents.has(body.event);

  let trainerId: string | null = null;
  if (ref) {
    // Sanidade extra: ref tem que ser UUID (trainer.id). Bloqueia injecao de
    // string aleatoria no campo externalReference.
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(ref)) {
      trainerId = ref;
    } else {
      console.warn("[asaas-webhook] externalReference invalid format", {
        event: body.event,
        ref,
      });
    }
  }

  if (!trainerId && !isElevating && customer) {
    // Customer lookup APENAS pra eventos nao-elevatorios.
    const { data, error: lookupErr } = await supabase
      .from("trainers")
      .select("id")
      .eq("asaas_customer_id", customer)
      .maybeSingle();
    if (lookupErr) {
      console.error("[asaas-webhook] trainer lookup failed", {
        customer,
        code: lookupErr.code,
        message: lookupErr.message,
      });
    }
    trainerId = data?.id ?? null;
  }

  if (!trainerId) {
    console.warn("[asaas-webhook] no trainer matched (or elevation without ref)", {
      event: body.event,
      isElevating,
      hasRef: Boolean(ref),
      hasCustomer: Boolean(customer),
    });
    return NextResponse.json({ ok: true, note: "no trainer" });
  }

  let newStatus: string | null = null;
  switch (body.event) {
    case "PAYMENT_CONFIRMED":
    case "PAYMENT_RECEIVED":
      newStatus = "active";
      break;
    case "PAYMENT_OVERDUE":
      newStatus = "past_due";
      break;
    case "SUBSCRIPTION_DELETED":
    case "PAYMENT_DELETED":
      newStatus = "canceled";
      break;
    case "SUBSCRIPTION_INACTIVATED":
      newStatus = "trial_expired";
      break;
  }

  if (newStatus) {
    const { error: updErr } = await supabase
      .from("trainers")
      .update({ subscription_status: newStatus })
      .eq("id", trainerId);
    if (updErr) {
      console.error("[asaas-webhook] trainer status update failed", {
        trainerId,
        newStatus,
        event: body.event,
        code: updErr.code,
        message: updErr.message,
      });
    } else {
      console.log("[asaas-webhook] trainer status updated", {
        trainerId,
        newStatus,
        event: body.event,
      });
    }
  }

  await supabase
    .from("billing_events")
    .update({ processed: true })
    .eq("event_type", body.event)
    .eq("payload->payment->>id", body.payment?.id ?? "");

  return NextResponse.json({ ok: true });
}

// Asaas as vezes envia GET de validacao
export async function GET() {
  return NextResponse.json({ ok: true });
}
