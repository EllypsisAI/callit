import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import LeaderboardTable from "@/components/leaderboard-table";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";

export const metadata = {
  title: "Rangliste — CallIt",
  description: "Se hvem der kalder det rigtigt. Top spillere i CallIt.",
};

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { user } = await getCurrentUser();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*, predictions(*)")
    .order("balance", { ascending: false })
    .limit(50);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8 sm:px-6 pitch-pattern">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tilbage
        </Link>

        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold uppercase tracking-wider text-foreground sm:text-5xl">
              Rangliste
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Top {profiles?.length ?? 0} spillere
            </p>
          </div>

          {/* Trophy icon */}
          <div className="hidden sm:block">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 border border-gold/20 shadow-sm">
              <Trophy className="h-6 w-6 text-gold" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-4 h-px bg-gradient-to-r from-primary/40 via-gold/20 to-transparent" />
      </div>

      {/* Leaderboard */}
      <LeaderboardTable
        profiles={profiles ?? []}
        currentUserId={user?.id ?? null}
      />

      {/* Footer link */}
      <div className="mt-10 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-primary transition-colors hover:text-pitch-dark"
        >
          Se turneringen
        </Link>
      </div>
    </main>
  );
}
