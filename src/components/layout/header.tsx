"use client";

import { Activity, RefreshCw } from "lucide-react";
import { useLiveClock } from "@/hooks/use-live-clock";

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Header({ onRefresh, isRefreshing }: HeaderProps) {
  const time = useLiveClock();

  return (
    <header className="flex items-center justify-between border-b border-apex-border bg-apex-surface px-6 py-3">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-apex-cyan" />
        <h1 className="font-mono text-lg font-bold tracking-wider text-apex-cyan">
          APEX INSIGHTS
        </h1>
        <span className="animate-pulse-dot ml-1 h-2 w-2 rounded-full bg-apex-green" />
      </div>

      <div className="flex items-center gap-4">
        <span className="font-mono text-sm text-muted-foreground">{time}</span>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="rounded-md border border-apex-border p-1.5 text-muted-foreground transition-colors hover:border-apex-cyan hover:text-apex-cyan disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    </header>
  );
}
