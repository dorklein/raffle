import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2 } from "lucide-react"
import { CacheInfo } from "./cache-info"

export function AudioInstructions() {
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Optional: Add Sound Effects
        </CardTitle>
      </CardHeader>
      <CardContent className="text-white/80 space-y-2">
        <p>
          To enable sound effects, add these audio files to your{" "}
          <code className="bg-white/20 px-1 rounded">public</code> folder:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <code className="bg-white/20 px-1 rounded">spinning.mp3</code> - Spinning/roulette sound (3-4 seconds,
            loopable)
          </li>
          <li>
            <code className="bg-white/20 px-1 rounded">winner.mp3</code> - Victory fanfare sound
          </li>
          <li>
            <code className="bg-white/20 px-1 rounded">drumroll.mp3</code> - Tension building drumroll (1-2 seconds)
          </li>
        </ul>
        <p className="text-xs text-white/60">
          The app works perfectly without sound files - they&apos;re completely optional!
        </p>
      </CardContent>
      <CacheInfo />
    </Card>
  )
}
