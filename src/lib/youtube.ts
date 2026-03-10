import { type YouTubeVideo, type YouTubeChannel, type ChannelData } from "./types";
import { getCached, setCache } from "./cache";

const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

async function fetchYT<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY not set");
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("key", API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`YouTube API ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

interface ChannelListResponse {
  items?: Array<{
    contentDetails?: { relatedPlaylists?: { uploads?: string } };
  }>;
}

interface PlaylistItemsResponse {
  items?: Array<{
    snippet?: {
      resourceId?: { videoId?: string };
      title?: string;
      thumbnails?: { medium?: { url?: string } };
      publishedAt?: string;
    };
  }>;
}

interface VideosResponse {
  items?: Array<{
    id?: string;
    statistics?: { viewCount?: string };
    contentDetails?: { duration?: string };
  }>;
}

export async function getChannelVideos(channel: YouTubeChannel): Promise<ChannelData> {
  const cacheKey = `yt-${channel.handle}`;
  const cached = getCached<ChannelData>(cacheKey);
  if (cached) return cached;

  try {
    // Step 1: Get uploads playlist ID
    const channelData = await fetchYT<ChannelListResponse>("channels", {
      part: "contentDetails",
      forHandle: channel.handle,
    });
    const uploadsId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsId) throw new Error(`No uploads playlist for @${channel.handle}`);

    // Step 2: Get recent videos
    const playlist = await fetchYT<PlaylistItemsResponse>("playlistItems", {
      part: "snippet",
      playlistId: uploadsId,
      maxResults: "10",
    });

    const videoIds = playlist.items
      ?.map((item) => item.snippet?.resourceId?.videoId)
      .filter(Boolean) as string[];

    if (!videoIds?.length) {
      return { channel, videos: [], insights: [] };
    }

    // Step 3: Get video details (views, duration)
    const details = await fetchYT<VideosResponse>("videos", {
      part: "statistics,contentDetails",
      id: videoIds.join(","),
    });

    const detailMap = new Map(
      details.items?.map((v) => [v.id, v]) ?? []
    );

    const videos: YouTubeVideo[] = (playlist.items ?? [])
      .filter((item) => item.snippet?.resourceId?.videoId)
      .map((item) => {
        const videoId = item.snippet!.resourceId!.videoId!;
        const detail = detailMap.get(videoId);
        return {
          id: videoId,
          title: item.snippet!.title ?? "",
          thumbnailUrl: item.snippet!.thumbnails?.medium?.url ?? "",
          publishedAt: item.snippet!.publishedAt ?? "",
          viewCount: parseInt(detail?.statistics?.viewCount ?? "0", 10),
          duration: detail?.contentDetails?.duration ?? "",
          channelTitle: channel.name,
        };
      });

    const result: ChannelData = { channel, videos, insights: [] };
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    return {
      channel,
      videos: [],
      insights: [],
      error: err instanceof Error ? err.message : "Failed to fetch",
    };
  }
}
