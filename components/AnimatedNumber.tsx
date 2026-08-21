"use client";

import { useEffect, useState } from "react";

// Small client island wrapping just the numeral inside a StatCard — the rest
// of the card stays a server component. Counts up from 0 to `value` with an
// ease-out curve over `durationMs`, driven by requestAnimationFrame.
export function AnimatedNumber({
  value,
  durationMs = 700,
}: {
  value: number;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    const to = value;

    function tick(now: number) {
      if (start === null) start = now;
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(to * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <>{display.toLocaleString()}</>;
}
