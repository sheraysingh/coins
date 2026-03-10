import { Brain } from "lucide-react";

interface MarketSummaryProps {
  summary: string;
}

export function MarketSummary({ summary }: MarketSummaryProps) {
  return (
    <div className="rounded-md border border-apex-border bg-apex-navy/50 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Brain className="h-3.5 w-3.5 text-apex-magenta" />
        <span className="font-mono text-xs uppercase text-apex-magenta">AI Summary</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
    </div>
  );
}
