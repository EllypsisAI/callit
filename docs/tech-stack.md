# Tech Stack Evaluation — CallIt PoC

## Constraints

- **Budget:** Near zero. Free tiers only.
- **Speed:** PoC, not SaaS. Ship in days, not weeks.
- **Audience:** Mobile-first, 16-25 year olds on phones.
- **Features needed:** Magic link auth, real-time odds, leaderboard, admin panel for entering results.

---

## 1. Frontend Framework

### Option A: Next.js (React)
- **Pros:** Largest ecosystem. Best Vercel integration. Huge community — easy to find answers. App Router with Server Components reduces client JS. React knowledge is the most transferable.
- **Cons:** More boilerplate than alternatives. Setup takes ~8 min with config decisions (linting, data patterns). Can be over-engineered if you're not careful.
- **Free tier fit:** Deploys natively on Vercel free tier with zero config.

### Option B: SvelteKit
- **Pros:** Smallest bundle sizes (40-60% less than React). Fastest time-to-interactive. Clean, intuitive syntax. Great DX.
- **Cons:** Smaller ecosystem. Fewer UI component libraries. Harder to find developers. Svelte 5 runes are relatively new.
- **Free tier fit:** Deploys on Vercel or Netlify. Adapter system is flexible.

### Option C: Nuxt (Vue)
- **Pros:** Fastest setup (~5 min). Convention-over-configuration. Auto-imports reduce boilerplate. Good DX.
- **Cons:** Smaller ecosystem than React. Vue is less common in job markets. Some Nuxt 3 modules still maturing.
- **Free tier fit:** Deploys on Vercel or Netlify.

### Recommendation: **Next.js**

Reasoning: The PoC needs to be built fast, but it also needs to be maintainable if CREW says yes. Next.js has the largest ecosystem for solving problems quickly (auth libraries, UI components, tutorials). It deploys on Vercel with zero friction. The App Router with Server Components keeps the client bundle lean for mobile. If the team already knows React, the speed advantage of Nuxt/SvelteKit disappears. And if we ever hand this off or bring in help, React developers are the easiest to find.

SvelteKit would be the pick if raw performance and bundle size were the top priority, but for a PoC where development speed and ecosystem depth matter more, Next.js wins.

---

## 2. Backend / API

### Option A: Next.js API Routes (serverless)
- **Pros:** No separate backend to deploy. Colocated with frontend. Serverless = free tier friendly. Route Handlers in App Router are simple.
- **Cons:** Cold starts on free tier (can add ~1-2s latency). Not ideal for long-running processes. Vendor lock-in to Vercel's serverless runtime.
- **Free tier limits (Vercel Hobby):** 1M serverless function invocations/month, 100 GB-hours execution, 4 CPU-hours.

### Option B: Separate backend (Express, Fastify, etc.)
- **Pros:** Full control. Can run anywhere. Better for complex business logic.
- **Cons:** Need separate hosting. More infrastructure to manage. Overkill for a PoC.
- **Free tier fit:** Would need Railway, Render, or Fly.io free tier — all have limitations (sleep after inactivity, limited hours).

### Recommendation: **Next.js API Routes (Route Handlers)**

Reasoning: For a PoC, there's no reason to maintain a separate backend. Next.js Route Handlers handle our use cases (place bet, resolve match, fetch leaderboard) fine. The parimutuel odds calculation is simple math that runs in milliseconds — no need for a dedicated server. If this grows beyond PoC, we can extract API routes into a separate service later.

---

## 3. Database

### Option A: Supabase (Postgres)
- **Pros:** 500 MB storage (plenty for PoC). Built-in Auth with magic links. Built-in Realtime (Postgres changes over WebSocket). Row Level Security for access control. Dashboard for admin. REST and client library auto-generated from schema. All-in-one: DB + Auth + Realtime + Storage.
- **Cons:** Projects pause after 7 days of inactivity on free tier (need to wake manually). 2 active projects max. Shared CPU. No uptime SLA on free tier.
- **Free tier:** 500 MB database, 1 GB file storage, 5 GB bandwidth, 50K MAUs, 200 concurrent Realtime connections, 100 messages/second, unlimited API requests.

### Option B: Neon (Postgres)
- **Pros:** Serverless Postgres. Scales to zero (no pausing issue). Branching for dev/preview.
- **Cons:** 0.5 GB storage. No built-in auth or realtime — need separate services. 100 compute-hours/month.
- **Free tier:** 0.5 GB storage, 100 CU-hours/month, 5 GB egress, 20 projects.

