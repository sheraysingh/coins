import { getCached, setCache } from "./cache";

const MOCK_CHANNEL_INSIGHTS: Record<string, string[]> = {
  asyncr0ne: [
    "AI agent frameworks are converging on tool-use patterns",
    "Claude Code and similar tools driving developer productivity gains",
    "Focus on practical AI automation over theoretical capabilities",
  ],
  matthew_berman: [
    "Open-source models closing gap with proprietary offerings",
    "Multi-modal AI becoming standard across applications",
    "Local AI deployment gaining traction for privacy-conscious users",
  ],
  sabrina_ramonov: [
    "AI workflow automation tools seeing rapid adoption",
    "Content creation with AI assistants becoming mainstream",
    "Business use cases for AI outpacing consumer applications",
  ],
  intothecryptoverse: [
    "Bitcoin dominance trending relative to altcoin rotation cycles",
    "Macro economic indicators influencing crypto market direction",
    "Risk metrics suggest cautious positioning in current conditions",
  ],
  CoinBureau: [
    "Regulatory clarity emerging in key markets",
    "DeFi protocols showing renewed institutional interest",
    "Layer 2 solutions gaining significant traction",
  ],
  ChartGuys: [
    "Key support/resistance levels defining current range",
    "Volume profiles suggest consolidation before next move",
    "Technical indicators showing mixed signals across timeframes",
  ],
  CryptoBanter: [
    "Altcoin season indicators approaching key thresholds",
    "Market sentiment shifting as institutional flows increase",
    "New narratives emerging around AI x Crypto intersection",
  ],
  TheCryptoLark: [
    "Emerging market adoption accelerating crypto usage",
    "Web3 infrastructure maturing for mainstream applications",
    "Token economics evolving with new governance models",
  ],
  AltcoinDaily: [
    "Mid-cap altcoins showing relative strength",
    "NFT market finding new utility beyond collectibles",
    "Cross-chain interoperability improving ecosystem connectivity",
  ],
  Jungernaut: [
    "Crypto wealth strategies focusing on long-term accumulation",
    "Side income opportunities expanding in Web3 space",
    "Financial literacy content bridging traditional and crypto markets",
  ],
};

export async function getChannelInsights(handle: string): Promise<string[]> {
  const cacheKey = `insights-${handle}`;
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  // TODO: In production, SSH to VPS and query NotebookLM:
  // nlm notebook query <notebook-id> "What are the key trends from recent videos?"
  // For now, return mock insights
  const insights = MOCK_CHANNEL_INSIGHTS[handle] ?? [
    "Channel analysis pending — NotebookLM processing",
  ];

  setCache(cacheKey, insights);
  return insights;
}

const MOCK_MARKET_SUMMARY =
  "Crypto markets showing mixed signals with BTC holding key support levels. Institutional flows remain positive while retail sentiment is cautious. Watch for macro events that could trigger volatility.";

export async function getMarketInsights(): Promise<string> {
  const cacheKey = "market-insights";
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  // TODO: In production, use OpenRouter API or spawn OpenClaw agent for real AI summary
  const summary = MOCK_MARKET_SUMMARY;
  setCache(cacheKey, summary);
  return summary;
}

export async function getSkoolOpinion() {
  const cacheKey = "skool-opinion";
  const cached = getCached<{ pros: string[]; cons: string[]; verdict: string; lastUpdated: string }>(cacheKey);
  if (cached) return cached;

  // TODO: In production, use OpenClaw's last30days skill or WordSmith agent
  const opinion = {
    pros: [
      "Very low barrier to entry ($1/month)",
      "Claims proven track record with documented calls",
      "Active community with regular Q&A sessions",
      "Educational content beyond just signals",
      "Accountability through public track record claims",
    ],
    cons: [
      "Delayed signals reduce edge vs. paid tiers",
      "Risk of blind-following without own analysis",
      "No independently verified public performance proofs",
      "Community hype can amplify FOMO-driven decisions",
      "Altcoin picks carry inherently higher risk",
    ],
    verdict:
      "A low-cost entry point for learning, but treat signals as research starting points, not financial advice. Always do your own analysis.",
    lastUpdated: new Date().toISOString().split("T")[0],
  };

  setCache(cacheKey, opinion);
  return opinion;
}
