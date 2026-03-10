# Investment Intelligence System — Build Spec

## Overview

Build a personal investment intelligence system that aggregates signals from multiple sources, processes them via OpenClaw agents, and delivers output through a web dashboard with chat + visual board, NotebookLM, Telegram/Discord bot, and daily email digest.

**Infrastructure:** Hostinger VPS (srv1426570.hstgr.cloud) — runs alongside existing OpenClaw Docker stack
**Team size:** 2–3 users
**Cost posture:** Free/cheap tiers only

---

## Architecture Overview

```
SOURCES           →   INGESTION        →   STORAGE        →   OUTPUT
──────────────────────────────────────────────────────────────────────
YouTube                NotebookLM skill     SQLite (raw)       Web Dashboard
Discord                (native YT           + sqlite-vec        ├── Visual board
RSS / News             transcript pull)     (vector search)     └── Chat (Claude API)
Reddit / X
TradingView        OpenClaw agents
My Notes           (Maestro orchestrates)

                                                               NotebookLM
                                                               (YouTube Q&A layer)

                                                               Gmail digest (daily)
                                                               Telegram bot (alerts)
```

---

## Source → Agent Mapping

| Source | Ingestion Method | Agent | Output |
|---|---|---|---|
| YouTube | NotebookLM skill (native transcript) | WordSmith | Summary → DB + digest |
| Discord | Webhook listener on VPS | WordSmith | Thread summaries → DB |
| RSS / News | Cron + feedparser | WordSmith | Article summaries → DB |
| Reddit | Reddit public API (free) | QuantFox | Sentiment + ticker mentions |
| X / Twitter | Nitter RSS (free, no API key) | QuantFox | Signal cards |
| TradingView | Webhook alerts → VPS endpoint | QuantFox | Price alerts → Telegram |
| My Notes | Watched folder → auto-ingest | Scrutin | QC + tag + archive |

---

## OpenClaw Agent Roles

- **Maestro** — Orchestrator. Runs daily morning pipeline at 07:00. Triggers all agents in sequence.
- **WordSmith** — Summarizes YouTube (via NotebookLM output), Discord threads, news articles. Writes to DB.
- **QuantFox** — Monitors for ticker mentions, sentiment shifts, price alerts. Feeds signal board and Telegram bot.
- **Scrutin** — QC and deduplication layer. Nothing hits the dashboard without passing Scrutin.
- **CodeSmith** — Builds and maintains scrapers, ingestion scripts, and the web app itself.

---

## Storage Layer

**Primary DB:** SQLite on VPS
**Location:** `/data/intelligence/db/signals.db`
**Vector search:** `sqlite-vec` extension (free, no external service needed)

### Tables
```sql
signals         -- raw ingested items (source, content, url, timestamp, asset_tags)
summaries       -- processed output from WordSmith (linked to signals)
positions       -- team position journal (asset, entry, thesis, notes, status)
alerts          -- QuantFox generated alerts (asset, type, triggered_at, resolved)
```

---

## Web Dashboard

**Stack:** Single-page app served from VPS on port `3456`
**Framework:** Vanilla JS or lightweight React — keep it simple
**Auth:** Basic HTTP auth or single shared token (team of 3)

### Layout

```
┌─────────────────────────────────────────────────────┐
│  HEADER: Today's date | Market status | Quick stats  │
├───────────────────────┬─────────────────────────────┤
│  SIGNAL BOARD (left)  │  CHAT PANEL (right)          │
│                       │                              │
│  ┌─ Watchlist ──────┐ │  [Powered by Claude API]     │
│  │ BTC  $XX  ↑ Bull │ │                              │
│  │ ETH  $XX  → Neut │ │  "What did QuantFox flag     │
│  └──────────────────┘ │   on BTC this week?"         │
│                       │                              │
│  ┌─ Today's Signals ┐ │  [Answer drawn from your     │
│  │ [card] [card]    │ │   signals DB + summaries]    │
│  │ [card] [card]    │ │                              │
│  └──────────────────┘ │                              │
│                       │                              │
│  ┌─ Daily Brief ────┐ │                              │
│  │ WordSmith digest │ │                              │
│  └──────────────────┘ │                              │
└───────────────────────┴─────────────────────────────┘
```

