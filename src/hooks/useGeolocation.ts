"use client";

import * as React from "react";

export type GeoState = {
  lat: number | null;
  lng: number | null;
  status: "idle" | "loading" | "granted" | "denied" | "unavailable";
  error: string | null;
};

const DEFAULT_LAT = 41.0082;
const DEFAULT_LNG = 28.9784;

export function useGeolocation() {
  const [state, setState] = React.useState<GeoState>({
    lat: null,
    lng: null,
    status: "idle",
    error: null,
  });

  const request = React.useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        lat: DEFAULT_LAT,
        lng: DEFAULT_LNG,
        status: "unavailable",
        error: "Geolocation not supported",
      });
      return;
    }
    setState((s) => ({ ...s, status: "loading", error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          status: "granted",
          error: null,
        });
      },
      (err) => {
        setState({
          lat: DEFAULT_LAT,
          lng: DEFAULT_LNG,
          status: err.code === 1 ? "denied" : "unavailable",
          error: err.message,
        });
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 15_000 }
    );
  }, []);

  React.useEffect(() => {
    request();
  }, [request]);

  const coords = React.useMemo(() => {
    if (state.lat !== null && state.lng !== null) {
      return { lat: state.lat, lng: state.lng };
    }
    return { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
  }, [state.lat, state.lng]);

  return { ...state, coords, request };
}
