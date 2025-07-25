import { type NextRequest, NextResponse } from "next/server";
import { CachedTikTokData, redis } from "@/lib/cache-store";

interface TikTokAPIResponse {
  statusCode: number;
  status_code: number;
  userInfo: {
    stats: {
      followerCount: number;
      followingCount: number;
      heartCount: number;
      videoCount: number;
    };
    user: {
      id: string;
      uniqueId: string;
      nickname: string;
      avatarLarger: string;
      avatarMedium: string;
      avatarThumb: string;
      signature: string;
      verified: boolean;
      bioLink?: {
        link: string;
      };
    };
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const username = (await params).username.replace("@", "").toLowerCase();

    // Check cache first
    // const cachedData = await cacheStore.get(username);
    const cachedData = await redis.get<CachedTikTokData>(username);

    if (cachedData) {
      console.log(
        `✅ Serving cached data for ${username} (cached ${Math.floor(
          (Date.now() - cachedData.cachedAt) / (1000 * 60 * 60 * 24)
        )} days ago)`
      );
      return NextResponse.json(cachedData);
    }

    // Check if API key is available
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      console.error("❌ RAPIDAPI_KEY environment variable is not set");
      return NextResponse.json({ error: "API configuration error" }, { status: 500 });
    }

    console.log(`🔄 Fetching fresh data for ${username} from TikTok API`);

    // Fetch from TikTok API via RapidAPI
    const response = await fetch(
      `https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=${username}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "tiktok-api23.p.rapidapi.com",
          "x-rapidapi-key": apiKey,
        },
        next: {
          revalidate: 3600 * 24 * 30, // 30 days
        },
      }
    );

    if (!response.ok) {
      console.error(`❌ TikTok API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: "Failed to fetch TikTok data" },
        { status: response.status }
      );
    }

    const data: TikTokAPIResponse = await response.json();

    // Check if the API returned an error
    if (data.status_code !== 0 || !data.userInfo) {
      console.error("❌ TikTok API returned error or no user info:", data);
      return NextResponse.json({ error: "User not found or API error" }, { status: 404 });
    }

    // Transform the data to our format
    const transformedData: CachedTikTokData = {
      username: `@${data.userInfo.user.uniqueId}`,
      displayName: data.userInfo.user.nickname,
      followerCount: data.userInfo.stats.followerCount,
      avatar: data.userInfo.user.avatarMedium || data.userInfo.user.avatarThumb,
      verified: data.userInfo.user.verified,
      bio: data.userInfo.user.signature || "TikTok Creator",
      likesCount: data.userInfo.stats.heartCount,
      videoCount: data.userInfo.stats.videoCount,
      bioLink: data.userInfo.user.bioLink?.link,
      cachedAt: Date.now(),
    };

    // Cache the data
    await redis.set(username, transformedData);
    console.log(`💾 Cached data for ${username}`);

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("❌ Error fetching TikTok data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