### Option C: Turso (SQLite at the edge)
- **Pros:** 5 GB storage (most generous). Edge-deployed = fast reads. SQLite is simple.
- **Cons:** No built-in auth or realtime. SQLite limitations (no full Postgres feature set). Less tooling. LibSQL is relatively niche.
- **Free tier:** 5 GB storage, 500M rows read/month, 10M rows written/month, 500 databases.

### Option D: Cloudflare D1 (SQLite)
- **Pros:** 5 GB storage. Fast edge reads. Pairs with Cloudflare Workers.
- **Cons:** Locks you into Cloudflare ecosystem. No built-in auth/realtime. D1 is still relatively young. Would need to use Cloudflare Pages instead of Vercel.
- **Free tier:** 5 GB storage, 5M rows read/day, 100K rows written/day.

### Recommendation: **Supabase**

Reasoning: Supabase is the clear winner for a PoC because it bundles everything we need into one free tier:
1. **Database** — 500 MB Postgres is more than enough for one tournament.
2. **Auth** — Magic links work out of the box. No extra setup, no SMTP config needed (Supabase sends the emails).
3. **Realtime** — Subscribe to database changes over WebSocket. 200 concurrent connections and 100 msg/sec is plenty for a PoC with one creator's audience.
4. **Dashboard** — Built-in table editor works as a basic admin panel for entering results.

The 7-day inactivity pause is the only real downside, but for an active PoC that people are using, this won't trigger. And if it does, it wakes up in seconds.

Using Supabase means we don't need Clerk, Auth.js, Pusher, or any separate realtime service. One account, one dashboard, one bill (zero).

---

## 4. Auth

### Option A: Supabase Auth (built-in)
- **Pros:** Magic links enabled by default. 50K MAUs free. No separate service. Integrates with RLS for row-level security. Email templates customizable. PKCE flow for security.
- **Cons:** Less polished UI components than Clerk. Email deliverability depends on Supabase's shared SMTP (fine for PoC, might need custom SMTP for production).
- **Cost:** Free (included with Supabase).

### Option B: Clerk
- **Pros:** Beautiful pre-built UI components. 50K MAUs free. Great DX. Handles magic links, social logins, MFA.
- **Cons:** Separate service = another dependency. Need to sync user data with Supabase. More complex setup. Overkill for a PoC that just needs email + display name.
- **Cost:** Free up to 50K MAUs.

### Option C: Auth.js (NextAuth)
- **Pros:** Open source. Full control. Works with any database.
- **Cons:** Requires your own SMTP setup for magic links (Gmail, Resend, etc.). More configuration. Need database adapter setup. More code to write and maintain. Magic link requires a verification token table.
- **Cost:** Free (open source), but need free SMTP (Gmail limited, Resend ~3K emails/month free).

### Recommendation: **Supabase Auth**

Reasoning: Since we're already using Supabase for the database, using Supabase Auth is a no-brainer. Magic links work out of the box — literally `supabase.auth.signInWithOtp({ email })`. No SMTP setup, no extra service, no user sync issues. 50K MAUs is more than enough. The pre-built auth UI helpers (`@supabase/auth-helpers-nextjs`) integrate cleanly with Next.js.

---

## 5. Hosting

### Option A: Vercel
- **Pros:** Best Next.js support (they build it). Zero-config deployment from Git. Preview deployments on every PR. Edge network. Analytics built in.
- **Cons:** Hobby plan can't be used commercially (gray area for a free PoC). Some vendor lock-in.
- **Free tier:** 100 GB bandwidth, 1M edge requests, 1M serverless invocations, 100 deployments/day.

### Option B: Netlify
- **Pros:** Good Next.js support. Similar DX to Vercel. Edge functions.
- **Cons:** Next.js support is not as native as Vercel. 300 build minutes/month (can be tight). 125K serverless function invocations per site.
- **Free tier:** 100 GB bandwidth, 300 build minutes, 125K serverless invocations.

### Option C: Cloudflare Pages
- **Pros:** Unlimited static bandwidth. 100K worker requests/day. Fast edge network.
- **Cons:** Next.js support via `@cloudflare/next-on-pages` is not first-class. Some Next.js features don't work. Different runtime (Workers vs Node.js).
- **Free tier:** 500 builds/month, 100K worker requests/day, unlimited static bandwidth.

