"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Users } from "lucide-react"
import Link from "next/link"

interface Participant {
  name: string
  username: string
  id: string
  profilePic?: string
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([])

  useEffect(() => {
    // In a real app, you'd get this from a global state or API
    // For demo purposes, we'll use localStorage
    const stored = localStorage.getItem("raffle-participants")
    if (stored) {
      const parsedParticipants = JSON.parse(stored)
      setParticipants(parsedParticipants)
      setFilteredParticipants(parsedParticipants)
    }
  }, [])

  useEffect(() => {
    const filtered = participants.filter(
      (participant) =>
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.username.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredParticipants(filtered)
  }, [searchTerm, participants])

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Raffle
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Users className="w-8 h-8" />
              All Participants
            </h1>
            <p className="text-blue-200">{participants.length.toLocaleString()} total participants</p>
          </div>
        </div>

        {/* Search */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <Input
                placeholder="Search participants by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex justify-between items-center">
          <Badge variant="secondary" className="bg-white/20 text-white">
            Showing {filteredParticipants.length} of {participants.length} participants
          </Badge>
        </div>

        {/* Participants Grid */}
        {filteredParticipants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredParticipants.map((participant) => (
              <Card
                key={participant.id}
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12 border-2 border-white/30">
                      <AvatarImage
                        src={
                          participant.profilePic ||
                          `/placeholder.svg?height=48&width=48&text=${participant.name.charAt(0)}`
                        }
                        alt={participant.name}
                      />
                      <AvatarFallback className="bg-linear-to-br from-purple-500 to-pink-500 text-white">
                        {participant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{participant.name}</h3>
                      <p className="text-sm text-blue-200 truncate">@{participant.username}</p>
                      <p className="text-xs text-white/60">ID: {participant.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm ? "No participants found" : "No participants loaded"}
              </h3>
              <p className="text-blue-200">
                {searchTerm ? "Try adjusting your search terms" : "Upload a CSV file on the main page to get started"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
