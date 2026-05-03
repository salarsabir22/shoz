import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export async function GET() {
  const auth = getAuthUser();
  if (!auth || auth.role !== "customer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("favorites")
    .select("business_id, businesses(*)")
    .eq("customer_id", auth.userId);

  if (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }

  const favorites = (data ?? []).map((row: { business_id: string; businesses: unknown }) => ({
    business_id: row.business_id,
    business: row.businesses,
  }));

  return NextResponse.json({ favorites });
}

const postSchema = z.object({
  business_id: z.string().uuid(),
});

export async function POST(req: Request) {
  const auth = getAuthUser();
  if (!auth || auth.role !== "customer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json: unknown = await req.json();
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { error } = await supabase.from("favorites").insert({
    customer_id: auth.userId,
    business_id: parsed.data.business_id,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const auth = getAuthUser();
  if (!auth || auth.role !== "customer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("business_id");
  if (!businessId) {
    return NextResponse.json({ error: "business_id required" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("customer_id", auth.userId)
    .eq("business_id", businessId);

  if (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
