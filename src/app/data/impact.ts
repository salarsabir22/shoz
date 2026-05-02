import "server-only";

import { createAdminSupabase } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/env";

export type ImpactTotals = {
  mealsSaved: number;
  moneySavedCents: number;
  co2KgEstimate: number;
};

/** Rough meal CO₂ equivalent for storytelling (order of magnitude). */
const KG_CO2_PER_MEAL = 2.5;

export async function fetchImpactTotals(): Promise<ImpactTotals | null> {
  if (!isSupabaseAdminConfigured()) return null;
  try {
    const supabase = createAdminSupabase();
    const { data: reservations, error: rErr } = await supabase
      .from("reservations")
      .select("quantity, listing_id");

    if (rErr) return null;
    if (!reservations?.length) {
      return { mealsSaved: 0, moneySavedCents: 0, co2KgEstimate: 0 };
    }

    const listingIds = [
      ...new Set(reservations.map((r) => r.listing_id as string)),
    ];
    const { data: listings, error: lErr } = await supabase
      .from("listings")
      .select("id, original_price_cents, discount_at_start, discount_at_end")
      .in("id", listingIds);

    if (lErr || !listings) {
      return { mealsSaved: 0, moneySavedCents: 0, co2KgEstimate: 0 };
    }

    const priceById = new Map(
      listings.map((l) => [
        l.id as string,
        {
          original: l.original_price_cents as number,
          d0: l.discount_at_start as number,
          d1: l.discount_at_end as number,
        },
      ])
    );

    let mealsSaved = 0;
    let moneySavedCents = 0;

    for (const row of reservations) {
      const qty = (row.quantity as number) ?? 1;
      mealsSaved += qty;
      const p = priceById.get(row.listing_id as string);
      if (!p) continue;
      const avgDiscount = (p.d0 + p.d1) / 2;
      const savedPer = Math.round(p.original * (avgDiscount / 100));
      moneySavedCents += savedPer * qty;
    }

    return {
      mealsSaved,
      moneySavedCents,
      co2KgEstimate: Math.round(mealsSaved * KG_CO2_PER_MEAL * 10) / 10,
    };
  } catch {
    return null;
  }
}
