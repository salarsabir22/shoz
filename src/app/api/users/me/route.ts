import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  avatar_url: z.union([z.string().url(), z.literal("")]).optional(),
  notify_deals: z.boolean().optional(),
  notify_reminders: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const auth = getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json: unknown = await req.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.avatar_url !== undefined) {
    updates.avatar_url = parsed.data.avatar_url === "" ? null : parsed.data.avatar_url;
  }
  if (parsed.data.notify_deals !== undefined) updates.notify_deals = parsed.data.notify_deals;
  if (parsed.data.notify_reminders !== undefined) {
    updates.notify_reminders = parsed.data.notify_reminders;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data: user, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", auth.userId)
    .select("id, name, email, role, avatar_url, notify_deals, notify_reminders")
    .single();

  if (error || !user) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ user });
}
