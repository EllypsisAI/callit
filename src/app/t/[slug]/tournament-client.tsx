"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Flame,
  Clock,
  ChevronDown,
  ChevronUp,
  Coins,
  Target,
  TrendingUp,
  BarChart3,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MatchCard } from "@/components/match-card";
import { PredictionSlip } from "@/components/prediction-slip";
import { BracketView } from "@/components/bracket-view";
import { Disclaimer } from "@/components/disclaimer";
import type { Tables } from "@/lib/database.types";
import type { MatchOdds } from "@/lib/odds";

type Match = Tables<"matches">;
type Tournament = Tables<"tournaments">;
type Profile = Tables<"profiles">;

type UserPrediction = {
  id: string;
  match_id: string;
  predicted_winner: string;
  amount: number;
  payout: number | null;
};

type TournamentClientProps = {
  tournament: Tournament;
  matches: Match[];
  user: { id: string; email: string } | null;
  profile: Profile | null;
  userPredictions: UserPrediction[];
};

type SlipData = {
  match: Match;
  side: "a" | "b";
  odds: number;
  matchOdds: MatchOdds;
};

const ROUND_LABELS: Record<number, string> = {
  1: "Ottendedelsfinale",
  2: "Kvartfinale",
  3: "Semifinale",
  4: "Finale",
};

