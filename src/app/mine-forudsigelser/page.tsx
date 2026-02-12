import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Zap,
  Trophy,
  Clock,
  TrendingUp,
  Target,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getClub } from "@/lib/clubs";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mine forudsigelser — CallIt",
  description: "Se alle dine forudsigelser og hvordan de gik.",
};

type PredictionWithMatch = {
  id: string;
  amount: number;
  predicted_winner: string;
  payout: number | null;
  created_at: string;
  match_id: string;
  matches: {
    id: string;
    player_a: string;
    player_b: string;
    club_a: string | null;
    club_b: string | null;
    status: "upcoming" | "live" | "completed";
    winner: string | null;
    round: number;
    match_order: number;
    tournament_id: string;
  };
};

function formatDanishNumber(n: number): string {
  return n.toLocaleString("da-DK");
}

function ClubBadge({ clubName }: { clubName: string | null }) {
  const club = getClub(clubName);
  if (!club) return null;

  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[8px] font-bold uppercase tracking-wide ring-1 ring-white/10"
      style={{
        backgroundColor: club.primaryColor,
        color: club.textOnPrimary,
      }}
    >
      {club.shortName}
    </span>
  );
}

export default async function MineForudsigelserPage() {
  const { user, profile } = await getCurrentUser();

  if (!user || !profile) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Fetch all predictions for this user, joined with match data
  const { data: predictions } = await supabase
    .from("predictions")
    .select(
      `
      id,
      amount,
      predicted_winner,
      payout,
      created_at,
      match_id,
      matches (
        id,
        player_a,
        player_b,
        club_a,
        club_b,
        status,
        winner,
        round,
        match_order,
        tournament_id
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const allPredictions = (predictions ?? []) as unknown as PredictionWithMatch[];

  // Split into active and completed
  const active = allPredictions.filter(
    (p) => p.matches.status !== "completed"
  );
  const completed = allPredictions.filter(
    (p) => p.matches.status === "completed"
  );

  // Summary stats
  const totalWagered = allPredictions.reduce((sum, p) => sum + p.amount, 0);
  const totalWon = completed
    .filter((p) => p.payout != null && p.payout > 0)
    .reduce((sum, p) => sum + (p.payout ?? 0), 0);
  const totalLost = completed
    .filter((p) => p.payout === null || p.payout === 0)
    .reduce((sum, p) => sum + p.amount, 0);
  const wins = completed.filter(
    (p) => p.payout != null && p.payout > 0
  ).length;
  const winRate =
    completed.length > 0 ? Math.round((wins / completed.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background hex-pattern">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl px-4 pb-5 pt-6">
          <Link
            href="/t/crew-fifa"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbage til turnering
          </Link>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground sm:text-4xl">
            Mine forudsigelser
          </h1>
          <p className="mt-1 text-sm text-muted">
            Alle dine calls samlet ét sted.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Summary stats */}
        {allPredictions.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={<Zap className="h-4 w-4 text-primary" />}
              label="Satset i alt"
              value={`${formatDanishNumber(totalWagered)} calls`}
            />
            <StatCard
              icon={<Trophy className="h-4 w-4 text-success" />}
              label="Vundet i alt"
              value={`${formatDanishNumber(totalWon)} calls`}
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4 text-destructive" />}
              label="Tabt i alt"
              value={`${formatDanishNumber(totalLost)} calls`}
            />
            <StatCard
              icon={<Target className="h-4 w-4 text-primary" />}
              label="Gevinstrate"
              value={`${winRate}%`}
            />
          </div>
        )}

        {/* Empty state */}
        {allPredictions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Zap className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="font-display text-xl font-semibold uppercase text-foreground">
              Du har ikke lavet nogen forudsigelser endnu
            </p>
            <p className="mt-2 text-sm text-muted">
              Gå til turneringen og brug dine calls til at forudsige vinderne!
            </p>
            <Link
              href="/t/crew-fifa"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]"
            >
              Se turneringen
            </Link>
          </div>
        )}

        {/* Active predictions */}
        {active.length > 0 && (
          <section>
            <SectionHeader
              icon={<Clock className="h-4 w-4" />}
              title="Aktive"
              count={active.length}
            />
            <div className="space-y-3">
              {active.map((prediction) => (
                <PredictionCard key={prediction.id} prediction={prediction} />
              ))}
            </div>
          </section>
        )}

        {/* Completed predictions */}
        {completed.length > 0 && (
          <section>
            <SectionHeader
              icon={<Trophy className="h-4 w-4" />}
              title="Afsluttede"
              count={completed.length}
            />
            <div className="space-y-3">
              {completed.map((prediction) => (
                <PredictionCard key={prediction.id} prediction={prediction} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/60 px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-muted mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-display text-lg font-bold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
      <span className="flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
        {icon}
        {title}
        <span className="font-sans text-xs text-muted-foreground">
          ({count})
        </span>
      </span>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
    </div>
  );
}

function PredictionCard({
  prediction,
}: {
  prediction: PredictionWithMatch;
}) {
  const match = prediction.matches;
  const isCompleted = match.status === "completed";
  const pickedA = prediction.predicted_winner === "a";
  const pickedPlayer = pickedA ? match.player_a : match.player_b;
  const pickedClub = pickedA ? match.club_a : match.club_b;

  const didWin =
    isCompleted && prediction.payout != null && prediction.payout > 0;
  const didLose = isCompleted && !didWin;

  // Left accent color based on the picked side's club
  const accentClub = getClub(pickedClub);
  const accentColor = accentClub?.primaryColor ?? undefined;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border transition-all",
        didWin
          ? "border-success/30 bg-success/[0.03]"
          : didLose
            ? "border-border/30 bg-card/40"
            : "border-border/40 bg-card/60"
      )}
    >
      {/* Left accent bar using picked club color */}
      {accentColor && (
        <div
          className="absolute inset-y-0 left-0 w-1"
          style={{ backgroundColor: accentColor }}
        />
      )}

      <div className="px-4 py-3 pl-5">
        {/* Match info */}
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1.5">
            <ClubBadge clubName={match.club_a} />
            <span
              className={cn(
                "font-medium",
                isCompleted && match.winner === "a"
                  ? "text-foreground"
                  : isCompleted
                    ? "text-muted"
                    : "text-foreground"
              )}
            >
              {match.player_a}
            </span>
          </span>

          <span className="text-xs font-bold uppercase text-muted-foreground">
            vs
          </span>

          <span className="flex items-center gap-1.5">
            <ClubBadge clubName={match.club_b} />
            <span
              className={cn(
                "font-medium",
                isCompleted && match.winner === "b"
                  ? "text-foreground"
                  : isCompleted
                    ? "text-muted"
                    : "text-foreground"
              )}
            >
              {match.player_b}
            </span>
          </span>
        </div>

        {/* Prediction details */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-primary">
            <Zap className="h-3 w-3" />
            Dit valg: {pickedPlayer}
            {pickedClub && (
              <span className="text-muted-foreground">({pickedClub})</span>
            )}
          </span>

          <span className="tabular-nums text-muted">
            {formatDanishNumber(prediction.amount)} calls
          </span>
        </div>

        {/* Status / payout row */}
        <div className="mt-2 flex items-center justify-between text-xs">
          {/* Status badge */}
          {isCompleted ? (
            didWin ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success">
                <Trophy className="h-3 w-3" />
                Vundet
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted-foreground/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tabt
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Clock className="h-3 w-3" />
              Afventer
            </span>
          )}

          {/* Payout */}
          {didWin && prediction.payout != null && (
            <span className="font-semibold tabular-nums text-success">
              +{formatDanishNumber(prediction.payout)} calls
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
