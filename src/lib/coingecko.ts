import { type CoinData, type ChartDataPoint, type MarketData } from "./types";
import { getCached, setCache } from "./cache";

const BASE_URL = "https://api.coingecko.com/api/v3";

async function fetchJSON<T>(url: string): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const apiKey = process.env.COINGECKO_API_KEY;
  if (apiKey) {
    headers["x-cg-demo-api-key"] = apiKey;
  }
  const res = await fetch(url, { headers, next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

export async function getTopCoins(): Promise<CoinData[]> {
  const cached = getCached<CoinData[]>("top-coins");
  if (cached) return cached;

  const coins = await fetchJSON<CoinData[]>(
    `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&sparkline=true&price_change_percentage=24h`
  );
  setCache("top-coins", coins);
  return coins;
}

export async function getCoinChart(coinId: string): Promise<ChartDataPoint[]> {
  const cacheKey = `chart-${coinId}`;
  const cached = getCached<ChartDataPoint[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchJSON<{ prices: [number, number][] }>(
    `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=7`
  );
  const points = data.prices.map(([timestamp, price]) => ({ timestamp, price }));
  setCache(cacheKey, points);
  return points;
}

function calculateSentiment(coins: CoinData[]): "bullish" | "neutral" | "bearish" {
  const avgChange = coins.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / coins.length;
  if (avgChange > 2) return "bullish";
  if (avgChange < -2) return "bearish";
  return "neutral";
}

function generateSummary(coins: CoinData[], sentiment: string): string {
  const btc = coins.find((c) => c.symbol === "btc");
  const eth = coins.find((c) => c.symbol === "eth");
  const topMover = [...coins].sort(
    (a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h)
  )[0];

  const btcStr = btc ? `BTC at $${btc.current_price.toLocaleString()} (${btc.price_change_percentage_24h >= 0 ? "+" : ""}${btc.price_change_percentage_24h.toFixed(1)}%)` : "";
  const ethStr = eth ? `ETH at $${eth.current_price.toLocaleString()} (${eth.price_change_percentage_24h >= 0 ? "+" : ""}${eth.price_change_percentage_24h.toFixed(1)}%)` : "";
  const moverStr = topMover ? `${topMover.name} leads movement at ${topMover.price_change_percentage_24h >= 0 ? "+" : ""}${topMover.price_change_percentage_24h.toFixed(1)}%.` : "";

  return `Market is ${sentiment}. ${btcStr}, ${ethStr}. ${moverStr}`;
}

export async function getMarketData(): Promise<MarketData> {
  const [coins, btcChart, ethChart] = await Promise.all([
    getTopCoins(),
    getCoinChart("bitcoin"),
    getCoinChart("ethereum"),
  ]);

  const sentiment = calculateSentiment(coins);
  const summary = generateSummary(coins, sentiment);

  return { coins, btcChart, ethChart, sentiment, summary };
}
