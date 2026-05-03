"use client";

import * as React from "react";
import { MapContainer, TileLayer, Marker, CircleMarker, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DealWithMeta } from "./DealCard";

/** Free basemap: Carto raster tiles (OpenStreetMap data). No API key. */
const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";
const TILE_ATTRIB =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

type Props = {
  deals: DealWithMeta[];
  highlightedId: string | null;
  userLat: number;
  userLng: number;
  onSelectDeal: (id: string) => void;
};

function createPriceIcon(deal: DealWithMeta, highlighted: boolean): L.DivIcon {
  const bg = highlighted ? "hsl(43 96% 56%)" : "hsl(153 43% 17%)";
  const fg = highlighted ? "hsl(0 0% 10%)" : "hsl(60 33% 98%)";
  const ring = highlighted ? "box-shadow:0 0 0 2px hsl(153 43% 17%);" : "";
  const price = `Rs.${Number(deal.current_price).toFixed(0)}`;
  const html = `<button type="button" aria-label="Open ${deal.title.replace(/"/g, "&quot;")}" style="min-width:3.25rem;padding:4px 10px;border-radius:9999px;border:2px solid #fff;font-size:12px;font-weight:700;cursor:pointer;box-shadow:0 4px 6px rgba(0,0,0,0.18);background:${bg};color:${fg};${ring}">${price}</button>`;
  return L.divIcon({
    className: "leaflet-price-marker border-0 bg-transparent",
    html,
    iconSize: [56, 32],
    iconAnchor: [28, 32],
  });
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

export function ExploreMap({ deals, highlightedId, userLat, userLng, onSelectDeal }: Props) {
  return (
    <MapContainer
      center={[userLat, userLng]}
      zoom={12}
      className="z-0 h-full min-h-[280px] w-full rounded-xl md:min-h-0"
      style={{ minHeight: 280 }}
      scrollWheelZoom
      zoomControl={false}
    >
      <TileLayer attribution={TILE_ATTRIB} url={TILE_URL} subdomains="abcd" maxZoom={19} />
      <ZoomControl position="topright" />
      <MapRecenter lat={userLat} lng={userLng} />
      <CircleMarker
        center={[userLat, userLng]}
        radius={8}
        pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#3b82f6", fillOpacity: 1 }}
      />
      {deals.map((deal) => (
        <Marker
          key={`${deal.id}-${deal.id === highlightedId ? "1" : "0"}`}
          position={[deal.business.lat, deal.business.lng]}
          icon={createPriceIcon(deal, deal.id === highlightedId)}
          eventHandlers={{ click: () => onSelectDeal(deal.id) }}
        />
      ))}
    </MapContainer>
  );
}
