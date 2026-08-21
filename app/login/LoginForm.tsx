"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { buttonStyles } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin") {
          setError("Invalid email or password.");
        } else {
          setError(
            `Server error during sign-in (${res.error}). Check the terminal running \`npm run dev\` for the real error.`
          );
        }
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
      // Intentionally leave loading=true here — we're navigating away.
      // If the redirect doesn't happen quickly, clear it so the button
      // doesn't stay stuck forever.
      setTimeout(() => setLoading(false), 3000);
    } catch (err) {
      console.error("Sign-in request failed:", err);
      setError(
        "Something went wrong talking to the server. Check the terminal running `npm run dev` for details, and try again."
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">
          Email
        </label>
        <div className="relative">
          <Mail
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-white/5 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">
          Password
        </label>
        <div className="relative">
          <Lock
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-white/5 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            placeholder="••••••••"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`${buttonStyles.primary} w-full py-2.5`}
      >
        {loading && <Spinner className="h-3.5 w-3.5" />}
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
