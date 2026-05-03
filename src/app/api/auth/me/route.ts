import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export async function GET() {
  const auth = getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, name, email, role, avatar_url, notify_deals, notify_reminders")
    .eq("id", auth.userId)
    .maybeSingle();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url ?? null,
      notify_deals: user.notify_deals ?? true,
      notify_reminders: user.notify_reminders ?? true,
    },
  });
}
