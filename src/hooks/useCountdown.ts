"use client";

import * as React from "react";

export type CountdownState = {
  totalSeconds: number;
  minutes: number;
  seconds: number;
  isUrgent: boolean;
  isCritical: boolean;
  isPast: boolean;
};

export function useCountdown(target: Date | string | null): CountdownState {
  const end = React.useMemo(() => (target ? new Date(target).getTime() : NaN), [target]);

  const compute = React.useCallback((): CountdownState => {
    if (!Number.isFinite(end)) {
      return {
        totalSeconds: 0,
        minutes: 0,
        seconds: 0,
        isUrgent: false,
        isCritical: false,
        isPast: true,
      };
    }
    const diffMs = end - Date.now();
    if (diffMs <= 0) {
      return {
        totalSeconds: 0,
        minutes: 0,
        seconds: 0,
        isUrgent: true,
        isCritical: true,
        isPast: true,
      };
    }
    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const isUrgent = totalSeconds < 3600;
    const isCritical = totalSeconds < 1800;
    return { totalSeconds, minutes, seconds, isUrgent, isCritical, isPast: false };
  }, [end]);

  const [state, setState] = React.useState<CountdownState>(compute);

  React.useEffect(() => {
    setState(compute());
    const id = window.setInterval(() => setState(compute()), 1000);
    return () => window.clearInterval(id);
  }, [compute]);

  return state;
}
