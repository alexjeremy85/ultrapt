/**
 * Cliente Asaas (server-side apenas).
 * Usa fetch com chave de API. NUNCA importar no browser.
 */

const SANDBOX_BASE = "https://api-sandbox.asaas.com/v3";
const PROD_BASE = "https://api.asaas.com/v3";

function baseUrl() {
  return process.env.ASAAS_ENV === "production" ? PROD_BASE : SANDBOX_BASE;
}

function apiKey() {
  const k = process.env.ASAAS_API_KEY;
  if (!k) throw new Error("ASAAS_API_KEY nao definida");
  return k;
}

async function asaasFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey(),
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }
  if (!res.ok) {
    const msg =
      (json as { errors?: Array<{ description: string }> })?.errors?.[0]
        ?.description ||
      (json as { message?: string })?.message ||
      `Asaas error ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}

// ----- Tipos -----
export type AsaasCustomer = {
  id: string;
  name: string;
  email: string | null;
  cpfCnpj: string | null;
};

export type AsaasSubscription = {
  id: string;
  customer: string;
  value: number;
  cycle: string;
  status: string;
  nextDueDate: string;
};

export type AsaasPayment = {
  id: string;
  customer: string;
  value: number;
  status: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixCopyAndPaste?: string;
  pixQrCodeImage?: string;
};

// ----- Customers -----
export async function asaasCreateCustomer(input: {
  name: string;
  email?: string;
  cpfCnpj: string;
  mobilePhone?: string;
}): Promise<AsaasCustomer> {
  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function asaasFindCustomerByCpf(
  cpfCnpj: string
): Promise<AsaasCustomer | null> {
  const res = await asaasFetch<{ data: AsaasCustomer[] }>(
    `/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}`
  );
  return res.data[0] ?? null;
}

// ----- Subscriptions -----
export async function asaasCreateSubscription(input: {
  customer: string;
  billingType: "PIX" | "CREDIT_CARD" | "BOLETO" | "UNDEFINED";
  value: number;
  nextDueDate: string;
  cycle: "MONTHLY" | "QUARTERLY" | "YEARLY";
  description?: string;
  externalReference?: string;
}): Promise<AsaasSubscription> {
  return asaasFetch<AsaasSubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function asaasGetSubscription(
  id: string
): Promise<AsaasSubscription> {
  return asaasFetch<AsaasSubscription>(`/subscriptions/${id}`);
}

export async function asaasCancelSubscription(id: string): Promise<unknown> {
  return asaasFetch(`/subscriptions/${id}`, { method: "DELETE" });
}

// ----- Payments -----
export async function asaasCreatePayment(input: {
  customer: string;
  billingType: "PIX" | "CREDIT_CARD" | "BOLETO";
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
}): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function asaasGetPaymentPixQr(
  paymentId: string
): Promise<{ encodedImage: string; payload: string; expirationDate: string }> {
  return asaasFetch(`/payments/${paymentId}/pixQrCode`);
}

/**
 * Lista os pagamentos de uma assinatura.
 * Apos criar a subscription, usamos isso pra pegar o invoiceUrl da
 * primeira cobranca e mandar o usuario direto pro checkout hospedado
 * (onde ele escolhe Pix ou Cartao).
 */
export async function asaasListSubscriptionPayments(
  subscriptionId: string
): Promise<{ data: AsaasPayment[] }> {
  return asaasFetch<{ data: AsaasPayment[] }>(
    `/subscriptions/${subscriptionId}/payments`
  );
}
