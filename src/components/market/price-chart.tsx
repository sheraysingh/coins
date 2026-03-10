"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { type ChartDataPoint } from "@/lib/types";
import { COLORS } from "@/lib/constants";

interface PriceChartProps {
  btcData: ChartDataPoint[];
  ethData: ChartDataPoint[];
}

export function PriceChart({ btcData, ethData }: PriceChartProps) {
  // Merge BTC and ETH data by timestamp (sampled to ~50 points for performance)
  const step = Math.max(1, Math.floor(btcData.length / 50));
  const merged = btcData
    .filter((_, i) => i % step === 0)
    .map((btcPoint, i) => {
      const ethPoint = ethData[i * step];
      return {
        time: new Date(btcPoint.timestamp).toLocaleDateString("en-US", { weekday: "short" }),
        btc: btcPoint.price,
        eth: ethPoint?.price ?? 0,
      };
    });

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged}>
          <XAxis
            dataKey="time"
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="btc"
            orientation="left"
            stroke={COLORS.cyan}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="eth"
            orientation="right"
            stroke={COLORS.magenta}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #1e293b",
              borderRadius: "6px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#94a3b8" }}
          />
          <Line
            yAxisId="btc"
            type="monotone"
            dataKey="btc"
            stroke={COLORS.cyan}
            strokeWidth={2}
            dot={false}
            name="BTC"
          />
          <Line
            yAxisId="eth"
            type="monotone"
            dataKey="eth"
            stroke={COLORS.magenta}
            strokeWidth={2}
            dot={false}
            name="ETH"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
