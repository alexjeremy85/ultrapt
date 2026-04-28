/**
 * Validacao de voucher (server-side, usa service_role).
 */

import { createAdminClient } from "@/lib/supabase/admin";

export type VoucherType = "fixed_price" | "percent" | "fixed_discount";

export type Voucher = {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  max_uses: number | null;
  uses_count: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  description: string | null;
};

export type VoucherValidation =
  | { ok: true; voucher: Voucher; finalPrice: number; discount: number }
  | { ok: false; reason: string };

export async function validateVoucher(
  code: string,
  basePrice: number
): Promise<VoucherValidation> {
  const supabase = createAdminClient();
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return { ok: false, reason: "Codigo vazio" };

  const { data, error } = await supabase
    .from("vouchers")
    .select("*")
    .ilike("code", cleanCode)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, reason: "Cupom nao encontrado" };
  }

  const v = data as Voucher;

  if (!v.active) return { ok: false, reason: "Cupom inativo" };

  const now = new Date();
  if (v.valid_from && new Date(v.valid_from) > now) {
    return { ok: false, reason: "Cupom ainda nao esta valido" };
  }
  if (v.valid_until && new Date(v.valid_until) < now) {
    return { ok: false, reason: "Cupom expirado" };
  }
  if (v.max_uses !== null && v.uses_count >= v.max_uses) {
    return { ok: false, reason: "Cupom atingiu limite de usos" };
  }

  let finalPrice = basePrice;
  if (v.type === "fixed_price") {
    finalPrice = Number(v.value);
  } else if (v.type === "percent") {
    finalPrice = Math.max(0, basePrice * (1 - Number(v.value) / 100));
  } else if (v.type === "fixed_discount") {
    finalPrice = Math.max(0, basePrice - Number(v.value));
  }

  finalPrice = Math.round(finalPrice * 100) / 100;

  return {
    ok: true,
    voucher: v,
    finalPrice,
    discount: Math.round((basePrice - finalPrice) * 100) / 100,
  };
}

export async function incrementVoucherUse(voucherId: string): Promise<void> {
  const supabase = createAdminClient();
  // RPC seria mais seguro pra concorrencia, mas para volume baixo basta.
  const { data: current } = await supabase
    .from("vouchers")
    .select("uses_count")
    .eq("id", voucherId)
    .maybeSingle();
  if (!current) return;
  await supabase
    .from("vouchers")
    .update({ uses_count: (current as { uses_count: number }).uses_count + 1 })
    .eq("id", voucherId);
}
