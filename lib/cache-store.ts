import { Redis } from "@upstash/redis";

// Initialize Redis
export const redis = Redis.fromEnv();

export interface CachedTikTokData {
  username: string;
  displayName: string;
  followerCount: number;
  avatar: string;
  verified: boolean;
  bio: string;
  likesCount: number;
  videoCount: number;
  bioLink?: string;
  cachedAt: number;
}
