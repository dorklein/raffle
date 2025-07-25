"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Users, Heart, Video, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface Participant {
  name: string
  username: string
  id: string
  profilePic?: string
}

interface TikTokProfile {
  username: string
  displayName: string
  followerCount: number
  avatar: string
  verified: boolean
  bio: string
  likesCount: number
  videoCount: number
  bioLink?: string
}

interface WinnerDisplayProps {
  winner: Participant
  isAnimating?: boolean
}

export function WinnerDisplay({ winner, isAnimating = false }: WinnerDisplayProps) {
  const [tikTokProfile, setTikTokProfile] = useState<TikTokProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const fetchTikTokProfile = async (username: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Clean username (remove @ if present)
      const cleanUsername = username.replace("@", "").toLowerCase()
      const response = await fetch(`/api/tiktok/${cleanUsername}`, {
        next: {
          revalidate: 3600 * 24 * 30, // 30 days
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("data", data)
        setTikTokProfile(data)
      } else {
        // If TikTok profile not found, we'll just show basic info
        console.log(`TikTok profile not found for ${username}`)
      }
    } catch (error) {
      console.error("Error fetching TikTok profile:", error)
      setError("Could not load TikTok profile")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (winner.username) {
      fetchTikTokProfile(winner.username)
    }
  }, [winner.username])

  return (
    <div
      className={cn(
        "transition-all duration-500 transform",
        isAnimating && "animate-pulse scale-110",
        !isAnimating && "scale-125",
      )}
    >
      {/* Winner Avatar */}
      <div className="relative">
        <Avatar className="w-40 h-40 mx-auto border-4 border-yellow-400 shadow-2xl">
          <AvatarImage
            src={
              tikTokProfile?.avatar ||
              winner.profilePic ||
              `/placeholder.svg?height=160&width=160&text=${winner.name.charAt(0) || "/placeholder.svg"}`
            }
            alt={winner.name}
          />
          <AvatarFallback className="text-4xl bg-linear-to-br from-purple-500 to-pink-500 text-white">
            {winner.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Verification Badge */}
        {tikTokProfile?.verified && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Winner Info */}
      <div className="mt-6 space-y-4 text-center">
        {/* Name and Username */}
        <div>
          <h3 className="text-3xl font-bold text-white mb-2">{tikTokProfile?.displayName || winner.name}</h3>
          <p className="text-xl text-pink-300 flex items-center justify-center gap-2">
            @{winner.username}
            {tikTokProfile && (
              <a
                href={`https://tiktok.com/@${winner.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </p>
        </div>

        {/* Bio */}
        {tikTokProfile?.bio && (
          <p className="text-white/80 text-sm max-w-md mx-auto line-clamp-2">{tikTokProfile.bio}</p>
        )}

        {/* TikTok Stats */}
        {tikTokProfile && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-bold text-lg">{formatNumber(tikTokProfile.followerCount)}</span>
                </div>
                <div className="text-white/60 text-xs">Followers</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-white font-bold text-lg">{formatNumber(tikTokProfile.likesCount)}</span>
                </div>
                <div className="text-white/60 text-xs">Likes</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Video className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-bold text-lg">{formatNumber(tikTokProfile.videoCount)}</span>
                </div>
                <div className="text-white/60 text-xs">Videos</div>
              </div>
            </div>
          </div>
        )}

        {/* Status Badges */}
        <div className="flex justify-center gap-2 flex-wrap">
          {tikTokProfile && (
            <Badge className="bg-pink-600 hover:bg-pink-700 text-white">
              <Star className="w-3 h-3 mr-1" />
              TikTok Creator
            </Badge>
          )}

          {!tikTokProfile && !isLoading && !error && (
            <Badge variant="outline" className="border-white/30 text-white/70">
              Raffle Participant
            </Badge>
          )}

          {error && (
            <Badge variant="outline" className="border-yellow-500/50 text-yellow-300">
              Profile Loading Failed
            </Badge>
          )}
        </div>

        {/* Bio Link */}
        {tikTokProfile?.bioLink && (
          <div className="pt-2">
            <a
              href={tikTokProfile.bioLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-200 text-sm underline"
            >
              Visit Bio Link
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
