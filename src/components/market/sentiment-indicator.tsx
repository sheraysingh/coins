import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentIndicatorProps {
  sentiment: "bullish" | "neutral" | "bearish";
}

const config = {
  bullish: { icon: TrendingUp, color: "text-apex-green", bg: "bg-apex-green/10", label: "BULLISH" },
  neutral: { icon: Minus, color: "text-apex-amber", bg: "bg-apex-amber/10", label: "NEUTRAL" },
  bearish: { icon: TrendingDown, color: "text-apex-red", bg: "bg-apex-red/10", label: "BEARISH" },
};

export function SentimentIndicator({ sentiment }: SentimentIndicatorProps) {
  const { icon: Icon, color, bg, label } = config[sentiment];

  return (
    <div className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 ${bg}`}>
      <Icon className={`h-4 w-4 ${color}`} />
      <span className={`font-mono text-xs font-semibold ${color}`}>{label}</span>
    </div>
  );
}
