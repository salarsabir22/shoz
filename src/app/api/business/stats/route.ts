import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export async function GET() {
  const auth = getAuthUser();
  if (!auth || auth.role !== "business") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServerSupabase();
  const { data: biz, error: bErr } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", auth.userId)
    .limit(1)
    .maybeSingle();

  if (bErr || !biz) {
    return NextResponse.json({ error: "No business" }, { status: 404 });
  }

  const { data: listings, error: lErr } = await supabase
    .from("listings")
    .select("id, title, quantity_remaining, current_price, pickup_end, status, created_at")
    .eq("business_id", biz.id);

  if (lErr) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }

  const listingIds = (listings ?? []).map((l) => l.id);
  let reservations: {
    id: string;
    quantity: number;
    total_price: number;
    status: string;
    created_at: string;
    listing_id: string;
  }[] = [];

  if (listingIds.length) {
    const { data: resv } = await supabase
      .from("reservations")
      .select("id, quantity, total_price, status, created_at, listing_id")
      .in("listing_id", listingIds);
    reservations = resv ?? [];
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const soldToday = reservations.filter(
    (r) => r.status !== "cancelled" && new Date(r.created_at) >= startOfDay
  );

  const revenueToday = soldToday.reduce((s, r) => s + Number(r.total_price), 0);
  const activeListings = (listings ?? []).filter((l) => l.status === "active").length;

  let co2Saved = 0;
  const resIds = reservations.map((r) => r.id);
  if (resIds.length) {
    const { data: logs } = await supabase.from("impact_logs").select("co2_saved_kg").in("reservation_id", resIds);
    for (const row of logs ?? []) {
      co2Saved += Number(row.co2_saved_kg ?? 0);
    }
  }

  const mealsByDay: { date: string; sold: number; wasted: number }[] = [];
  const revenueByDay: { date: string; revenue: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    mealsByDay.push({ date: key, sold: 0, wasted: 0 });
    revenueByDay.push({ date: key, revenue: 0 });
  }

  const mealMap = new Map(mealsByDay.map((m) => [m.date, m]));
  const revMap = new Map(revenueByDay.map((m) => [m.date, m]));

  for (const r of reservations) {
    if (r.status === "cancelled") continue;
    const key = new Date(r.created_at).toISOString().slice(0, 10);
    const m = mealMap.get(key);
    if (m) m.sold += r.quantity;
    const rv = revMap.get(key);
    if (rv) rv.revenue += Number(r.total_price);
  }

  const now = Date.now();
  for (const l of listings ?? []) {
    const ended = new Date(l.pickup_end).getTime() < now;
    if (l.status === "expired" || (l.status === "active" && ended && l.quantity_remaining > 0)) {
      const key = new Date(l.pickup_end).toISOString().slice(0, 10);
      const m = mealMap.get(key);
      if (m) m.wasted += l.quantity_remaining;
    }
  }

  const revByTitle = new Map<string, number>();
  for (const r of reservations) {
    if (r.status === "cancelled") continue;
    const list = (listings ?? []).find((x) => x.id === r.listing_id);
    const t = list?.title ?? "Item";
    revByTitle.set(t, (revByTitle.get(t) ?? 0) + Number(r.total_price));
  }
  const topItems = Array.from(revByTitle.entries())
    .map(([title, revenue]) => ({ title, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return NextResponse.json({
    businessId: biz.id,
    activeListings,
    soldTodayCount: soldToday.length,
    revenueRecoveredToday: parseFloat(revenueToday.toFixed(2)),
    co2SavedKg: parseFloat(co2Saved.toFixed(2)),
    listings: listings ?? [],
    mealsByDay,
    revenueByDay,
    topItems,
  });
}
