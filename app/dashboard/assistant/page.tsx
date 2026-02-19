'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, Sparkles, ChevronDown, Square, Brain, Zap, BookOpen, Target, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const suggestedQuestions = [
  { text: 'Why is my accuracy dropping?',       icon: '📉', tag: 'Analysis'  },
  { text: 'How should I prepare for my exam?',  icon: '📚', tag: 'Strategy'  },
  { text: 'What should I revise today?',         icon: '📝', tag: 'Planning'  },
  { text: 'Explain my last test performance',   icon: '🔍', tag: 'Review'    },
  { text: 'Which topics are most important?',   icon: '⭐', tag: 'Priority'  },
  { text: 'How can I improve time management?', icon: '⏱️', tag: 'Skills'    },
]

const quickStats = [
  { icon: Zap,      label: 'AI-Powered'    },
  { icon: BookOpen, label: 'Study-Focused' },
  { icon: Target,   label: 'Personalised'  },
  { icon: Clock,    label: 'Always Ready'  },
]

/* ─────────────────────────────────────────
   Background
───────────────────────────────────────── */
function SceneBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute -top-64 -left-64 w-[900px] h-[900px] rounded-full bg-primary/10 blur-[180px]" />
      <div className="absolute top-1/4 -right-64 w-[700px] h-[700px] rounded-full bg-accent/8 blur-[150px]" />
      <div className="absolute -bottom-64 left-1/4 w-[600px] h-[600px] rounded-full bg-chart-3/8 blur-[140px]" />

      <svg className="absolute inset-0 w-full h-full text-foreground" style={{ opacity: 0.05 }} aria-hidden="true">
        <defs>
          <pattern id="ch-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.4" cy="1.4" r="1.4" fill="currentColor" />
          </pattern>
          <pattern id="ch-hex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
            <polygon points="14,2 42,2 56,26 42,50 14,50 0,26" fill="none" stroke="currentColor" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ch-dots)" />
        <g opacity="0.5" transform="translate(54%,-4%) scale(1.1)"><rect width="580" height="460" fill="url(#ch-hex)" /></g>
        <circle cx="91%" cy="8%"  r="200" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.38" />
        <circle cx="91%" cy="8%"  r="140" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.22" strokeDasharray="5 5" />
        <circle cx="4%"  cy="88%" r="130" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
        <path d="M -60 840 Q 580 560 1480 800" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.14" strokeDasharray="7 5" />
        {([[18,25],[78,16],[60,50],[88,78],[10,58]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i} transform={`translate(${cx}%,${cy}%)`} opacity="0.38">
            <line x1="-6" y1="0" x2="6" y2="0" stroke="currentColor" strokeWidth="1" />
            <line x1="0" y1="-6" x2="0" y2="6" stroke="currentColor" strokeWidth="1" />
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ─────────────────────────────────────────
   Typing indicator
───────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-4 mb-6 px-2">
      <div className="flex items-center justify-center w-9 h-9 rounded-full shrink-0
        bg-white/60 dark:bg-white/8 border border-white/30 dark:border-white/10
        backdrop-blur-xl ring-2 ring-primary/20 shadow-md">
        <Brain className="h-4 w-4 text-primary" />
      </div>
      <div className="rounded-3xl rounded-bl-lg px-5 py-3.5
        bg-white/65 dark:bg-white/[0.05]
        border border-white/30 dark:border-white/10
        backdrop-blur-xl
        shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.7)]
        dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary/50 animate-bounce [animation-delay:0ms]" />
          <span className="w-2.5 h-2.5 rounded-full bg-primary/50 animate-bounce [animation-delay:140ms]" />
          <span className="w-2.5 h-2.5 rounded-full bg-primary/50 animate-bounce [animation-delay:280ms]" />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Message bubble
