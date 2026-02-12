"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Tables } from "@/lib/database.types";
import type { MatchOdds } from "@/lib/odds";
import { MiniMatchCard } from "@/components/match-card";

type Match = Tables<"matches">;

type UserPrediction = {
  id: string;
  match_id: string;
  predicted_winner: string;
  amount: number;
  payout: number | null;
};

type BracketViewProps = {
  matches: Match[];
  userPredictions: UserPrediction[];
  onMatchClick: (match: Match) => void;
};

const ROUND_LABELS: Record<number, string> = {
  1: "Ottendedelsfinale",
  2: "Kvartfinale",
  3: "Semifinale",
  4: "Finale",
};

export function BracketView({
  matches,
  userPredictions,
  onMatchClick,
}: BracketViewProps) {
  const [oddsMap, setOddsMap] = useState<Record<string, MatchOdds>>({});

  // Group matches by round
  const rounds = new Map<number, Match[]>();
  for (const m of matches) {
    if (!rounds.has(m.round)) rounds.set(m.round, []);
    rounds.get(m.round)!.push(m);
  }

  // Sort each round by match_order
  for (const [, roundMatches] of rounds) {
    roundMatches.sort((a, b) => a.match_order - b.match_order);
  }

  const roundNumbers = Array.from(rounds.keys()).sort((a, b) => a - b);

  // Fetch odds for all matches
  const fetchAllOdds = useCallback(async () => {
    const results: Record<string, MatchOdds> = {};
    await Promise.allSettled(
      matches.map(async (m) => {
        try {
          const res = await fetch(`/api/matches/${m.id}/odds`);
          if (res.ok) {
            results[m.id] = await res.json();
          }
        } catch {
          // ignore individual failures
        }
      })
    );
    setOddsMap(results);
  }, [matches]);

  useEffect(() => {
    fetchAllOdds();
    const interval = setInterval(fetchAllOdds, 15_000);
    return () => clearInterval(interval);
  }, [fetchAllOdds]);

  // Build prediction lookup
  const predictionByMatch = new Map<string, UserPrediction>();
  for (const p of userPredictions) {
    predictionByMatch.set(p.match_id, p);
  }

  const maxRound = Math.max(...roundNumbers);

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="inline-flex min-w-max gap-0">
        {roundNumbers.map((round) => {
          const roundMatches = rounds.get(round)!;
          const isLast = round === maxRound;

          return (
            <div key={round} className="flex flex-col">
              {/* Round header */}
              <div className="mb-3 px-2 text-center">
                <span
                  className={cn(
                    "inline-block rounded-full border border-border bg-white px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider shadow-sm",
                    isLast ? "text-gold" : "text-muted"
                  )}
                >
                  {ROUND_LABELS[round] ?? `Runde ${round}`}
                </span>
              </div>

              {/* Matches column with connectors */}
              <div className="flex flex-1 flex-col justify-around gap-2 px-2">
                {roundMatches.map((match, matchIdx) => {
                  const prediction = predictionByMatch.get(match.id);

                  return (
                    <div
                      key={match.id}
                      className="relative flex items-center"
                    >
                      {/* Match card */}
                      <div className="w-48 shrink-0">
                        <MiniMatchCard
                          match={match}
                          odds={oddsMap[match.id] ?? null}
                          userPrediction={prediction}
                          onClick={() => onMatchClick(match)}
                        />
                      </div>

                      {/* Connector lines to next round */}
                      {!isLast && (
                        <div className="relative w-8">
                          <div className="absolute left-0 top-1/2 h-[1px] w-3 bg-border" />
                          {matchIdx % 2 === 0 && (
                            <div
                              className="absolute left-3 top-1/2 w-[1px] bg-border"
                              style={{
                                height: "calc(50% + 0.25rem + 50%)",
                              }}
                            />
                          )}
                          {matchIdx % 2 === 0 && (
                            <div
                              className="absolute right-0 w-2 h-[1px] bg-border"
                              style={{
                                top: `calc(100% + 0.25rem)`,
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
