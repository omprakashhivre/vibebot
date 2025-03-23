"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText } from "lucide-react"

interface PdfViewerProps {
  file: File
}

export function PdfViewer({ file }: PdfViewerProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (file) {
      const fileUrl = URL.createObjectURL(file)
      setUrl(fileUrl)
      setLoading(false)

      return () => {
        URL.revokeObjectURL(fileUrl)
      }
    }
  }, [file])

  if (loading) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <Skeleton className="h-[600px] w-full max-w-3xl" />
      </div>
    )
  }

  if (!url) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <Card className="p-8 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium">Unable to display PDF</h3>
          <p className="text-sm text-muted-foreground">There was an issue loading the PDF file.</p>
        </Card>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 p-6">
      <div className="flex justify-center">
        <iframe src={url} className="w-full h-[calc(100vh-150px)] border rounded-lg" title="PDF Viewer" />
      </div>
    </ScrollArea>
  )
}

