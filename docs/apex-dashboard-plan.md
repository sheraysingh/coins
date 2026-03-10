# Apex Insights Dashboard — Implementation Plan

## Context

Build a Next.js 15 App Router dashboard ("Apex Insights Dashboard") with Bloomberg Terminal aesthetics, **replacing the existing minimal Flask dashboard** in the `sheraysingh/coins` repo. The dashboard provides daily crypto/YouTube/community insights across 3 panels, leveraging OpenClaw's VPS infrastructure (cron jobs, AI agents, NotebookLM) for data processing and AI summaries.

**Working directory**: `d:\apex-system` (remote: `https://github.com/sheraysingh/coins.git`, branch: `main`)

**Current state**: Flask Phase 1 code (9 files) is staged for deletion. Two worktrees exist but contain the same skeleton code. The `docs/intelligence-system-spec.md` outlines the broader vision (SQLite + vector search, multi-agent orchestration, NotebookLM). We're replacing Flask with Next.js as the new frontend.

**Pre-implementation**: Commit the staged deletions first, then scaffold Next.js in-place.

---

## Design System (Bloomberg Terminal Aesthetic)

- **Base**: Deep navy `#0a0e1a`, panel surface `#111827`, borders `#1e293b`
- **Accents**: Cyan `#22d3ee` (primary), Magenta `#ec4899` (secondary)
- **Data colors**: Green `#4ade80` (positive), Red `#f87171` (negative), Amber `#fbbf24` (warning)
- **Fonts**: IBM Plex Mono (numbers/tickers), Inter (body text) — via `next/font/google`
- **Animations**: Pulse for live data, color flash on price changes, ticker scroll for status bar
- **Layout**: 3-column CSS grid on desktop, stacked on mobile, each panel independently scrollable

---

## Tech Stack

- Next.js 15 (App Router, TypeScript, `src/` directory)
- Tailwind CSS + shadcn/ui (New York style, dark default)
- Recharts (charts), Lucide React (icons), next-themes (dark mode)
- OpenClaw VPS as backend for AI processing (cron jobs, NotebookLM, agent spawning)

---

## Folder Structure

```
apex-system/   (d:\apex-system, remote: sheraysingh/coins)
├── CLAUDE.md                       # Updated project instructions
├── docs/
│   └── intelligence-system-spec.md # Existing architecture spec (kept)
├── .env.local / .env.example
├── next.config.ts
├── tailwind.config.ts
├── components.json                 # shadcn/ui config
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: fonts, ThemeProvider, Header, StatusBar
│   │   ├── page.tsx                # Dashboard: 3-panel grid with Suspense
│   │   ├── globals.css             # Bloomberg dark theme CSS
│   │   ├── loading.tsx             # Skeleton fallback
│   │   └── api/
│   │       ├── youtube/route.ts    # YouTube Data API v3 proxy
│   │       ├── market/route.ts     # CoinGecko proxy
│   │       └── insights/route.ts   # AI summary endpoint (OpenClaw or mock)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx          # APEX logo, live clock, refresh button
│   │   │   ├── status-bar.tsx      # Scrolling ticker bar
│   │   │   └── panel-wrapper.tsx   # Reusable panel container
│   │   ├── youtube/
│   │   │   ├── youtube-panel.tsx   # Server wrapper
│   │   │   ├── channel-feed.tsx    # Tabbed channel view
│   │   │   ├── video-card.tsx      # Thumbnail + title + date
│   │   │   └── insight-bullets.tsx # AI insight bullets
│   │   ├── market/
│   │   │   ├── market-panel.tsx    # Server wrapper
│   │   │   ├── coin-table.tsx      # Top 10 coins table
│   │   │   ├── price-chart.tsx     # BTC/ETH 7-day line chart
│   │   │   ├── top-movers-chart.tsx # Bar chart of movers
│   │   │   ├── market-summary.tsx  # AI market summary
│   │   │   └── sentiment-indicator.tsx
│   │   ├── skool/
│   │   │   ├── skool-panel.tsx
│   │   │   ├── community-card.tsx  # Static public info
│   │   │   ├── opinion-card.tsx    # AI cross-check (pros/cons)
│   │   │   └── risk-warning.tsx    # Prominent disclaimer
│   │   └── ui/                     # shadcn/ui generated components
│   ├── lib/
│   │   ├── types.ts                # All TypeScript interfaces
│   │   ├── constants.ts            # Channel configs, color tokens
│   │   ├── utils.ts                # cn(), formatCurrency(), formatPercent(), timeAgo()
│   │   ├── youtube.ts              # YouTube Data API v3 multi-step fetch
│   │   ├── coingecko.ts            # CoinGecko API (top coins + chart data)
│   │   ├── insights.ts             # AI summary: OpenClaw agent → OpenAI fallback → mock
│   │   └── cache.ts                # In-memory cache with 24h TTL
│   ├── hooks/
│   │   ├── use-refresh.ts          # SWR-like fetch + staleness check
│   │   └── use-live-clock.ts       # UTC clock updating every second
│   └── providers/
│       └── theme-provider.tsx      # next-themes wrapper (defaultTheme="dark")
```

