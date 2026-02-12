import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { TournamentClient } from "./tournament-client";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("title, description")
    .eq("slug", slug)
    .single();

  if (!tournament) {
    return { title: "Turnering ikke fundet — CallIt" };
  }

  return {
    title: `${tournament.title} — CallIt`,
    description:
      tournament.description ??
      "Sæt dine calls og vis hvem der kalder det rigtigt.",
  };
}

export default async function TournamentPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch tournament by slug
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("*")
    .eq("slug", slug)
    .single();

  if (tournamentError || !tournament) {
    notFound();
  }

  // Fetch all matches for this tournament, ordered by round then match_order
  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournament.id)
    .order("round", { ascending: true })
    .order("match_order", { ascending: true });

  // Get current user and their predictions for this tournament
  const { user, profile } = await getCurrentUser();

  let userPredictions: Array<{
    id: string;
    match_id: string;
    predicted_winner: string;
    amount: number;
    payout: number | null;
  }> = [];

  if (user && matches && matches.length > 0) {
    const matchIds = matches.map((m) => m.id);
    const { data: predictions } = await supabase
      .from("predictions")
      .select("id, match_id, predicted_winner, amount, payout")
      .eq("user_id", user.id)
      .in("match_id", matchIds);

    userPredictions = predictions ?? [];
  }

  return (
    <TournamentClient
      tournament={tournament}
      matches={matches ?? []}
      user={user}
      profile={profile}
      userPredictions={userPredictions}
    />
  );
}
