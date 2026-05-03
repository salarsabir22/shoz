"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_CITY_LABEL } from "@/lib/region";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DealCard, type DealWithMeta } from "@/components/custom/DealCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { BusinessCategory } from "@/types";

const ExploreMap = dynamic(
  () => import("@/components/custom/ExploreMap").then((m) => m.ExploreMap),
  { ssr: false, loading: () => <Skeleton className="h-full min-h-[280px] w-full rounded-xl" /> }
);

export function ExploreView() {
  const { coords, status } = useGeolocation();
  const { toast } = useToast();
  const toastRef = React.useRef(toast);
  toastRef.current = toast;
  const [deals, setDeals] = React.useState<DealWithMeta[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [highlightedId, setHighlightedId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<BusinessCategory | "all">("all");
  const [radius, setRadius] = React.useState([3]);
  const [sort, setSort] = React.useState<"nearest" | "ending_soon" | "biggest_discount">("nearest");
  const prevQtyRef = React.useRef<Record<string, number>>({});

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: String(coords.lat),
        lng: String(coords.lng),
        radius: String(radius[0] ?? 3),
        category,
        sort,
      });
      const res = await fetch(`/api/listings?${params.toString()}`, { credentials: "same-origin" });
      const json = (await res.json()) as { listings: DealWithMeta[] };
      const next = json.listings ?? [];
      for (const d of next) {
        const prev = prevQtyRef.current[d.id];
        if (prev !== undefined && prev > 0 && d.quantity_remaining === 0) {
          toastRef.current({
            title: "Just sold out",
            description: `Someone just reserved the last "${d.title}" at ${d.business.name}.`,
          });
        }
        prevQtyRef.current[d.id] = d.quantity_remaining;
      }
      setDeals(next);
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, [category, coords.lat, coords.lng, radius, sort]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const loadRef = React.useRef(load);
  React.useEffect(() => {
    loadRef.current = load;
  }, [load]);

  React.useEffect(() => {
    let sb: ReturnType<typeof createBrowserSupabase> | null = null;
    try {
      sb = createBrowserSupabase();
    } catch {
      return undefined;
    }

    const channel = sb
      .channel("listings-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "listings" }, () => {
        void loadRef.current();
      })
      .subscribe();

    return () => {
      void sb.removeChannel(channel);
    };
  }, []);

  React.useEffect(() => {
    if (!highlightedId) return;
    const el = document.getElementById(`deal-${highlightedId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [highlightedId]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.business.name.toLowerCase().includes(q) ||
        (d.description?.toLowerCase().includes(q) ?? false)
    );
  }, [deals, search]);

  const listSection = (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="space-y-3 rounded-xl border bg-card p-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            className="pl-8"
            placeholder="Search deals or places..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search deals"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
              <SelectTrigger aria-label="Category filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="bakery">Bakery</SelectItem>
                <SelectItem value="cafe">Cafe</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="grocery">Grocery</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sort</Label>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger aria-label="Sort deals">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nearest">Nearest</SelectItem>
                <SelectItem value="ending_soon">Ending soon</SelectItem>
                <SelectItem value="biggest_discount">Biggest discount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Max distance</span>
            <span className="tabular-nums">{radius[0]} km</span>
          </div>
          <Slider
            min={0.5}
            max={10}
            step={0.5}
            value={radius}
            onValueChange={setRadius}
            aria-label="Maximum distance in kilometers"
          />
        </div>
        {status === "denied" ? (
          <p className="text-xs text-muted-foreground">
            Location denied — showing {DEFAULT_CITY_LABEL} city centre.
          </p>
        ) : null}
      </div>

      <ScrollArea className="min-h-0 flex-1 md:pr-2">
        <div className="flex flex-col gap-4 pb-24 md:pb-4">
          {loading ? (
            <>
              <Skeleton className="h-72 w-full rounded-xl" />
              <Skeleton className="h-72 w-full rounded-xl" />
            </>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
              No deals in range. Try widening distance or changing category.
            </div>
          ) : (
            filtered.map((deal) => (
              <div key={deal.id} id={`deal-${deal.id}`}>
                <DealCard deal={deal} highlight={deal.id === highlightedId} onHover={setHighlightedId} />
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 pb-24 pt-4 md:flex-row md:pb-6 md:pt-6">
        <section className="relative flex min-h-[40vh] flex-1 flex-col md:min-h-0 md:w-[58%]">
          <ExploreMap
            deals={filtered}
            highlightedId={highlightedId}
            userLat={coords.lat}
            userLng={coords.lng}
            onSelectDeal={(id) => {
              setHighlightedId(id);
            }}
          />
          <div className="mt-3 md:hidden">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="secondary" className="w-full">
                  View deal list
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh]">
                <DrawerHeader>
                  <DrawerTitle>Nearby deals</DrawerTitle>
                </DrawerHeader>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-6">{listSection}</div>
              </DrawerContent>
            </Drawer>
          </div>
        </section>
        <section className="hidden min-h-0 flex-1 flex-col md:flex md:w-[42%]">{listSection}</section>
      </main>
      <MobileBottomNav />
    </div>
  );
}
