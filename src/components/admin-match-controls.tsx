"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getClubOptions } from "@/lib/clubs";
import { cn } from "@/lib/utils";

const TOURNAMENT_ID = "63d625f0-6302-4866-85e6-f1cace7f8ce8";

const ROUND_LABELS: Record<number, string> = {
  1: "Ottendedelsfinale",
  2: "Kvartfinale",
  3: "Semifinale",
  4: "Finale",
};

type Match = {
  id: string;
  tournament_id: string;
  round: number;
  match_order: number;
  player_a: string;
  player_b: string;
  club_a: string | null;
  club_b: string | null;
  status: "upcoming" | "live" | "completed";
  winner: string | null;
  result: string | null;
  scheduled_at: string | null;
};

type Prediction = {
  id: string;
  match_id: string;
  predicted_winner: string;
  amount: number;
  payout: number | null;
};

type MatchWithPredictions = Match & {
  predictions: Prediction[];
};

type PoolStats = {
  totalPredictions: number;
  totalCalls: number;
  callsOnA: number;
  callsOnB: number;
  predictionsOnA: number;
  predictionsOnB: number;
};

function computePoolStats(predictions: Prediction[], match: Match): PoolStats {
  const matchPredictions = predictions.filter(
    (p) => p.match_id === match.id
  );
  const onA = matchPredictions.filter(
    (p) => p.predicted_winner === "a"
  );
  const onB = matchPredictions.filter(
    (p) => p.predicted_winner === "b"
  );

  return {
    totalPredictions: matchPredictions.length,
    totalCalls: matchPredictions.reduce((sum, p) => sum + p.amount, 0),
    callsOnA: onA.reduce((sum, p) => sum + p.amount, 0),
    callsOnB: onB.reduce((sum, p) => sum + p.amount, 0),
    predictionsOnA: onA.length,
    predictionsOnB: onB.length,
  };
}

function formatDanish(n: number): string {
  return n.toLocaleString("da-DK");
}

function StatusBadge({ status }: { status: Match["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
        status === "upcoming" && "bg-muted-foreground/10 text-muted",
        status === "live" && "bg-success/15 text-success",
        status === "completed" && "bg-primary/15 text-accent"
      )}
    >
      {status === "live" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
        </span>
      )}
      {status === "upcoming" && "Kommende"}
      {status === "live" && "Live"}
      {status === "completed" && "Afsluttet"}
    </span>
  );
}