const STATUS_CONFIG = {
  upcoming: {
    label: "Kommende",
    icon: Clock,
    className: "border-border bg-secondary text-muted",
  },
  active: {
    label: "Aktiv",
    icon: Flame,
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  completed: {
    label: "Afsluttet",
    icon: Trophy,
    className: "border-border bg-secondary text-muted",
  },
} as const;

const HOW_IT_WORKS_STEPS = [
  {
    icon: Coins,
    title: "Få 1.000 calls",
    desc: "Opret en konto og få gratis startkapital",
  },
  {
    icon: Target,
    title: "Vælg din vinder",
    desc: "Sæt calls på den spiller du tror vinder",
  },
  {
    icon: TrendingUp,
    title: "Odds skifter live",
    desc: "Jo flere der vælger en side, jo bedre odds på den anden",
  },
  {
    icon: BarChart3,
    title: "Klatr på ranglisten",
    desc: "Vind calls og bevis at du kalder det rigtigt",
  },
];

export function TournamentClient({
  tournament,
  matches,
  user,
  profile,
  userPredictions,
}: TournamentClientProps) {
  const router = useRouter();
  const [slip, setSlip] = useState<SlipData | null>(null);
  const [collapsedRounds, setCollapsedRounds] = useState<Set<number>>(
    new Set()
  );
  const [viewMode, setViewMode] = useState<"list" | "bracket">("list");
  const [showHowItWorks, setShowHowItWorks] = useState(true);
  const matchRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Group matches by round
  const rounds = new Map<number, Match[]>();
  for (const m of matches) {
    if (!rounds.has(m.round)) rounds.set(m.round, []);
    rounds.get(m.round)!.push(m);
  }
  const roundNumbers = Array.from(rounds.keys()).sort((a, b) => a - b);

  // Build prediction lookup by match_id
  const predictionByMatch = new Map<string, UserPrediction>();
  for (const p of userPredictions) {
    predictionByMatch.set(p.match_id, p);
  }

  const isLoggedIn = !!user;

  function toggleRound(round: number) {
    setCollapsedRounds((prev) => {
      const next = new Set(prev);
      if (next.has(round)) next.delete(round);
      else next.add(round);
      return next;
    });
  }

  function handleSelectPrediction(
    match: Match,
    side: "a" | "b",
    odds: number,
    matchOdds: MatchOdds
  ) {
    setSlip({ match, side, odds, matchOdds });
  }

  const handlePredictionSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  function handleBracketMatchClick(match: Match) {
    setViewMode("list");
    setTimeout(() => {
      const el = matchRefs.current[match.id];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary/50");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-primary/50");
        }, 2000);
      }
    }, 100);
  }

  const status = STATUS_CONFIG[tournament.status];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background pitch-pattern">
      {/* Tournament header */}
      <header className="relative overflow-hidden border-b border-border">
        {/* Subtle green gradient at top */}
        <div className="absolute inset-0 pitch-gradient-top" />

        <div className="relative mx-auto max-w-5xl px-4 pb-5 pt-6">
          {/* Status badge */}
          <div className="mb-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                status.className
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
          </div>

          {/* Title — display font */}
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-foreground sm:text-5xl">
            {tournament.title}
          </h1>

          {/* Description */}
          {tournament.description && (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              {tournament.description}
            </p>
          )}

          {/* Quick stats */}
          <div className="mt-4 flex items-center gap-4 text-xs text-muted">
            <span>{matches.length} kampe</span>
            <span className="h-3 w-[1px] bg-border" />
            <span>{roundNumbers.length} runder</span>
            <span className="h-3 w-[1px] bg-border" />
            <span>
              {matches.filter((m) => m.status === "completed").length} afsluttet
            </span>
          </div>
        </div>
      </header>

      {/* How it works — dismissible */}
      {showHowItWorks && (
        <div className="mx-auto max-w-5xl px-4 pt-5">
          <div className="relative overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            {/* Subtle top accent */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <h3 className="font-display text-base font-semibold uppercase tracking-wider text-primary">
                Sådan virker det
              </h3>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
              {HOW_IT_WORKS_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex flex-col items-center gap-2 rounded-lg bg-secondary/50 px-3 py-3 text-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {step.title}
                    </span>
                    <span className="text-[10px] leading-tight text-muted">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* View mode toggle */}
      {roundNumbers.length > 1 && (
        <div className="mx-auto hidden max-w-5xl px-4 pt-4 md:block">
          <div className="inline-flex rounded-lg border border-border bg-white p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "list"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Liste
            </button>
            <button
              onClick={() => setViewMode("bracket")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "bracket"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Bracket
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Bracket view (desktop only) */}
        {viewMode === "bracket" && (
          <div className="hidden md:block">
            <BracketView
              matches={matches}
              userPredictions={userPredictions}
              onMatchClick={handleBracketMatchClick}
            />
          </div>
        )}

        {/* List view */}
        {(viewMode === "list" || viewMode === "bracket") && (
          <div
            className={cn(
              viewMode === "bracket" ? "md:hidden" : "",
              "space-y-6"
            )}
          >
            {roundNumbers.map((round) => {
              const roundMatches = rounds.get(round)!;
              const isCollapsed = collapsedRounds.has(round);
              const completedCount = roundMatches.filter(
                (m) => m.status === "completed"
              ).length;
              const allCompleted = completedCount === roundMatches.length;

              return (
                <section key={round}>
                  {/* Round header */}
                  <button
                    onClick={() => toggleRound(round)}
                    className="group mb-3 flex w-full items-center gap-3"
                  >
                    <div
                      className={cn(
                        "h-[1px] flex-1",
                        allCompleted
                          ? "bg-border/50"
                          : "bg-gradient-to-r from-primary/30 to-transparent"
                      )}
                    />
                    <span
                      className={cn(
                        "flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-wider",
                        allCompleted ? "text-muted-foreground" : "text-foreground"
                      )}
                    >
                      {ROUND_LABELS[round] ?? `Runde ${round}`}
                      <span className="font-sans text-xs text-muted-foreground">
                        ({completedCount}/{roundMatches.length})
                      </span>
                      {isCollapsed ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform" />
                      ) : (
                        <ChevronUp className="h-3.5 w-3.5 text-muted-foreground transition-transform" />
                      )}
                    </span>
                    <div
                      className={cn(
                        "h-[1px] flex-1",
                        allCompleted
                          ? "bg-border/50"
                          : "bg-gradient-to-l from-primary/30 to-transparent"
                      )}
                    />
                  </button>

                  {/* Match cards */}
                  {!isCollapsed && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {roundMatches.map((match) => {
                        const prediction = predictionByMatch.get(match.id);
                        return (
                          <div
                            key={match.id}
                            ref={(el) => {
                              matchRefs.current[match.id] = el;
                            }}
                            className="rounded-2xl transition-all duration-500"
                          >
                            <MatchCard
                              match={match}
                              userPrediction={prediction}
                              isLoggedIn={isLoggedIn}
                              onSelectPrediction={handleSelectPrediction}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {matches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Trophy className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="font-display text-xl font-semibold uppercase text-foreground">
              Ingen kampe endnu
            </p>
            <p className="mt-1 text-sm text-muted">
              Kampene bliver tilføjet snart. Kom tilbage senere!
            </p>
          </div>
        )}
      </main>

      {/* Disclaimer */}
      <Disclaimer />

      {/* Prediction slip */}
      {slip && profile && (
        <PredictionSlip
          match={slip.match}
          side={slip.side}
          odds={slip.odds}
          matchOdds={slip.matchOdds}
          userBalance={profile.balance}
          onClose={() => setSlip(null)}
          onSuccess={handlePredictionSuccess}
        />
      )}
    </div>
  );
}
