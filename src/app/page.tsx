"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import * as React from "react";
import { Leaf, Store, MapPin, ShoppingBag } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.07"/></svg>`
)}")`;

const featured = [
  {
    title: "Sunset meze box",
    price: "₺160",
    was: "₺320",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
    tag: "Nişantaşı",
  },
  {
    title: "Sourdough & jam",
    price: "₺70",
    was: "₺140",
    img: "https://images.unsplash.com/photo-1586444538869-86e37b0ef498?w=800",
    tag: "Galata",
  },
  {
    title: "Mystery pastry bag",
    price: "₺45",
    was: "₺90",
    img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
    tag: "Moda",
    mystery: true,
  },
];

function StatCounter({ value, label }: { value: number; label: string }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (!inView) return;
    const steps = 32;
    let i = 0;
    const t = window.setInterval(() => {
      i++;
      setN(Math.round((value * i) / steps));
      if (i >= steps) {
        setN(value);
        window.clearInterval(t);
      }
    }, 24);
    return () => window.clearInterval(t);
  }, [inView, value]);
  return (
    <div ref={ref} className="text-center">
      <motion.p
        className="font-display text-4xl font-bold text-primary md:text-5xl"
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
      >
        {n.toLocaleString()}+
      </motion.p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <section
        className="relative overflow-hidden border-b bg-secondary/25"
        style={{ backgroundImage: GRAIN }}
      >
        <div className="mx-auto max-w-5xl px-4 py-20 md:py-28">
          <motion.h1
            className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Great food. Half the price. Zero waste.
          </motion.h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            SaveBite connects Istanbul eateries with neighbors who want great meals — rescued from going unsold before
            closing time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/explore">Find deals near me</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signup?role=business">List your surplus</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-4">
        <StatCounter value={12840} label="Meals saved" />
        <StatCounter value={312} label="Partner restaurants" />
        <StatCounter value={32} label="Tonnes CO₂ prevented" />
        <StatCounter value={4} label="Cities active" />
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="font-display text-3xl font-semibold">How it works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { step: "1", title: "Businesses list surplus food", desc: "Set portions, pickup windows, and smart discounts.", icon: Store },
            { step: "2", title: "You discover nearby deals", desc: "Map-first discovery with live availability.", icon: MapPin },
            { step: "3", title: "Reserve & pick up", desc: "Show your code, enjoy the meal, track your impact.", icon: ShoppingBag },
          ].map((c) => (
            <Card key={c.step}>
              <CardHeader>
                <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {c.step}
                </span>
                <c.icon className="mb-2 h-6 w-6 text-primary" aria-hidden />
                <CardTitle className="font-display text-xl">{c.title}</CardTitle>
                <CardDescription>{c.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/40 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-display text-2xl font-semibold">Featured deals</h2>
          <ScrollArea className="mt-6 w-full whitespace-nowrap pb-4">
            <div className="flex w-max gap-4 pb-2">
              {featured.map((deal) => (
                <Card key={deal.title} className="w-[min(100vw-2rem,300px)] shrink-0 overflow-hidden whitespace-normal">
                  <div className="relative aspect-video bg-muted">
                    <Image src={deal.img} alt="" fill className="object-cover" sizes="300px" />
                    {deal.mystery ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/55 backdrop-blur-sm">
                        <span className="font-display text-4xl text-primary">?</span>
                      </div>
                    ) : null}
                    <Badge className="absolute right-2 top-2" variant="secondary">
                      {deal.tag}
                    </Badge>
                  </div>
                  <CardContent className="space-y-2 pt-4">
                    <h3 className="font-display text-lg font-semibold">{deal.title}</h3>
                    <p className="text-sm text-muted-foreground line-through">{deal.was}</p>
                    <p className="text-xl font-bold text-primary">{deal.price}</p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/auth/login?next=/explore">See live deals</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Leaf className="h-10 w-10" aria-hidden />
            <div>
              <h2 className="font-display text-2xl font-semibold md:text-3xl">Impact mission</h2>
              <p className="mt-1 max-w-xl text-sm text-primary-foreground/90">
                Every rescued plate keeps good food in bellies and out of landfills — while supporting local businesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-background py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-lg font-semibold">SaveBite</p>
            <p className="text-sm text-muted-foreground">Fighting food waste one meal at a time.</p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link href="/explore" className="hover:text-foreground">
              Explore
            </Link>
            <Link href="/auth/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/auth/signup" className="hover:text-foreground">
              Sign up
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
