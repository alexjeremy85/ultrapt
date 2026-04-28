export type ChatMessage = {
  id: string;
  trainer_id: string;
  student_id: string;
  sender_role: "trainer" | "student";
  content: string;
  created_at: string;
  read_at: string | null;
};
