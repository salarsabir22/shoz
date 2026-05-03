"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ImpactStat } from "@/components/custom/ImpactStat";
import { CountdownTimer } from "@/components/custom/CountdownTimer";
import { ReservationCode } from "@/components/custom/ReservationCode";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Flame, Building2, PiggyBank } from "lucide-react";

const settingsSchema = z.object({
  name: z.string().min(1),
  avatar_url: z.union([z.string().url(), z.literal("")]),
  notify_deals: z.boolean(),
  notify_reminders: z.boolean(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

type ReservationRow = {
  id: string;
  quantity: number;
  total_price: number;
  status: string;
  reservation_code: string;
  created_at: string;
  listings: {
    id: string;
    title: string;
    photo_url: string | null;
    pickup_start: string;
    pickup_end: string;
    status: string;
    businesses: { id: string; name: string; address: string; category: string } | null;
  } | null;
};

export default function CustomerDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "reservations";
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = React.useState<ReservationRow[]>([]);
  const [impact, setImpact] = React.useState<{
    totalMealsSaved: number;
    totalMoneySaved: number;
    totalCo2Saved: number;
    currentStreak: number;
    businessesTried: number;
  } | null>(null);
  const [favorites, setFavorites] = React.useState<{ business_id: string; business: Record<string, unknown> }[]>([]);
  const [loading, setLoading] = React.useState(true);

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: user?.name ?? "",
      avatar_url: user?.avatar_url ?? "",
      notify_deals: user?.notify_deals ?? true,
      notify_reminders: user?.notify_reminders ?? true,
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        avatar_url: user.avatar_url ?? "",
        notify_deals: user.notify_deals ?? true,
        notify_reminders: user.notify_reminders ?? true,
      });
    }
  }, [user, form]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [r, i, f] = await Promise.all([
        fetch("/api/reservations/me", { credentials: "same-origin" }).then((x) => x.json()),
        fetch("/api/impact/me", { credentials: "same-origin" }).then((x) => x.json()),
        fetch("/api/favorites", { credentials: "same-origin" }).then((x) => x.json()),
      ]);
      setReservations((r.reservations ?? []) as ReservationRow[]);
      setImpact(i);
      setFavorites(f.favorites ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const setTab = (t: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("tab", t);
    router.push(`/customer/dashboard?${p.toString()}`);
  };

  async function cancelReservation(id: string) {
    const res = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action: "cancel" }),
    });
    if (!res.ok) toast({ title: "Could not cancel", variant: "destructive" });
    else {
      toast({ title: "Reservation cancelled" });
      void load();
    }
  }

  async function onSettings(values: SettingsForm) {
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(values),
    });
    if (!res.ok) toast({ title: "Update failed", variant: "destructive" });
    else {
      toast({ title: "Saved" });
      await refreshUser();
    }
  }

  async function removeFavorite(businessId: string) {
    await fetch(`/api/favorites?business_id=${businessId}`, { method: "DELETE", credentials: "same-origin" });
    void load();
  }

  const active = reservations.filter((r) => r.status === "confirmed" || r.status === "pending");
  const history = reservations.filter((r) => r.status === "picked_up" || r.status === "cancelled");

  const monthly = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const r of reservations.filter((x) => x.status === "picked_up")) {
      const key = format(new Date(r.created_at), "yyyy-MM");
      map.set(key, (map.get(key) ?? 0) + r.quantity);
    }
    return [...map.entries()].map(([month, meals]) => ({ month, meals }));
  }, [reservations]);

  if (loading && !impact) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Your dashboard</h1>
        <p className="text-muted-foreground">Reservations, impact, and preferences.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="reservations" className="space-y-6 pt-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Active</h2>
            {active.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No active reservations.</p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {active.map((r) => {
                  const l = r.listings;
                  const b = l?.businesses;
                  if (!l || !b) return null;
                  return (
                    <Card key={r.id}>
                      <CardContent className="space-y-3 pt-6">
                        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                          {l.photo_url ? (
                            <Image src={l.photo_url} alt="" fill className="object-cover" sizes="400px" />
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">{b.name}</p>
                        <p className="font-display text-lg font-semibold">{l.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Pickup until {format(new Date(l.pickup_end), "PPp")}
                        </p>
                        <CountdownTimer pickupEnd={l.pickup_end} />
                        <ReservationCode code={r.reservation_code} />
                        <Button variant="outline" size="sm" onClick={() => void cancelReservation(r.id)}>
                          Cancel
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">History</h2>
            <Card className="mt-4">
              <CardContent className="overflow-x-auto pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No history yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      history.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{format(new Date(r.created_at), "MMM d, yyyy")}</TableCell>
                          <TableCell>{r.listings?.businesses?.name ?? "—"}</TableCell>
                          <TableCell>{r.listings?.title ?? "—"}</TableCell>
                          <TableCell>₺{Number(r.total_price).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{r.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6 pt-4">
          {impact ? (
            <>
              <p className="font-display text-5xl font-bold text-primary">{impact.totalMealsSaved}</p>
              <p className="text-sm text-muted-foreground">total meals saved from waste</p>
              <div className="grid gap-4 md:grid-cols-3">
                <ImpactStat icon={PiggyBank} label="Money saved (est.)" value={`₺${impact.totalMoneySaved}`} />
                <ImpactStat icon={Leaf} label="CO₂ prevented (kg)" value={impact.totalCo2Saved} />
                <ImpactStat icon={Building2} label="Businesses tried" value={impact.businessesTried} />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Flame className="h-5 w-5 text-secondary" aria-hidden />
                    Streak
                  </CardTitle>
                  <CardDescription>
                    You&apos;ve saved food {impact.currentStreak} days in a row — keep the momentum!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">Progress to Silver Saver</p>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, (impact.totalMealsSaved / 10) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.min(impact.totalMealsSaved, 10)} / 10 meals to reach Silver Saver
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Monthly meals saved</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly.length ? monthly : [{ month: "—", meals: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="meals" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="favorites" className="pt-4">
          {favorites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved businesses yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {favorites.map((f) => {
                const b = f.business as { name?: string; address?: string; category?: string };
                return (
                  <Card key={f.business_id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{b.name}</CardTitle>
                      <CardDescription>{b.address}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" onClick={() => void removeFavorite(f.business_id)}>
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="pt-4">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle>Profile & notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSettings)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notify_deals"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel>Deal alerts</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notify_reminders"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel>Pickup reminders</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Save</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
