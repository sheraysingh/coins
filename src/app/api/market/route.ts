import { NextResponse } from "next/server";
import { getMarketData } from "@/lib/coingecko";

export async function GET() {
  try {
    const data = await getMarketData();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
