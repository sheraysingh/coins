"use client";

import { type ChannelData } from "@/lib/types";
import { VideoCard } from "./video-card";
import { InsightBullets } from "./insight-bullets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChannelFeedProps {
  channels: ChannelData[];
}

export function ChannelFeed({ channels }: ChannelFeedProps) {
  return (
    <Tabs defaultValue={channels[0]?.channel.handle} className="w-full">
      <ScrollArea className="w-full">
        <TabsList className="mb-3 flex w-max gap-1 bg-transparent">
          {channels.map((ch) => (
            <TabsTrigger
              key={ch.channel.handle}
              value={ch.channel.handle}
              className="whitespace-nowrap rounded-md border border-transparent px-3 py-1.5 font-mono text-xs data-[state=active]:border-apex-cyan data-[state=active]:text-apex-cyan"
            >
              @{ch.channel.handle}
            </TabsTrigger>
          ))}
        </TabsList>
      </ScrollArea>

      {channels.map((ch) => (
        <TabsContent key={ch.channel.handle} value={ch.channel.handle}>
          {ch.error ? (
            <div className="rounded-md border border-apex-red/30 bg-apex-red/5 p-3">
              <p className="font-mono text-sm text-apex-red">{ch.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <InsightBullets insights={ch.insights} />
              <div className="space-y-1">
                {ch.videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
                {ch.videos.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No videos found
                  </p>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
