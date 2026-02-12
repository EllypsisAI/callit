import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/matches/[id]
 *
 * Admin-only endpoint. Updates an existing match.
 * Supports partial updates to player names, clubs, status, round, and match order.
 */
export async function PATCH(
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
        { error: "Kun administratorer kan redigere kampe." },
        { status: 403 }
      );
    }

    // ── Verify match exists ─────────────────────────────────────────────
    const { data: existing, error: fetchError } = await supabase
      .from("matches")
      .select("id")
      .eq("id", matchId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Kampen blev ikke fundet." },
        { status: 404 }
      );
    }

    // ── Parse & build update object ─────────────────────────────────────
    const body = await request.json();
    const { playerA, playerB, clubA, clubB, status, round, matchOrder, scheduledAt } =
      body as {
        playerA?: string;
        playerB?: string;
        clubA?: string | null;
        clubB?: string | null;
        status?: "upcoming" | "live" | "completed";
        round?: number;
        matchOrder?: number;
        scheduledAt?: string | null;
      };

    const updates: Record<string, unknown> = {};

    if (playerA !== undefined) updates.player_a = playerA;
    if (playerB !== undefined) updates.player_b = playerB;
    if (clubA !== undefined) updates.club_a = clubA;
    if (clubB !== undefined) updates.club_b = clubB;
    if (status !== undefined) {
      if (!["upcoming", "live", "completed"].includes(status)) {
        return NextResponse.json(
          { error: "status skal være 'upcoming', 'live' eller 'completed'." },
          { status: 400 }
        );
      }
      updates.status = status;
    }
    if (round !== undefined) {
      if (round < 1) {
        return NextResponse.json(
          { error: "round skal være mindst 1." },
          { status: 400 }
        );
      }
      updates.round = round;
    }
    if (matchOrder !== undefined) {
      if (matchOrder < 1) {
        return NextResponse.json(
          { error: "matchOrder skal være mindst 1." },
          { status: 400 }
        );
      }
      updates.match_order = matchOrder;
    }

    if (scheduledAt !== undefined) updates.scheduled_at = scheduledAt;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Ingen felter at opdatere." },
        { status: 400 }
      );
    }

    // ── Apply update ────────────────────────────────────────────────────
    const { data: match, error: updateError } = await supabase
      .from("matches")
      .update(updates)
      .eq("id", matchId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Kunne ikke opdatere kampen: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ match });
  } catch {
    return NextResponse.json(
      { error: "Der opstod en uventet fejl. Prøv igen." },
      { status: 500 }
    );
  }
}
