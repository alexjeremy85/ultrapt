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
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const supabase = adminClient();

  // Log bruto
  await supabase.from("billing_events").insert({
    event_type: body.event,
    payload: body,
    processed: false,
  });

  // Resolve trainer pelo externalReference (preferido) ou customer
  const ref =
    body.payment?.externalReference || body.subscription?.externalReference;
  const customer = body.payment?.customer || body.subscription?.customer;

  let trainerId: string | null = null;
  if (ref) {
    trainerId = ref;
  } else if (customer) {
    const { data } = await supabase
      .from("trainers")
      .select("id")
      .eq("asaas_customer_id", customer)
      .maybeSingle();
    trainerId = data?.id ?? null;
  }

  if (!trainerId) {
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
    await supabase
      .from("trainers")
      .update({ subscription_status: newStatus })
      .eq("id", trainerId);
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