---

## Three Panels — Implementation Details

### Panel 1: YouTube Channels Insights

**Data flow:**
1. Config array in `constants.ts` with all 10 channels: asyncr0ne, matthew_berman, sabrina_ramonov, intothecryptoverse, CoinBureau, ChartGuys, CryptoBanter, TheCryptoLark, AltcoinDaily, Jungernaut
2. API route `/api/youtube` calls `lib/youtube.ts`:
   - `channels.list(forHandle=handle)` → get uploads playlist ID
   - `playlistItems.list(playlistId, maxResults=50)` → get video IDs, titles, thumbnails, dates
   - `videos.list(id=batchedIds)` → get view counts, durations
3. AI insights via **OpenClaw NotebookLM notebooks** (kept fresh by 4 AM cron job):
   - Each channel has its own NLM notebook with latest videos as sources
   - Dashboard `/api/insights` SSHs to VPS: `nlm notebook query <notebook-id> "What are the key trends and insights from the most recent videos?"`
   - Fallback: mock deterministic bullets if VPS unreachable
   - The 4 AM cron job (see OpenClaw Integration section) handles daily video refresh

**Display**: Tabbed channel feed, scrollable video cards with thumbnails, expandable AI insight bullets per video

### Panel 2: Market Insights (Crypto)

**Data flow:**
1. `/api/market` calls `lib/coingecko.ts`:
   - `GET /coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&sparkline=true` → top 10 coins
   - `GET /coins/bitcoin/market_chart?vs_currency=usd&days=7` → BTC 7-day chart
   - `GET /coins/ethereum/market_chart?vs_currency=usd&days=7` → ETH 7-day chart
2. AI market summary via **OpenClaw agent** (QuantFox or WordSmith):
   - SSH to VPS to spawn agent with market data context
   - Or: use OpenClaw's free-tier models via OpenRouter API directly from the dashboard
   - Prompt: "Given this market data [top 10 coins, 24h changes], generate a 3-sentence market sentiment summary"
   - Fallback: template-based summary using data thresholds
3. **Cron job**: Daily at 6:30 AM UTC, fetch fresh market data and generate AI summary, cache results

**Display**:
- Coin table: rank, icon, name, price (monospace), 24h% (green/red flash animation), volume, market cap
- Recharts line chart: BTC (cyan) + ETH (magenta) 7-day overlay
- Bar chart: top 5 movers by 24h% (green up / red down)
- Sentiment gauge: bullish/neutral/bearish based on aggregate data

### Panel 3: Skool CoinPicks Genesis

