import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminMatchControls from "@/components/admin-match-controls";
import Link from "next/link";

export const metadata = {
  title: "Admin — CallIt",
  description: "Administrationspanel for CallIt.",
};

export default async function AdminPage() {
  const { user, profile } = await getCurrentUser();

  // Guard: must be logged in and admin
  if (!user || !profile?.is_admin) {
    redirect("/");
  }

  const supabase = await createClient();

  // Fetch all matches with their predictions
  const { data: matches } = await supabase
    .from("matches")
    .select("*, predictions(*)")
    .order("round", { ascending: true })
    .order("match_order", { ascending: true });

  // Fetch aggregate stats
  const { count: totalPredictions } = await supabase
    .from("predictions")
    .select("*", { count: "exact", head: true });

  const { data: callsData } = await supabase
    .from("predictions")
    .select("amount");

  const totalCallsInPlay = callsData?.reduce((sum, p) => sum + p.amount, 0) ?? 0;

  const { count: activeUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Tilbage
        </Link>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Admin
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Styr kampe og se statistik
        </p>

        {/* Divider */}
        <div className="mt-4 h-px bg-gradient-to-r from-primary/40 via-accent/20 to-transparent" />
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        <StatCard
          label="Forudsigelser"
          value={totalPredictions ?? 0}
        />
        <StatCard
          label="Calls i spil"
          value={totalCallsInPlay}
          suffix="c"
        />
        <StatCard
          label="Brugere"
          value={activeUsers ?? 0}
        />
      </div>

      {/* Match controls */}
      <AdminMatchControls matches={matches ?? []} />

      {/* Footer links */}
      <div className="mt-10 flex justify-center gap-6 text-sm">
        <Link
          href="/leaderboard"
          className="font-medium text-accent transition-colors hover:text-accent/80"
        >
          Rangliste
        </Link>
        <Link
          href="/"
          className="font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Turnering
        </Link>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-3 py-4 text-center sm:px-4">
      <p className="text-2xl font-black tabular-nums text-foreground sm:text-3xl">
        {value.toLocaleString("da-DK")}
        {suffix && (
          <span className="ml-0.5 text-sm font-medium text-muted-foreground">
            {suffix}
          </span>
        )}
      </p>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
