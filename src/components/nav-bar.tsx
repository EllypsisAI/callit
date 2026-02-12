"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coins, LogOut, Menu, X, Trophy, Zap } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type NavBarProps = {
  user: { id: string; email: string } | null;
  profile: {
    display_name: string;
    balance: number;
  } | null;
};

function formatDanishNumber(n: number): string {
  return n.toLocaleString("da-DK");
}

export function NavBar({ user, profile }: NavBarProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur-xl">
      {/* Top accent — pitch green stripe */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-pitch-dark via-pitch to-pitch-light" />

      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-navy transition-transform group-hover:scale-105">
            <span className="font-display text-lg font-bold text-white">C</span>
          </div>
          <span className="font-display text-2xl font-semibold tracking-tight text-navy">
            Call<span className="text-primary">It</span>
          </span>
        </Link>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 sm:flex">
          {/* Leaderboard link */}
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Trophy className="h-3.5 w-3.5" />
            Rangliste
          </Link>

          {user && profile ? (
            <>
              {/* My predictions link */}
              <Link
                href="/mine-forudsigelser"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Zap className="h-3.5 w-3.5" />
                Mine calls
              </Link>

              {/* Balance chip */}
              <div className="flex items-center gap-2 rounded-full border border-gold/30 bg-amber-50 px-3.5 py-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dim shadow-sm">
                  <Coins className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-semibold tabular-nums text-gold">
                  {formatDanishNumber(profile.balance)}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-gold/60">
                  calls
                </span>
              </div>

              {/* User name */}
              <span className="text-sm text-muted">
                {profile.display_name}
              </span>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                title="Log ud"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-pitch-dark hover:shadow-md"
            >
              Log ind
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:hidden"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={cn(
          "overflow-hidden border-t border-border bg-white/95 backdrop-blur-xl transition-all duration-200 sm:hidden",
          mobileMenuOpen ? "max-h-48" : "max-h-0 border-t-0"
        )}
      >
        <div className="flex flex-col gap-3 px-4 py-3">
          {/* Leaderboard link */}
          <Link
            href="/leaderboard"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Trophy className="h-4 w-4" />
            Rangliste
          </Link>

          {user && profile ? (
            <>
              <Link
                href="/mine-forudsigelser"
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Zap className="h-4 w-4" />
                Mine calls
              </Link>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">
                  {profile.display_name}
                </span>
                <div className="flex items-center gap-2 rounded-full border border-gold/30 bg-amber-50 px-3 py-1">
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dim">
                    <Coins className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-gold">
                    {formatDanishNumber(profile.balance)}
                  </span>
                  <span className="text-[10px] text-gold/60">calls</span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                Log ud
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-pitch-dark"
            >
              Log ind
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