### Chat Interface
- Claude API (`claude-sonnet-4-20250514`) with system prompt injected with today's signals and recent summaries as context
- Search box queries sqlite-vec for relevant chunks before sending to Claude
- Conversation history held in session (not persisted)

### Signal Cards
Each card shows: source icon | asset tag | headline | sentiment (bull/bear/neutral) | timestamp | link

---

## Daily Morning Pipeline (07:00 cron)

```
Maestro triggers:
  1. Ingest all RSS/Reddit/X feeds → SQLite
  2. Pull NotebookLM YouTube summaries (via skill)
  3. WordSmith: summarize everything new since yesterday
  4. QuantFox: scan for ticker mentions + sentiment + price alerts
  5. Scrutin: QC pass, dedup, tag assets
  6. Send Gmail digest (via existing Gmail OAuth)
  7. Push top 3 alerts → Telegram bot
  8. Refresh dashboard signal board
```

---

## Telegram Bot

**Purpose:** Real-time alerts only — not a chat interface
**Triggers:**
- QuantFox flags a significant sentiment shift
- TradingView webhook fires a price alert
- A monitored Discord channel posts something tagged as high-signal

**Message format:**
```
🚨 SIGNAL | $BTC | Bearish
Source: Reddit r/CryptoCurrency
Summary: [2-line WordSmith summary]
Link: [url]
Time: 14:32 EST
```

---

## NotebookLM Integration

**Role:** YouTube knowledge layer — ingestion and Q&A
**Flow:**
1. OpenClaw (Maestro) detects new YouTube video from monitored channels
2. NotebookLM skill adds the YouTube URL to the designated notebook
3. NotebookLM processes transcript natively (no yt-dlp needed)
4. WordSmith queries NotebookLM for a summary and writes it to DB

**Notebook structure:** One notebook per asset class (Crypto, Equities, Macro) — keeps context focused.

---

## Build Order

### Phase 1 — Foundation (Week 1)
- [ ] Install NotebookLM skill in OpenClaw
- [ ] Test YouTube link → transcript → WordSmith summary flow
- [ ] Set up SQLite DB with schema on VPS

### Phase 2 — Ingestion (Week 2)
- [ ] RSS/News cron scraper (CodeSmith builds)
- [ ] Reddit public API poller
- [ ] Nitter RSS for X
- [ ] Discord webhook listener
- [ ] TradingView webhook endpoint on VPS

### Phase 3 — Dashboard (Week 3)
- [ ] Web app shell on VPS port 3456
- [ ] Signal board with cards populated from DB
- [ ] Daily brief panel from DB summaries

### Phase 4 — Intelligence (Week 4)
- [ ] sqlite-vec for vector search
- [ ] Chat panel with Claude API + context injection
- [ ] Telegram bot for alerts

### Phase 5 — Polish (Ongoing)
- [ ] Gmail digest formatting
- [ ] Scrutin dedup tuning
- [ ] Dashboard auth for team access

---

## Environment Variables Needed

```env
# Existing
OPENCLAW_GATEWAY_TOKEN=...
YOUTUBE_API_KEY=...

# New
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
ANTHROPIC_API_KEY=...        # for dashboard chat panel
TRADINGVIEW_WEBHOOK_SECRET=...
```

---

## Key Constraints

- All services run in Docker on existing VPS alongside `openclaw-wekw-openclaw-1`
- No paid APIs beyond what's already in use
- NotebookLM replaces yt-dlp for all YouTube ingestion
- Dashboard is the single team-facing interface
