# CallIt

## What this is

A play-money prediction platform for content creators' communities. Fans predict outcomes in creator content — FIFA tournaments, challenges, competitions — using points ("calls"). No real money. No gambling. Just entertainment software that makes watching content more fun because you have skin in the game.

## Why we're building it

We saw a Danish YouTube group (CREW) post a FIFA tournament video and thought: "What if their fans could bet on it?" Not for money — just for bragging rights. That thought turned into this project.

We don't have a business plan. We don't know if this becomes a product, a portfolio piece, or just something fun we built. We're building it because the idea is good and we want to see it work. The goal right now is: **make it real, make it work, send it to CREW, see what happens.**

That's it. Don't over-engineer for scale. Don't build for "the platform." Build for one creator group and their fans.

## The proof of concept

**CREW** (@crewboyss on YouTube, ~63K subscribers) — a Danish YouTuber group that makes humor/vlog content. They recently posted a FIFA tournament video. That's our first event.

The PoC should work like this:
1. A fan visits the site (e.g., callit.dk/crew-fifa)
2. They sign up with a display name and email (magic link, no password)
3. They get 1,000 "calls" (points) to start
4. They see the tournament matches and place predictions
5. Odds shift dynamically based on what everyone bets (parimutuel model)
6. Results are entered by an admin after matches are played
7. Leaderboard shows who called it right

## Technical constraints

- **Budget: near zero.** Use free tiers. Vercel/Netlify for hosting, Supabase or equivalent for database. No paid APIs unless absolutely necessary.
- **Complexity: minimal.** This is a PoC, not a SaaS product. If you're debating between "correct" and "simple," pick simple.
- **Mobile-first.** CREW's audience is 16-25. They're on their phones.
- **Ship fast.** We'd rather have something rough that works than something polished that takes weeks.

## Legal framing

This is **entertainment software**, not gambling:
- Points ("calls") have zero monetary value
- No purchase required to play
- No cash-out, no prizes with monetary value
- No real money touches the system at any point

We still need:
- A clear Terms of Service stating this
- A minimal Privacy Policy (GDPR-compliant, but we collect almost nothing)
- Age gate: 13+ (standard digital services threshold in Denmark)

## How we work

### Decision-making
When facing a choice (tech stack, architecture, design pattern), present the options with honest tradeoffs. Don't just pick — explain why. The human (Sewar) makes the call, but needs enough context to decide quickly.

### Cost awareness
Every API call, every database query, every external service costs something. Be explicit about costs. If a decision would meaningfully increase the API bill, flag it before doing it.

### Progress tracking
After completing a meaningful chunk of work, summarize what was done, what's next, and any decisions that need human input. Don't wait until the end to surface problems.

### Agent Teams coordination
When working as part of an agent team:
- **Stay in your lane.** Don't edit files another teammate owns.
- **Communicate findings.** If you discover something that affects another teammate's work, message them.
- **Don't duplicate work.** Check the task list before starting something new.
- **Report blockers immediately.** Don't spin on a problem — flag it.

## Project phases

### Phase 1: Research (Agent Teams — 3 teammates)
- **CREW Research:** Who are they? Who are their members? What content patterns do they have? What does their audience look like? What's the FIFA tournament format?
- **Tech Stack:** Compare realistic options for backend, frontend, auth, hosting. Recommend a stack that's free/cheap, fast to build, and works.
- **Legal/Compliance:** Draft privacy policy and ToS. Research Danish law on play-money prediction platforms. Confirm this is not regulated as gambling.

Output: Updated docs in `/docs/` with findings and recommendations.

### Phase 2: Build (Agent Teams — 3-4 teammates)
Based on Phase 1 findings. Teammates own separate domains (backend, frontend, auth/infra, review). Specifics TBD after research.

### Phase 3: Polish & Ship
Make it look good. Test it. Deploy it. Send it to CREW.

## The spirit of this project

This isn't a startup. It's not a client project. It's a proof of concept built out of genuine enthusiasm. 

Build it like you're making something cool for yourself on a weekend. Not like you're shipping enterprise software. The bar is: "Does this work? Does it look decent? Would I actually use this?"

If something feels overengineered, it probably is. Scale it back.
