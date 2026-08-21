// Small inline spinner used by buttons/forms while a server action is in
// flight. Uses `currentColor` so it automatically matches whatever text
// color the parent button already has, instead of needing a variant per
// button style.
export function Spinner({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70 ${className}`}
    />
  );
}
