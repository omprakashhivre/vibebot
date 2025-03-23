"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX } from "lucide-react"

interface MediaPlayerProps {
  file: File
  type: "audio" | "video" | null
}

export function MediaPlayer({ file, type }: MediaPlayerProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null)

  useEffect(() => {
    if (file) {
      const fileUrl = URL.createObjectURL(file)
      setUrl(fileUrl)

      return () => {
        URL.revokeObjectURL(fileUrl)
      }
    }
  }, [file])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const handlePlayPause = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause()
      } else {
        mediaRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    if (mediaRef.current) {
      const newTime = value[0]
      mediaRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)

    if (mediaRef.current) {
      mediaRef.current.volume = newVolume
    }

    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  const handleMuteToggle = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleSkipBackward = () => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = Math.max(0, currentTime - 10)
    }
  }

  const handleSkipForward = () => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = Math.min(duration, currentTime + 10)
    }
  }

  const VolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="h-4 w-4" />
    } else if (volume < 0.5) {
      return <Volume1 className="h-4 w-4" />
    } else {
      return <Volume2 className="h-4 w-4" />
    }
  }

  if (!url) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium">Unable to load media</h3>
          <p className="text-sm text-muted-foreground">There was an issue loading the media file.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 flex flex-col items-center">
      <Card className="w-full max-w-3xl p-4 bg-background">
        {type === "video" ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={url}
            className="w-full rounded-lg mb-4 aspect-video bg-black max-h-[calc(100vh-250px)]"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />
        ) : (
          <div className="flex items-center justify-center h-[200px] bg-muted rounded-lg mb-4">
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={url}
              className="hidden"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Play className={`h-12 w-12 ${isPlaying ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <h3 className="text-lg font-medium">{file.name}</h3>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-10">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-10">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleMuteToggle}>
                <VolumeIcon />
              </Button>
              <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleSkipBackward}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button variant="default" size="icon" className="h-10 w-10 rounded-full" onClick={handlePlayPause}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSkipForward}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-[88px]" /> {/* Spacer to balance the layout */}
          </div>
        </div>
      </Card>
    </div>
  )
}

