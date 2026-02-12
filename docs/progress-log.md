# CallIt — Progress Log

## Session 5 — 2026-02-12

### What we did
**Phase 3: Polish — Copy polish + data reseed + resolve verification**

1. **Danish copy polish** — full audit of all user-facing text across 7 files. Killed "prediction"/"forudsigelse" everywhere, standardized on "call" as the brand word. Fixed "Klatr på ranglisten" (not Danish lingo) → "Top ranglisten". Changed "Visningsnavn" → "Brugernavn", "Potentiel udbetaling" → "Mulig gevinst", "Tabte" → "Tabt", plus 10 more string fixes. All copy now speaks casual youth Danish + brand language.

2. **Outright bets scoping** — discussed tournament-level markets (winner, finalist, most goals). Decision: **skip for now**. One lonely outright market in the UI would look half-baked. Revisit in v1.1 when there's enough content to justify the feature.

3. **Fresh prediction seed data** — user deleted old matches/predictions and recreated matches. Reset all 20 fake profile balances to 1.000, then seeded:
   - **Match 1** (completed, Dortmund won 2-4): 14 bets — 8 on Bayern (lost), 6 on Dortmund (won at ~2.71x). Fan names track realistically (JimilianSzn/xXSkinzXx went big on Bayern, HavErKing/KamalFansen backed Dortmund).
   - **Match 2** (upcoming): 12 bets — 5 on Newcastle (450 pool), 7 on Aston Villa (700 pool). Payouts pending resolution.
   - All balances consistent with stakes and payouts.

4. **Resolve flow verified** — traced full chain: admin UI → API auth/admin check → `resolve_match` RPC → parimutuel payout calculation → balance credits. Confirmed working. Edge case (no winners) refunds all stakes.

### Build status
- `next build` passes clean, 0 errors

### Next step
- **Deploy to Vercel** — git init, first commit, connect to Vercel, ship it

---

## Session 4 — 2026-02-12

### What we did
**Phase 3: Polish — Auth overhaul + Admin UX improvements**

Switched from magic-link-only auth to email+password as primary login (magic link hit Supabase free tier rate limits — 429 after ~3 emails/hour). Then improved admin match management with scheduling dates and match result display.

### Changes

**1. Password Auth (`src/app/login/page.tsx` — full rewrite)**
- Dual-mode page: "Log ind" (default) / "Opret konto" tabs
- Sign up: display name + email + password → `supabase.auth.signUp()`
- Log in: email + password → `supabase.auth.signInWithPassword()`
- Forgot password link → `supabase.auth.resetPasswordForEmail()`
- Password show/hide toggle (Eye/EyeOff icons from lucide-react)
- Danish error mapping via `SUPABASE_ERROR_MAP` record (maps Supabase error codes to Danish messages)
- No email confirmation required (PoC — toggle off in Supabase Dashboard)
- `/auth/callback` route unchanged — still handles password reset links

**2. Match Scheduling (admin + user-facing)**
- Admin create form: added "Kampdato (valgfri)" date input
- Admin edit form: added date input for editing scheduled date
- `POST /api/matches` + `PATCH /api/matches/[id]`: accept `scheduledAt` field
- Match card (`match-card.tsx`): shows calendar icon + Danish-formatted date on non-completed matches

**3. Match Result Display**
- New DB column: `ALTER TABLE public.matches ADD COLUMN result text` (migration: `add_match_result_field`)
- `database.types.ts` regenerated with `result: string | null`
- Admin resolve flow: when confirming winner, admin types the score (e.g. "3-1", "2-2 (str. 4-3)")
- Result saved via `supabase.from("matches").update({ result })` after `resolve_match` RPC
- Match card: completed matches show score prominently (font-display, bold, text-lg)
- Winner already indicated by trophy icon on the team — no redundant "X vandt!" banner

**4. Admin Account Setup**
- Confirmed no accounts had `is_admin = true` initially
- Sewar's account (sewar.sidou9@gmail.com, display name "wolfman") identified
- Instructions given to set `is_admin = true` via Supabase SQL Editor or Dashboard

### Files modified
| File | Change |
|------|--------|
| `src/app/login/page.tsx` | Full rewrite: password auth with dual tabs |
| `src/components/admin-match-controls.tsx` | Added scheduledAt fields + result input on resolve |
| `src/components/match-card.tsx` | Added date display + result score display |
| `src/app/api/matches/route.ts` | Added `scheduledAt` to POST body |
| `src/app/api/matches/[id]/route.ts` | Added `scheduledAt` to PATCH body |
| `src/lib/database.types.ts` | Regenerated — added `result` field to matches |

