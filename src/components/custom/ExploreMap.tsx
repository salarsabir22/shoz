"use client";

import * as React from "react";
import mapboxgl from "mapbox-gl";
import type { DealWithMeta } from "./DealCard";

type Props = {
  deals: DealWithMeta[];
  highlightedId: string | null;
  userLat: number;
  userLng: number;
  onSelectDeal: (id: string) => void;
};

export function ExploreMap({ deals, highlightedId, userLat, userLng, onSelectDeal }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const dealMarkersRef = React.useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = React.useRef<mapboxgl.Marker | null>(null);

  React.useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current) return;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [userLng, userLat],
      zoom: 12,
    });
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    mapRef.current = map;

    const u = document.createElement("div");
    u.className = "h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-md";
    userMarkerRef.current = new mapboxgl.Marker({ element: u }).setLngLat([userLng, userLat]).addTo(map);

    return () => {
      dealMarkersRef.current.forEach((m) => m.remove());
      dealMarkersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [userLat, userLng]);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    dealMarkersRef.current.forEach((m) => m.remove());
    dealMarkersRef.current = [];

    for (const deal of deals) {
      const wrap = document.createElement("div");
      wrap.className = "relative flex -translate-x-1/2 -translate-y-full";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "relative flex min-w-[3.25rem] cursor-pointer items-center justify-center rounded-full border-2 border-white bg-primary px-2 py-1 text-xs font-bold text-primary-foreground shadow-lg";
      const label = document.createElement("span");
      label.textContent = `₺${Number(deal.current_price).toFixed(0)}`;
      btn.appendChild(label);
      const tail = document.createElement("span");
      tail.className =
        "pointer-events-none absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-white bg-primary";
      btn.appendChild(tail);
      btn.setAttribute("aria-label", `Open ${deal.title}`);
      btn.addEventListener("click", () => onSelectDeal(deal.id));
      wrap.appendChild(btn);

      if (deal.id === highlightedId) {
        btn.classList.add("bg-secondary", "text-secondary-foreground", "ring-2", "ring-primary");
      }

      const marker = new mapboxgl.Marker({ element: wrap, anchor: "bottom" })
        .setLngLat([deal.business.lng, deal.business.lat])
        .addTo(map);
      dealMarkersRef.current.push(marker);
    }
  }, [deals, highlightedId, onSelectDeal]);

  React.useEffect(() => {
    userMarkerRef.current?.setLngLat([userLng, userLat]);
    mapRef.current?.flyTo({ center: [userLng, userLat], essential: true });
  }, [userLat, userLng]);

  return <div ref={containerRef} className="h-full min-h-[280px] w-full rounded-xl md:min-h-0" />;
}
