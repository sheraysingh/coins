"use client";

import { type CoinData } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface StatusBarProps {
  coins: CoinData[];
}

export function StatusBar({ coins }: StatusBarProps) {
  if (!coins.length) return null;

  const items = coins.slice(0, 6);

  return (
    <div className="overflow-hidden border-t border-apex-border bg-apex-surface px-4 py-1.5">
      <div className="animate-ticker flex whitespace-nowrap">
        {[...items, ...items].map((coin, i) => (
          <span key={`${coin.id}-${i}`} className="mr-8 inline-flex items-center gap-2 font-mono text-xs">
            <span className="uppercase text-muted-foreground">{coin.symbol}</span>
            <span className="text-foreground">{formatCurrency(coin.current_price)}</span>
            <span className={coin.price_change_percentage_24h >= 0 ? "text-apex-green" : "text-apex-red"}>
              {formatPercent(coin.price_change_percentage_24h)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
