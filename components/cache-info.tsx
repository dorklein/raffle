"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, Trash2, RefreshCw } from "lucide-react"

interface CacheStats {
  totalEntries: number
  cachedUsernames: string[]
  cacheLocation: string
}

export function CacheInfo() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCleaningUp, setIsCleaningUp] = useState(false)

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/cache/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch cache stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const cleanupCache = async () => {
    setIsCleaningUp(true)
    try {
      const response = await fetch("/api/cache/cleanup", { method: "POST" })
      if (response.ok) {
        const result = await response.json()
        console.log("Cache cleanup result:", result)
        await fetchStats() // Refresh stats
      }
    } catch (error) {
      console.error("Failed to cleanup cache:", error)
    } finally {
      setIsCleaningUp(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (!stats && !isLoading) return null

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Database className="w-4 h-4" />
          Cache Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-sm">Cached Profiles:</span>
          <Badge variant="secondary" className="bg-white/20 text-white">
            {isLoading ? "..." : stats?.totalEntries || 0}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white/70 text-sm">Storage:</span>
          <span className="text-white/60 text-xs">File-based JSON</span>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={fetchStats}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/10 bg-transparent text-xs"
          >
            {isLoading ? (
              <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
          </Button>

          <Button
            onClick={cleanupCache}
            disabled={isCleaningUp}
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/10 bg-transparent text-xs"
          >
            {isCleaningUp ? (
              <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
          </Button>
        </div>

        {stats && stats.cachedUsernames.length > 0 && (
          <div className="text-xs text-white/50">
            Recent: {stats.cachedUsernames.slice(0, 3).join(", ")}
            {stats.cachedUsernames.length > 3 && "..."}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
