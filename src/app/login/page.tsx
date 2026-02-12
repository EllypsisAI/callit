"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Zap, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Mode = "signup" | "login";

const SUPABASE_ERROR_MAP: Record<string, string> = {
  "Invalid login credentials": "Forkert email eller adgangskode",
  "User already registered": "Der findes allerede en bruger med denne email",
  "Password should be at least 6 characters":
    "Adgangskoden skal være mindst 6 tegn",
  "Email rate limit exceeded":
    "For mange forsøg — vent et par minutter og prøv igen",
  "For security purposes, you can only request this after 60 seconds":
    "Vent venligst 60 sekunder før du prøver igen",
};

function danishError(msg: string): string {
  return SUPABASE_ERROR_MAP[msg] || msg;
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "signup") {
      if (!displayName.trim()) {
        setError("Brugernavn er påkrævet");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Adgangskoden skal være mindst 6 tegn");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName.trim() },
        },
      });

      if (error) {
        setError(danishError(error.message));
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(danishError(error.message));
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    }
  }

  async function handleResetPassword() {
    if (!email) {
      setError("Indtast din email først");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      setError(danishError(error.message));
    } else {
      setResetSent(true);
    }
    setLoading(false);
  }

  if (resetSent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 pitch-pattern">
        <div className="relative w-full max-w-sm space-y-4 text-center animate-fade-up">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-lg shadow-primary/5">
            <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
              Tjek din email
            </h1>
            <p className="mt-2 text-sm text-muted">
              Vi har sendt et link til{" "}
              <strong className="text-foreground">{email}</strong> hvor du kan
              nulstille din adgangskode.
            </p>
            <button
              onClick={() => setResetSent(false)}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Tilbage til log ind
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 pitch-pattern">
      {/* Background glow */}
      <div className="pointer-events-none fixed -top-32 left-1/2 h-64 w-[500px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-3xl" />

      <div className="relative w-full max-w-sm space-y-6 animate-fade-up">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tilbage
        </Link>

        {/* Login card */}
        <div className="relative rounded-2xl border border-border bg-white p-6 shadow-lg shadow-primary/5">
          {/* Top accent */}
          <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-pitch-dark via-primary to-pitch-light" />

          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
              {mode === "signup" ? "Opret konto" : "Log ind"}
            </h1>
          </div>

          {/* Mode tabs */}
          <div className="mb-5 flex rounded-xl bg-secondary p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold uppercase tracking-wider transition-all ${
                mode === "login"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Log ind
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold uppercase tracking-wider transition-all ${
                mode === "signup"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Opret konto
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-muted mb-1.5"
                >
                  Brugernavn
                </label>
                <input
                  id="displayName"
                  type="text"
                  placeholder="Dit navn"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-colors"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-muted mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="din@email.dk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-muted mb-1.5"
              >
                Adgangskode
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    mode === "signup" ? "Mindst 6 tegn" : "Din adgangskode"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "signup" ? 6 : undefined}
                  className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary px-4 py-2.5 font-display text-base font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-pitch-dark hover:shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {loading
                ? "Vent..."
                : mode === "signup"
                  ? "Opret konto"
                  : "Log ind"}
            </button>
          </form>

          {mode === "login" && (
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className="mt-3 block w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Glemt adgangskode?
            </button>
          )}
        </div>

        {/* Branding */}
        <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground/60">
          Ingen rigtige penge — kun bragging rights
        </p>
      </div>
    </main>
  );
}
