import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { getDiscountedPrice } from "@/lib/discount-engine";
import { haversineKm } from "@/lib/geo";
import { createServerSupabase } from "@/lib/supabase";
import { DEFAULT_MAP_LAT, DEFAULT_MAP_LNG } from "@/lib/region";
import type { Business, BusinessCategory, Listing, ListingStatus } from "@/types";

type Row = Listing & { businesses: Business | null };

function parseNum(v: string | null, fallback: number): number {
  if (v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseNum(searchParams.get("lat"), DEFAULT_MAP_LAT);
    const lng = parseNum(searchParams.get("lng"), DEFAULT_MAP_LNG);
    const radiusKm = parseNum(searchParams.get("radius"), 5);
    const category = searchParams.get("category") as BusinessCategory | "all" | null;
    const sort = searchParams.get("sort") ?? "nearest";

    const supabase = createServerSupabase();
    const nowIso = new Date().toISOString();
    const q = supabase
      .from("listings")
      .select("*, businesses(*)")
      .in("status", ["active", "sold_out"])
      .gte("pickup_end", nowIso);

    const { data, error } = await q;
    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to load listings" }, { status: 500 });
    }

    let rows = (data ?? []) as Row[];

    if (category && category !== "all") {
      rows = rows.filter((r) => r.businesses?.category === category);
    }

    rows = rows.filter((r) => {
      const b = r.businesses;
      if (!b) return false;
      const d = haversineKm(lat, lng, b.lat, b.lng);
      return d <= radiusKm;
    });

    const withDistance = rows.map((r) => {
      const b = r.businesses!;
      const distanceKm = haversineKm(lat, lng, b.lat, b.lng);
      return { ...r, distanceKm };
    });

    if (sort === "nearest") {
      withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sort === "ending_soon") {
      withDistance.sort((a, b) => new Date(a.pickup_end).getTime() - new Date(b.pickup_end).getTime());
    } else if (sort === "biggest_discount") {
      withDistance.sort((a, b) => {
        const da = a.original_price > 0 ? 1 - a.current_price / Number(a.original_price) : 0;
        const db = b.original_price > 0 ? 1 - b.current_price / Number(b.original_price) : 0;
        return db - da;
      });
    }

    const listings = withDistance.map(({ businesses, distanceKm, ...listing }) => ({
      ...listing,
      business: businesses,
      distance_km: distanceKm,
    }));

    return NextResponse.json({ listings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  photo_url: z.string().optional(),
  category: z.enum(["bakery", "cafe", "restaurant", "grocery"]),
  original_price: z.number().positive(),
  quantity: z.number().int().positive(),
  pickup_start: z.string().datetime(),
  pickup_end: z.string().datetime(),
  is_mystery_bag: z.boolean().optional(),
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

  const body = parsed.data;
  if (!body.is_mystery_bag && (!body.description || body.description.length < 1)) {
    return NextResponse.json({ error: "Description required unless mystery bag" }, { status: 400 });
  }

  const pickupEnd = new Date(body.pickup_end);
  const pickupStart = new Date(body.pickup_start);
  if (pickupEnd <= pickupStart) {
    return NextResponse.json({ error: "pickup_end must be after pickup_start" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data: biz, error: bizErr } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", auth.userId)
    .limit(1)
    .maybeSingle();

  if (bizErr || !biz) {
    return NextResponse.json({ error: "Business profile not found" }, { status: 400 });
  }

  const current_price = getDiscountedPrice(body.original_price, pickupEnd);
  const status: ListingStatus = "active";

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      business_id: biz.id,
      title: body.title,
      description: body.is_mystery_bag ? "Surprise assortment" : body.description,
      category: body.category,
      original_price: body.original_price,
      current_price,
      quantity_total: body.quantity,
      quantity_remaining: body.quantity,
      pickup_start: pickupStart.toISOString(),
      pickup_end: pickupEnd.toISOString(),
      photo_url: body.photo_url ?? null,
      is_mystery_bag: body.is_mystery_bag ?? false,
      status,
    })
    .select("id")
    .single();

  if (error || !listing) {
    console.error(error);
    return NextResponse.json({ error: "Could not create listing" }, { status: 500 });
  }

  return NextResponse.json({ id: listing.id });
}
