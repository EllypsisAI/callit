"use client";

import { useCallback, useEffect, useState } from "react";
import {
  X,
  Zap,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getClub } from "@/lib/clubs";
import type { Tables } from "@/lib/database.types";
import type { MatchOdds } from "@/lib/odds";

type Match = Tables<"matches">;

type PredictionSlipProps = {
  match: Match;
  side: "a" | "b";
  odds: number;
  matchOdds: MatchOdds;
  userBalance: number;
  onClose: () => void;
  onSuccess: () => void;
};

const PRESET_AMOUNTS = [50, 100, 200, 500];
const MIN_AMOUNT = 10;
const MAX_AMOUNT = 500;

function formatDanishNumber(n: number): string {
  return n.toLocaleString("da-DK");
}

type SlipState = "idle" | "submitting" | "success" | "error";

export function PredictionSlip({
  match,
  side,
  odds,
  matchOdds,
  userBalance,
  onClose,
  onSuccess,
}: PredictionSlipProps) {
  const [amount, setAmount] = useState<number | "">(100);
  const [state, setState] = useState<SlipState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const playerName = side === "a" ? match.player_a : match.player_b;
  const clubName = side === "a" ? match.club_a : match.club_b;
  const club = getClub(clubName);
  const numericAmount = typeof amount === "number" ? amount : 0;
  const potentialPayout = Math.floor(numericAmount * odds);

  const tooLow = numericAmount > 0 && numericAmount < MIN_AMOUNT;
  const tooHigh = numericAmount > MAX_AMOUNT;
  const exceedsBalance = numericAmount > userBalance;
  const isValid =
    numericAmount >= MIN_AMOUNT &&
    numericAmount <= MAX_AMOUNT &&
    !exceedsBalance;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isValid || state === "submitting") return;

    setState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: match.id,
          predictedWinner: side,
          amount: numericAmount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Noget gik galt. Prøv igen.");
      }

      setState("success");

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Noget gik galt. Prøv igen."
      );
    }
  }, [isValid, state, match.id, side, numericAmount, onSuccess, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slip panel */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto max-w-lg rounded-t-2xl border border-b-0 border-border bg-white shadow-2xl shadow-black/10">
          {/* Top accent — pitch green line */}
          <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-pitch-dark via-primary to-pitch-light" />

          {/* Handle + close */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-display text-base font-semibold uppercase tracking-wider text-foreground">
                Ny prediction
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Match info */}
          <div className="mx-5 rounded-xl border border-border bg-secondary/50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Club badge in slip */}
                {club && (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-bold uppercase shadow-sm"
                    style={{
                      backgroundColor: club.primaryColor,
                      color: club.textOnPrimary,
                    }}
                  >
                    {club.shortName}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {playerName}
                  </p>
                  {clubName && (
                    <p className="text-[10px] uppercase tracking-wide text-muted">
                      {clubName}
                    </p>
                  )}
                </div>
              </div>
              <div className="rounded-lg bg-primary/10 px-3 py-1.5">
                <span className="font-display text-xl font-bold tabular-nums text-primary">
                  {odds.toFixed(2)}
                </span>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-muted">
              {match.player_a}
              {match.club_a ? ` (${match.club_a})` : ""} vs{" "}
              {match.player_b}
              {match.club_b ? ` (${match.club_b})` : ""}
            </p>
          </div>

          {/* Amount input */}
          <div className="px-5 pt-4">
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Antal calls
            </label>
            <div className="relative">
              <input
                type="number"
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                step={10}
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  setAmount(val === "" ? "" : parseInt(val, 10) || 0);
                  if (state === "error") setState("idle");
                }}
                className={cn(
                  "w-full rounded-xl border bg-secondary px-4 py-3 pr-16 font-display text-xl font-semibold tabular-nums text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 transition-colors",
                  tooLow || tooHigh || exceedsBalance
                    ? "border-destructive/50 focus:ring-destructive/30"
                    : "border-border focus:ring-primary/30 focus:border-primary/40"
                )}
                placeholder="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                calls
              </span>
            </div>

            {/* Validation messages */}
            {tooLow && (
              <p className="mt-1 text-xs text-destructive">
                Minimum {MIN_AMOUNT} calls
              </p>
            )}
            {tooHigh && (
              <p className="mt-1 text-xs text-destructive">
                Maximum {formatDanishNumber(MAX_AMOUNT)} calls
              </p>
            )}
            {exceedsBalance && !tooHigh && (
              <p className="mt-1 text-xs text-destructive">
                Du har kun {formatDanishNumber(userBalance)} calls
              </p>
            )}

            {/* Preset buttons */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setAmount(preset);
                    if (state === "error") setState("idle");
                  }}
                  disabled={preset > userBalance}
                  className={cn(
                    "rounded-lg border py-2 font-display text-base font-medium tabular-nums transition-all",
                    amount === preset
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                    preset > userBalance && "cursor-not-allowed opacity-30"
                  )}
                >
                  {formatDanishNumber(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Payout preview */}
          <div className="mx-5 mt-4 flex items-center justify-between rounded-xl border border-border bg-secondary/50 px-4 py-3">
            <span className="text-xs text-muted">Potentiel udbetaling</span>
            <div className="flex items-center gap-1.5">
              <ArrowRight className="h-3 w-3 text-muted" />
              <span
                className={cn(
                  "font-display text-xl font-bold tabular-nums",
                  numericAmount > 0 && isValid
                    ? "text-success"
                    : "text-muted-foreground"
                )}
              >
                {numericAmount > 0
                  ? formatDanishNumber(potentialPayout)
                  : "--"}
              </span>
              <span className="text-xs text-muted">calls</span>
            </div>
          </div>

          {/* Error message */}
          {state === "error" && errorMessage && (
            <div className="mx-5 mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-red-50 px-3 py-2.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
              <p className="text-xs text-destructive">{errorMessage}</p>
            </div>
          )}

          {/* Submit button */}
          <div className="px-5 pb-6 pt-4">
            {state === "success" ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-3.5 text-sm font-semibold text-success">
                <CheckCircle2 className="h-4 w-4" />
                Prediction placeret!
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isValid || state === "submitting"}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-display text-base font-semibold uppercase tracking-wider transition-all",
                  isValid && state !== "submitting"
                    ? "bg-primary text-white shadow-sm hover:bg-pitch-dark hover:shadow-md active:scale-[0.98]"
                    : "cursor-not-allowed bg-primary/20 text-primary/40"
                )}
              >
                {state === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placerer...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Placer prediction
                  </>
                )}
              </button>
            )}
          </div>

          {/* Safe area spacer for iOS */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    </>
  );
}
