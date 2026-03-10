"use client";

import { useEffect, useState } from "react";
import { PanelWrapper } from "@/components/layout/panel-wrapper";
import { CoinTable } from "./coin-table";
import { PriceChart } from "./price-chart";
import { TopMoversChart } from "./top-movers-chart";
import { SentimentIndicator } from "./sentiment-indicator";
import { MarketSummary } from "./market-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { type MarketData } from "@/lib/types";

interface MarketPanelProps {
  refreshKey: number;
}

export function MarketPanel({ refreshKey }: MarketPanelProps) {
  const [data, setData] = useState<MarketData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/market")
      .then((res) => res.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <PanelWrapper title="Market Insights" accent="cyan">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 bg-apex-border" />
          <Skeleton className="h-48 w-full bg-apex-border" />
          <Skeleton className="h-32 w-full bg-apex-border" />
        </div>
      ) : error ? (
        <div className="rounded-md border border-apex-red/30 bg-apex-red/5 p-4">
          <p className="font-mono text-sm text-apex-red">Error: {error}</p>
        </div>
      ) : data ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <SentimentIndicator sentiment={data.sentiment} />
            <span className="font-mono text-xs text-muted-foreground">
              {data.coins.length} coins tracked
            </span>
          </div>

          <MarketSummary summary={data.summary} />

          <div>
            <h3 className="mb-2 font-mono text-xs uppercase text-muted-foreground">
              BTC / ETH — 7 Day
            </h3>
            <PriceChart btcData={data.btcChart} ethData={data.ethChart} />
          </div>

          <div>
            <h3 className="mb-2 font-mono text-xs uppercase text-muted-foreground">
              Top Movers — 24h
            </h3>
            <TopMoversChart coins={data.coins} />
          </div>

          <div>
            <h3 className="mb-2 font-mono text-xs uppercase text-muted-foreground">
              Top 10 by Market Cap
            </h3>
            <CoinTable coins={data.coins} />
          </div>
        </div>
      ) : null}
    </PanelWrapper>
  );
}
