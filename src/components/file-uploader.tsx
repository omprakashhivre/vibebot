"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UploadIcon, FileAudio, FileVideo, FileIcon as FilePdf } from "lucide-react"

interface FileUploaderProps {
  onFileUpload: (file: File) => void
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0])
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <Card
      className={`w-full max-w-md p-8 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors ${
        dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/20"
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input ref={inputRef} type="file" className="hidden" accept=".pdf,audio/*,video/*" onChange={handleChange} />

      <div className="flex gap-4 mb-4">
        <FilePdf className="h-10 w-10 text-red-500" />
        <FileAudio className="h-10 w-10 text-blue-500" />
        <FileVideo className="h-10 w-10 text-green-500" />
      </div>

      <UploadIcon className="h-10 w-10 mb-4 text-muted-foreground" />

      <h3 className="text-lg font-medium mb-2">Upload your file</h3>
      <p className="text-sm text-muted-foreground text-center mb-4">
        Drag and drop or click to upload a PDF, audio, or video file
      </p>

      <Button type="button">Select File</Button>
    </Card>
  )
}