function PoolBar({ stats }: { stats: PoolStats }) {
  if (stats.totalCalls === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        Ingen forudsigelser endnu
      </div>
    );
  }

  const percentA =
    stats.totalCalls > 0
      ? Math.round((stats.callsOnA / stats.totalCalls) * 100)
      : 50;
  const percentB = 100 - percentA;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>
          {formatDanish(stats.callsOnA)} calls ({stats.predictionsOnA})
        </span>
        <span>
          ({stats.predictionsOnB}) {formatDanish(stats.callsOnB)} calls
        </span>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-border/50">
        <div
          className="rounded-l-full bg-accent/70 transition-all duration-500"
          style={{ width: `${percentA}%` }}
        />
        <div
          className="rounded-r-full bg-primary/70 transition-all duration-500"
          style={{ width: `${percentB}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] font-semibold text-muted">
        <span>{percentA}%</span>
        <span>{percentB}%</span>
      </div>
    </div>
  );
}

// ── Create Match Form ─────────────────────────────────────────────────────

function CreateMatchForm({ onCreated }: { onCreated: () => void }) {
  const clubOptions = getClubOptions();

  const [clubA, setClubA] = useState("");
  const [clubB, setClubB] = useState("");
  const [playerA, setPlayerA] = useState("");
  const [playerB, setPlayerB] = useState("");
  const [round, setRound] = useState(1);
  const [matchOrder, setMatchOrder] = useState(1);
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleClubAChange = (value: string) => {
    setClubA(value);
    const option = clubOptions.find((o) => o.value === value);
    if (option) setPlayerA(option.players);
  };

  const handleClubBChange = (value: string) => {
    setClubB(value);
    const option = clubOptions.find((o) => o.value === value);
    if (option) setPlayerB(option.players);
  };

  const handleSubmit = async () => {
    if (!playerA || !playerB) {
      setError("Begge spillere skal udfyldes.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tournamentId: TOURNAMENT_ID,
        round,
        matchOrder,
        playerA,
        playerB,
        clubA: clubA || null,
        clubB: clubB || null,
        scheduledAt: scheduledAt || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Kunne ikke oprette kampen.");
      setLoading(false);
      return;
    }

    // Reset form
    setClubA("");
    setClubB("");
    setPlayerA("");
    setPlayerB("");
    setScheduledAt("");
    setMatchOrder((prev) => prev + 1);
    setLoading(false);
    setExpanded(false);
    onCreated();
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full rounded-xl border-2 border-dashed border-border/60 px-4 py-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
      >
        + Opret ny kamp
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold">Opret ny kamp</h3>
        <button
          onClick={() => setExpanded(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Annuller
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Round + Match Order */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Runde
            </label>
            <select
              value={round}
              onChange={(e) => setRound(Number(e.target.value))}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
            >
              {Object.entries(ROUND_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Kamp nr.
            </label>
            <input
              type="number"
              min={1}
              value={matchOrder}
              onChange={(e) => setMatchOrder(Number(e.target.value))}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Scheduled date */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Kampdato (valgfri)
          </label>
          <input
            type="date"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Team A */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Hold A
          </label>
          <select
            value={clubA}
            onChange={(e) => handleClubAChange(e.target.value)}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            <option value="">Vælg hold...</option>
            {clubOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={playerA}
            onChange={(e) => setPlayerA(e.target.value)}
            placeholder="Spillere (auto-udfyldt)"
            className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Team B */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Hold B
          </label>
          <select
            value={clubB}
            onChange={(e) => handleClubBChange(e.target.value)}
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            <option value="">Vælg hold...</option>
            {clubOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={playerB}
            onChange={(e) => setPlayerB(e.target.value)}
            placeholder="Spillere (auto-udfyldt)"
            className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !playerA || !playerB}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          {loading ? "Opretter..." : "Opret kamp"}
        </button>
      </div>
    </div>
  );
}

// ── Inline Edit for existing matches ──────────────────────────────────────

function EditableMatchCard({
  match,
  poolStats,
  onSetLive,
  onResolve,
  onUpdated,
}: {
  match: MatchWithPredictions;
  poolStats: PoolStats;
  onSetLive: (matchId: string) => Promise<void>;
  onResolve: (matchId: string, winner: "a" | "b", result: string | null) => Promise<void>;
  onUpdated: () => void;
}) {
  const [confirming, setConfirming] = useState<"a" | "b" | null>(null);
  const [resultText, setResultText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const clubOptions = getClubOptions();

  const [editPlayerA, setEditPlayerA] = useState(match.player_a);
  const [editPlayerB, setEditPlayerB] = useState(match.player_b);
  const [editClubA, setEditClubA] = useState(match.club_a ?? "");
  const [editClubB, setEditClubB] = useState(match.club_b ?? "");
  const [editRound, setEditRound] = useState(match.round);
  const [editMatchOrder, setEditMatchOrder] = useState(match.match_order);
  const [editScheduledAt, setEditScheduledAt] = useState(
    match.scheduled_at ? match.scheduled_at.split("T")[0] : ""
  );

  const handleSetLive = async () => {
    setActionLoading(true);
    await onSetLive(match.id);
    setActionLoading(false);
  };

  const handleResolve = async (winner: "a" | "b") => {
    if (confirming !== winner) {
      setConfirming(winner);
      return;
    }
    setActionLoading(true);
    await onResolve(match.id, winner, resultText || null);
    setActionLoading(false);
    setConfirming(null);
    setResultText("");
  };

  const cancelConfirm = () => {
    setConfirming(null);
    setResultText("");
  };

  const handleEditClubA = (value: string) => {
    setEditClubA(value);
    const option = clubOptions.find((o) => o.value === value);
    if (option) setEditPlayerA(option.players);
  };

  const handleEditClubB = (value: string) => {
    setEditClubB(value);
    const option = clubOptions.find((o) => o.value === value);
    if (option) setEditPlayerB(option.players);
  };

  const handleSaveEdit = async () => {
    setEditLoading(true);
    setEditError(null);

    const res = await fetch(`/api/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerA: editPlayerA,
        playerB: editPlayerB,
        clubA: editClubA || null,
        clubB: editClubB || null,
        round: editRound,
        matchOrder: editMatchOrder,
        scheduledAt: editScheduledAt || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setEditError(data.error ?? "Kunne ikke opdatere kampen.");
      setEditLoading(false);
      return;
    }

    setEditLoading(false);
    setEditing(false);
    onUpdated();
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditPlayerA(match.player_a);
    setEditPlayerB(match.player_b);
    setEditClubA(match.club_a ?? "");
    setEditClubB(match.club_b ?? "");
    setEditRound(match.round);
    setEditMatchOrder(match.match_order);
    setEditScheduledAt(match.scheduled_at ? match.scheduled_at.split("T")[0] : "");
    setEditError(null);
  };

  const winnerLabel =
    match.winner === "a"
      ? match.player_a
      : match.winner === "b"
        ? match.player_b
        : null;

  if (editing) {
    return (
      <div className="rounded-xl border border-accent/30 bg-card p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            Redigerer
          </span>
          <button
            onClick={handleCancelEdit}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Annuller
          </button>
        </div>

        {editError && (
          <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {editError}
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Runde
              </label>
              <select
                value={editRound}
                onChange={(e) => setEditRound(Number(e.target.value))}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
              >
                {Object.entries(ROUND_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Kamp nr.
              </label>
              <input
                type="number"
                min={1}
                value={editMatchOrder}
                onChange={(e) => setEditMatchOrder(Number(e.target.value))}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Scheduled date */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Kampdato (valgfri)
            </label>
            <input
              type="date"
              value={editScheduledAt}
              onChange={(e) => setEditScheduledAt(e.target.value)}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Hold A
            </label>
            <select
              value={editClubA}
              onChange={(e) => handleEditClubA(e.target.value)}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
            >
              <option value="">Intet hold</option>
              {clubOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={editPlayerA}
              onChange={(e) => setEditPlayerA(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Hold B
            </label>
            <select
              value={editClubB}
              onChange={(e) => handleEditClubB(e.target.value)}
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
            >
              <option value="">Intet hold</option>
              {clubOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={editPlayerB}
              onChange={(e) => setEditPlayerB(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={handleSaveEdit}
            disabled={editLoading || !editPlayerA || !editPlayerB}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {editLoading ? "Gemmer..." : "Gem ændringer"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card p-4 transition-colors sm:p-5",
        match.status === "live" && "border-success/30 shadow-[0_0_24px_-8px] shadow-success/10",
        match.status === "completed" && "opacity-75"
      )}
    >
      {/* Match header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Kamp {match.match_order}
        </span>
        <div className="flex items-center gap-2">
          {match.status !== "completed" && (
            <button
              onClick={() => setEditing(true)}
              className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-accent"
            >
              Rediger
            </button>
          )}
          <StatusBadge status={match.status} />
        </div>
      </div>

      {/* Players */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-base font-bold",
              match.winner === "a" && "text-success"
            )}
          >
            {match.player_a}
          </p>
          {match.club_a && (
            <p className="truncate text-xs text-muted-foreground">
              {match.club_a}
            </p>
          )}
        </div>

        <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          vs
        </span>

        <div className="min-w-0 flex-1 text-right">
          <p
            className={cn(
              "truncate text-base font-bold",
              match.winner === "b" && "text-success"
            )}
          >
            {match.player_b}
          </p>
          {match.club_b && (
            <p className="truncate text-xs text-muted-foreground">
              {match.club_b}
            </p>
          )}
        </div>
      </div>

      {/* Pool stats */}
      <div className="mb-4">
        <PoolBar stats={poolStats} />
      </div>

      {/* Total info */}
      <div className="mb-4 flex justify-center gap-6 text-xs text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">
            {poolStats.totalPredictions}
          </span>{" "}
          forudsigelser
        </span>
        <span>
          <span className="font-semibold text-foreground">
            {formatDanish(poolStats.totalCalls)}
          </span>{" "}
          calls i puljen
        </span>
      </div>

      {/* Actions */}
      {match.status === "completed" && (
        <div className="rounded-lg bg-success/10 px-3 py-2 text-center text-sm">
          {match.result && (
            <span className="block font-bold text-foreground">{match.result}</span>
          )}
          {winnerLabel && (
            <span className="font-semibold text-success">Vinder: {winnerLabel}</span>
          )}
        </div>
      )}

      {/* Result input — shown when confirming resolve */}
      {confirming && (
        <div className="mb-2">
          <input
            type="text"
            value={resultText}
            onChange={(e) => setResultText(e.target.value)}
            placeholder="Resultat, f.eks. 3-1 eller 2-2 (str. 4-3)"
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          />
        </div>
      )}

      {match.status === "upcoming" && (
        <div className="space-y-2">
          <button
            onClick={handleSetLive}
            disabled={actionLoading}
            className="w-full rounded-lg bg-success/15 px-4 py-2.5 text-sm font-bold text-success transition-colors hover:bg-success/25 disabled:opacity-50"
          >
            {actionLoading ? "Opdaterer..." : "Sæt Live"}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <ResolveButton
              label={`${match.player_a} vinder`}
              side="a"
              confirming={confirming}
              loading={actionLoading}
              onResolve={handleResolve}
              onCancel={cancelConfirm}
            />
            <ResolveButton
              label={`${match.player_b} vinder`}
              side="b"
              confirming={confirming}
              loading={actionLoading}
              onResolve={handleResolve}
              onCancel={cancelConfirm}
            />
          </div>
        </div>
      )}

      {match.status === "live" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <ResolveButton
              label={`${match.player_a} vinder`}
              side="a"
              confirming={confirming}
              loading={actionLoading}
              onResolve={handleResolve}
              onCancel={cancelConfirm}
            />
            <ResolveButton
              label={`${match.player_b} vinder`}
              side="b"
              confirming={confirming}
              loading={actionLoading}
              onResolve={handleResolve}
              onCancel={cancelConfirm}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ResolveButton({
  label,
  side,
  confirming,
  loading,
  onResolve,
  onCancel,
}: {
  label: string;
  side: "a" | "b";
  confirming: "a" | "b" | null;
  loading: boolean;
  onResolve: (winner: "a" | "b") => Promise<void>;
  onCancel: () => void;
}) {
  const isConfirming = confirming === side;
  const otherConfirming = confirming !== null && confirming !== side;

  if (isConfirming) {
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onResolve(side)}
          disabled={loading}
          className="w-full rounded-lg bg-destructive px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-destructive/90 disabled:opacity-50"
        >
          {loading ? "Afslutter..." : "Bekræft?"}
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Annuller
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => onResolve(side)}
      disabled={loading || otherConfirming}
      className={cn(
        "w-full rounded-lg border border-border/60 bg-card px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-40",
        side === "a" && "hover:border-accent/40 hover:text-accent",
        side === "b" && "hover:border-primary/40 hover:text-primary-foreground"
      )}
    >
      {label}
    </button>
  );
}

export default function AdminMatchControls({
  matches,
}: {
  matches: MatchWithPredictions[];
}) {
  const [localMatches, setLocalMatches] = useState(matches);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleSetLive = useCallback(
    async (matchId: string) => {
      setError(null);
      const { error: err } = await supabase
        .from("matches")
        .update({ status: "live" as const })
        .eq("id", matchId);

      if (err) {
        setError(`Kunne ikke sætte kampen live: ${err.message}`);
        return;
      }

      setLocalMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, status: "live" as const } : m))
      );
    },
    [supabase]
  );

  const handleResolve = useCallback(
    async (matchId: string, winner: "a" | "b", result: string | null) => {
      setError(null);
      const { error: err } = await supabase.rpc("resolve_match", {
        p_match_id: matchId,
        p_winner: winner,
      });

      if (err) {
        setError(`Kunne ikke afgøre kampen: ${err.message}`);
        return;
      }

      // Save result text if provided
      if (result) {
        await supabase
          .from("matches")
          .update({ result })
          .eq("id", matchId);
      }

      setLocalMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? { ...m, status: "completed" as const, winner, result }
            : m
        )
      );
    },
    [supabase]
  );

  // Group matches by round
  const roundsMap = new Map<number, MatchWithPredictions[]>();
  for (const match of localMatches) {
    const round = match.round;
    if (!roundsMap.has(round)) {
      roundsMap.set(round, []);
    }
    roundsMap.get(round)!.push(match);
  }

  // Sort rounds and matches within each round
  const rounds = Array.from(roundsMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([round, roundMatches]) => ({
      round,
      matches: roundMatches.sort((a, b) => a.match_order - b.match_order),
    }));

  // Compute round labels
  function getRoundLabel(round: number, totalRounds: number): string {
    if (round === totalRounds) return "Finale";
    if (round === totalRounds - 1) return "Semifinale";
    if (round === totalRounds - 2) return "Kvartfinale";
    return `Runde ${round}`;
  }

  const totalRounds = rounds.length > 0 ? rounds[rounds.length - 1].round : 0;

  return (
    <div className="space-y-8">
      {/* Create match form */}
      <CreateMatchForm onCreated={handleRefresh} />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {rounds.map(({ round, matches: roundMatches }) => (
        <section key={round}>
          <h2 className="mb-3 text-lg font-bold tracking-tight">
            {getRoundLabel(round, totalRounds)}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {roundMatches.map((match) => (
              <EditableMatchCard
                key={match.id}
                match={match}
                poolStats={computePoolStats(match.predictions, match)}
                onSetLive={handleSetLive}
                onResolve={handleResolve}
                onUpdated={handleRefresh}
              />
            ))}
          </div>
        </section>
      ))}

      {rounds.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          Ingen kampe fundet. Opret den første kamp ovenfor.
        </div>
      )}
    </div>
  );
}
