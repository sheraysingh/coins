import { NextResponse } from "next/server";
import { getChannelVideos } from "@/lib/youtube";
import { YOUTUBE_CHANNELS } from "@/lib/constants";
import { getChannelInsights } from "@/lib/insights";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("channel");

  try {
    if (handle) {
      const channel = YOUTUBE_CHANNELS.find((c) => c.handle === handle);
      if (!channel) {
        return NextResponse.json({ error: "Channel not found" }, { status: 404 });
      }
      const data = await getChannelVideos(channel);
      const insights = await getChannelInsights(handle);
      return NextResponse.json({ ...data, insights });
    }

    // Return all channels
    const results = await Promise.allSettled(
      YOUTUBE_CHANNELS.map(async (channel) => {
        const data = await getChannelVideos(channel);
        const insights = await getChannelInsights(channel.handle);
        return { ...data, insights };
      })
    );

    const channels = results.map((r, i) =>
      r.status === "fulfilled"
        ? r.value
        : { channel: YOUTUBE_CHANNELS[i], videos: [], insights: [], error: "Failed to fetch" }
    );

    return NextResponse.json(channels);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch YouTube data" },
      { status: 500 }
    );
  }
}
