"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createBrowserSupabase } from "@/lib/supabase";
import { calculateDiscount, getDiscountedPrice } from "@/lib/discount-engine";
import { useToast } from "@/hooks/use-toast";
import { StatCard } from "@/components/custom/StatCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Package, TrendingUp, Leaf, Trash2, Pencil, Banknote } from "lucide-react";

type Stats = {
  businessId: string;
  activeListings: number;
  soldTodayCount: number;
  revenueRecoveredToday: number;
  co2SavedKg: number;
  listings: {
    id: string;
    title: string;
    quantity_remaining: number;
    current_price: number;
    pickup_end: string;
    status: string;
  }[];
  mealsByDay: { date: string; sold: number; wasted: number }[];
  revenueByDay: { date: string; revenue: number }[];
  topItems: { title: string; revenue: number }[];
};

const listingSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  photo_url: z.string().optional(),
  category: z.enum(["bakery", "cafe", "restaurant", "grocery"]),
  original_price: z.preprocess((v) => Number(v), z.number().positive()),
  quantity: z.preprocess((v) => Number(v), z.number().int().positive()),
  pickup_start: z.date(),
  pickup_end: z.date(),
  is_mystery_bag: z.boolean(),
});

type ListingForm = z.infer<typeof listingSchema>;

export default function BusinessDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "overview";
  const { toast } = useToast();
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/business/stats", { credentials: "same-origin" });
      if (!res.ok) throw new Error("fail");
      const json = (await res.json()) as Stats;
      setStats(json);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const loadRef = React.useRef(load);
  loadRef.current = load;

  React.useEffect(() => {
    if (!stats?.businessId) return;
    let sb: ReturnType<typeof createBrowserSupabase>;
    try {
      sb = createBrowserSupabase();
    } catch {
      return undefined;
    }
    const channel = sb
      .channel("biz-listings")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "listings",
          filter: `business_id=eq.${stats.businessId}`,
        },
        () => void loadRef.current()
      )
      .subscribe();
    return () => {
      void sb.removeChannel(channel);
    };
  }, [stats?.businessId]);

  const setTab = (t: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("tab", t);
    router.push(`/business/dashboard?${p.toString()}`);
  };

  const form = useForm<ListingForm>({
    resolver: zodResolver(listingSchema) as Resolver<ListingForm>,
    defaultValues: {
      title: "",
      description: "",
      photo_url: "",
      category: "restaurant",
      original_price: 100,
      quantity: 4,
      pickup_start: new Date(),
      pickup_end: new Date(Date.now() + 2 * 60 * 60 * 1000),
      is_mystery_bag: false,
    },
  });

  const watchEnd = form.watch("pickup_end");
  const watchOrig = form.watch("original_price");
  const watchMystery = form.watch("is_mystery_bag");

  const previewPrice = React.useMemo(() => {
    if (!watchEnd || !watchOrig) return null;
    return getDiscountedPrice(watchOrig, watchEnd);
  }, [watchEnd, watchOrig]);

  async function onCreate(values: ListingForm) {
    if (!values.is_mystery_bag && !values.description?.trim()) {
      toast({ title: "Add a description", variant: "destructive" });
      return;
    }
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        title: values.title,
        description: values.is_mystery_bag ? undefined : values.description,
        photo_url: values.photo_url || undefined,
        category: values.category,
        original_price: values.original_price,
        quantity: values.quantity,
        pickup_start: values.pickup_start.toISOString(),
        pickup_end: values.pickup_end.toISOString(),
        is_mystery_bag: values.is_mystery_bag,
      }),
    });
    if (!res.ok) {
      toast({ title: "Could not create listing", variant: "destructive" });
      return;
    }
    toast({ title: "Listing created" });
    setTab("overview");
    void load();
  }

  async function deleteListing(id: string) {
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE", credentials: "same-origin" });
    if (!res.ok) toast({ title: "Delete failed", variant: "destructive" });
    else {
      toast({ title: "Listing removed" });
      void load();
    }
  }

  if (loading && !stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set up your business</CardTitle>
          <CardDescription>We could not load your dashboard. Check Supabase env and seed data.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const milestones = [180, 120, 60, 30].map((m) => {
    const simulatedEnd = new Date(Date.now() + m * 60_000);
    const disc = calculateDiscount(simulatedEnd);
    return { label: `${m} min to close`, discount: disc };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Business dashboard</h1>
        <p className="text-muted-foreground">Manage surplus listings and track recovery.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active listings" value={String(stats.activeListings)} icon={Package} />
            <StatCard title="Sold today" value={String(stats.soldTodayCount)} icon={TrendingUp} />
            <StatCard
              title="Revenue recovered (today)"
              value={`Rs.${stats.revenueRecoveredToday.toFixed(0)}`}
              icon={Banknote}
            />
            <StatCard title="CO₂ saved (est.)" value={`${stats.co2SavedKg} kg`} icon={Leaf} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Active listings</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty left</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Closes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.listings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No listings yet — create one in the Create tab.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.listings.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.title}</TableCell>
                        <TableCell>{l.quantity_remaining}</TableCell>
                        <TableCell>Rs.{Number(l.current_price).toFixed(2)}</TableCell>
                        <TableCell>{format(new Date(l.pickup_end), "MMM d, HH:mm")}</TableCell>
                        <TableCell>
                          <Badge variant={l.status === "active" ? "default" : "secondary"}>{l.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" asChild aria-label="Edit listing">
                            <Link href={`/listing/${l.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            aria-label="Delete listing"
                            onClick={() => void deleteListing(l.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="pt-4">
          <p className="text-sm text-muted-foreground">Same table as overview — use Overview for quick stats.</p>
        </TabsContent>

        <TabsContent value="create" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create listing</CardTitle>
              <CardDescription>Discount is computed from pickup end time.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onCreate)} className="space-y-4 max-w-lg">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_mystery_bag"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel>Mystery bag</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {!watchMystery ? (
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}
                  <FormField
                    control={form.control}
                    name="photo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Photo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://images.unsplash.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bakery">Bakery</SelectItem>
                            <SelectItem value="cafe">Cafe</SelectItem>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                            <SelectItem value="grocery">Grocery</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="original_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original price (Rs.)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="pickup_start"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup start</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                                {field.value ? format(field.value, "PPp") : "Pick date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={(d) => d && field.onChange(d)} />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pickup_end"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup end</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                                {field.value ? format(field.value, "PPp") : "Pick date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={(d) => d && field.onChange(d)} />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                    <p className="font-medium">Discount preview</p>
                    <p className="mt-1 text-muted-foreground">
                      Current dynamic price:{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {previewPrice !== null ? `Rs.${previewPrice.toFixed(2)}` : "—"}
                      </span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {milestones.map((m) => (
                        <Badge key={m.label} variant="outline">
                          {m.label}: {m.discount}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button type="submit">Publish listing</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Meals sold vs wasted (30 days)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.mealsByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="sold" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="wasted" fill="hsl(var(--muted-foreground) / 0.35)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue recovered</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--secondary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.topItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales yet.</p>
              ) : (
                stats.topItems.map((t) => (
                  <div key={t.title} className="flex justify-between text-sm">
                    <span>{t.title}</span>
                    <span className="font-mono">Rs.{t.revenue.toFixed(0)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Business profile</CardTitle>
              <CardDescription>Update from your Supabase row or extend this form later.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link href="/explore">Preview public explore</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
