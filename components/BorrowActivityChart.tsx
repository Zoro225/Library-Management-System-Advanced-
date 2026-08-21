import { Activity } from "lucide-react";
import type { DailyBorrowActivity } from "@/lib/insights";
import { SectionCard } from "@/components/ui";

// Small decorative-but-real chart: a hand-built inline SVG bar chart of
// borrow requests per day over the last week. No charting library — just
// <rect>/<text> sized directly from the data.
export function BorrowActivityChart({ data }: { data: DailyBorrowActivity[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 260;
  const height = 64;
  const gap = 8;
  const barWidth = data.length > 0 ? (width - gap * (data.length - 1)) / data.length : width;
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const dayLabel = (iso: string) =>
    new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
      new Date(`${iso}T00:00:00`)
    );

  return (
    <SectionCard
      title="Borrow activity"
      description="Requests submitted per day, last 7 days."
      icon={Activity}
    >
      <svg
        viewBox={`0 0 ${width} ${height + 18}`}
        className="w-full max-w-xs"
        role="img"
        aria-label={`${total} borrow requests submitted in the last 7 days`}
      >
        <defs>
          <linearGradient id="bac-bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#60a5fa" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const barHeight = Math.max(3, (d.count / max) * (height - 4));
          const x = i * (barWidth + gap);
          const y = height - barHeight;
          return (
            <g key={d.date}>
              <rect
                x={x}
                y={height}
                width={barWidth}
                height={2}
                rx={1}
                fill="rgba(255,255,255,0.08)"
              />
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={3}
                fill="url(#bac-bar)"
                opacity={d.count === 0 ? 0.25 : 1}
              />
              <text
                x={x + barWidth / 2}
                y={height + 14}
                textAnchor="middle"
                fontSize="8"
                fill="#94a3b8"
              >
                {dayLabel(d.date)}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-xs text-slate-400">
        {total} request{total === 1 ? "" : "s"} in the last 7 days
      </p>
    </SectionCard>
  );
}
