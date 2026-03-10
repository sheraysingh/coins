import { type YouTubeChannel, type SkoolCommunity } from "./types";

export const YOUTUBE_CHANNELS: YouTubeChannel[] = [
  { handle: "asyncr0ne", name: "Asyncr0ne" },
  { handle: "matthew_berman", name: "Matthew Berman" },
  { handle: "sabrina_ramonov", name: "Sabrina Ramonov" },
  { handle: "intothecryptoverse", name: "Benjamin Cowen" },
  { handle: "CoinBureau", name: "Coin Bureau" },
  { handle: "ChartGuys", name: "The Chart Guys" },
  { handle: "CryptoBanter", name: "Crypto Banter" },
  { handle: "TheCryptoLark", name: "Lark Davis" },
  { handle: "AltcoinDaily", name: "Altcoin Daily" },
  { handle: "Jungernaut", name: "Brian Jung" },
];

export const SKOOL_COMMUNITY: SkoolCommunity = {
  name: "CoinPicks Genesis",
  creator: "Alexander Lorenzo",
  price: "$1/month",
  members: "~2.7k",
  benefits: [
    "Delayed buy/sell signals",
    "Diamond Altcoin Research DB",
    "Weekly Q&A sessions",
    "Educational videos & resources",
  ],
  url: "https://www.skool.com/coinpicks-genesis",
};

export const CACHE_TTL_MS = 86400000; // 24 hours

export const COLORS = {
  cyan: "#22d3ee",
  magenta: "#ec4899",
  green: "#4ade80",
  red: "#f87171",
  amber: "#fbbf24",
  purple: "#a78bfa",
} as const;
