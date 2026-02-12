import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildMatchOdds } from "@/lib/odds";

const MIN_AMOUNT = 10;
const MAX_AMOUNT = 500;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // ── Auth check ──────────────────────────────────────────────────────
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Du skal være logget ind for at lave en forudsigelse." },
        { status: 401 }
      );
    }

    // ── Parse & validate body ───────────────────────────────────────────
    const body = await request.json();
    const { matchId, predictedWinner, amount } = body as {
      matchId?: string;
      predictedWinner?: string;
      amount?: number;
    };

    if (!matchId || !predictedWinner || amount == null) {
      return NextResponse.json(
        { error: "Manglende felter: matchId, predictedWinner og amount er påkrævet." },
        { status: 400 }
      );
    }

    if (predictedWinner !== "a" && predictedWinner !== "b") {
      return NextResponse.json(
        { error: "predictedWinner skal være 'a' eller 'b'." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return NextResponse.json(
        {
          error: `Beløbet skal være et heltal mellem ${MIN_AMOUNT} og ${MAX_AMOUNT} calls.`,
        },
        { status: 400 }
      );
    }

    // ── Check match exists and is not completed ─────────────────────────
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("id, status")
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
        { error: "Denne kamp er allerede afsluttet. Du kan ikke lave flere forudsigelser." },
        { status: 400 }
      );
    }

    // ── Check user hasn't already predicted on this match ───────────────
    const { data: existing } = await supabase
      .from("predictions")
      .select("id")
      .eq("user_id", user.id)
      .eq("match_id", matchId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Du har allerede lavet en forudsigelse på denne kamp." },
        { status: 400 }
      );
    }

    // ── Check user has enough balance ───────────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profilen blev ikke fundet." },
        { status: 404 }
      );
    }

    if (profile.balance < amount) {
      return NextResponse.json(
        {
          error: `Du har ikke nok calls. Din saldo er ${profile.balance} calls.`,
        },
        { status: 400 }
      );
    }

    // ── Insert prediction (DB trigger deducts balance) ──────────────────
    const { data: prediction, error: insertError } = await supabase
      .from("predictions")
      .insert({
        user_id: user.id,
        match_id: matchId,
        predicted_winner: predictedWinner,
        amount,
      })
      .select()
      .single();

    if (insertError) {
      // The DB trigger might reject if balance is insufficient (race condition safety)
      return NextResponse.json(
        { error: "Kunne ikke oprette forudsigelsen. Prøv igen." },
        { status: 500 }
      );
    }

    // ── Calculate updated odds for this match ───────────────────────────
    const { data: pools } = await supabase
      .from("predictions")
      .select("predicted_winner, amount")
      .eq("match_id", matchId);

    let poolA = 0;
    let poolB = 0;
    const totalPredictions = pools?.length ?? 0;

    for (const p of pools ?? []) {
      if (p.predicted_winner === "a") poolA += p.amount;
      else poolB += p.amount;
    }

    const odds = buildMatchOdds(matchId, poolA, poolB, totalPredictions);

    return NextResponse.json({
      prediction,
      odds,
    });
  } catch {
    return NextResponse.json(
      { error: "Der opstod en uventet fejl. Prøv igen." },
      { status: 500 }
    );
  }
}
