'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send, Loader2, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const suggestedQuestions = [
  'Why is my accuracy dropping?',
  'How should I prepare for my exam?',
  'What should I revise today?',
  'Explain my last test performance',
  'Which topics are most important?',
  'How can I improve my time management?',
]

export default function AssistantPage() {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  function handleSuggestion(question: string) {
    if (isLoading) return
    sendMessage({ text: question })
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex-none pb-4 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          AI Study Assistant
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Ask questions about your performance, get exam-specific guidance, and study tips.
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col min-h-0 mt-4">
        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-2 pb-4 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-12">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center max-w-md">
                <h3 className="text-lg font-semibold text-foreground">How can I help you today?</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  I can analyze your performance, suggest study strategies, and answer exam-related questions.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl px-4">
                {suggestedQuestions.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="text-sm text-left justify-start h-auto py-3 px-4 whitespace-normal"
                    onClick={() => handleSuggestion(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto w-full">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-start justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
                      <Bot className="h-4 w-4 text-primary mt-2" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground border border-border'
                    )}
                  >
                    {message.parts.map((part, index) => {
                      if (part.type === 'text') {
                        return (
                          <div key={index} className="whitespace-pre-wrap break-words">
                            {part.text}
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                  {message.role === 'user' && (
                    <div className="flex items-start justify-center w-8 h-8 rounded-full bg-primary shrink-0">
                      <User className="h-4 w-4 text-primary-foreground mt-2" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3">
                  <div className="flex items-start justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
                    <Bot className="h-4 w-4 text-primary mt-2" />
                  </div>
                  <div className="bg-muted border border-border rounded-lg px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-none border-t border-border pt-4 bg-background">
          <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-4xl mx-auto">
            <div className="flex-1">
              <textarea
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none min-h-[52px] max-h-32"
                value={input}
                rows={1}
                placeholder="Ask about your performance, study tips, or exam strategy..."
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" size="icon" className="h-[52px] w-[52px]" disabled={!input.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3 text-center max-w-4xl mx-auto">
            AI-assisted guidance based on your performance data. Press Enter to send, Shift+Enter for new line.
          </p>
        </div>
      </div>
    </div>
  )
}