### Recommendation: **Vercel**

Reasoning: Vercel + Next.js is the path of least resistance. Zero-config deployment, preview URLs on every push, and the free tier is generous enough for a PoC. The "no commercial use" restriction on Hobby is fine — CallIt is a free platform with no revenue. If it ever becomes commercial, the Pro plan is $20/month.

---

## 6. Real-time Updates

### Option A: Supabase Realtime (built-in)
- **Pros:** Subscribe to Postgres changes via WebSocket. No extra service. Works with RLS. Broadcast and Presence channels available. 200 concurrent connections on free tier.
- **Cons:** 100 msg/sec limit. Tied to database changes (not arbitrary pub/sub). Can be chatty if many rows change.
- **Cost:** Free (included).

### Option B: Pusher
- **Pros:** Purpose-built for realtime. Reliable. Good SDKs.
- **Cons:** Free tier is extremely limited (appears to not have a meaningful free Channels tier anymore — pricing starts at $699/month for Growth). Not viable on zero budget.
- **Cost:** Effectively not free for Channels.

### Option C: Server-Sent Events (SSE) / Polling
- **Pros:** No external dependency. Simple to implement. Works everywhere.
- **Cons:** SSE is one-directional. Polling wastes resources. No built-in presence/broadcast. More code to write and maintain.
- **Cost:** Free (just serverless function invocations).

### Option D: PartyKit / Cloudflare Durable Objects
- **Pros:** Edge-deployed WebSockets. Good for collaborative/realtime apps.
- **Cons:** Different hosting ecosystem (Cloudflare). Extra service to manage. Learning curve.
- **Cost:** PartyKit free tier exists but adds complexity.

### Recommendation: **Supabase Realtime**