───────────────────────────────────────── */
function MessageBubble({ message }: {
  message: { id: string; role: string; parts: Array<{ type: string; text?: string }> }
}) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('flex items-end gap-4 mb-6 px-2 group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn(
        'flex items-center justify-center w-9 h-9 rounded-full shrink-0 mb-0.5',
        'transition-all duration-200 group-hover:scale-105',
        isUser
          ? 'bg-primary text-primary-foreground text-[10px] font-bold shadow-[0_4px_14px_-2px_rgba(99,102,241,0.5)]'
          : 'bg-white/65 dark:bg-white/8 border border-white/30 dark:border-white/10 backdrop-blur-xl ring-2 ring-primary/15 shadow-md'
      )}>
        {isUser ? 'You' : <Brain className="h-4 w-4 text-primary" />}
      </div>

      <div className={cn(
        'relative max-w-[80%] rounded-3xl px-5 py-4 text-sm leading-relaxed transition-all duration-200',
        isUser
          ? 'bg-primary text-primary-foreground rounded-br-lg shadow-[0_6px_24px_-4px_rgba(99,102,241,0.45)]'
          : [
              'rounded-bl-lg text-foreground',
              'bg-white/65 dark:bg-white/[0.05]',
              'border border-white/30 dark:border-white/10',
              'backdrop-blur-xl',
              'shadow-[0_6px_24px_-4px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.75)]',
              'dark:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]',
            ].join(' ')
      )}>
        {!isUser && (
          <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none" />
        )}
        {message.parts.map((part, i) => {
          if (part.type === 'text' && part.text) {
            const formatted = part.text
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/^- (.+)/gm, '<li class="ml-4 list-disc my-0.5">$1</li>')
              .replace(/^(\d+)\. (.+)/gm, '<li class="ml-4 list-decimal my-0.5">$2</li>')
            return (
              <div
                key={i}
                className={cn('whitespace-pre-wrap', !isUser && '[&_strong]:font-semibold [&_li]:leading-relaxed')}
                dangerouslySetInnerHTML={!isUser ? { __html: formatted } : undefined}
              >
                {isUser ? part.text : undefined}
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════ */
export default function AssistantPage() {
  const [input, setInput] = useState('')
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const scrollRef   = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef   = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'
  const isEmpty   = messages.length === 0

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 140
    if (near || isLoading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 220)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [input])

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  return (
    <>
      <SceneBackground />

      {/*
        KEY FIX: Remove `absolute inset-0` — that was stretching over the sidebar.
        Instead use `h-full flex flex-col` so this page fills only the content
        area the dashboard layout assigns to it (next to the sidebar, not over it).
        The parent layout must have `h-screen overflow-hidden` on the content area.
      */}
      <div className="h-full flex flex-col gap-3 min-h-0">

        {/* ══ HEADER ══ */}
        <div className={[
          'relative flex items-center gap-4 px-6 py-4 shrink-0 rounded-2xl overflow-hidden',
          'border border-white/25 dark:border-white/8',
          'bg-white/65 dark:bg-white/[0.04]',
          'backdrop-blur-xl',
          'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.75)]',
          'dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]',
        ].join(' ')}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/12 ring-2 ring-primary/20 shrink-0">
            <Brain className="h-6 w-6 text-primary" />
            <Sparkles className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-chart-3" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground leading-none">AI Study Assistant</h1>
            <p className="text-xs text-muted-foreground mt-1">Powered by your performance data · Ask anything</p>
          </div>

          <div className="hidden xl:flex items-center gap-2">
            {quickStats.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/8">
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-500',
              isLoading
                ? 'bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
            )}>
              <span className={cn('w-1.5 h-1.5 rounded-full', isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400')} />
              {isLoading ? 'Thinking…' : 'Ready'}
            </div>
          </div>
        </div>

        {/* ══ BODY: messages + input (takes remaining height) ══ */}
        <div className={[
          'relative flex-1 flex flex-col min-h-0 overflow-hidden rounded-2xl',
          'border border-white/25 dark:border-white/8',
          'bg-white/50 dark:bg-white/[0.02]',
          'backdrop-blur-xl',
          'shadow-[0_4px_32px_-4px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.75)]',
          'dark:shadow-[0_4px_32px_-4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)]',
        ].join(' ')}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/15 to-transparent pointer-events-none z-10" />

          {/* ── Scrollable messages ── */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto py-6 min-h-0
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-primary/15
              [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {isEmpty ? (

              /* ── EMPTY / WELCOME STATE ── */
              <div className="flex flex-col items-center justify-center h-full gap-8 px-6 py-8">
                <div className="flex flex-col items-center gap-4 text-center max-w-lg">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl scale-110" />
                    <div className={[
                      'relative flex items-center justify-center w-24 h-24 rounded-3xl',
                      'bg-white/70 dark:bg-white/[0.06]',
                      'border border-white/40 dark:border-white/12',
                      'backdrop-blur-xl ring-2 ring-primary/20',
                      'shadow-[0_8px_40px_-4px_rgba(99,102,241,0.25)]',
                    ].join(' ')}>
                      <Brain className="h-11 w-11 text-primary" />
                      <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-chart-3" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">How can I help you study?</h2>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      Ask me anything about your performance, weak areas, or study strategy.
                      I'm powered by your actual test data.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage({ text: q.text })}
                      className={[
                        'group flex flex-col gap-3 text-left px-4 py-4 rounded-2xl',
                        'border border-white/30 dark:border-white/8',
                        'bg-white/55 dark:bg-white/[0.03]',
                        'backdrop-blur-xl',
                        'shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)]',
                        'dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)]',
                        'hover:border-primary/35 hover:bg-white/75 dark:hover:bg-primary/8',
                        'hover:shadow-[0_6px_24px_-4px_rgba(99,102,241,0.18)]',
                        'transition-all duration-200',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{q.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg
                          bg-primary/8 dark:bg-primary/10 text-primary/70 border border-primary/15">
                          {q.tag}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground/75 group-hover:text-foreground transition-colors leading-snug">
                        {q.text}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground/50 text-center">
                  Click a suggestion or type your own question below
                </p>
              </div>

            ) : (

              /* ── MESSAGES ── */
              <div className="pb-2">
                <div className="flex items-center gap-3 px-6 mb-6">
                  <div className="flex-1 h-px bg-border/40" />
                  <span className="text-[11px] text-muted-foreground/50 font-medium px-3 py-1 rounded-full
                    bg-white/40 dark:bg-white/5 border border-white/25 dark:border-white/8">
                    Today
                  </span>
                  <div className="flex-1 h-px bg-border/40" />
                </div>

                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && <TypingIndicator />}
                <div ref={bottomRef} className="h-1" />
              </div>
            )}
          </div>

          {/* Scroll to bottom */}
          {showScrollBtn && (
            <button
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className={[
                'absolute bottom-24 right-5 w-9 h-9 rounded-full z-20',
                'flex items-center justify-center',
                'bg-white/80 dark:bg-white/10 border border-white/40 dark:border-white/15',
                'backdrop-blur-xl shadow-[0_4px_16px_-2px_rgba(0,0,0,0.15)]',
                'text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary/40',
                'transition-all duration-200 animate-in fade-in slide-in-from-bottom-2',
              ].join(' ')}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent mx-4 shrink-0" />

          {/* ── Input ── */}
          <div className="shrink-0 px-4 py-4">
            <div className={[
              'relative flex items-end gap-3 rounded-2xl px-5 py-4',
              'border border-white/30 dark:border-white/10',
              'bg-white/70 dark:bg-white/[0.04]',
              'backdrop-blur-xl',
              'shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]',
              'dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]',
              'focus-within:border-primary/40 focus-within:shadow-[0_4px_24px_-4px_rgba(99,102,241,0.2),inset_0_1px_0_rgba(255,255,255,0.8)]',
              'transition-all duration-200',
            ].join(' ')}>
              <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/90 dark:via-white/20 to-transparent pointer-events-none" />

              <textarea
                ref={textareaRef}
                className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-h-[26px] max-h-[160px] leading-relaxed"
                value={input}
                placeholder="Ask about your performance, study tips, exam strategy…"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
              />

              <div className="flex items-center gap-2 shrink-0">
                {isLoading ? (
                  <button
                    type="button"
                    onClick={() => stop()}
                    className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-medium
                      border border-destructive/30 text-destructive bg-destructive/8 hover:bg-destructive/15
                      transition-all duration-200"
                  >
                    <Square className="h-3 w-3 fill-current" />
                    Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={!input.trim()}
                    className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-xs font-semibold
                      bg-primary text-primary-foreground
                      shadow-[0_2px_14px_-2px_rgba(99,102,241,0.5)]
                      hover:opacity-90 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed
                      transition-all duration-200"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send
                  </button>
                )}
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground/50 text-center mt-2.5 select-none">
              <kbd className="px-1.5 py-0.5 rounded-md bg-white/60 dark:bg-white/8 border border-white/40 dark:border-white/10 text-[10px] font-mono">Enter</kbd>
              {' '}to send ·{' '}
              <kbd className="px-1.5 py-0.5 rounded-md bg-white/60 dark:bg-white/8 border border-white/40 dark:border-white/10 text-[10px] font-mono">Shift+Enter</kbd>
              {' '}for new line
            </p>
          </div>
        </div>

      </div>
    </>
  )
}
