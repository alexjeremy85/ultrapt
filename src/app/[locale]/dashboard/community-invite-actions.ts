"use server";

import { createClient } from "@/lib/supabase/server";

export async function markCommunityInviteSeen() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("trainers")
    .update({ community_invite_seen_at: new Date().toISOString() })
    .eq("id", user.id);
}
