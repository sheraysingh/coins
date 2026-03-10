import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { YOUTUBE_CHANNELS } from "@/lib/constants";

interface OpenClawChannel {
  handle: string;
  name: string;
  notebookId?: string;
  videos: Array<{
    id: string;
    title: string;
    thumbnailUrl: string;
    publishedAt: string;
    viewCount: number;
    duration: string;
    channelTitle: string;
  }>;
  insights: string[];
}

interface OpenClawData {
  lastUpdated: string;
  channels: OpenClawChannel[];
}

async function readOpenClawData(): Promise<OpenClawData | null> {
  try {
    const dataPath = join(process.cwd(), "data", "youtube.json");
    const raw = await readFile(dataPath, "utf-8");
    const data = JSON.parse(raw) as OpenClawData;
    if (data.channels && data.channels.length > 0) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("channel");

  try {
    const openClawData = await readOpenClawData();

    if (!openClawData) {
      return NextResponse.json(
        { error: "YouTube data not yet available. OpenClaw cron job runs daily at 4 AM ET." },
        { status: 503 }
      );
    }

    if (handle) {
      const channelData = openClawData.channels.find((c) => c.handle === handle);
      if (!channelData) {
        return NextResponse.json({ error: "Channel not found" }, { status: 404 });
      }
      return NextResponse.json({
        channel: { handle: channelData.handle, name: channelData.name, notebookId: channelData.notebookId },
        videos: channelData.videos,
        insights: channelData.insights,
      });
    }

    // Return all channels
    const channels = YOUTUBE_CHANNELS.map((ch) => {
      const data = openClawData.channels.find((c) => c.handle === ch.handle);
      return {
        channel: { handle: ch.handle, name: ch.name, notebookId: data?.notebookId },
        videos: data?.videos ?? [],
        insights: data?.insights ?? [],
      };
    });

    return NextResponse.json(channels, {
      headers: { "X-Data-Updated": openClawData.lastUpdated },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to read YouTube data" },
      { status: 500 }
    );
  }
}