Reasoning: Already included with Supabase, no extra setup. When someone places a bet, the odds update in the database, and all connected clients get the update via WebSocket subscription. 200 concurrent connections is enough for a PoC (that's 200 people watching odds live at the same time). If we need more, simple polling every 5-10 seconds is a fine fallback that costs nothing.

---

## 7. Additional Services

### Email (for magic links)
- **Supabase built-in SMTP:** Fine for PoC. Sends from `noreply@mail.app.supabase.io`. May hit spam filters.
- **Resend (if needed):** Free tier sends ~3,000 emails/month. Clean API. Easy to plug into Supabase custom SMTP. Only add if deliverability becomes a problem.

### UI Components
- **Tailwind CSS + shadcn/ui:** Free, looks good, mobile-first. shadcn/ui gives you copy-paste components (not a dependency). Perfect for shipping fast without designing from scratch.
- **Alternative:** Radix UI, Headless UI — but shadcn/ui is built on Radix and pre-styled with Tailwind, so it's the fastest path.

### Deployment Pipeline
- **Vercel Git integration:** Push to main = deploy. Push to branch = preview URL. No CI/CD to configure.

---

## Recommended Stack Summary

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | Next.js (App Router) | Largest ecosystem, zero-config Vercel deploy, Server Components for mobile perf |
| **Backend** | Next.js Route Handlers | No separate server needed. Serverless = free tier friendly |
| **Database** | Supabase (Postgres) | 500 MB free. Built-in Auth + Realtime. One service for everything |
| **Auth** | Supabase Auth | Magic links out of the box. 50K MAUs free. No SMTP setup needed |
| **Realtime** | Supabase Realtime | WebSocket subscriptions to DB changes. 200 concurrent connections free |
| **Hosting** | Vercel (Hobby) | Best Next.js host. 100 GB bandwidth. Preview deploys. Zero config |
| **Styling** | Tailwind CSS + shadcn/ui | Mobile-first. Pre-built components. Copy-paste, no dependency |
| **Email** | Supabase built-in (upgrade to Resend if needed) | Zero config to start. Resend as fallback if deliverability is poor |

### Total monthly cost: **$0**

### Free tier headroom for PoC:
- **Users:** Up to 50,000 MAUs (auth) — we'll have maybe 100-500 for CREW
- **Database:** 500 MB — a tournament with 1,000 users and 10,000 bets is ~10 MB
- **Bandwidth:** 100 GB (Vercel) + 5 GB (Supabase) — PoC won't come close
- **Realtime:** 200 concurrent connections — plenty for one creator's audience watching live
- **Serverless:** 1M invocations/month — each page load is ~1-3 invocations, so ~300K-1M page loads

### Key risk: Supabase free tier pauses after 7 days of inactivity
- **Mitigation:** Set up a cron job (Vercel Cron or free external service like cron-job.org) to ping the database daily. Or just use the dashboard occasionally. This is only a risk before launch — once users are active, the project stays awake.

---

## Architecture Overview

```
User (mobile browser)
  |
  v
Vercel (Next.js App Router)
  |-- Static pages (SSG/ISR): Tournament info, leaderboard
  |-- Server Components: Dynamic data fetching
  |-- Route Handlers: API endpoints (place bet, resolve match)
  |
  v
Supabase
  |-- Postgres: Users, matches, bets, leaderboard
  |-- Auth: Magic link sign-in, session management
  |-- Realtime: WebSocket subscriptions for live odds
  |-- RLS: Row-level security (users can only modify their own bets)
```

### Data flow for placing a bet:
1. User clicks "Bet 50 calls on Player A"
2. Next.js Route Handler validates the request
3. Supabase: Insert bet row, update odds (parimutuel calculation)
4. Supabase Realtime: All subscribed clients receive the updated odds
5. UI updates in real-time

### Data flow for resolving a match:
1. Admin enters result in admin panel (protected route)
2. Route Handler: Update match result, calculate payouts, update user balances
3. Supabase Realtime: Leaderboard updates for all connected users

---

## What We're NOT Using (and why)

| Skipped | Reason |
|---------|--------|
| **Clerk** | Adds complexity. Supabase Auth does everything we need for free. |
| **Auth.js / NextAuth** | Requires SMTP setup, database adapter, more config. Supabase Auth is simpler. |
| **PlanetScale** | Killed their free tier in 2024. |
| **Neon** | Good DB, but no auth/realtime. Would need 3 services instead of 1 (Supabase). |
| **Turso** | SQLite at the edge is cool but unnecessary. No auth/realtime. |
| **Pusher** | No meaningful free tier for Channels anymore. Supabase Realtime is free. |
| **Separate backend** | Overkill. Next.js Route Handlers cover our needs. |
| **Cloudflare Pages** | Next.js support isn't first-class. Adds friction vs Vercel. |
| **Netlify** | Good, but Vercel is the native Next.js host. Less friction. |

---

## Decision needed from Sewar

The stack above is our recommendation. The only real decision point is:

**Do you want to use Next.js (React) or would you prefer SvelteKit or Nuxt?**

If you have strong Vue or Svelte experience, we could swap the frontend framework. Everything else (Supabase, Vercel, Tailwind) stays the same regardless. But if you're comfortable with React or have no strong preference, Next.js is the safest pick for ecosystem depth and ease of finding help.

---

## Implementation Quickstart (verified from official docs)

These code snippets are pulled from the official documentation to confirm the integration points work as described above.

### 1. Supabase Magic Link Auth

A single function call sends the magic link email. No SMTP config needed on free tier.

```typescript
// Sign in with magic link (passwordless)
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'https://callit.dk/auth/callback'
  }
})
```

React component pattern (from Supabase docs):

```tsx
import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      alert(error.error_description || error.message)
    } else {
      alert('Check your email for the login link!')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      <button disabled={loading}>
        {loading ? 'Loading...' : 'Send magic link'}
      </button>
    </form>
  )
}
```

### 2. Next.js Route Handlers (App Router)

API endpoints are simple exported functions. No Express, no middleware boilerplate.

```typescript
// app/api/bets/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  // validate, insert bet, recalculate odds
  return new Response(JSON.stringify({ success: true }), { status: 200 })
}

export async function GET(request: Request) {
  // fetch current odds / leaderboard
  return new Response(JSON.stringify(data), { status: 200 })
}
```

### 3. Supabase Row Level Security

One SQL statement locks down data access at the database level.

```sql
alter table profiles enable row level security;

-- Users can only read their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Users can only update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);
```

### 4. shadcn/ui Setup

One command initializes the component system. Then add components as needed.

```bash
# Initialize shadcn/ui in a Next.js project
npx shadcn@latest init

# Add individual components (copy-pasted into your project, not a dependency)
npx shadcn@latest add button card input table dialog
```

Configuration lives in `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  },
  "iconLibrary": "lucide"
}
```

---

*Documentation references verified via Context7 against official Supabase, Next.js, and shadcn/ui sources.*
