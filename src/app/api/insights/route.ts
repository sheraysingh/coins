import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { getMarketInsights, getSkoolOpinion } from "@/lib/insights";

async function getChannelInsightsFromFile(handle: string): Promise<string[]> {
  try {
    const dataPath = join(process.cwd(), "data", "youtube.json");
    const raw = await readFile(dataPath, "utf-8");
    const data = JSON.parse(raw);
    const channel = data.channels?.find((c: { handle: string }) => c.handle === handle);
    if (channel?.insights?.length > 0) {
      return channel.insights;
    }
  } catch {
    // Fall through to fallback
  }
  return ["Channel insights pending — OpenClaw processes data daily at 4 AM ET"];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    if (type === "channel") {
      const handle = searchParams.get("handle");
      if (!handle) {
        return NextResponse.json({ error: "handle required" }, { status: 400 });
      }
      const insights = await getChannelInsightsFromFile(handle);
      return NextResponse.json({ insights });
    }

    if (type === "market") {
      const summary = await getMarketInsights();
      return NextResponse.json({ summary });
    }

    if (type === "skool") {
      const opinion = await getSkoolOpinion();
      return NextResponse.json(opinion);
    }

    return NextResponse.json({ error: "type must be channel, market, or skool" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch insights" },
      { status: 500 }
    );
  }
}
