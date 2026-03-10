import { NextResponse } from "next/server";
import { getChannelInsights, getMarketInsights, getSkoolOpinion } from "@/lib/insights";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    if (type === "channel") {
      const handle = searchParams.get("handle");
      if (!handle) {
        return NextResponse.json({ error: "handle required" }, { status: 400 });
      }
      const insights = await getChannelInsights(handle);
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
