"use client"

import { useState, useRef, useEffect } from "react"
import axiosInstance from "@/lib/axios-instance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileUploader } from "@/components/file-uploader"
import { PdfViewer } from "@/components/pdf-viewer"
import { MediaPlayer } from "@/components/media-player"
import { FileDetails } from "@/components/file-details"
import Cookies from "js-cookie"
import { v4 as uuidv4 } from 'uuid';
import { Send, Bot, User, ChevronDown, ChevronUp, PanelRight, PanelLeft, X, Maximize2, Minimize2, LogOut, Upload, FileText, UploadCloud } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import Spinner from "@/components/spinner"
import verifyToken from "@/lib/verify-token"


export default function ChatInterface() {

  const router = useRouter()
  useEffect(() => {
    const token = sessionStorage.getItem("access_token") || "";
    if (!token) {
      router.push("/");
    }
    verifyToken(token)
      .then((res) => {
        // console.log(res);
        
        if (!res || !res.username) {
          router.push("/");
        }
        return
      })
      .catch(() => {
        router.push("/");
      })
  }, []);
  const [file, setFile] = useState<File | null>(null)
  const [messages, setMessages] = useState([
    {
      id: uuidv4(),
      role: "assistant",
      content: "Hello! Upload a PDF, audio, or video file to get started.",
    }
  ])
  const [input, setInput] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [isChatFloating, setIsChatFloating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [transcriptId, setTranscriptId] = useState<string>("")
  const [summary, setSummary] = useState<string | null>(null)

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile)
    setTranscript(null)
    setSummary(null)
    processFile(uploadedFile)
  }

  const processFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      let apiUrl = ""
      if (file.type.includes("pdf")) {
        apiUrl = "/api/v1/process-pdf" // PDF API
      } else if (file.type.includes("audio") || file.type.includes("video")) {
        apiUrl = "/api/v1/transcribe"
      }

      setLoading(true)
      const response = await axiosInstance.post(apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
          Authorization: `Bearer ${Cookies.get("access_token")}`
        },
      })
      setLoading(false)

      const { transcript, summary, transcript_id } = response.data
      setTranscript(transcript)
      setSummary(summary)
      setTranscriptId(transcript_id)

      setMessages([
        ...messages,
        {
          id: uuidv4(),
          role: "assistant",
          content: `I see you've uploaded "${file.name}". What would you like to know about it?`,
        }
      ])
    } catch (error) {
      console.error("Error processing file:", error)
      setLoading(false)
      setMessages([
        ...messages,
        {
          id: uuidv4(),
          role: "assistant",
          content: "Sorry, there was an error processing the file. Please try again.",
        },
      ])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !file) return

    // Add user message to chat
    const newMessages = [
      ...messages,
      {
        id: uuidv4(),
        role: "user",
        content: input,
      },
    ]
    setMessages(newMessages)
    setInput("")

    // Add a temporary "thinking" message from assistant
    const thinkingMessageId = uuidv4();
    setMessages([
      ...newMessages,
      {
        id: thinkingMessageId,
        role: "assistant",
        content: "🤔 Thinking...",
      }
    ])

    try {
      // Prepare request payload
      const body = {
        transcript_id: transcriptId,
        question: input,
      }

      // Call the /api/v1/chat endpoint
      const response = await axiosInstance.post("/api/v1/chat",
        body, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${Cookies.get("access_token")}`
        }
      })

      if (!response.data) {
        throw new Error(`Error: ${response.statusText}`)
      }

      // Parse API response
      const data = response.data

      // Replace thinking message with actual response
      setMessages(prev =>
        prev.map(msg =>
          msg.id === thinkingMessageId
            ? { ...msg, content: data.answer || "No valid response received." }
            : msg
        )
      )
    } catch (error) {
      console.error("API Error:", error)
      // Replace thinking message with error message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === thinkingMessageId
            ? {
              ...msg,
              content: "⚠️ Sorry, something went wrong while processing your question. Please try again later."
            }
            : msg
        )
      )
    }

    inputRef.current?.focus()
  }

  const getFileType = () => {
    if (!file) return null
    if (file.type.includes("pdf")) return "pdf"
    if (file.type.includes("audio")) return "audio"
    if (file.type.includes("video")) return "video"
    return "unknown"
  }

  const fileType = getFileType()

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  const toggleChatPosition = () => {
    setIsChatFloating(!isChatFloating)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setTranscript(null)
    setSummary(null)
    setTranscriptId("")

    setMessages([
      ...messages,
      {
        id: uuidv4(),
        role: "assistant",
        content: "The file has been removed. You can upload a new document to continue.",
      },
    ])
  }

  const handleUploadNew = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,audio/*,video/*'
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files[0]) {
        handleFileUpload(target.files[0])
      }
    }
    input.click()
  }

  const fallUserName = Cookies.get("username") || "XX"

  const handleLogout = () => {
    Cookies.remove("username")
    Cookies.remove("access_token")
    sessionStorage.clear()
    router.push("/")
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      {/* Header */}
      <header className="border-b p-4 bg-background flex justify-between items-center z-10">
        <h1 className="text-xl font-bold md:text-2xl">Multi-Modal Chat Interface</h1>

        <div className="flex items-center gap-2">
          {file && (
            <div className="hidden sm:flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveFile}
                className="text-destructive border-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Remove File</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadNew}
              >
                <UploadCloud className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Upload New</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleChatPosition}
                className="hidden md:flex"
              >
                {isChatFloating ? <PanelLeft className="h-4 w-4 mr-2" /> : <PanelRight className="h-4 w-4 mr-2" />}
                <span className="hidden lg:inline">{isChatFloating ? "Dock Chat" : "Float Chat"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleChat}
              >
                {isChatOpen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
                <span className="hidden lg:inline">{isChatOpen ? "Minimize Chat" : "Open Chat"}</span>
              </Button>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer h-8 w-8">
                <AvatarFallback>{fallUserName.charAt(0)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => alert("Profile coming soon")} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>

              {file && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleRemoveFile} className="cursor-pointer text-destructive">
                    <X className="mr-2 h-4 w-4" />
                    <span>Remove File</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleUploadNew} className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Upload New File</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content Area */}
        <div className={`${isChatFloating || !file ? "w-full" : "flex-1"} flex flex-col overflow-hidden`}>
          {/* Transcript Button */}
          {transcript && (
            <div className="absolute top-2 left-4 z-10">
              <Button
                onClick={() => setShowTranscript(true)}
                variant="secondary"
                size="sm"
                className="shadow-md"
              >
                <FileText className="h-4 w-4 mr-2" />
                Show Transcript
              </Button>
            </div>
          )}

          {/* File Display Area */}
          {!file ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <FileUploader onFileUpload={handleFileUpload} />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden p-4">
              {fileType === "pdf" && <PdfViewer file={file} />}
              {(fileType === "audio" || fileType === "video") && (
                <MediaPlayer file={file} type={fileType} />
              )}
            </div>
          )}

          {/* Chat Interface (non-floating) */}
          {!isChatFloating && file && (
            <div
              className={`border-t transition-all max-h-[80%] duration-300 ease-in-out ${isChatOpen ? "h-[450px]" : "h-[40px]"
                } flex flex-col`}
            >
              <div className="p-2 border-b flex justify-between items-center bg-muted/30">
                <span className="font-medium">💬 Chat</span>
                <Button variant="ghost" size="sm" onClick={toggleChat} className="h-6 w-6 p-0">
                  {isChatOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
              </div>

              {isChatOpen && (
                <>
                  <ScrollArea className="flex-1 p-4 h-full overflow-y-auto">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : ""
                            }`}
                        >
                          {message.role === "assistant" && (
                            <Avatar className="h-8 w-8 bg-primary">
                              <Bot className="h-4 w-4 text-primary-foreground" />
                            </Avatar>
                          )}

                          <Card
                            className={`p-3 max-w-[80%] ${message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                              }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </Card>

                          {message.role === "user" && (
                            <Avatar className="h-8 w-8 bg-secondary">
                              <User className="h-4 w-4 text-secondary-foreground" />
                            </Avatar>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2 bg-background">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about the file..."
                      className="flex-1"
                      disabled={!file}
                    />
                    <Button type="submit" size="icon" disabled={!file}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>

        {/* File Details Sidebar */}
        {file && !isChatFloating && (
          <div className="w-[300px] border-l bg-muted/30 overflow-auto hidden md:block">
            <FileDetails
              file={file}
              onRemove={handleRemoveFile}
              onUploadNew={handleUploadNew}
            />
          </div>
        )}

        {/* Floating Chat Interface */}
        {isChatFloating && file && isChatOpen && (
          <div className="fixed bottom-4 right-4 w-[350px] h-[500px] bg-background border rounded-lg shadow-lg flex flex-col z-10">
            <div className="p-2 border-b flex justify-between items-center bg-muted/30">
              <span className="font-medium">💬 Chat</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={toggleChatPosition} className="h-6 w-6 p-0">
                  <PanelLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={toggleChat} className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 h-full overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : ""
                      }`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 bg-primary">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </Avatar>
                    )}

                    <Card
                      className={`p-3 max-w-[80%] ${message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </Card>

                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 bg-secondary">
                        <User className="h-4 w-4 text-secondary-foreground" />
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2 bg-background">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the file..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}

        {/* Floating Chat Button */}
        {isChatFloating && file && !isChatOpen && (
          <Button
            onClick={toggleChat}
            className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-lg"
          >
            <Bot className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Transcript Dialog */}
      <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>📜 Transcript & Summary</DialogTitle>
            <DialogDescription>
              View the transcription and summary of the uploaded file.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 mt-4 h-full overflow-auto">
            <div className="space-y-6 pr-4">
              <div>
                <h2 className="text-lg font-bold">📄 Transcript:</h2>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  {transcript || "No transcript available."}
                </p>
              </div>

              {summary && (
                <div>
                  <h2 className="text-lg font-bold">✨ Summary:</h2>
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                    {summary}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogClose asChild>
            <Button className="mt-4">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* Loading Spinner */}
      {loading && <Spinner message="Processing file" />}
    </div>
  )
}
