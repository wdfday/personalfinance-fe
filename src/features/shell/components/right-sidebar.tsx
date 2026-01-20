"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Send, Bot, User, GripVertical, Brain, Wrench, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { chatService } from "@/services/api"
import type { ChatUIMessage } from "@/types/chat"

interface RightSidebarProps {
  isOpen: boolean
  onToggle: () => void
  onWidthChange?: (width: number) => void
}

interface ThinkingStep {
  id: string
  type: 'thinking' | 'tool_call' | 'tool_result'
  content: string
  tool?: string
  status?: string
}

const MIN_WIDTH = 400
const MAX_WIDTH = 1200
const DEFAULT_WIDTH = 640

export function RightSidebar({ isOpen, onToggle, onWidthChange }: RightSidebarProps) {
  const [messages, setMessages] = useState<ChatUIMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Xin chào! Tôi là **AI Financial Advisor** 🤖\n\nTôi có thể giúp bạn về ngân sách, trả nợ, mục tiêu tài chính, đầu tư và quỹ khẩn cấp.\n\nHãy hỏi tôi bất cứ điều gì!",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([])
  const [showThinking, setShowThinking] = useState(true)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Detect desktop/mobile
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, thinkingSteps])

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = window.innerWidth - e.clientX
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setWidth(newWidth)
        onWidthChange?.(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    if (isResizing) {
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, onWidthChange])

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isStreaming) return

    const userMessage: ChatUIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsStreaming(true)
    setThinkingSteps([])

    // Create placeholder for assistant message
    const assistantMsgId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
      isThinking: true,
    }])

    try {
      const stream = chatService.sendMessageStream({
        message: inputValue,
        conversation_id: conversationId || undefined,
      })

      let fullContent = ""

      for await (const event of stream) {
        switch (event.type) {
          case 'start':
            if (event.data.conversation_id) {
              setConversationId(event.data.conversation_id)
            }
            break

          case 'thinking':
            setThinkingSteps(prev => [...prev, {
              id: crypto.randomUUID(),
              type: 'thinking',
              content: event.data.thinking || '',
            }])
            break

          case 'tool_call':
            setThinkingSteps(prev => [...prev, {
              id: crypto.randomUUID(),
              type: 'tool_call',
              content: event.data.content || `Calling ${event.data.tool}...`,
              tool: event.data.tool,
              status: event.data.status,
            }])
            break

          case 'tool_result':
            setThinkingSteps(prev => [...prev, {
              id: crypto.randomUUID(),
              type: 'tool_result',
              content: event.data.content || `${event.data.tool} completed`,
              tool: event.data.tool,
              status: event.data.status,
            }])
            // Clear thinking state when we start getting response
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMsgId 
                ? { ...msg, isThinking: false }
                : msg
            ))
            break

          case 'delta':
            fullContent += event.data.content || ''
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMsgId 
                ? { ...msg, content: fullContent, isThinking: false }
                : msg
            ))
            break

          case 'end':
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMsgId 
                ? { ...msg, isStreaming: false, isThinking: false }
                : msg
            ))
            break

          case 'error':
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMsgId 
                ? { ...msg, error: event.data.error?.message, isStreaming: false, isThinking: false }
                : msg
            ))
            break
        }
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId 
          ? { ...msg, error: String(error), isStreaming: false, isThinking: false }
          : msg
      ))
    } finally {
      setIsStreaming(false)
    }
  }, [inputValue, isStreaming, conversationId])

  // Render markdown-like content
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold text
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Bullet points
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <div key={i} className="ml-2" dangerouslySetInnerHTML={{ __html: line }} />
      }
      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        return <div key={i} className="ml-2" dangerouslySetInnerHTML={{ __html: line }} />
      }
      // Headers with emoji
      if (line.includes('**') || line.match(/^[📊💳🎯💰🛡️⚠️💡🔥⛄📈📍✅❌⏰🔗📏🤖]/)) {
        return <div key={i} className="font-medium" dangerouslySetInnerHTML={{ __html: line }} />
      }
      return <div key={i} dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
    })
  }

  return (
    <>
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-50 h-12 w-6 rounded-l-lg rounded-r-none border border-r-0 bg-background shadow-md hover:bg-accent transition-all duration-300"
        )}
        style={{ right: isDesktop ? (isOpen ? `${width}px` : '0') : '0' }}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {/* Sidebar panel */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed right-0 top-16 bottom-0 z-30 border-l border-t bg-background ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
          isResizing ? "transition-none" : "transition-transform duration-300"
        )}
        style={{ width: isDesktop ? `${width}px` : '100%' }}
      >
        {/* Resize handle */}
        {isOpen && (
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 group hidden lg:block"
            onMouseDown={() => setIsResizing(true)}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        )}

        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">AI Financial Advisor</h2>
                  <p className="text-xs text-muted-foreground">Powered by DSS</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowThinking(!showThinking)}
                className={cn("text-xs", showThinking && "bg-accent")}
              >
                <Brain className="h-3 w-3 mr-1" />
                Thinking
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={cn("flex gap-3", message.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={cn(
                      message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "rounded-lg px-3 py-2 max-w-[85%]",
                    message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
                  )}>
                    {/* Thinking indicator */}
                    {message.isThinking && showThinking && thinkingSteps.length > 0 && (
                      <div className="mb-3 space-y-2 border-b border-border/50 pb-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Brain className="h-3 w-3 animate-pulse" />
                          <span>Thinking...</span>
                        </div>
                        {thinkingSteps.map((step) => (
                          <div key={step.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                            {step.type === 'thinking' && (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin mt-0.5 shrink-0" />
                                <span>{step.content}</span>
                              </>
                            )}
                            {step.type === 'tool_call' && (
                              <>
                                <Wrench className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                                <span className="text-blue-600">{step.content}</span>
                              </>
                            )}
                            {step.type === 'tool_result' && (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                                <span className="text-green-600">{step.content}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message content */}
                    <div className="text-sm space-y-1">
                      {message.content ? renderContent(message.content) : (
                        message.isStreaming && !message.isThinking && (
                          <span className="inline-block w-2 h-4 bg-current animate-pulse" />
                        )
                      )}
                    </div>

                    {/* Error */}
                    {message.error && (
                      <p className="text-xs text-red-500 mt-2">Error: {message.error}</p>
                    )}

                    {/* Timestamp */}
                    <p className={cn(
                      "text-xs mt-2",
                      message.role === "assistant" ? "text-muted-foreground" : "text-primary-foreground/70"
                    )}>
                      {message.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Hỏi về tài chính..."
                className="flex-1"
                disabled={isStreaming}
              />
              <Button type="submit" size="icon" disabled={isStreaming || !inputValue.trim()}>
                {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-2">
              AI Financial Advisor • DSS Integration
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  )
}
