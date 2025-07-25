import { NextResponse } from "next/server";
import { redis } from "@/lib/cache-store";

export async function POST() {
  try {
    const removedCount = await redis.flushdb();
    const remainingSize = await redis.dbsize();

    return NextResponse.json({
      message: "Cache cleanup completed",
      removedEntries: removedCount,
      remainingEntries: remainingSize,
    });
  } catch (error) {
    console.error("Error cleaning up cache:", error);
    return NextResponse.json({ error: "Failed to cleanup cache" }, { status: 500 });
  }
}
