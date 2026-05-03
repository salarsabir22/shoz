import "server-only";

import { createPublicSupabase } from "@/lib/supabase/public";
import { isSupabasePublicConfigured } from "@/lib/env";

export type ImpactTotals = {
  mealsSaved: number;
  moneySavedCents: number;
  co2KgEstimate: number;
};

const ZERO: ImpactTotals = {
  mealsSaved: 0,
  moneySavedCents: 0,
  co2KgEstimate: 0,
};

type RpcRow = {
  meals_saved?: number;
  money_saved_cents?: number;
  co2_kg_estimate?: number;
};

/** Uses public Supabase + DB RPC (no service role). Run `supabase/community_impact.sql` if missing. */
export async function fetchImpactTotals(): Promise<ImpactTotals> {
  if (!isSupabasePublicConfigured()) return ZERO;
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase.rpc("get_community_impact");

    if (error) {
      console.warn("[impact]", error.message);
      return ZERO;
    }

    let row: RpcRow | null = null;
    if (typeof data === "string") {
      try {
        row = JSON.parse(data) as RpcRow;
      } catch {
        return ZERO;
      }
    } else if (data && typeof data === "object") {
      row = data as RpcRow;
    }
    if (!row) return ZERO;

    return {
      mealsSaved: Number(row.meals_saved ?? 0),
      moneySavedCents: Number(row.money_saved_cents ?? 0),
      co2KgEstimate: Number(row.co2_kg_estimate ?? 0),
    };
  } catch {
    return ZERO;
  }
}
