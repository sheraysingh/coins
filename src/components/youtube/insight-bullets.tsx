import { Sparkles } from "lucide-react";

interface InsightBulletsProps {
  insights: string[];
}

export function InsightBullets({ insights }: InsightBulletsProps) {
  if (!insights.length) return null;

  return (
    <div className="rounded-md border border-apex-border bg-apex-navy/50 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-apex-magenta" />
        <span className="font-mono text-xs uppercase text-apex-magenta">AI Insights</span>
      </div>
      <ul className="space-y-1.5">
        {insights.map((insight, i) => (
          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
            <span className="mt-1 text-apex-cyan">&#8250;</span>
            <span>{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
