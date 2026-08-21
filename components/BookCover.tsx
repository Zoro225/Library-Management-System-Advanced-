// Deterministic, generated "cover art" for a book — no external images.
// The same book (by id + title) always renders the same gradient + pattern +
// initials, but different books land on different combinations, so a grid of
// these reads as a varied shelf rather than one repeated template.

type Size = "xs" | "sm" | "md" | "lg";

// Each entry is a full literal Tailwind class string (not built from
// interpolated color names) so the JIT scanner can find and generate them.
const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-fuchsia-500 to-pink-600",
  "from-sky-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-teal-500 to-emerald-600",
  "from-orange-500 to-amber-600",
  "from-blue-500 to-violet-600",
  "from-pink-500 to-rose-600",
] as const;

const SIZE_CLASSES: Record<Size, string> = {
  xs: "h-11 w-8 text-[11px] rounded-sm",
  sm: "h-14 w-10 text-xs rounded-md",
  md: "h-24 w-16 text-lg rounded-lg",
  lg: "aspect-[2/3] w-full text-3xl rounded-xl",
};

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initials(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0] + words[1]![0]).toUpperCase();
}

// Four hand-authored, low-opacity SVG textures — a dot grid, diagonal
// stripes, concentric rings, and a wavy line pattern — so covers don't all
// share one repeated overlay. `uid` keeps each cover's pattern/gradient defs
// unique in the DOM (this renders inside server components, so no useId).
function PatternOverlay({ variant, uid }: { variant: number; uid: string }) {
  const id = `bc-${uid}-${variant}`;
  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full opacity-30"
      viewBox="0 0 100 150"
      preserveAspectRatio="none"
    >
      {variant === 0 && (
        <>
          <defs>
            <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2.5" cy="2.5" r="1.6" fill="white" />
            </pattern>
          </defs>
          <rect width="100" height="150" fill={`url(#${id})`} />
        </>
      )}
      {variant === 1 && (
        <>
          <defs>
            <pattern
              id={id}
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(35)"
            >
              <rect width="14" height="7" fill="white" />
            </pattern>
          </defs>
          <rect width="100" height="150" fill={`url(#${id})`} />
        </>
      )}
      {variant === 2 && (
        <g fill="none" stroke="white" strokeWidth="2.5">
          <circle cx="50" cy="38" r="10" />
          <circle cx="50" cy="38" r="22" />
          <circle cx="50" cy="38" r="34" />
        </g>
      )}
      {variant === 3 && (
        <g fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M-10 40 Q 15 28 40 40 T 90 40 T 140 40" />
          <path d="M-10 100 Q 15 88 40 100 T 90 100 T 140 100" />
        </g>
      )}
    </svg>
  );
}

export function BookCover({
  id,
  title,
  size = "md",
  className = "",
}: {
  id: string;
  title: string;
  size?: Size;
  className?: string;
}) {
  const hash = hashString(`${id}:${title}`);
  const gradient = GRADIENTS[hash % GRADIENTS.length];
  const patternVariant = Math.floor(hash / GRADIENTS.length) % 4;
  const label = initials(title);

  return (
    <div
      className={`group relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br shadow-md shadow-black/40 ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 ${gradient} ${SIZE_CLASSES[size]} ${className}`}
      title={title}
    >
      <PatternOverlay variant={patternVariant} uid={id} />
      <div className="relative z-10 flex flex-col items-center gap-1.5">
        <span className="font-serif font-bold leading-none text-white drop-shadow-sm">
          {label}
        </span>
        <span className="h-px w-6 bg-white/50" aria-hidden />
      </div>
    </div>
  );
}
