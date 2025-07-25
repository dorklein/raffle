import { NextResponse } from "next/server";
import { redis } from "@/lib/cache-store";

export async function GET() {
  try {
    const size = await redis.dbsize();
    const keys = await redis.keys("*");

    return NextResponse.json({
      totalEntries: size,
      cachedUsernames: keys,
      cacheLocation: ".cache/tiktok-profiles.json",
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return NextResponse.json({ error: "Failed to get cache stats" }, { status: 500 });
  }
}
