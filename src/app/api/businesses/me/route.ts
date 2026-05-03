import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export async function GET() {
  const auth = getAuthUser();
  if (!auth || auth.role !== "business") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", auth.userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
  return NextResponse.json({ business: data });
}

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  address: z.string().min(1).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  category: z.enum(["bakery", "cafe", "restaurant", "grocery"]).optional(),
  phone: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
});

export async function PATCH(req: Request) {
  const auth = getAuthUser();
  if (!auth || auth.role !== "business") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json: unknown = await req.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data: biz, error: fErr } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", auth.userId)
    .limit(1)
    .maybeSingle();

  if (fErr || !biz) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const { error } = await supabase.from("businesses").update(parsed.data).eq("id", biz.id);
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
