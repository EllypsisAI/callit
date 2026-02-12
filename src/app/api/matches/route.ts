import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/matches
 *
 * Admin-only endpoint. Creates a new match in a tournament.
 * Used for progressive match reveal — CREW reveals matchups one video at a time.
 */
export async function POST(request: NextRequest) {
  try {
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
        { error: "Kun administratorer kan oprette kampe." },
        { status: 403 }
      );
    }

    // ── Parse & validate body ───────────────────────────────────────────
    const body = await request.json();
    const { tournamentId, round, matchOrder, playerA, playerB, clubA, clubB, scheduledAt } =
      body as {
        tournamentId?: string;
        round?: number;
        matchOrder?: number;
        playerA?: string;
        playerB?: string;
        clubA?: string;
        clubB?: string;
        scheduledAt?: string | null;
      };

    if (!tournamentId || !playerA || !playerB) {
      return NextResponse.json(
        { error: "Manglende felter: tournamentId, playerA og playerB er påkrævet." },
        { status: 400 }
      );
    }

    if (!round || round < 1) {
      return NextResponse.json(
        { error: "round skal være mindst 1." },
        { status: 400 }
      );
    }

    if (!matchOrder || matchOrder < 1) {
      return NextResponse.json(
        { error: "matchOrder skal være mindst 1." },
        { status: 400 }
      );
    }

    // ── Verify tournament exists ────────────────────────────────────────
    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .select("id")
      .eq("id", tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: "Turneringen blev ikke fundet." },
        { status: 404 }
      );
    }

    // ── Insert match ────────────────────────────────────────────────────
    const { data: match, error: insertError } = await supabase
      .from("matches")
      .insert({
        tournament_id: tournamentId,
        round,
        match_order: matchOrder,
        player_a: playerA,
        player_b: playerB,
        club_a: clubA ?? null,
        club_b: clubB ?? null,
        scheduled_at: scheduledAt ?? null,
        status: "upcoming",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `Kunne ikke oprette kampen: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ match }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Der opstod en uventet fejl. Prøv igen." },
      { status: 500 }
    );
  }
}
