// ============================================================================
// CallIt — Parimutuel Odds Engine
// ============================================================================
// This implements parimutuel (tote/pool) betting math — the same model used
// in horse racing. The total pool of "calls" is split among winners
// proportionally to their stake. No house edge, no fixed odds.
//
// Key concept: odds shift dynamically as more predictions come in.
// If everyone piles on side A, side B becomes more attractive.
// ============================================================================

/**
 * Shape returned by the odds API for the UI to consume.
 */
export type MatchOdds = {
  matchId: string;
  poolA: number; // total calls wagered on side A
  poolB: number; // total calls wagered on side B
  totalPool: number;
  oddsA: number; // decimal odds for A (e.g., 1.85)
  oddsB: number; // decimal odds for B (e.g., 2.10)
  percentA: number; // implied probability A wins (e.g., 54)
  percentB: number; // implied probability B wins (e.g., 46)
  totalPredictions: number; // how many individual predictions placed
};

// Maximum odds cap — prevents absurd payouts when one side has near-zero
const MAX_ODDS = 10.0;
const MIN_ODDS = 1.01;

/**
 * Calculate decimal odds for both sides of a parimutuel pool.
 *
 * Formula: odds = totalPool / poolForThatSide
 *
 * Edge cases:
 * - Both pools at 0 → even odds (2.0, 2.0)
 * - One pool at 0 → the empty side gets MAX_ODDS (capped)
 */
export function calculateDecimalOdds(
  poolA: number,
  poolB: number
): { oddsA: number; oddsB: number } {
  // Both empty — no predictions yet, show even odds
  if (poolA === 0 && poolB === 0) {
    return { oddsA: 2.0, oddsB: 2.0 };
  }

  const totalPool = poolA + poolB;

  // One side empty — cap at MAX_ODDS to avoid infinity
  if (poolA === 0) {
    return { oddsA: MAX_ODDS, oddsB: formatOdds(totalPool / poolB) };
  }
  if (poolB === 0) {
    return { oddsA: formatOdds(totalPool / poolA), oddsB: MAX_ODDS };
  }

  return {
    oddsA: formatOdds(totalPool / poolA),
    oddsB: formatOdds(totalPool / poolB),
  };
}

/**
 * Calculate what you'd win if you placed `amount` at given `odds`.
 *
 * In parimutuel, the payout INCLUDES your original stake.
 * So if odds are 2.0 and you bet 100, you get back 200 (100 profit + 100 stake).
 */
export function calculatePotentialPayout(
  amount: number,
  odds: number
): number {
  return Math.floor(amount * odds);
}

/**
 * Calculate the percentage distribution of the pool.
 *
 * Returns whole-number percentages (e.g., 65 and 35, not 0.65 and 0.35).
 * When both pools are 0, returns 50/50.
 */
export function calculatePoolDistribution(
  poolA: number,
  poolB: number
): { percentA: number; percentB: number } {
  if (poolA === 0 && poolB === 0) {
    return { percentA: 50, percentB: 50 };
  }

  const total = poolA + poolB;
  const percentA = Math.round((poolA / total) * 100);
  // Ensure they always add up to exactly 100
  const percentB = 100 - percentA;

  return { percentA, percentB };
}

/**
 * Format odds to 2 decimal places, clamped between MIN_ODDS and MAX_ODDS.
 *
 * Odds below 1.01 don't make sense (you'd lose money even when winning).
 * Odds above 10.0 are capped to keep things reasonable for a PoC.
 */
export function formatOdds(odds: number): number {
  const clamped = Math.max(MIN_ODDS, Math.min(MAX_ODDS, odds));
  return Math.round(clamped * 100) / 100;
}

/**
 * Convert decimal odds to an implied probability percentage.
 *
 * Formula: (1 / odds) * 100
 *
 * E.g., odds of 2.0 → 50% implied probability
 * E.g., odds of 1.5 → 66.7% implied probability
 */
export function calculateImpliedProbability(odds: number): number {
  if (odds <= 0) return 0;
  return Math.round((1 / odds) * 100);
}

/**
 * Build a complete MatchOdds object from raw pool data.
 *
 * This is the main function the API routes use — it takes pool totals
 * and prediction count, and returns the full odds snapshot for the UI.
 */
export function buildMatchOdds(
  matchId: string,
  poolA: number,
  poolB: number,
  totalPredictions: number
): MatchOdds {
  const { oddsA, oddsB } = calculateDecimalOdds(poolA, poolB);
  const { percentA, percentB } = calculatePoolDistribution(poolA, poolB);

  return {
    matchId,
    poolA,
    poolB,
    totalPool: poolA + poolB,
    oddsA,
    oddsB,
    percentA,
    percentB,
    totalPredictions,
  };
}
