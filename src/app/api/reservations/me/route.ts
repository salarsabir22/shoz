import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export async function GET() {
  const auth = getAuthUser();
  if (!auth || auth.role !== "customer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("reservations")
    .select(
      `id, quantity, total_price, status, reservation_code, created_at,
       listings ( id, title, photo_url, pickup_start, pickup_end, status,
         businesses ( id, name, address, category, lat, lng ) )`
    )
    .eq("customer_id", auth.userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }

  return NextResponse.json({ reservations: data ?? [] });
}
