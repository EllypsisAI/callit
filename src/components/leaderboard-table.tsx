"use client";

import { cn } from "@/lib/utils";

type Prediction = {
  amount: number;
  payout: number | null;
};

type ProfileWithPredictions = {
  id: string;
  display_name: string;
  balance: number;
  is_admin: boolean;
  predictions: Prediction[];
};

type LeaderboardEntry = {
  rank: number;
  id: string;
  displayName: string;
  balance: number;
  correctPredictions: number;
  roi: number;
};

function computeLeaderboard(
  profiles: ProfileWithPredictions[]
): LeaderboardEntry[] {
  return profiles.map((profile, index) => {
    const correctPredictions = profile.predictions.filter(
      (p) => p.payout !== null && p.payout > p.amount
    ).length;

    const roi = ((profile.balance - 1000) / 1000) * 100;

    return {
      rank: index + 1,
      id: profile.id,
      displayName: profile.display_name,
      balance: profile.balance,
      correctPredictions,
      roi,
    };
  });
}

function formatDanish(n: number): string {
  return n.toLocaleString("da-DK");
}

function formatRoi(roi: number): string {
  const sign = roi >= 0 ? "+" : "";
  return `${sign}${roi.toFixed(1)}%`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="relative flex items-center justify-center">
        <span className="shimmer-gold relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 font-display text-base font-bold text-white shadow-lg shadow-amber-500/30">
          1
        </span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-400 font-display text-base font-bold text-white shadow-md">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-700 to-amber-900 font-display text-base font-bold text-amber-100 shadow-md">
        3
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center font-display text-base font-semibold text-muted">
      {rank}
    </span>
  );
}

export default function LeaderboardTable({
  profiles,
  currentUserId,
}: {
  profiles: ProfileWithPredictions[];
  currentUserId: string | null;
}) {
  const entries = computeLeaderboard(profiles);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 font-display text-4xl text-muted-foreground/30">---</div>
        <p className="font-display text-lg font-medium uppercase text-muted">
          Ingen calls endnu
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Vær den første!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Column headers */}
      <div className="mb-2 grid grid-cols-[40px_1fr_80px_48px_64px] items-center gap-2 px-3 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:grid-cols-[48px_1fr_100px_64px_80px] sm:px-4">
        <span>#</span>
        <span>Navn</span>
        <span className="text-right">Saldo</span>
        <span className="text-right">Rigtige</span>
        <span className="text-right">Afkast</span>
      </div>

      {/* Entries */}
      <div className="space-y-1">
        {entries.map((entry) => {
          const isCurrentUser = entry.id === currentUserId;
          const isTopThree = entry.rank <= 3;

          return (
            <div
              key={entry.id}
              className={cn(
                "group relative grid grid-cols-[40px_1fr_80px_48px_64px] items-center gap-2 rounded-lg px-3 py-3 transition-colors sm:grid-cols-[48px_1fr_100px_64px_80px] sm:px-4 sm:py-3.5",
                isCurrentUser && "bg-primary/10 ring-1 ring-primary/30",
                isTopThree && !isCurrentUser && "bg-white shadow-sm border border-border/50",
                !isTopThree && !isCurrentUser && "bg-transparent hover:bg-white/60"
              )}
            >
              {/* Rank 1 glow effect */}
              {entry.rank === 1 && (
                <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-amber-50 via-transparent to-amber-50" />
              )}

              {/* Rank */}
              <div className="relative z-10 flex justify-center">
                <RankBadge rank={entry.rank} />
              </div>

              {/* Name */}
              <div className="relative z-10 min-w-0">
                <span
                  className={cn(
                    "block truncate text-sm font-semibold",
                    entry.rank === 1 && "text-gold",
                    entry.rank === 2 && "text-slate-500",
                    entry.rank === 3 && "text-amber-800",
                    entry.rank > 3 && "text-foreground",
                    isCurrentUser && entry.rank > 3 && "text-primary"
                  )}
                >
                  {entry.displayName}
                </span>
                {isCurrentUser && (
                  <span className="font-display text-[10px] font-medium uppercase tracking-widest text-primary">
                    dig
                  </span>
                )}
              </div>

              {/* Balance */}
              <div className="relative z-10 text-right">
                <span
                  className={cn(
                    "font-display text-sm font-bold tabular-nums",
                    entry.rank === 1 && "text-gold",
                    entry.rank > 1 && "text-foreground"
                  )}
                >
                  {formatDanish(entry.balance)}
                </span>
                <span className="ml-0.5 text-[10px] text-muted-foreground">
                  c
                </span>
              </div>

              {/* Correct predictions */}
              <div className="relative z-10 text-right">
                <span className="text-sm font-medium tabular-nums text-muted">
                  {entry.correctPredictions}
                </span>
              </div>

              {/* ROI */}
              <div className="relative z-10 text-right">
                <span
                  className={cn(
                    "font-display text-sm font-semibold tabular-nums",
                    entry.roi > 0 && "text-success",
                    entry.roi < 0 && "text-destructive",
                    entry.roi === 0 && "text-muted"
                  )}
                >
                  {formatRoi(entry.roi)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
