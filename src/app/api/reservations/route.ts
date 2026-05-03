import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { calculateImpact } from "@/lib/impact-calculator";
import { generateReservationCode } from "@/lib/reservation-code";
import { createServerSupabase } from "@/lib/supabase";

const postSchema = z.object({
  listing_id: z.string().uuid(),
  quantity: z.number().int().positive(),
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

  const { listing_id, quantity } = parsed.data;
  const supabase = createServerSupabase();

  const { data: listing, error: lErr } = await supabase
    .from("listings")
    .select("id, status, quantity_remaining, current_price, original_price, title, businesses(name)")
    .eq("id", listing_id)
    .maybeSingle();

  if (lErr || !listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (listing.status !== "active" || listing.quantity_remaining < quantity) {
    return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
  }

  const unit = Number(listing.current_price);
  const total_price = parseFloat((unit * quantity).toFixed(2));
  const originalTotal = Number(listing.original_price) * quantity;
  const impact = calculateImpact(quantity, originalTotal, total_price);

  let code = generateReservationCode();
  for (let i = 0; i < 8; i++) {
    const { data: clash } = await supabase.from("reservations").select("id").eq("reservation_code", code).maybeSingle();
    if (!clash) break;
    code = generateReservationCode();
  }

  const newRemaining = listing.quantity_remaining - quantity;
  const newStatus = newRemaining <= 0 ? "sold_out" : "active";

  const { data: resv, error: rErr } = await supabase
    .from("reservations")
    .insert({
      listing_id,
      customer_id: auth.userId,
      quantity,
      total_price,
      status: "confirmed",
      reservation_code: code,
    })
    .select("id, reservation_code, total_price, quantity, status, created_at")
    .single();

  if (rErr || !resv) {
    console.error(rErr);
    return NextResponse.json({ error: "Reservation failed" }, { status: 500 });
  }

  const { data: updatedRows, error: uErr } = await supabase
    .from("listings")
    .update({
      quantity_remaining: newRemaining,
      status: newStatus,
    })
    .eq("id", listing_id)
    .eq("quantity_remaining", listing.quantity_remaining)
    .select("id");

  if (uErr || !updatedRows?.length) {
    await supabase.from("reservations").delete().eq("id", resv.id);
    return NextResponse.json({ error: "Listing just sold out — try again" }, { status: 409 });
  }

  await supabase.from("impact_logs").insert({
    reservation_id: resv.id,
    co2_saved_kg: impact.co2Saved,
    meals_saved: impact.mealsFromWaste,
    money_saved: impact.moneySaved,
  });

  const bizName = (listing as { businesses?: { name?: string } }).businesses?.name ?? "A partner";
  console.log(
    `[email stub] Reservation confirmed for ${auth.email}: ${listing.title} at ${bizName}. Code ${resv.reservation_code}.`
  );

  return NextResponse.json({
    reservation: resv,
    listing_title: listing.title as string,
    business_name: bizName,
  });
}
