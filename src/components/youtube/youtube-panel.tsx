"use client";

import { useEffect, useState } from "react";
import { PanelWrapper } from "@/components/layout/panel-wrapper";
import { ChannelFeed } from "./channel-feed";
import { Skeleton } from "@/components/ui/skeleton";
import { type ChannelData } from "@/lib/types";

interface YouTubePanelProps {
  refreshKey: number;
}

export function YouTubePanel({ refreshKey }: YouTubePanelProps) {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/youtube")
      .then((res) => res.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setChannels(Array.isArray(d) ? d : []);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <PanelWrapper title="YouTube Channels" accent="magenta">
      {loading ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-md bg-apex-border" />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-16 w-28 rounded bg-apex-border" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full bg-apex-border" />
                <Skeleton className="h-3 w-1/2 bg-apex-border" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md border border-apex-red/30 bg-apex-red/5 p-4">
          <p className="font-mono text-sm text-apex-red">Error: {error}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Set YOUTUBE_API_KEY to enable live data
          </p>
        </div>
      ) : (
        <ChannelFeed channels={channels} />
      )}
    </PanelWrapper>
  );
}
