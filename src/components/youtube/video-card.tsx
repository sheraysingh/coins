"use client";

import Image from "next/image";
import { type YouTubeVideo } from "@/lib/types";
import { formatViewCount, timeAgo } from "@/lib/utils";
import { Eye, Clock } from "lucide-react";

interface VideoCardProps {
  video: YouTubeVideo;
}

function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = match[1] ? `${match[1]}:` : "";
  const m = (match[2] ?? "0").padStart(h ? 2 : 1, "0");
  const s = (match[3] ?? "0").padStart(2, "0");
  return `${h}${m}:${s}`;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 rounded-md border border-transparent p-2 transition-colors hover:border-apex-border hover:bg-apex-navy/50"
    >
      <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover"
            sizes="112px"
          />
        ) : (
          <div className="h-full w-full bg-apex-border" />
        )}
        {video.duration && (
          <span className="absolute bottom-0.5 right-0.5 rounded bg-black/80 px-1 py-0.5 font-mono text-[10px] text-white">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-2 text-sm font-medium leading-tight group-hover:text-apex-cyan">
          {video.title}
        </h4>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatViewCount(video.viewCount)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(video.publishedAt)}
          </span>
        </div>
      </div>
    </a>
  );
}
