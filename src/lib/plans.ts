export type PlanId = "starter" | "pro" | "scale";

export const PLANS: Record<
  PlanId,
  {
    id: PlanId;
    name: string;
    price: number;
    studentLimit: number | null;
    descKey: string;
  }
> = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 59,
    studentLimit: 10,
    descKey: "Billing.plan_starter_desc",
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 119,
    studentLimit: 50,
    descKey: "Billing.plan_pro_desc",
  },
  scale: {
    id: "scale",
    name: "Scale",
    price: 179,
    studentLimit: null,
    descKey: "Billing.plan_scale_desc",
  },
};
