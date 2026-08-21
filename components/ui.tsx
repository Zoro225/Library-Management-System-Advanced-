import Link from "next/link";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import type { LucideProps } from "lucide-react";
import { Inbox } from "lucide-react";
import { AnimatedNumber } from "@/components/AnimatedNumber";

type IconType = ComponentType<LucideProps>;

// Centralized button variants so every page reaches for the same classes
// instead of hand-rolling slightly different ones per call site. All three
// share sizing/radius/transition/focus behavior and differ only in color.
const buttonBase =
  "inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

// Primary actions carry the brand gradient (electric blue -> indigo) with a
// matching colored shadow glow that deepens on hover, so every primary
// button in the app reads as one deliberate accent system instead of a flat
// single color.
const primaryGradient =
  "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:from-blue-400 hover:to-indigo-500 hover:shadow-xl hover:shadow-blue-500/40 disabled:hover:shadow-lg disabled:hover:shadow-blue-500/30";

export const buttonStyles = {
  primary: `${buttonBase} ${primaryGradient} px-4 py-2`,
  primarySm: `${buttonBase} ${primaryGradient} px-3 py-1.5 text-xs`,
  secondary: `${buttonBase} border border-white/15 bg-white/5 px-4 py-2 text-slate-200 hover:border-white/25 hover:bg-white/10`,
  secondarySm: `${buttonBase} border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:border-white/25 hover:bg-white/10`,
  dark: `${buttonBase} bg-slate-700 px-4 py-2 text-white shadow-sm shadow-black/20 hover:bg-slate-600 hover:shadow-md`,
  darkSm: `${buttonBase} bg-slate-700 px-3 py-1.5 text-xs text-white shadow-sm shadow-black/20 hover:bg-slate-600 hover:shadow-md`,
  destructive: `${buttonBase} border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50`,
  destructiveSm: `${buttonBase} border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50`,
  successSm: `${buttonBase} border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50`,
  accentSm: `${buttonBase} border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-violet-500/10 px-3 py-1.5 text-xs text-blue-300 hover:border-blue-400/50 hover:from-blue-500/15 hover:to-violet-500/15`,
} as const;

// Consistent text input / select styling — same border, radius, placeholder
// tone, and focus ring everywhere a field appears. `inputStylesBase` omits
// width so call sites needing a fixed width (e.g. a small numeric field)
// don't end up with two conflicting width utilities in the same string.
export const inputStylesBase =
  "rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus:border-blue-400";
export const inputStyles = `w-full ${inputStylesBase}`;
export const inputStylesSm =
  "rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus:border-blue-400";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-1.5 hidden h-7 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-blue-500 to-violet-500 sm:block"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// Each stat card gets a distinct tinted personality — a soft colored wash
// across the whole card plus a bolder, solid-color icon badge — instead of
// every card being an identical white box with a pale icon in the corner.
const STAT_TONES: Record<
  string,
  { wash: string; border: string; badge: string }
> = {
  indigo: {
    wash: "bg-gradient-to-br from-blue-500/10 via-slate-900 to-slate-900",
    border: "border-white/10 hover:border-blue-400/40",
    badge: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30",
  },
  emerald: {
    wash: "bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900",
    border: "border-white/10 hover:border-emerald-400/40",
    badge: "bg-emerald-500 text-white shadow-md shadow-emerald-500/30",
  },
  amber: {
    wash: "bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900",
    border: "border-white/10 hover:border-amber-400/40",
    badge: "bg-amber-500 text-white shadow-md shadow-amber-500/30",
  },
  red: {
    wash: "bg-gradient-to-br from-rose-500/10 via-slate-900 to-slate-900",
    border: "border-white/10 hover:border-rose-400/40",
    badge: "bg-rose-500 text-white shadow-md shadow-rose-500/30",
  },
  slate: {
    wash: "bg-slate-900",
    border: "border-white/10 hover:border-white/20",
    badge: "bg-slate-700 text-white shadow-md shadow-black/20",
  },
};

export function StatCard({
  label,
  value,
  href,
  icon: Icon,
  tone = "indigo",
}: {
  label: string;
  value: number | string;
  href?: string;
  icon?: IconType;
  tone?: keyof typeof STAT_TONES;
}) {
  const t = STAT_TONES[tone] ?? STAT_TONES.indigo;
  const className = `group block rounded-xl border ${t.border} ${t.wash} p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-all duration-200 ${
    href ? "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20" : ""
  }`;
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        {Icon && (
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${t.badge}`}
          >
            <Icon size={19} strokeWidth={2.25} />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-50">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}

export function SectionCard({
  title,
  description,
  children,
  icon: Icon,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  icon?: IconType;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-slate-900 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      {(title || description) && (
        <div className="mb-4 flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-blue-400 ring-1 ring-inset ring-blue-500/20">
              <Icon size={16} strokeWidth={2} />
            </span>
          )}
          <div>
            {title && (
              <h2 className="font-semibold text-slate-100">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-slate-400">{description}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}

export function TableCard({ children }: { children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="scroll-thin overflow-x-auto">{children}</div>
    </section>
  );
}

export function MobileCardList({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-white/10 sm:hidden">{children}</div>;
}

export function MobileCard({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`space-y-3 p-4 text-sm ${className}`} style={style}>
      {children}
    </div>
  );
}

export function MobileCardRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 pt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="text-right text-slate-300">{children}</div>
    </div>
  );
}

export function MobileCardEmpty({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="px-4 py-10 text-center text-sm text-slate-500 sm:hidden">
      {children}
    </div>
  );
}

export function TableEmptyRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-slate-500">
        {children}
      </td>
    </tr>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  illustration,
}: {
  title: string;
  description?: string;
  icon?: IconType;
  illustration?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-14 text-center">
      {illustration ? (
        <div className="mb-2" aria-hidden>
          {illustration}
        </div>
      ) : (
        <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-slate-500">
          <Icon size={20} strokeWidth={1.75} />
        </span>
      )}
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 ring-amber-400/30",
  APPROVED: "bg-emerald-500/10 text-emerald-400 ring-emerald-400/30",
  ACTIVE: "bg-emerald-500/10 text-emerald-400 ring-emerald-400/30",
  AVAILABLE: "bg-emerald-500/10 text-emerald-400 ring-emerald-400/30",
  REJECTED: "bg-rose-500/10 text-rose-400 ring-rose-400/30",
  OVERDUE: "bg-rose-500/10 text-rose-400 ring-rose-400/30",
  UNAVAILABLE: "bg-rose-500/10 text-rose-400 ring-rose-400/30",
  RETURNED: "bg-white/5 text-slate-400 ring-white/10",
  INACTIVE: "bg-white/5 text-slate-400 ring-white/10",
  DEACTIVATED: "bg-white/5 text-slate-400 ring-white/10",
};

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const cls =
    STATUS_STYLES[status] ?? "bg-white/5 text-slate-400 ring-white/10";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls}`}
    >
      {label ?? status}
    </span>
  );
}

export function Chip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/5 text-slate-300",
    accent: "bg-gradient-to-r from-blue-500/15 to-violet-500/15 text-blue-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
