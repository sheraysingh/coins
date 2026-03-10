export interface YouTubeChannel {
  handle: string;
  name: string;
  notebookId?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  duration: string;
  channelTitle: string;
}

export interface ChannelData {
  channel: YouTubeChannel;
  videos: YouTubeVideo[];
  insights: string[];
  error?: string;
}

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
  market_cap_rank: number;
}

export interface ChartDataPoint {
  timestamp: number;
  price: number;
}

export interface MarketData {
  coins: CoinData[];
  btcChart: ChartDataPoint[];
  ethChart: ChartDataPoint[];
  sentiment: "bullish" | "neutral" | "bearish";
  summary: string;
}

export interface SkoolCommunity {
  name: string;
  creator: string;
  price: string;
  members: string;
  benefits: string[];
  url: string;
}

export interface AIOpinion {
  pros: string[];
  cons: string[];
  verdict: string;
  lastUpdated: string;
}
