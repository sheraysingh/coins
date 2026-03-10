"use client";

import { Header } from "@/components/layout/header";
import { StatusBar } from "@/components/layout/status-bar";
import { MarketPanel } from "@/components/market/market-panel";
import { YouTubePanel } from "@/components/youtube/youtube-panel";
import { SkoolPanel } from "@/components/skool/skool-panel";
import { useRefresh } from "@/hooks/use-refresh";
import { useEffect, useState } from "react";
import { type CoinData } from "@/lib/types";

export default function Dashboard() {
  const { refreshKey, isRefreshing, refresh } = useRefresh();
  const [tickerCoins, setTickerCoins] = useState<CoinData[]>([]);

  useEffect(() => {
    fetch("/api/market")
      .then((res) => res.json())
      .then((d) => {
        if (d.coins) setTickerCoins(d.coins);
      })
      .catch(() => {});
  }, [refreshKey]);

  return (
    <div className="flex h-screen flex-col bg-apex-navy">
      <Header onRefresh={refresh} isRefreshing={isRefreshing} />

      <main className="flex-1 overflow-hidden p-4">
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-3">
          <MarketPanel refreshKey={refreshKey} />
          <YouTubePanel refreshKey={refreshKey} />
          <SkoolPanel refreshKey={refreshKey} />
        </div>
      </main>

      <StatusBar coins={tickerCoins} />
    </div>
  );
}
