import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { AssessmentPdfClient } from "./AssessmentPdfClient";

export default async function PrintAssessmentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; assessmentId: string }>;
}) {
  const { locale, id, assessmentId } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const [{ data: assessment }, { data: student }, { data: trainer }] = await Promise.all([
    supabase
      .from("student_assessments")
      .select("*")
      .eq("id", assessmentId)
      .eq("trainer_id", user.id)
      .maybeSingle(),
    supabase
      .from("students")
      .select("id, full_name")
      .eq("id", id)
      .eq("trainer_id", user.id)
      .maybeSingle(),
    supabase
      .from("trainers")
      .select("full_name, cref, phone")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (!assessment || !student) notFound();

  return (
    <AssessmentPdfClient
      assessment={assessment}
      student={student}
      trainer={trainer}
    />
  );
}
