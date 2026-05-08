import { PLANS, type PlanId } from "@/lib/plans";

export type StudentLimitStatus = {
  planId: PlanId;
  studentCount: number;
  studentLimit: number | null;
  atLimit: boolean;
  exceeded: boolean;
};

/**
 * Calcula se o trainer atingiu o limite de alunos do plano.
 * Plano Escala (sem limite) sempre retorna atLimit=false.
 */
export function computeStudentLimit(
  planId: PlanId,
  studentCount: number
): StudentLimitStatus {
  const plan = PLANS[planId] ?? PLANS.free;
  const limit = plan.studentLimit;
  if (limit === null) {
    return {
      planId,
      studentCount,
      studentLimit: null,
      atLimit: false,
      exceeded: false,
    };
  }
  return {
    planId,
    studentCount,
    studentLimit: limit,
    atLimit: studentCount >= limit,
    exceeded: studentCount > limit,
  };
}
