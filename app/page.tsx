import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  BookOpen, BarChart3, Brain, Target, TrendingUp, MessageSquare,
  GraduationCap, ArrowRight, Zap, Shield,
} from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Detailed subject-wise and topic-level analysis of your mock test results with interactive charts.',
  },
  {
    icon: Brain,
    title: 'AI Recommendations',
    description: 'Grok-powered study recommendations personalized to your weak areas and target exam.',
  },
  {
    icon: Target,
    title: 'Weak Topic Detection',
    description: 'Automatically identifies topics where you struggle with mastery scores and improvement tracking.',
  },
  {
    icon: MessageSquare,
    title: 'AI Study Assistant',
    description: 'Context-aware chatbot that understands your performance and provides personalized guidance.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Visualize improvement trends, readiness scores, and score progression over time.',
  },
  {
    icon: GraduationCap,
    title: 'Exam-Specific Insights',
    description: 'AI-generated exam overviews, high-weightage topics, and preparation strategies.',
  },
]

const exams = ['JEE', 'NEET', 'UPSC', 'CAT', 'GATE', 'SSC', 'Banking']

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Score Sense</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-secondary-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            AI-Powered Exam Preparation Platform
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
            Prepare Smarter, Not Harder
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl text-pretty leading-relaxed">
            Upload your mock test results and let AI analyze your performance, identify weak spots,
            and guide your preparation with personalized strategies for competitive exams.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="gap-2 px-8">
                Start for Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Shield className="h-4 w-4" />
            Supports {exams.join(', ')} and more
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground text-balance">Everything You Need to Ace Your Exam</h2>
          <p className="text-muted-foreground mt-2 text-pretty">
            Structured analytics combined with AI-powered intelligence for your exam preparation.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-card-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-secondary/30 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground text-balance">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload Your Tests', desc: 'Import mock test results via CSV or enter them manually.' },
              { step: '02', title: 'Get AI Analysis', desc: 'Our AI analyzes performance, detects weak areas, and classifies mistakes.' },
              { step: '03', title: 'Follow the Plan', desc: 'Receive personalized recommendations and track your progress.' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-foreground text-balance">Ready to Transform Your Preparation?</h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-pretty">
          Join students who are preparing smarter with AI-powered analytics and personalized study strategies.
        </p>
        <Link href="/signup">
          <Button size="lg" className="mt-6 gap-2 px-8">
            Get Started Now <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-primary">
              <BookOpen className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-card-foreground">Score Sense</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with structured analytics + Grok-powered AI for competitive exam preparation.
          </p>
        </div>
      </footer>
    </div>
  )
}
