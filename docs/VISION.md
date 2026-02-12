# CallIt — Vision Document

## The idea

A prediction platform where content creators' communities can bet play-money on outcomes in their content. FIFA tournaments, challenges, competitions, head-to-heads — anything with an outcome.

It started with one observation: CREW posted a FIFA tournament on YouTube. Their fans watched it. Some probably guessed who'd win. But there was no mechanic for that — no way to participate, no stakes, no bragging rights beyond a comment that gets buried.

CallIt gives creators an engagement layer on top of their existing content:
- **Before the video:** Fans place predictions. They talk about it. They have opinions.
- **During the video:** They watch with more intensity because they have something on the line.
- **After the video:** The leaderboard updates. People brag. People cope. The content lives longer.

## Who it's for

**Primary:** Danish YouTubers and content creators who make competition-based content.

**Secondary:** Their communities — the people who already comment, like, and subscribe, but don't have a way to *participate* in the content.

**Proof of concept:** CREW's FIFA tournament.

## What fans see

### Signing up
- Visit the event page (e.g., callit.dk/crew-fifa)
- Pick a display name (anything they want)
- Enter an email address
- Click a magic link to log in (no password)
- Get 1,000 "calls" as starting balance

### Placing predictions
- See all open markets for an event (e.g., "Quarterfinal 1: Lucas vs. Oliver")
- Pick a winner
- Choose how many calls to bet
- See odds shift in real-time as others bet

### After results
- Winners receive calls from the losers' pool, proportional to their bet
- Leaderboard updates: top predictors per event and all-time
- Profile shows their history, win rate, current balance

### Running out of calls
- If balance hits 0, option to reset to 500 calls (lower than starting, so there's a natural consequence)

## What creators see (Admin dashboard)

- Create events (e.g., "CREW FIFA Tournament February 2026")
- Add markets under events (individual matches, "who wins it all", custom predictions)
- Share the event link with their community
- Report results when matches are played
- See engagement data: prediction count, unique users, most popular markets

The dashboard is not analytics-heavy. It's an overview that shows: "People are engaging with your content in a new way."

## The points system: "Calls"

Why "calls"? Because you "call" an outcome. "I'm calling Lucas." It's the language. And it's the platform name.

Rules:
- Everyone starts with 1,000 calls
- No purchasing calls. No real money. No cash-out. Ever.
- Calls have zero monetary value — it's a scoring system, not a currency
- Reset to 500 if you go broke (not back to 1,000 — there's a cost to being wrong)

Future ideas (not for PoC):
- Bonus calls for daily login, streaks, social sharing
- Seasonal resets with all-time leaderboards preserved

## Odds model: Parimutuel

No bookmaker. No fixed odds. It's a pool model:

- All bets on a market go into a shared pool
- Odds reflect the distribution of bets
- Winners split the entire pool, proportional to their individual bet

**Example:**
- Match: Lucas vs. Oliver
- Total pool: 10,000 calls
- 7,000 bet on Lucas, 3,000 bet on Oliver
- Oliver wins
- Everyone who bet on Oliver splits the 10,000 calls proportionally
- If you bet 300 of the 3,000 on Oliver (10% of Oliver's pool), you get 1,000 calls back

Simple. Fair. Self-balancing. And visually satisfying to watch odds move in real-time.

## Data and privacy

### What we collect
- Display name (user-chosen, can be anything)
- Email address (for magic link login)
- Prediction history (bets, timestamps, results)

### What we do NOT collect
- Real names (unless they choose to use theirs)
- Age, location, or demographics
- Payment information (there are no payments)
- Third-party data

### GDPR approach
- Minimal data = minimal risk
- Users can delete their account and all associated data
- No tracking cookies beyond session
- Privacy policy in clear language, not legalese

### Terms of Service — key points
- Calls have no monetary value and cannot be exchanged
- This is an entertainment product, not gambling
- Service can be modified or discontinued at any time
- Users must be 13+ (standard age threshold for digital services in Denmark)
- Abuse = ban

## What this is NOT

- **Not gambling.** No real money, no prizes with monetary value, no cash-out.
- **Not a SaaS.** It's a tool that exists to prove an idea.
- **Not an app.** It's a webapp. Mobile-first, but browser-based.
- **Not a platform yet.** It's a proof of concept built around one event (CREW FIFA).

## Design direction

- Dark theme, clean, mobile-first
- Should feel like something CREW's audience (16-25) would actually use
- Not enterprise. Not fintech. Not overly polished.
- Slightly bold. A bit of personality. But functional above all.

## What happens after

We genuinely don't know. And that's fine. The possibilities range from "send it to CREW and see what happens" to "use it as a creator-tools portfolio piece" to "it was fun to build, thanks for playing."

The important thing: build it because the idea is good. Not because there's a business case. Yet.
