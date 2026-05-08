export type PlanId = "free" | "solo" | "pro" | "escala";
export type Cycle = "monthly" | "annual";

export type PlanPrices = {
  monthly: number;
  monthlyPioneiro: number;
  annual: number;
  annualPioneiro: number;
};

export type Plan = {
  id: PlanId;
  name: string;
  studentLimit: number | null;
  desc: string;
  prices: PlanPrices | null;
};

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    studentLimit: 2,
    desc: "Pra começar com até 2 alunos. Sem cartão, sem prazo.",
    prices: null,
  },
  solo: {
    id: "solo",
    name: "Solo",
    studentLimit: 5,
    desc: "Pra atender em academia ou começar online.",
    prices: {
      monthly: 39,
      monthlyPioneiro: 19,
      annual: 279,
      annualPioneiro: 149,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    studentLimit: 30,
    desc: "Pra quem está crescendo a consultoria online.",
    prices: {
      monthly: 79,
      monthlyPioneiro: 39,
      annual: 559,
      annualPioneiro: 299,
    },
  },
  escala: {
    id: "escala",
    name: "Escala",
    studentLimit: null,
    desc: "Alunos ilimitados pra quem fechou.",
    prices: {
      monthly: 99,
      monthlyPioneiro: 49,
      annual: 699,
      annualPioneiro: 379,
    },
  },
};

export const PIONEIRO_VAGAS_POR_PLANO = 10;

export const PAID_PLAN_ORDER: Exclude<PlanId, "free">[] = ["solo", "pro", "escala"];

export function priceFor(planId: PlanId, cycle: Cycle, isPioneiro: boolean): number {
  const plan = PLANS[planId];
  if (!plan.prices) return 0;
  if (cycle === "monthly") {
    return isPioneiro ? plan.prices.monthlyPioneiro : plan.prices.monthly;
  }
  return isPioneiro ? plan.prices.annualPioneiro : plan.prices.annual;
}

export function discountPctFromPioneiro(planId: PlanId, cycle: Cycle): number {
  const plan = PLANS[planId];
  if (!plan.prices) return 0;
  const cheio = cycle === "monthly" ? plan.prices.monthly : plan.prices.annual;
  const pio = cycle === "monthly" ? plan.prices.monthlyPioneiro : plan.prices.annualPioneiro;
  if (!cheio) return 0;
  return Math.round(((cheio - pio) / cheio) * 100);
}
