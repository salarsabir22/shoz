import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = getAuthUser();
  if (!auth || auth.role !== "customer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = ctx.params;
  const body = (await req.json()) as { action?: string };
  if (body.action !== "cancel") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data: resv, error: fErr } = await supabase
    .from("reservations")
    .select("id, listing_id, quantity, status")
    .eq("id", id)
    .eq("customer_id", auth.userId)
    .maybeSingle();

  if (fErr || !resv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (resv.status !== "confirmed" && resv.status !== "pending") {
    return NextResponse.json({ error: "Cannot cancel" }, { status: 400 });
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("quantity_remaining, status")
    .eq("id", resv.listing_id)
    .maybeSingle();

  const { error: uRes } = await supabase.from("reservations").update({ status: "cancelled" }).eq("id", id);
  if (uRes) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  if (listing && resv.status === "confirmed") {
    const newQty = listing.quantity_remaining + resv.quantity;
    await supabase
      .from("listings")
      .update({
        quantity_remaining: newQty,
        status: listing.status === "sold_out" && newQty > 0 ? "active" : listing.status,
      })
      .eq("id", resv.listing_id);
  }

  await supabase.from("impact_logs").delete().eq("reservation_id", id);

  return NextResponse.json({ success: true });
}
