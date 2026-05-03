import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { getDiscountedPrice } from "@/lib/discount-engine";
import { createServerSupabase } from "@/lib/supabase";

type Ctx = { params: { id: string } };

async function assertListingOwner(supabase: ReturnType<typeof createServerSupabase>, listingId: string, userId: string) {
  const { data: listing, error } = await supabase
    .from("listings")
    .select("business_id")
    .eq("id", listingId)
    .maybeSingle();
  if (error || !listing) return { ok: false as const, status: 404 as const };
  const { data: biz, error: bErr } = await supabase
    .from("businesses")
    .select("owner_id")
    .eq("id", listing.business_id)
    .maybeSingle();
  if (bErr || !biz || biz.owner_id !== userId) return { ok: false as const, status: 403 as const };
  return { ok: true as const };
}

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = ctx.params;
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from("listings").select("*, businesses(*)").eq("id", id).maybeSingle();
  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const row = data as Record<string, unknown> & { businesses: Record<string, unknown> | null };
  const { businesses, ...listing } = row;
  return NextResponse.json({ listing: { ...listing, business: businesses } });
}

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  photo_url: z.string().nullable().optional(),
  original_price: z.number().positive().optional(),
  current_price: z.number().positive().optional(),
  quantity_total: z.number().int().nonnegative().optional(),
  quantity_remaining: z.number().int().nonnegative().optional(),
  pickup_start: z.string().datetime().optional(),
  pickup_end: z.string().datetime().optional(),
  status: z.enum(["active", "sold_out", "expired", "cancelled"]).optional(),
  is_mystery_bag: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = getAuthUser();
  if (!auth || auth.role !== "business") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = ctx.params;
  const json: unknown = await req.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const owner = await assertListingOwner(supabase, id, auth.userId);
  if (!owner.ok) {
    return NextResponse.json({ error: "Not found" }, { status: owner.status });
  }

  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.pickup_end) {
    const { data: cur } = await supabase.from("listings").select("original_price").eq("id", id).single();
    const orig = parsed.data.original_price ?? (cur ? Number(cur.original_price) : null);
    if (orig) {
      updates.current_price = getDiscountedPrice(orig, new Date(parsed.data.pickup_end));
    }
  }

  const { error } = await supabase.from("listings").update(updates).eq("id", id);
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = getAuthUser();
  if (!auth || auth.role !== "business") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = ctx.params;
  const supabase = createServerSupabase();
  const owner = await assertListingOwner(supabase, id, auth.userId);
  if (!owner.ok) {
    return NextResponse.json({ error: "Not found" }, { status: owner.status });
  }

  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
