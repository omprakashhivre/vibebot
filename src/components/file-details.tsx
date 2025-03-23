"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileIcon, Clock, HardDrive, FileType, X, UploadCloud } from "lucide-react"
import { Button } from "./ui/button"

interface FileDetailsProps {
  file: File
  onRemove?: () => void
  onUploadNew?: () => void
}

export function FileDetails({ file, onRemove, onUploadNew }: FileDetailsProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileTypeIcon = () => {
    if (file.type.includes("pdf")) {
      return <FileIcon className="h-5 w-5 text-red-500" />
    } else if (file.type.includes("audio")) {
      return <FileIcon className="h-5 w-5 text-blue-500" />
    } else if (file.type.includes("video")) {
      return <FileIcon className="h-5 w-5 text-green-500" />
    }
    return <FileIcon className="h-5 w-5" />
  }

  const getFileType = () => {
    if (file.type.includes("pdf")) {
      return "PDF Document"
    } else if (file.type.includes("audio")) {
      return "Audio File"
    } else if (file.type.includes("video")) {
      return "Video File"
    }
    return file.type || "Unknown"
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            {getFileTypeIcon()}
            File Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-1 truncate">{file.name}</h3>
            <Badge variant="outline">{getFileType()}</Badge>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Size:</span>
              <span className="ml-auto">{formatFileSize(file.size)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Modified:</span>
              <span className="ml-auto">{new Date(file.lastModified).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <FileType className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Type:</span>
              <span className="ml-auto">{file.type || "Unknown"}</span>
            </div>
          </div>

          <Separator />

          <div className="text-sm">
            <h4 className="font-medium mb-1">Actions</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Ask questions about the content</li>
              <li>• Request a summary</li>
              <li>• Extract key information</li>
              <li>• Analyze the document</li>
            </ul>
          </div>

          {(onRemove || onUploadNew) && (
            <>
              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium mb-1">Document Management</h4>
                <div className="flex flex-col gap-2">
                  {onRemove && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-destructive border-destructive hover:bg-destructive/10"
                      onClick={onRemove}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove Document
                    </Button>
                  )}

                  {onUploadNew && (
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={onUploadNew}>
                      <UploadCloud className="h-4 w-4 mr-2" />
                      Upload New Document
                    </Button>
                  )}
                </div>
              </div>
            </>)}
        </CardContent>
      </Card>
    </div>
  )
}

