// Hand-authored inline SVG illustrations used in empty states and the auth
// pages. All self-contained (no external images/fonts) and colored with the
// brand indigo -> violet gradient so they read as part of the same system.

export function EmptyShelfIllustration({ className = "h-24 w-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 96" className={className} aria-hidden>
      <rect x="6" y="80" width="108" height="6" rx="3" fill="#334155" />
      <rect
        x="18"
        y="38"
        width="14"
        height="42"
        rx="2"
        fill="#6366f1"
        opacity="0.85"
        transform="rotate(-9 25 59)"
      />
      <rect x="35" y="30" width="13" height="50" rx="2" fill="#8b5cf6" opacity="0.75" />
      <rect
        x="50" y="42" width="12" height="38" rx="2"
        fill="#a5b4fc" opacity="0.7" transform="rotate(6 56 61)"
      />
      <rect
        x="82" y="48" width="15" height="32" rx="2"
        fill="#c4b5fd" opacity="0.65" transform="rotate(11 89 64)"
      />
      <circle cx="70" cy="16" r="2.5" fill="#c7d2fe" />
      <circle cx="100" cy="24" r="2" fill="#a5b4fc" />
    </svg>
  );
}

export function AllCaughtUpIllustration({ className = "h-24 w-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 96" className={className} aria-hidden>
      <defs>
        <linearGradient id="acu-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect x="30" y="20" width="60" height="54" rx="14" fill="url(#acu-grad)" opacity="0.12" />
      <rect
        x="30" y="20" width="60" height="54" rx="14"
        fill="none" stroke="url(#acu-grad)" strokeWidth="2.5"
      />
      <path
        d="M45 48 L57 60 L78 34"
        stroke="url(#acu-grad)" strokeWidth="4.5"
        strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <path d="M16 28 L22 26 M16 28 L18 34" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" />
      <path d="M100 62 L106 60 M100 62 L102 68" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" />
      <circle cx="98" cy="24" r="2.5" fill="#c4b5fd" />
      <circle cx="14" cy="66" r="2" fill="#a5b4fc" />
    </svg>
  );
}

export function NoResultsIllustration({ className = "h-24 w-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 96" className={className} aria-hidden>
      <path d="M18 64 L54 56 L54 24 L18 32 Z" fill="#a5b4fc" opacity="0.75" />
      <path d="M90 64 L54 56 L54 24 L90 32 Z" fill="#8b5cf6" opacity="0.6" />
      <line x1="54" y1="24" x2="54" y2="56" stroke="#6366f1" strokeWidth="2" />
      <circle cx="82" cy="46" r="15" fill="#0f172a" stroke="#6366f1" strokeWidth="3" />
      <line x1="92.5" y1="56.5" x2="103" y2="67" stroke="#6366f1" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

export function NoActivityIllustration({ className = "h-24 w-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 96" className={className} aria-hidden>
      <line x1="14" y1="76" x2="106" y2="76" stroke="#334155" strokeWidth="2" />
      <path
        d="M14 56 Q 35 56 45 56 T 76 56 T 106 56"
        stroke="#c7d2fe" strokeWidth="3" fill="none"
        strokeDasharray="6 6" strokeLinecap="round"
      />
      <circle cx="60" cy="56" r="3.5" fill="#8b5cf6" />
      <circle cx="60" cy="56" r="7.5" fill="#8b5cf6" opacity="0.2" />
    </svg>
  );
}

// Auth-page hero illustration: a stack of books with an open book resting on
// top. The bookmark ribbon and the small glow drift gently via the `float`
// keyframes defined in globals.css, so the page has a touch of ambient life.
export function LibraryHeroIllustration({
  className = "h-full w-full",
  uid = "default",
}: {
  className?: string;
  uid?: string;
}) {
  // Gradient ids are namespaced by `uid` — this illustration is rendered
  // twice per auth page (a desktop copy and a mobile copy, toggled with
  // `hidden`/`md:block`), and duplicate SVG element ids in one document can
  // make `url(#id)` fills resolve inconsistently.
  const a = `lh-a-${uid}`;
  const b = `lh-b-${uid}`;
  const c = `lh-c-${uid}`;
  return (
    <svg
      viewBox="0 0 260 220"
      className={`aspect-[260/220] ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={a} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id={b} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id={c} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#93c5fd" />
          <stop offset="1" stopColor="#60a5fa" />
        </linearGradient>
      </defs>

      {/* soft ground shadow */}
      <ellipse cx="130" cy="188" rx="92" ry="12" fill="#000000" opacity="0.35" />

      {/* stacked books */}
      <rect x="46" y="158" width="168" height="20" rx="4" fill={`url(#${a})`} />
      <rect x="60" y="136" width="140" height="20" rx="4" fill={`url(#${b})`} opacity="0.9" />
      <rect x="76" y="114" width="108" height="20" rx="4" fill={`url(#${c})`} opacity="0.85" />

      {/* open book on top, gently floating */}
      <g className="hero-float">
        <path
          d="M130 70 L66 92 L66 108 L130 90 Z"
          fill="#1e293b"
          stroke="#60a5fa"
          strokeWidth="2"
        />
        <path
          d="M130 70 L194 92 L194 108 L130 90 Z"
          fill="#0f172a"
          stroke="#818cf8"
          strokeWidth="2"
        />
        <line x1="130" y1="70" x2="130" y2="90" stroke="#8b5cf6" strokeWidth="2" />
        <path d="M76 88 L120 76" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" />
        <path d="M76 96 L118 84" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" />
        <path d="M142 76 L184 88" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" />
        <path d="M144 84 L182 96" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* floating bookmark ribbon */}
      <g className="hero-float-slow">
        <path
          d="M186 40 L206 40 L206 78 L196 68 L186 78 Z"
          fill={`url(#${b})`}
        />
      </g>

      {/* ambient sparkles */}
      <g className="hero-float">
        <circle cx="40" cy="56" r="3.5" fill="#a5b4fc" />
      </g>
      <g className="hero-float-slow">
        <circle cx="222" cy="70" r="2.5" fill="#c4b5fd" />
        <circle cx="34" cy="120" r="2" fill="#818cf8" />
      </g>
    </svg>
  );
}
