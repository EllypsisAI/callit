# Phase 1: Research — Agent Teams Kickoff

## How to use this

Open Claude Code in the `callit/` repo directory and paste the prompt below. Claude will read CLAUDE.md automatically, then spin up an agent team based on your instructions.

**Before you start:**
- Make sure `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is set (check `.claude/settings.json`)
- Make sure your MCP servers are configured (check `.mcp.json`)
- You need tmux installed if you want split-pane view: `brew install tmux` (mac) or `sudo apt install tmux` (linux)

---

## The prompt

```
Read CLAUDE.md and docs/VISION.md to understand this project.

Create an agent team for the research phase. Three teammates:

1. **crew-researcher** — Research CREW (@crewboyss on YouTube). Find out:
   - Who are the members? Names, roles, social handles
   - What's their audience size across platforms (YouTube, Instagram, TikTok)?
   - What kind of content do they make? How often?
   - Do they have sponsors or brand deals?
   - What's the FIFA tournament format from their recent video?
   - What engagement patterns do they have? (comment style, community vibe)
   Write findings to docs/RESEARCH-CREW.md

2. **tech-scout** — Research and recommend a tech stack. Requirements:
   - Free or near-free to host and run
   - Fast to build (days, not weeks)
   - Supports: magic link auth, real-time odds updates, mobile-first UI
   - Compare: Supabase vs Firebase vs PocketBase vs other options
   - Compare: Next.js vs Remix vs plain React+Vite vs other options
   - Compare: Vercel vs Netlify vs Railway vs Fly.io for hosting
   - Recommend a specific stack with reasoning
   Write findings to docs/RESEARCH-TECH.md

3. **legal-drafter** — Handle the legal/compliance side:
   - Research Danish law on play-money prediction platforms
   - Confirm this doesn't fall under gambling regulation (Spillemyndigheden)
   - Draft a minimal Privacy Policy (GDPR-compliant, plain language)
   - Draft minimal Terms of Service
   - Research age requirements for digital services in Denmark/EU
   Write findings to docs/RESEARCH-LEGAL.md

Each teammate should use Perplexity search and Context7 for documentation lookup where relevant.

When all three are done, synthesize their findings into a single summary: docs/RESEARCH-SUMMARY.md — with clear recommendations and any decisions that need my input.

Keep it lean. Don't over-research. We need enough to make smart decisions, not a PhD thesis.
```

---

## What to expect

- Claude will create the team and spawn 3 teammates
- Each works independently in their own context window
- They'll write their findings to the docs/ folder
- The lead will synthesize everything when they're done
- Total time: probably 10-20 minutes depending on search speed
- Total cost: roughly 5x a normal Claude Code session (each teammate is a separate instance)

## After research

Review the findings. Make decisions on:
1. Tech stack (the tech scout will recommend, but you choose)
2. Any legal concerns flagged
3. Anything surprising from CREW research

Then we move to Phase 2: Build.
