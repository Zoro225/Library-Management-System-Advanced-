"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutGrid,
  Users,
  BookOpen,
  Inbox,
  Clock,
  Search,
  Bookmark,
  Menu,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "./Logo";

type Role = "ADMIN" | "STAFF" | "STUDENT";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const LINKS_BY_ROLE: Record<Role, NavLink[]> = {
  ADMIN: [
    { href: "/admin", label: "Overview", icon: LayoutGrid },
    { href: "/admin/staff", label: "Manage Staff", icon: Users },
    { href: "/admin/inventory", label: "Inventory", icon: BookOpen },
    { href: "/admin/requests", label: "Requests", icon: Inbox },
    { href: "/admin/borrowed", label: "Books Taken", icon: Clock },
  ],
  STAFF: [
    { href: "/staff", label: "Overview", icon: LayoutGrid },
    { href: "/staff/inventory", label: "Inventory", icon: BookOpen },
    { href: "/staff/requests", label: "Requests", icon: Inbox },
    { href: "/staff/borrowed", label: "Books Taken", icon: Clock },
  ],
  STUDENT: [
    { href: "/student", label: "Browse Books", icon: Search },
    { href: "/student/my-requests", label: "My Books", icon: Bookmark },
  ],
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

function Avatar({ name, className = "h-9 w-9 text-xs" }: { name: string; className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-semibold text-white shadow-sm shadow-blue-500/30 ${className}`}
    >
      {initials(name)}
    </span>
  );
}

function findActiveLink(pathname: string, links: NavLink[]) {
  const exact = links.find((link) => link.href === pathname);
  if (exact) return exact;
  const nested = links
    .filter((link) => link.href !== links[0].href && pathname.startsWith(link.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return nested ?? links[0];
}

function NavList({
  links,
  pathname,
  onNavigate,
}: {
  links: NavLink[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = findActiveLink(pathname, links);
  return (
    <nav className="flex flex-col gap-1 px-3">
      {links.map((link) => {
        const isActive = link.href === active.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-500/15 to-violet-500/10 text-blue-300 shadow-sm ring-1 ring-inset ring-blue-500/25"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
            }`}
          >
            {isActive && (
              <span
                className="absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-500 to-violet-500"
                style={{ width: 3 }}
              />
            )}
            <Icon
              size={18}
              strokeWidth={2}
              className={`shrink-0 transition-colors duration-200 ${isActive ? "text-blue-400" : "text-slate-500"}`}
            />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  role,
  name,
  children,
}: {
  role: Role;
  name: string;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const links = LINKS_BY_ROLE[role];
  const activeLink = findActiveLink(pathname, links);

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Desktop sidebar — a whisper of brand-tinted wash + hairline border
          gives it presence as a floating panel without a heavy light-mode
          shadow. */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-gradient-to-b from-blue-500/5 via-slate-900 to-slate-900 lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <NavList links={links} pathname={pathname} />
        </div>
        <div className="flex items-center gap-3 border-t border-white/10 p-4">
          <Avatar name={name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-100">{name}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {role.toLowerCase()}
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 transition-opacity duration-150"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[80vw] flex-col bg-gradient-to-b from-blue-500/5 via-slate-900 to-slate-900 shadow-xl shadow-black/50">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <Logo />
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-slate-400 transition-colors duration-150 hover:bg-white/10 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <NavList
                links={links}
                pathname={pathname}
                onNavigate={() => setDrawerOpen(false)}
              />
            </div>
            <div className="flex items-center gap-3 border-t border-white/10 p-4">
              <Avatar name={name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-100">{name}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {role.toLowerCase()}
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                className="rounded-md p-1.5 text-slate-400 transition-colors duration-150 hover:bg-white/10 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 lg:hidden"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-base font-semibold text-slate-100 sm:text-lg">
                {activeLink.label}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2.5 sm:flex">
                <div className="text-right">
                  <p className="text-sm font-medium leading-tight text-slate-100">{name}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide leading-tight text-slate-500">
                    {role.toLowerCase()}
                  </p>
                </div>
                <Avatar name={name} className="h-8 w-8 text-[11px]" />
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors duration-150 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <LogOut size={15} strokeWidth={2} />
                Sign out
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
