import Link from "next/link";
import { Search, ClipboardList, Users2 } from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { buttonStyles } from "@/components/ui";

const roleHome: Record<string, string> = {
  ADMIN: "/admin",
  STAFF: "/staff",
  STUDENT: "/student",
};

const features = [
  {
    title: "Browse the catalog",
    description:
      "Search the full collection by title or author, and filter by category or tag to find the right book fast.",
    icon: Search,
  },
  {
    title: "Request and track loans",
    description:
      "Send a borrow request in one click and follow its status from pending to approved, returned, or overdue.",
    icon: ClipboardList,
  },
  {
    title: "Run the front desk",
    description:
      "Staff and admins approve requests, manage inventory and copies, and keep tabs on everything checked out.",
    icon: Users2,
  },
];

export default async function Home() {
  const session = await getSession();
  if (session?.user) {
    redirect(roleHome[session.user.role] ?? "/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-100"
            >
              Log in
            </Link>
            <Link href="/signup" className={buttonStyles.primary}>
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pt-16 pb-14 text-center sm:px-6 sm:pt-24 sm:pb-20">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
            Library management, without the spreadsheets
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
            Run your library&apos;s books, loans, and staff in one place.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
            AJ gives students a fast way to find and request books, and
            gives staff and admins a clear workflow for approvals, inventory,
            and returns — all from a single, focused dashboard.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className={buttonStyles.primary}>
              Log in
            </Link>
            <Link href="/signup" className={buttonStyles.secondary}>
              Sign up as a student
            </Link>
          </div>
        </section>

        <section className="border-t border-white/10 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid gap-8 sm:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <feature.icon size={20} strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-100">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} AJ. All rights reserved.</span>
          <span>Built for libraries that outgrew the spreadsheet.</span>
        </div>
      </footer>
    </div>
  );
}
