"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Trophy,
  Users,
  Zap,
  CheckCircle2,
  Lock,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getClub } from "@/lib/clubs";
import type { Tables } from "@/lib/database.types";
import type { MatchOdds } from "@/lib/odds";

type Match = Tables<"matches">;

type UserPrediction = {
  id: string;
  predicted_winner: string;
  amount: number;
  payout: number | null;
};

type MatchCardProps = {
  match: Match;
  userPrediction?: UserPrediction | null;
  isLoggedIn: boolean;
  onSelectPrediction: (
    match: Match,
    side: "a" | "b",
    odds: number,
    matchOdds: MatchOdds
  ) => void;
};

function formatDanishNumber(n: number): string {
  return n.toLocaleString("da-DK");
}

function formatDanishDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("da-DK", { day: "numeric", month: "short" });
}

const POLL_INTERVAL = 10_000;

/** Small club badge — circle with team abbreviation in club colors */
function ClubBadge({ clubName }: { clubName: string | null }) {
  const club = getClub(clubName);
  if (!club) return null;

  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-bold uppercase tracking-wide shadow-sm"
      style={{
        backgroundColor: club.primaryColor,
        color: club.textOnPrimary,
      }}
    >
      {club.shortName}
    </div>
  );
}

export function MatchCard({
  match,
  userPrediction,
  isLoggedIn,
  onSelectPrediction,
}: MatchCardProps) {
  const [odds, setOdds] = useState<MatchOdds | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchOdds = useCallback(async () => {
    try {
      const res = await fetch(`/api/matches/${match.id}/odds`);
      if (!res.ok) throw new Error("Failed to fetch odds");
      const data: MatchOdds = await res.json();
      setOdds(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [match.id]);

  useEffect(() => {
    fetchOdds();
    if (match.status !== "completed") {
      const interval = setInterval(fetchOdds, POLL_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [fetchOdds, match.status]);

  const isCompleted = match.status === "completed";
  const isLive = match.status === "live";
  const hasPredicted = !!userPrediction;

  const percentA = odds?.percentA ?? 50;
  const percentB = odds?.percentB ?? 50;

  function handleSideClick(side: "a" | "b") {
    if (isCompleted || hasPredicted || !odds) return;
    if (!isLoggedIn) return;
    const sideOdds = side === "a" ? odds.oddsA : odds.oddsB;
    onSelectPrediction(match, side, sideOdds, odds);
  }

  const statusBadge = isCompleted ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
      <CheckCircle2 className="h-3 w-3" />
      Afsluttet
    </span>
  ) : isLive ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
      </span>
      Live
    </span>
  ) : null;

  const winnerIsA = match.winner === "a";
  const winnerIsB = match.winner === "b";
  const userPickedA = userPrediction?.predicted_winner === "a";
  const userPickedB = userPrediction?.predicted_winner === "b";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white transition-all duration-300",
        isCompleted
          ? "border-border/60 opacity-80"
          : isLive
            ? "border-destructive/40 shadow-lg shadow-destructive/5 glow-live"
            : "border-border shadow-sm hover:shadow-md hover:border-primary/30"
      )}
    >
      {/* Top edge accent */}
      {isLive && (
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-destructive/60 via-destructive to-destructive/60" />
      )}
      {!isLive && !isCompleted && (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      )}

      {/* Header: match meta */}
      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <div className="flex items-center gap-2 text-xs text-muted">
          {odds && (
            <>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {odds.totalPredictions}
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {formatDanishNumber(odds.totalPool)} i puljen
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isCompleted && match.scheduled_at && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDanishDate(match.scheduled_at)}
            </span>
          )}
          {statusBadge}
        </div>
      </div>

      {/* Main odds buttons row */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-0 px-3 py-3">
        {/* Side A */}
        <OddsButton
          playerName={match.player_a}
          clubName={match.club_a}
          odds={odds?.oddsA ?? null}
          side="a"
          isWinner={winnerIsA}
          isLoser={isCompleted && !winnerIsA}
          isUserPick={userPickedA}
          isCompleted={isCompleted}
          hasPredicted={hasPredicted}
          isLoggedIn={isLoggedIn}
          loading={loading}
          onClick={() => handleSideClick("a")}
        />

        {/* VS divider */}
        <div className="flex flex-col items-center justify-center px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary font-display text-xs font-bold uppercase tracking-wider text-muted">
            vs
          </div>
        </div>

        {/* Side B */}
        <OddsButton
          playerName={match.player_b}
          clubName={match.club_b}
          odds={odds?.oddsB ?? null}
          side="b"
          isWinner={winnerIsB}
          isLoser={isCompleted && !winnerIsB}
          isUserPick={userPickedB}
          isCompleted={isCompleted}
          hasPredicted={hasPredicted}
          isLoggedIn={isLoggedIn}
          loading={loading}
          onClick={() => handleSideClick("b")}
        />
      </div>

      {/* Pool distribution bar */}
      <div className="px-4 pb-3">
        <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-l-full transition-all duration-700 ease-out",
              isCompleted
                ? "bg-muted-foreground/20"
                : "bg-gradient-to-r from-primary to-pitch-light"
            )}
            style={{ width: `${percentA}%` }}
          />
          <div
            className={cn(
              "absolute inset-y-0 right-0 rounded-r-full transition-all duration-700 ease-out",
              isCompleted
                ? "bg-muted-foreground/15"
                : "bg-gradient-to-l from-navy to-navy/60"
            )}
            style={{ width: `${percentB}%` }}
          />
          {/* Center notch */}
          <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/80" />
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-medium tabular-nums text-muted">
          <span>{percentA}%</span>
          <span>{percentB}%</span>
        </div>
      </div>

      {/* Result banner for completed matches */}
      {isCompleted && match.result && (
        <div className="border-t border-border/60 bg-secondary/50 px-4 py-2">
          <p className="text-center font-display text-lg font-bold tabular-nums tracking-wider text-foreground">
            {match.result}
          </p>
        </div>
      )}

      {/* User prediction result */}
      {hasPredicted && isCompleted && (
        <div
          className={cn(
            "border-t px-4 py-2.5",
            userPrediction.payout != null && userPrediction.payout > 0
              ? "border-success/20 bg-success/5"
              : "border-destructive/10 bg-destructive/5"
          )}
        >
          <div className="flex items-center justify-between text-xs">
            <span
              className={cn(
                "flex items-center gap-1.5 font-semibold",
                userPrediction.payout != null && userPrediction.payout > 0
                  ? "text-success"
                  : "text-destructive"
              )}
            >
              <Zap className="h-3 w-3" />
              {userPrediction.payout != null && userPrediction.payout > 0
                ? "Du vandt!"
                : "Tabt"}
            </span>
            <span className="tabular-nums text-muted">
              {formatDanishNumber(userPrediction.amount)} calls
              {userPrediction.payout != null && userPrediction.payout > 0 && (
                <span className="ml-1.5 font-bold text-success">
                  +{formatDanishNumber(userPrediction.payout - userPrediction.amount)}
                </span>
              )}
              {(userPrediction.payout == null || userPrediction.payout === 0) && (
                <span className="ml-1.5 font-bold text-destructive">
                  -{formatDanishNumber(userPrediction.amount)}
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* User prediction status (non-completed) */}
      {hasPredicted && !isCompleted && (
        <div className="border-t border-border px-4 py-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-primary">
              <Zap className="h-3 w-3" />
              Dit call: {userPickedA ? match.player_a : match.player_b}
            </span>
            <span className="tabular-nums text-muted">
              {formatDanishNumber(userPrediction.amount)} calls
            </span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="border-t border-destructive/20 bg-red-50 px-4 py-2 text-xs text-destructive">
          Kunne ikke hente odds. Prøver igen...
        </div>
      )}
    </div>
  );
}

/* ─── Odds Button (one side) ──────────────────────────────────────────── */

type OddsButtonProps = {
  playerName: string;
  clubName: string | null;
  odds: number | null;
  side: "a" | "b";
  isWinner: boolean;
  isLoser: boolean;
  isUserPick: boolean;
  isCompleted: boolean;
  hasPredicted: boolean;
  isLoggedIn: boolean;
  loading: boolean;
  onClick: () => void;
};

function OddsButton({
  playerName,
  clubName,
  odds,
  isWinner,
  isLoser,
  isUserPick,
  isCompleted,
  hasPredicted,
  isLoggedIn,
  loading,
  onClick,
}: OddsButtonProps) {
  const disabled = isCompleted || hasPredicted;

  const content = (
    <div
      className={cn(
        "relative flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-all duration-200",
        disabled
          ? "cursor-default"
          : "cursor-pointer active:scale-[0.97]",
        // Winner state
        isWinner &&
          "border-success/40 bg-green-50",
        // Loser state
        isLoser &&
          "border-border/40 bg-secondary/50 opacity-50",
        // User pick highlight
        isUserPick &&
          !isCompleted &&
          "border-primary/50 bg-primary/5 ring-1 ring-primary/20",
        isUserPick &&
          isWinner &&
          "border-success/50 bg-green-50 ring-1 ring-success/30",
        // Default interactive state
        !disabled &&
          !isUserPick &&
          "border-border bg-secondary/40 hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm",
        // Not logged in
        !isLoggedIn && !isCompleted && "hover:border-primary/30"
      )}
      onClick={disabled ? undefined : onClick}
      role={disabled ? undefined : "button"}
      tabIndex={disabled ? undefined : 0}
      onKeyDown={
        disabled
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
      }
    >
      {/* Winner icon */}
      {isWinner && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <Trophy className="h-4 w-4 text-success" />
        </div>
      )}

      {/* Club badge */}
      <ClubBadge clubName={clubName} />

      {/* Player name */}
      <span
        className={cn(
          "text-center text-sm font-semibold leading-tight",
          isLoser ? "text-muted" : "text-foreground"
        )}
      >
        {playerName}
      </span>

      {/* Club name */}
      {clubName && (
        <span className="text-center text-[10px] uppercase tracking-wide text-muted-foreground">
          {clubName}
        </span>
      )}

      {/* Odds value — the key element */}
      <div
        className={cn(
          "mt-1 rounded-lg px-4 py-1.5 text-center transition-colors",
          isCompleted
            ? "bg-secondary"
            : isUserPick
              ? "bg-primary/10"
              : "bg-primary/5 group-hover:bg-primary/10"
        )}
      >
        {loading ? (
          <div className="h-5 w-8 animate-pulse rounded bg-border" />
        ) : (
          <span
            className={cn(
              "font-display text-xl font-bold tabular-nums",
              isCompleted
                ? "text-muted"
                : isUserPick
                  ? "text-primary"
                  : "text-foreground"
            )}
          >
            {odds?.toFixed(2) ?? "--"}
          </span>
        )}
      </div>

      {/* Lock icon for not-logged-in */}
      {!isLoggedIn && !isCompleted && (
        <Lock className="absolute right-2 top-2 h-3 w-3 text-muted-foreground/40" />
      )}
    </div>
  );

  if (!isLoggedIn && !isCompleted) {
    return (
      <a href="/login" className="block">
        {content}
      </a>
    );
  }

  return content;
}

/* ─── Mini Match Card (for bracket view) ──────────────────────────────── */

export type MiniMatchCardProps = {
  match: Match;
  odds: MatchOdds | null;
  userPrediction?: UserPrediction | null;
  onClick?: () => void;
};

export function MiniMatchCard({
  match,
  odds,
  userPrediction,
  onClick,
}: MiniMatchCardProps) {
  const isCompleted = match.status === "completed";
  const winnerIsA = match.winner === "a";
  const winnerIsB = match.winner === "b";

  const clubA = getClub(match.club_a);
  const clubB = getClub(match.club_b);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border border-border bg-white p-2 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md",
        isCompleted && "opacity-70"
      )}
    >
      {/* Side A */}
      <div
        className={cn(
          "flex items-center justify-between py-0.5 text-xs",
          winnerIsA && "font-semibold text-success"
        )}
      >
        <span className="flex items-center gap-1.5 truncate">
          {clubA && (
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[6px] font-bold shadow-sm"
              style={{ backgroundColor: clubA.primaryColor, color: clubA.textOnPrimary }}
            >
              {clubA.shortName.charAt(0)}
            </span>
          )}
          {match.player_a}
        </span>
        <span className="ml-2 font-display tabular-nums text-muted">
          {odds?.oddsA.toFixed(2) ?? "--"}
        </span>
      </div>
      {/* Side B */}
      <div
        className={cn(
          "flex items-center justify-between py-0.5 text-xs",
          winnerIsB && "font-semibold text-success"
        )}
      >
        <span className="flex items-center gap-1.5 truncate">
          {clubB && (
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[6px] font-bold shadow-sm"
              style={{ backgroundColor: clubB.primaryColor, color: clubB.textOnPrimary }}
            >
              {clubB.shortName.charAt(0)}
            </span>
          )}
          {match.player_b}
        </span>
        <span className="ml-2 font-display tabular-nums text-muted">
          {odds?.oddsB.toFixed(2) ?? "--"}
        </span>
      </div>
      {/* User prediction indicator */}
      {userPrediction && (
        <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-primary">
          <Zap className="h-2.5 w-2.5" />
          Dit call
        </div>
      )}
    </button>
  );
}
