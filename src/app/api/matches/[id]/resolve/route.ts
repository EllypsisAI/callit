import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/matches/[id]/resolve
 *
 * Admin-only endpoint. Resolves a match by setting the winner.
 * Calls the `resolve_match` DB function which:
 * 1. Sets match.winner and match.status = 'completed'
 * 2. Calculates parimutuel payouts for all predictions
 * 3. Credits winning users' balances
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    const supabase = await createClient();

    // ── Auth check ──────────────────────────────────────────────────────
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Du skal være logget ind." },
        { status: 401 }
      );
    }

    // ── Admin check ─────────────────────────────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json(
        { error: "Kun administratorer kan afgøre kampe." },
        { status: 403 }
      );
    }

    // ── Parse & validate body ───────────────────────────────────────────
    const body = await request.json();
    const { winner } = body as { winner?: string };

    if (winner !== "a" && winner !== "b") {
      return NextResponse.json(
        { error: "winner skal være 'a' eller 'b'." },
        { status: 400 }
      );
    }

    // ── Verify match exists and is not already completed ────────────────
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("id, status, player_a, player_b")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: "Kampen blev ikke fundet." },
        { status: 404 }
      );
    }

    if (match.status === "completed") {
      return NextResponse.json(
        { error: "Denne kamp er allerede afgjort." },
        { status: 400 }
      );
    }

    // ── Call the resolve_match DB function ───────────────────────────────
    const { error: resolveError } = await supabase.rpc("resolve_match", {
      p_match_id: matchId,
      p_winner: winner,
    });

    if (resolveError) {
      return NextResponse.json(
        { error: "Kunne ikke afgøre kampen. Prøv igen." },
        { status: 500 }
      );
    }

    // ── Build payout summary ────────────────────────────────────────────
    const { data: predictions } = await supabase
      .from("predictions")
      .select("id, user_id, predicted_winner, amount, payout")
      .eq("match_id", matchId);

    const winners = (predictions ?? []).filter(
      (p) => p.predicted_winner === winner
    );
    const losers = (predictions ?? []).filter(
      (p) => p.predicted_winner !== winner
    );

    const totalPayout = winners.reduce((sum, p) => sum + (p.payout ?? 0), 0);

    return NextResponse.json({
      message: "Kampen er afgjort!",
      matchId,
      winner,
      winnerName: winner === "a" ? match.player_a : match.player_b,
      summary: {
        totalPredictions: (predictions ?? []).length,
        winnersCount: winners.length,
        losersCount: losers.length,
        totalPayout,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Der opstod en uventet fejl. Prøv igen." },
      { status: 500 }
    );
  }
}