### Migration applied
- `add_match_result_field`: `ALTER TABLE public.matches ADD COLUMN result text;`

### Build status
- `next build` passes clean, 0 TypeScript errors

### Still pending
- [ ] Supabase Dashboard: disable "Confirm email" toggle (manual step)
- [ ] Set password for Sewar's existing magic-link account (SQL needed, password TBD)
- [ ] Frontend redesign: bright football theme (NOT dark)
- [ ] "Mine forudsigelser" page
- [ ] CREW disclaimer
- [ ] Git init + first commit
- [ ] Deploy to Vercel
- [ ] Mobile responsiveness pass

---

## Session 2 — 2026-02-12

### What we did
**Phase 2: Build — CORE COMPLETE**

Built the entire PoC in one session. Foundation laid by lead, then 3 agents worked in parallel on separate domains.

### Build outputs

**1. Database (Supabase — project `edguponbgyvcnybyzjzw`, region `eu-west-1`)**
- 4 tables: `profiles`, `tournaments`, `matches`, `predictions` — all with RLS
- Enums: `tournament_status`, `match_status`
- Triggers: `on_auth_user_created` (auto-creates profile), `on_prediction_created` (deducts balance)
- Function: `resolve_match(p_match_id, p_winner)` — parimutuel payout calculation
- All functions have `set search_path = ''` (passed security advisor check)
- Realtime enabled on `predictions` and `matches` tables
- CREW FIFA tournament seeded: 16 teams, 15 matches across 4 rounds
- Migrations applied: `initial_schema`, `fix_function_search_paths`, `add_club_fields`

**2. Backend (API Routes)**
- `POST /api/predictions` — place prediction (auth, validation, min 10 / max 500 calls, one per match)
- `GET /api/matches/[id]/odds` — live parimutuel odds (public)
- `POST /api/matches/[id]/resolve` — admin resolves match, triggers payouts

**3. Odds Engine (`src/lib/odds.ts`)**
- Real parimutuel math (tote betting model)
- `calculateDecimalOdds`, `calculatePotentialPayout`, `calculatePoolDistribution`
- `formatOdds`, `calculateImpliedProbability`, `buildMatchOdds`
- Exported `MatchOdds` type for UI consumption
- Odds capped at 10.0, edge cases handled (empty pools = even odds)

**4. Frontend Pages**
- `/` — Redirects to `/t/crew-fifa`
- `/t/[slug]` — Tournament page (server component fetches data, client component renders)
- `/login` — Magic link auth page (Danish, no password)
- `/leaderboard` — Ranked leaderboard with ROI, gold/silver/bronze top 3
- `/admin` — Protected admin panel for resolving matches

**5. UI Components**
- `NavBar` — Frosted glass, balance chip with coin icon, mobile hamburger menu
- `MatchCard` — Sportsbook-style with tappable odds buttons, pool distribution bar, live polling
- `PredictionSlip` — Bottom-sheet betting slip with preset amounts + payout preview
- `BracketView` — Single-elimination bracket for desktop
- `LeaderboardTable` — Ranked table with Danish number formatting
- `AdminMatchControls` — Match management with 2-step confirmation for resolving

**6. Auth Flow**
- Supabase magic link auth
- `/auth/callback` — handles code exchange
- `/auth/signout` — server-side sign out
- `getCurrentUser()` helper for server components
- Middleware refreshes session on every request

### Architecture
```
src/
├── app/
│   ├── layout.tsx          — Root layout with NavBar + auth
│   ├── page.tsx            — Redirects to /t/crew-fifa
│   ├── login/page.tsx      — Magic link login
│   ├── t/[slug]/
│   │   ├── page.tsx        — Tournament server component
│   │   └── tournament-client.tsx — Client-side orchestrator
│   ├── leaderboard/page.tsx
│   ├── admin/page.tsx
│   ├── api/
│   │   ├── predictions/route.ts
│   │   └── matches/[id]/
│   │       ├── odds/route.ts
│   │       └── resolve/route.ts
│   └── auth/
│       ├── callback/route.ts
│       └── signout/route.ts
├── components/
│   ├── nav-bar.tsx
│   ├── match-card.tsx
│   ├── prediction-slip.tsx
│   ├── bracket-view.tsx
│   ├── leaderboard-table.tsx
│   └── admin-match-controls.tsx
├── lib/
│   ├── auth.ts
│   ├── database.types.ts   — Auto-generated from Supabase
│   ├── odds.ts             — Parimutuel math engine
│   ├── utils.ts            — cn() helper
│   └── supabase/
│       ├── client.ts       — Browser client
│       ├── server.ts       — Server client
│       └── middleware.ts    — Session refresh
└── middleware.ts            — Next.js middleware
```

