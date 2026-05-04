"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { deleteAssessment } from "./actions";

export function DeleteAssessmentButton({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Excluir esta avaliação?")) return;
    startTransition(async () => {
      const res = await deleteAssessment(assessmentId);
      if (res.ok) router.refresh();
      else alert(res.error);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="btn-ghost text-xs text-danger"
    >
      {pending ? "..." : "Excluir"}
    </button>
  );
}
