import { Trophy } from "lucide-react";
import type { MostBorrowedBook } from "@/lib/insights";
import { EmptyState, SectionCard } from "@/components/ui";
import { BookCover } from "@/components/BookCover";
import { NoActivityIllustration } from "@/components/illustrations";

const RANK_STYLES: Record<number, string> = {
  0: "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-[0_0_0_4px_rgba(251,191,36,0.18),0_4px_14px_-2px_rgba(217,119,6,0.55)]",
  1: "bg-slate-700 text-slate-200 ring-1 ring-inset ring-slate-600",
  2: "bg-orange-500/15 text-orange-300 ring-1 ring-inset ring-orange-500/30",
};

const BAR_STYLES: Record<number, string> = {
  0: "bg-gradient-to-r from-amber-400 to-yellow-500",
  1: "bg-gradient-to-r from-blue-500 to-violet-500",
  2: "bg-gradient-to-r from-blue-500 to-violet-500",
};

export function MostBorrowedWidget({
  mostBorrowed,
}: {
  mostBorrowed: MostBorrowedBook[];
}) {
  const topCount = mostBorrowed[0]?.count ?? 0;

  return (
    <SectionCard
      title="Most borrowed books"
      description="Ranked by total borrow requests, all-time."
      icon={Trophy}
    >
      {mostBorrowed.length === 0 ? (
        <EmptyState
          illustration={<NoActivityIllustration />}
          title="No borrow activity yet"
          description="Once students start borrowing books, the most requested titles will show up here."
        />
      ) : (
        <ol className="space-y-5">
          {mostBorrowed.map((entry, index) => {
            const pct = topCount > 0 ? (entry.count / topCount) * 100 : 0;
            const isTop = index === 0;
            return (
              <li
                key={entry.bookId}
                className="animate-fade-slide-up flex items-center gap-4"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span
                  className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${
                    isTop ? "h-9 w-9 text-base" : "h-7 w-7 text-sm"
                  } ${RANK_STYLES[index] ?? "bg-blue-500/10 text-blue-300"}`}
                >
                  {index + 1}
                </span>
                <BookCover id={entry.bookId} title={entry.title} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className={`truncate text-sm text-slate-100 ${
                        isTop ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {entry.title}
                    </p>
                    <span className="shrink-0 text-sm font-semibold text-slate-300">
                      {entry.count}
                    </span>
                  </div>
                  <p className="truncate text-xs text-slate-400">
                    {entry.author}
                  </p>
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-2 rounded-full transition-[width] duration-700 ease-out ${
                        BAR_STYLES[index] ?? "bg-gradient-to-r from-blue-500 to-violet-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </SectionCard>
  );
}