### Build status
- **27 source files, 11 routes, 0 TypeScript errors**
- `next build` passes clean
- All code compiles with Next.js 16.1.6 + Turbopack

### Tournament data seeded
- Tournament: "CREW FIFA 2v2 Turnering" (slug: `crew-fifa`)
- 16 teams in Round of 16 with known matchups from the brief
- Placeholder matches for QF, SF, Final (update as results come in)
- Known teams: Skinz & Jimilian (Bayern), Hav & Kamal (Dortmund), TopGunn & Mika (Napoli), FY & Jesseminho (Chelsea), Madsen & Jeppe (PSG), Ibis & Jab (Man City), Peter Bylgaard & Mads (Real Madrid), Billo (Arsenal), Omar (Atletico), Mohammed (Tottenham), Bro & SH (Liverpool), + others

### What needs refinement (Phase 3)
- [ ] Visual polish — run dev server, check all pages visually, fix spacing/layout issues
- [ ] Test the full flow end-to-end: sign up → predict → resolve → leaderboard
- [ ] Verify real-time odds polling works correctly
- [ ] Fix any runtime errors in browser console
- [ ] Update placeholder team names (Hold 12-16) with real names from video
- [ ] Mobile responsiveness pass on all pages
- [ ] Add Inter font (referenced in globals.css but not imported)
- [ ] Deploy to Vercel
- [ ] Initialize git repo + first commit
- [ ] Consider: Vercel MCP server for deployment automation
- [ ] Middleware deprecation warning: Next.js 16 prefers "proxy" over "middleware" — works fine for now

### Skills reminder for next session
- Use `/frontend-design` skill for any UI work
- Use `/supabase-postgres-best-practices` skill for any DB work
- Agents should also load these skills before writing code

---

## Session 1 — 2026-02-12

### What we did
**Phase 1: Research — COMPLETE**

Spun up a 3-agent team (crew-researcher, tech-evaluator, legal-researcher) to run all research tracks in parallel. All three delivered.

### Research outputs (all in `/docs/`)

**1. CREW Research (`crew-research.md`)**
- CREW (@CREWBOYSS) — Danish YouTube humor group, ~72K subs, ~17M views, active since Aug 2023
- Core members: Frommerjoe (Nicolai From, ~270K TikTok) + Lucas Christiansen
- Recurring collaborators: Mathias Bach, Loke Lund, Nomi
- Content: festival vlogs, pranks, challenges, comedy — all Danish, audience 16-22
- FIFA tournament video could NOT be verified via web search — needs manual check
- Platform should be in Danish for this audience

**2. Tech Stack (`tech-stack.md`)**
- **Recommended: Next.js + Supabase + Vercel + Tailwind/shadcn/ui**
- Total cost: $0/month on free tiers
- Supabase covers DB + auth (magic links) + real-time in one service
- Implementation snippets verified against official docs included in the file

**3. Legal/Compliance**
- `legal-compliance.md` — CallIt is NOT gambling under Danish law (no monetary stake or prize)
- No licence needed from Spillemyndigheden
- `terms-of-service.md` — Draft ToS ready (entertainment-only framing, 13+ age gate)
- `privacy-policy.md` — Draft GDPR-compliant privacy policy ready (minimal data collection)

### Decisions made
- Tech stack: Next.js + Supabase + Vercel + Tailwind + shadcn/ui (confirmed by Sewar)
- Legal: Clear to build — not regulated as gambling in Denmark
- Language: Platform UI should be in Danish

### Key files
```
/docs/
├── crew-research.md
├── crew-fifa-tournament.md  ← tournament brief from NotebookLM
├── tech-stack.md
├── legal-compliance.md
├── terms-of-service.md
├── privacy-policy.md
└── progress-log.md
```
