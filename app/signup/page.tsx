import Link from "next/link";
import { SignupForm } from "./SignupForm";
import { Logo } from "@/components/Logo";
import { LibraryHeroIllustration } from "@/components/illustrations";

export default function SignupPage() {
  return (
    <main className="auth-backdrop relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
      {/* Large soft blurred color blobs give the backdrop real depth instead
          of a flat dotted plane. Purely decorative, so hidden from AT. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute -right-16 top-1/3 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
      </div>

      <div className="animate-fade-up relative z-10 flex w-full max-w-4xl flex-col items-center gap-8 md:flex-row md:items-center md:justify-center md:gap-4">
        <div
          aria-hidden
          className="hidden w-full max-w-xs shrink-0 md:block md:w-2/5"
        >
          <LibraryHeroIllustration uid="signup-desktop" />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-2 w-40 md:hidden" aria-hidden>
              <LibraryHeroIllustration uid="signup-mobile" />
            </div>
            <Logo className="text-lg" size="lg" />
            <h1 className="mt-5 text-2xl font-bold text-slate-50">
              Create your student account
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Sign up to browse the catalog and request books
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/40 backdrop-blur-xl">
            <SignupForm />
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
