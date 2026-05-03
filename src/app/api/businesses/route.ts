import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

const postSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  category: z.enum(["bakery", "cafe", "restaurant", "grocery"]),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  const auth = getAuthUser();
  if (!auth || auth.role !== "business") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json: unknown = await req.json();
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data: existing } = await supabase.from("businesses").select("id").eq("owner_id", auth.userId).limit(1).maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "Business already exists" }, { status: 400 });
  }

  const { error } = await supabase.from("businesses").insert({
    owner_id: auth.userId,
    ...parsed.data,
    logo_url: null,
    rating: 0,
    verified: false,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
