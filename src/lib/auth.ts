import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

export async function getCurrentUser(): Promise<{
  user: { id: string; email: string } | null;
  profile: Tables<"profiles"> | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    user: { id: user.id, email: user.email ?? "" },
    profile,
  };
}
