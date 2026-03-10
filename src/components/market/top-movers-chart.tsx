"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { type CoinData } from "@/lib/types";
import { COLORS } from "@/lib/constants";

interface TopMoversChartProps {
  coins: CoinData[];
}

export function TopMoversChart({ coins }: TopMoversChartProps) {
  const movers = [...coins]
    .sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))
    .slice(0, 5)
    .map((c) => ({
      name: c.symbol.toUpperCase(),
      change: parseFloat(c.price_change_percentage_24h.toFixed(2)),
    }));

  return (
    <div className="h-36 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={movers}>
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #1e293b",
              borderRadius: "6px",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value}%`, "24h Change"]}
          />
          <Bar dataKey="change" radius={[4, 4, 0, 0]}>
            {movers.map((entry, index) => (
              <Cell key={index} fill={entry.change >= 0 ? COLORS.green : COLORS.red} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
