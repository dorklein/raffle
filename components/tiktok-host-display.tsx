"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Plus, X, ExternalLink, Star, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TikTokHost {
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

interface TikTokHostDisplayProps {
  hosts: TikTokHost[]
  onHostsChange: (hosts: TikTokHost[]) => void
}

export function TikTokHostDisplay({ hosts, onHostsChange }: TikTokHostDisplayProps) {
  const [isEditing, setIsEditing] = useState(hosts.length === 0)
  const [newUsername, setNewUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTikTokProfile = async (username: string): Promise<TikTokHost> => {
    setIsLoading(true)
    setError(null)

    try {
      const cleanUsername = username.replace("@", "").toLowerCase()
      const response = await fetch(`/api/tiktok/${cleanUsername}`, {
        next: {
          revalidate: 3600 * 24 * 30, // 30 days
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching TikTok profile:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const addHost = async () => {
    if (!newUsername.trim() || hosts.length >= 3) return

    try {
      const hostData = await fetchTikTokProfile(newUsername.trim())
      const updatedHosts = [...hosts, hostData]
      onHostsChange(updatedHosts)
      setNewUsername("")
      setError(null)

      if (updatedHosts.length >= 3) {
        setIsEditing(false)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch TikTok profile")
    }
  }

  const removeHost = (index: number) => {
    const updatedHosts = hosts.filter((_, i) => i !== index)
    onHostsChange(updatedHosts)
    if (updatedHosts.length === 0) {
      setIsEditing(true)
    }
  }

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

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            Raffle Host{hosts.length > 1 ? "s" : ""}
          </h2>
          {!isEditing && hosts.length < 3 && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Host
            </Button>
          )}
        </div>

        {/* Host Display */}
        {hosts.length > 0 && (
          <div
            className={cn(
              "grid gap-4 mb-6",
              hosts.length === 1 && "grid-cols-1",
              hosts.length === 2 && "grid-cols-1 md:grid-cols-2",
              hosts.length === 3 && "grid-cols-1 md:grid-cols-3",
            )}
          >
            {hosts.map((host, index) => (
              <div
                key={host.username}
                className="relative bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
              >
                {isEditing && (
                  <Button
                    onClick={() => removeHost(index)}
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-white/60 hover:text-white hover:bg-red-500/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}

                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 border-2 border-white/20">
                    <AvatarImage src={host.avatar || "/placeholder.svg"} alt={host.displayName} />
                    <AvatarFallback className="bg-linear-to-br from-pink-500 to-purple-500 text-white text-lg">
                      {host.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white truncate">{host.displayName}</h3>
                      {host.verified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <p className="text-pink-300 text-sm mb-2">{host.username}</p>

                    <p className="text-white/70 text-xs mb-3 line-clamp-2">{host.bio}</p>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-white font-semibold">{formatNumber(host.followerCount)}</div>
                        <div className="text-white/60">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{formatNumber(host.likesCount)}</div>
                        <div className="text-white/60">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{formatNumber(host.videoCount)}</div>
                        <div className="text-white/60">Videos</div>
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  href={`https://tiktok.com/${host.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 text-white/60 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Add Host Form */}
        {isEditing && hosts.length < 3 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="tiktok-username" className="text-white text-sm">
                  TikTok Username (e.g., @username)
                </Label>
                <Input
                  id="tiktok-username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="@username"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  onKeyPress={(e) => e.key === "Enter" && addHost()}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={addHost}
                  disabled={!newUsername.trim() || isLoading}
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                  {isLoading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
                {hosts.length > 0 && (
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                  >
                    Done
                  </Button>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-200 text-xs">
                <strong>Real TikTok API:</strong> Add 1-3 TikTok hosts using their @username. Profile data is cached for
                30 days to optimize API usage.
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {hosts.length === 0 && !isEditing && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-white/60 mb-2">No hosts added yet</h3>
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add TikTok Host
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
