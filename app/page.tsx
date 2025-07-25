"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Users, Trophy, Sparkles, Play, Volume2, VolumeX } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { TikTokHost, TikTokHostDisplay } from "@/components/tiktok-host-display"
import { WinnerDisplay } from "@/components/winner-display"

interface Participant {
  name: string
  username: string
  id: string
  profilePic?: string
}

interface AudioContextType {
  spinning: HTMLAudioElement | null
  winner: HTMLAudioElement | null
  drumroll: HTMLAudioElement | null
}

export default function RafflePage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isRaffling, setIsRaffling] = useState(false)
  const [winner, setWinner] = useState<Participant | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [currentSpinning, setCurrentSpinning] = useState<Participant | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [spinDuration, setSpinDuration] = useState(7_000)
  const [audioContext, setAudioContext] = useState<AudioContextType>({
    spinning: null,
    winner: null,
    drumroll: null,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [hosts, setHosts] = useState<TikTokHost[]>([])

  useEffect(() => {
    // Initialize audio elements with error handling
    const initializeAudio = () => {
      const spinning = new Audio()
      const winner = new Audio()
      const drumroll = new Audio()

      // Set audio properties
      spinning.loop = true
      spinning.volume = 0.6
      winner.volume = 0.8
      drumroll.volume = 0.5

      // Add error handling
      const handleAudioError = (audioType: string) => {
        console.log(`Audio file not found: ${audioType}. App will work without sound.`)
      }

      spinning.onerror = () => handleAudioError("spinning")
      winner.onerror = () => handleAudioError("winner")
      drumroll.onerror = () => handleAudioError("drumroll")

      // Try to load audio files (these are optional)
      try {
        spinning.src = "/spinning.mp3"
        winner.src = "/winner.mp3"
        drumroll.src = "/drumroll.mp3"
      } catch (e) {
        console.log("Audio files not available, running in silent mode", e)
      }

      setAudioContext({
        spinning,
        winner,
        drumroll,
      })
    }

    initializeAudio()

    // Store participants in localStorage for the participants page
    if (participants.length > 0) {
      // localStorage.setItem("raffle-participants", JSON.stringify(participants))
    }

    return () => {
      if (audioContext.spinning) audioContext.spinning.pause()
      if (audioContext.winner) audioContext.winner.pause()
      if (audioContext.drumroll) audioContext.drumroll.pause()
    }
  }, [participants])

  const playSound = (soundType: keyof AudioContextType) => {
    if (isMuted || !audioContext[soundType]) return

    try {
      const audio = audioContext[soundType]!
      audio.currentTime = 0

      // Check if the audio source is loaded
      if (audio.src && audio.src !== window.location.href) {
        audio.play().catch((error) => {
          console.log(`Could not play ${soundType} sound:`, error.message)
        })
      }
    } catch (error) {
      console.log(`Error playing ${soundType} sound:`, error)
    }
  }

  const stopSound = (soundType: keyof AudioContextType) => {
    if (!audioContext[soundType]) return
    audioContext[soundType]!.pause()
    audioContext[soundType]!.currentTime = 0
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const csv = e.target?.result as string
      const lines = csv.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

      const parsedParticipants: Participant[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",")
        if (values.length >= 2) {
          // Now we only require name and username
          const participant: Participant = {
            name: values[headers.indexOf("name")]?.trim() || "",
            username: values[headers.indexOf("username")]?.trim() || "",
            id: values[headers.indexOf("id")]?.trim() || `${i}`, // Generate ID if not provided
          }

          // Profile pic is optional now since we'll get it from TikTok API
          const profilePicIndex = headers.indexOf("profile pic") || headers.indexOf("profilepic")
          if (profilePicIndex !== -1 && values[profilePicIndex]) {
            participant.profilePic = values[profilePicIndex].trim()
          }

          if (participant.name && participant.username) {
            parsedParticipants.push(participant)
          }
        }
      }

      setParticipants(parsedParticipants)
    }
    reader.readAsText(file)
  }

  const startRaffle = async () => {
    if (participants.length === 0) return

    setIsRaffling(true)
    setWinner(null)
    setShowConfetti(false)

    // Play drumroll and spinning sound for tension
    playSound("drumroll")
    playSound("spinning")

    // Spinning animation for 3 seconds
    const spinInterval = 100
    const totalSpins = spinDuration / spinInterval

    for (let i = 0; i < totalSpins; i++) {
      const randomParticipant = participants[Math.floor(Math.random() * participants.length)]
      setCurrentSpinning(randomParticipant)
      await new Promise((resolve) => setTimeout(resolve, spinInterval))
    }

    // Stop spinning sound
    stopSound("drumroll")
    stopSound("spinning")

    // Select final winner
    const finalWinner = participants[Math.floor(Math.random() * participants.length)]
    setCurrentSpinning(null)
    setWinner(finalWinner)
    setShowConfetti(true)
    setIsRaffling(false)

    // Play winner sound
    playSound("winner")

    // Hide confetti after 5 seconds
    setTimeout(() => setShowConfetti(false), 5000)
  }

  const resetRaffle = () => {
    setWinner(null)
    setShowConfetti(false)
    setCurrentSpinning(null)
    stopSound("spinning")
    stopSound("winner")
    stopSound("drumroll")
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      // If muting, stop all sounds
      stopSound("spinning")
      stopSound("winner")
      stopSound("drumroll")
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-2 h-2 animate-bounce",
                i % 4 === 0 && "bg-yellow-400",
                i % 4 === 1 && "bg-pink-400",
                i % 4 === 2 && "bg-blue-400",
                i % 4 === 3 && "bg-green-400",
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
              <Sparkles className="text-yellow-400" />
              TikTok Raffle
              <Sparkles className="text-yellow-400" />
            </h1>
            <Button
              onClick={toggleMute}
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xl text-blue-200">Win amazing prizes with your TikTok community!</p>
        </div>

        {/* TikTok Host Display */}
        <TikTokHostDisplay hosts={hosts} onHostsChange={setHosts} />

        {/* Audio Instructions */}
        {/* <AudioInstructions /> */}

        {/* Upload Section */}
        {participants.length === 0 && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Participants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="csv-file" className="text-white">
                  Upload CSV file with participants (name, username required - profile pics will be fetched
                  automatically)
                </Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="bg-white/20 border-white/30 text-white file:bg-white/20 file:text-white file:border-0 mt-4"
                />
              </div>
              <div>
                <Label htmlFor="spin-duration" className="text-white">
                  Spin Duration (seconds)
                </Label>
                <Input
                  id="spin-duration"
                  type="number"
                  min="1"
                  max="60"
                  step="1"
                  value={spinDuration / 1000}
                  onChange={(e) => setSpinDuration(Number(e.target.value) * 1000)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50 mt-2"
                  placeholder="10"
                />
                <p className="text-blue-200 text-sm mt-1">
                  Controls how long the spinning animation lasts (1-10 seconds)
                </p>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-200 text-sm">
                  <strong>Simplified CSV:</strong> Now you only need `name` and `username` columns. Profile pictures
                  and stats will be automatically fetched from TikTok!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Raffle Interface */}
        {participants.length > 0 && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="flex justify-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white text-lg px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                {participants.length.toLocaleString()} Participants
              </Badge>
              <Link href="/participants">
                <Badge variant="outline" className="border-white/30 text-white text-lg px-4 py-2 hover:bg-white/10">
                  View All Participants
                </Badge>
              </Link>
            </div>

            {/* Raffle Display */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-8">
                <div className="text-center space-y-8">
                  {/* Current Spinning Display */}
                  {currentSpinning && !winner && (
                    <div className="transition-all duration-300 transform animate-pulse scale-110">
                      <Avatar className="w-32 h-32 mx-auto border-4 border-white/30">
                        <AvatarImage
                          src={
                            currentSpinning.profilePic ||
                            `/placeholder.svg?height=128&width=128&text=${currentSpinning.name.charAt(0) || "/placeholder.svg"}`
                          }
                          alt={currentSpinning.name}
                        />
                        <AvatarFallback className="text-2xl bg-linear-to-br from-purple-500 to-pink-500 text-white">
                          {currentSpinning.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="mt-4 space-y-2">
                        <h3 className="text-2xl font-bold text-white">{currentSpinning.name}</h3>
                        <p className="text-lg text-blue-200">@{currentSpinning.username}</p>
                      </div>
                    </div>
                  )}

                  {/* Winner Display */}
                  {winner && (
                    <div>
                      <div className="text-4xl font-bold text-yellow-400 animate-bounce mb-8">🎉 WINNER! 🎉</div>
                      <WinnerDisplay winner={winner} isAnimating={false} />
                      <p className="text-xl text-white mt-6">Congratulations to our lucky winner!</p>
                    </div>
                  )}

                  {/* Ready State */}
                  {!currentSpinning && !winner && (
                    <div className="text-center space-y-4">
                      <div className="w-32 h-32 mx-auto rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Trophy className="w-16 h-16 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Ready to Draw Winner!</h3>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-4">
                    {!winner && (
                      <Button
                        onClick={startRaffle}
                        disabled={isRaffling}
                        size="lg"
                        className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
                      >
                        {isRaffling ? (
                          <>
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Drawing Winner...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Start Raffle
                          </>
                        )}
                      </Button>
                    )}

                    {winner && (
                      <div className="space-x-4">
                        <Button
                          onClick={resetRaffle}
                          variant="outline"
                          size="lg"
                          className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                        >
                          Draw Another Winner
                        </Button>
                        <Button
                          onClick={() => {
                            setParticipants([])
                            resetRaffle()
                          }}
                          variant="outline"
                          size="lg"
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          New Raffle
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