**Data flow:**
1. Static hardcoded public data (can't scrape private community):
   - Name: "CoinPicks Genesis", Creator: Alexander Lorenzo
   - Price: $1/month, Members: ~2.7k
   - Benefits: delayed buy/sell signals, Diamond Altcoin Research DB, weekly Q&A, educational videos
2. AI "Daily Cross-Check" opinion via **OpenClaw**:
   - Use OpenClaw's `last30days` skill to research "Skool CoinPicks Genesis Alexander Lorenzo review"
   - Or: spawn WordSmith agent to generate balanced assessment
   - Include pros (low barrier, proven track record claim, accountability) and cons (blind following risk, delayed signals, no public performance proofs)
3. Risk warning: prominent, always visible, not dismissible

**Display**: Community info card, AI opinion card with pros/cons columns, risk warning alert banner

---

## OpenClaw Integration Points

### Cron Job: YouTube NotebookLM Refresh (4:00 AM ET daily)

**Purpose**: For each tracked YouTube channel, fetch the last 50 videos (or last 20 days), and add new ones as sources to that channel's dedicated NotebookLM notebook. One notebook per channel.

**Channels & Notebooks** (10 channels):
| Channel | Handle | Notebook Name |
|---------|--------|---------------|
| Asyncr0ne | `@asyncr0ne` | `@asyncr0ne` |
| Matthew Berman | `@matthew_berman` | `@matthew_berman` |
| Sabrina Ramonov | `@sabrina_ramonov` | `@sabrina_ramonov` |
| Benjamin Cowen | `@intothecryptoverse` | `@intothecryptoverse` |
| Coin Bureau | `@CoinBureau` | `@CoinBureau` |
| The Chart Guys | `@ChartGuys` | `@ChartGuys` |
| Crypto Banter | `@CryptoBanter` | `@CryptoBanter` |
| Lark Davis | `@TheCryptoLark` | `@TheCryptoLark` |
| Altcoin Daily | `@AltcoinDaily` | `@AltcoinDaily` |
| Brian Jung | `@Jungernaut` | `@Jungernaut` |

**Implementation**: Add a new entry to `vps-backup/cron/jobs.json` (and push to VPS):

```json
{
  "id": "<generate-uuid>",
  "name": "youtube-nlm-refresh",
  "description": "Daily refresh: add latest YouTube videos to per-channel NotebookLM notebooks",
  "enabled": true,
  "schedule": { "kind": "cron", "expr": "0 4 * * *", "tz": "America/Toronto" },
  "sessionTarget": "isolated",
  "wakeMode": "now",
  "payload": {
    "kind": "agentTurn",
    "message": "Run the youtube-notebooklm playbook for each of these channels, one at a time. For each channel, use their existing NotebookLM notebook (create one if it doesn't exist). Add the last 50 videos (no older than 20 days) as sources. Skip videos already in the notebook.\n\nChannels:\n1. @asyncr0ne\n2. @matthew_berman\n3. @sabrina_ramonov\n4. @intothecryptoverse\n5. @CoinBureau\n6. @ChartGuys\n7. @CryptoBanter\n8. @TheCryptoLark\n9. @AltcoinDaily\n10. @Jungernaut\n\nFor each channel:\n1. yt-dlp --flat-playlist --print webpage_url --playlist-end 50 'https://www.youtube.com/@<handle>/videos'\n2. nlm login --check (re-auth if needed)\n3. Check if notebook exists: nlm notebook list | look for @<handle>. If not found, create: nlm notebook create '@<handle>'\n4. Get existing sources: nlm source list <notebook-id> --url\n5. For each video URL not already a source: nlm source add <notebook-id> --url '<url>' then sleep 3\n6. Report: how many new videos added, how many skipped (already existed), any failures\n\nProcess channels sequentially. If nlm auth expires mid-run, re-authenticate with nlm login and continue."
  },
  "state": {},
  "delivery": { "mode": "silent", "bestEffort": true },
  "deleteAfterRun": false
}
```

**Key details**:
- Schedule: `0 4 * * *` = 4:00 AM ET daily (America/Toronto)
- Dedup: checks existing sources before adding (avoids duplicates)
- Rate limiting: 3s sleep between source adds per playbook pattern
- NLM limits: ~50 sources per notebook, ~50 API calls per day — with 10 channels, dedup is critical; only new videos get added (typically 1-3 per channel per day). Cron job processes channels sequentially to stay within limits
- Auth: nlm sessions expire ~20min, so re-check between channels

**Files to modify**:
- `d:\OpenClaw\vps-backup\cron\jobs.json` — add the new job entry
- Then push to VPS: `cat jobs.json | ssh root@srv1426570.hstgr.cloud "docker exec -i openclaw-wekw-openclaw-1 tee /data/.openclaw/cron/jobs.json > /dev/null"`

### AI Models (via OpenRouter)
- **Default (FREE)**: Use `openrouter/auto` or `openrouter/qwen/qwen3-4b:free` for generating insight bullets and market summaries directly from the dashboard API routes
- **Mid-tier**: Haiku 4.5 for complex market analysis when free models produce poor results
- **Premium**: Sonnet only for comprehensive daily briefings (triggered by cron, not per-request)
- Implement in `lib/insights.ts` with tiered fallback: OpenClaw SSH → OpenRouter API → mock

### NotebookLM (via `nlm` CLI on VPS)
- Query existing notebooks for channel insights: `nlm notebook query <id> "What are the key trends discussed in recent videos?"`
- Generate audio briefings: `nlm studio audio generate <id> --format brief --length short`
- Research: `nlm research start "crypto market trends" --notebook-id <id> --mode fast`
- Auth: cookies-based, sessions expire ~20min — dashboard should handle gracefully

---

## Environment Variables

```env
# Required
YOUTUBE_API_KEY=              # YouTube Data API v3
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional — enables real AI summaries
OPENROUTER_API_KEY=           # Free-tier models for AI insights
OPENAI_API_KEY=               # Alternative AI provider

# Optional — CoinGecko demo key (works without it)
COINGECKO_API_KEY=

# Optional — VPS integration for OpenClaw features
VPS_HOST=srv1426570.hstgr.cloud
VPS_USER=root
DOCKER_CONTAINER=openclaw-wekw-openclaw-1

# Cache
CACHE_TTL_MS=86400000         # 24 hours default
```

---

## Implementation Order

| Phase | Files | Description |
|-------|-------|-------------|
| 0. Clean up | 0 new | Commit staged Flask deletions, clean worktrees, update CLAUDE.md |
| 1. Scaffold | 8 files | `create-next-app` (in-place at `d:\apex-system`), install deps, shadcn init, tailwind config, globals.css, types, constants, utils |
| 2. Infrastructure | 5 files | cache.ts, theme-provider, layout.tsx, hooks (clock, refresh) |
| 3. Layout | 3 files | header, status-bar, panel-wrapper |
| 4. Market Panel | 7 files | coingecko.ts, API route, coin-table, price-chart, top-movers, sentiment, market-summary, market-panel |
| 5. YouTube Panel | 6 files | youtube.ts, API route, insight-bullets, video-card, channel-feed, youtube-panel |
| 6. AI + Skool | 6 files | insights.ts, insights API route, risk-warning, community-card, opinion-card, skool-panel |
| 7. Assembly | 3 files | page.tsx (wire panels), loading.tsx, status-bar (connect live data) |
| 8. OpenClaw Cron | 1 file | Add youtube-nlm-refresh job to jobs.json, push to VPS |

**Total: ~39 files to create**

---

## Packages to Install

```bash
npm install recharts lucide-react next-themes
# shadcn/ui peer deps installed automatically via `npx shadcn@latest init`
# shadcn components: card badge button skeleton alert tabs separator scroll-area tooltip
```

---

## Verification Plan

1. `npm run dev` — dark theme loads, no errors
2. Market panel works immediately (CoinGecko needs no key): table, charts, sentiment
3. YouTube panel with `YOUTUBE_API_KEY`: channels load, videos display, mock insights render
4. YouTube panel without key: graceful error, no crash
5. Skool panel: static data + AI opinion render, risk warning prominent
6. Responsive: 3-col desktop → stacked mobile
7. Refresh button re-fetches all panels
8. Cache: second page load is instant
9. `npm run build` — zero TypeScript errors
10. OpenClaw cron: verify jobs.json is valid, test SSH command execution
