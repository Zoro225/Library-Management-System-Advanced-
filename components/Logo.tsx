import Link from "next/link";

// The brand mark uses the same indigo -> violet gradient as primary buttons
// and active nav states, so it reads as one deliberate accent system rather
// than a flat single-color logo bolted onto a neutral app.
export function LogoMark({
  className = "h-7 w-7",
  iconClassName = "h-4 w-4",
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/30 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className={iconClassName}>
        <path
          d="M5 4.5C5 3.67 5.67 3 6.5 3H17a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 19.5v-15Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M8 3v18"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  className = "",
  href,
  size = "md",
}: {
  className?: string;
  href?: string;
  size?: "md" | "lg";
}) {
  const markClassName = size === "lg" ? "h-11 w-11 rounded-xl" : "h-7 w-7";
  const iconClassName = size === "lg" ? "h-6 w-6" : "h-4 w-4";
  const content = (
    <span
      className={`inline-flex items-center gap-2.5 font-semibold tracking-tight text-slate-100 ${className}`}
    >
      <LogoMark className={markClassName} iconClassName={iconClassName} />
      AJ
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
