import { NextRequest, NextResponse } from "next/server";
import { getStockHistory } from "@/lib/data/store";
import { getForecast } from "@/lib/forecastingClient";

export async function GET(req: NextRequest) {
  const facilityId = req.nextUrl.searchParams.get("facilityId");
  const itemId = req.nextUrl.searchParams.get("itemId");
  if (!facilityId || !itemId) {
    return NextResponse.json({ error: "facilityId and itemId are required" }, { status: 400 });
  }

  const history = getStockHistory(facilityId, itemId);
  const result = await getForecast(history, 21);
  return NextResponse.json({ history, ...result });
}
