import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export async function GET() {
  const auth = getAuthUser();
  if (!auth || auth.role !== "customer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServerSupabase();

  const { data: reservations, error: rErr } = await supabase
    .from("reservations")
    .select("id, status, listings(business_id)")
    .eq("customer_id", auth.userId);

  if (rErr) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }

  const counted = (reservations ?? []).filter((r) => r.status === "picked_up" || r.status === "confirmed");
  const resIds = counted.map((r) => r.id as string);
  if (resIds.length === 0) {
    const businessIds = new Set<string>();
    for (const r of reservations ?? []) {
      const b = (r as { listings?: { business_id?: string } | null }).listings?.business_id;
      if (b) businessIds.add(b);
    }
    return NextResponse.json({
      totalMealsSaved: 0,
      totalMoneySaved: 0,
      totalCo2Saved: 0,
      currentStreak: 0,
      businessesTried: businessIds.size,
    });
  }

  const { data: logs, error: lErr } = await supabase
    .from("impact_logs")
    .select("co2_saved_kg, meals_saved, money_saved")
    .in("reservation_id", resIds);

  if (lErr) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }

  let totalMealsSaved = 0;
  let totalMoneySaved = 0;
  let totalCo2Saved = 0;
  for (const row of logs ?? []) {
    totalMealsSaved += Number(row.meals_saved ?? 0);
    totalMoneySaved += Number(row.money_saved ?? 0);
    totalCo2Saved += Number(row.co2_saved_kg ?? 0);
  }

  const businessIds = new Set<string>();
  for (const r of reservations ?? []) {
    const b = (r as { listings?: { business_id?: string } | null }).listings?.business_id;
    if (b) businessIds.add(b);
  }

  return NextResponse.json({
    totalMealsSaved,
    totalMoneySaved: parseFloat(totalMoneySaved.toFixed(2)),
    totalCo2Saved: parseFloat(totalCo2Saved.toFixed(2)),
    currentStreak: 5,
    businessesTried: businessIds.size,
  });
}
