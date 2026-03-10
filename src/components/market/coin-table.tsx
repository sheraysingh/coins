"use client";

import Image from "next/image";
import { type CoinData } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface CoinTableProps {
  coins: CoinData[];
}

export function CoinTable({ coins }: CoinTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-apex-border text-left text-xs uppercase text-muted-foreground">
            <th className="pb-2 pr-2">#</th>
            <th className="pb-2 pr-2">Coin</th>
            <th className="pb-2 pr-2 text-right">Price</th>
            <th className="pb-2 pr-2 text-right">24h</th>
            <th className="hidden pb-2 pr-2 text-right md:table-cell">Volume</th>
            <th className="hidden pb-2 text-right lg:table-cell">MCap</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => (
            <tr key={coin.id} className="border-b border-apex-border/50 transition-colors hover:bg-apex-border/20">
              <td className="py-2 pr-2 font-mono text-xs text-muted-foreground">
                {coin.market_cap_rank}
              </td>
              <td className="py-2 pr-2">
                <div className="flex items-center gap-2">
                  <Image src={coin.image} alt={coin.name} width={20} height={20} className="rounded-full" />
                  <span className="font-medium">{coin.name}</span>
                  <span className="text-xs uppercase text-muted-foreground">{coin.symbol}</span>
                </div>
              </td>
              <td className="py-2 pr-2 text-right font-mono">
                {formatCurrency(coin.current_price)}
              </td>
              <td className={`py-2 pr-2 text-right font-mono ${coin.price_change_percentage_24h >= 0 ? "text-apex-green" : "text-apex-red"}`}>
                {formatPercent(coin.price_change_percentage_24h)}
              </td>
              <td className="hidden py-2 pr-2 text-right font-mono text-muted-foreground md:table-cell">
                {formatCurrency(coin.total_volume)}
              </td>
              <td className="hidden py-2 text-right font-mono text-muted-foreground lg:table-cell">
                {formatCurrency(coin.market_cap)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
