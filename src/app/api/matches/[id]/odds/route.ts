import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildMatchOdds } from "@/lib/odds";

/**
 * GET /api/matches/[id]/odds
 *
 * Public endpoint — returns live parimutuel odds for a match.
 * The UI polls this to show shifting odds in real-time.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    const supabase = await createClient();

    // ── Verify the match exists ─────────────────────────────────────────
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("id")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: "Kampen blev ikke fundet." },
        { status: 404 }
      );
    }

    // ── Aggregate prediction pools ──────────────────────────────────────
    const { data: predictions } = await supabase
      .from("predictions")
      .select("predicted_winner, amount")
      .eq("match_id", matchId);

    let poolA = 0;
    let poolB = 0;
    const totalPredictions = predictions?.length ?? 0;

    for (const p of predictions ?? []) {
      if (p.predicted_winner === "a") poolA += p.amount;
      else poolB += p.amount;
    }

    const odds = buildMatchOdds(matchId, poolA, poolB, totalPredictions);

    return NextResponse.json(odds);
  } catch {
    return NextResponse.json(
      { error: "Der opstod en fejl ved hentning af odds." },
      { status: 500 }
    );
  }
}
