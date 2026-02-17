import { streamText, convertToModelMessages, UIMessage } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export const maxDuration = 30

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  const sql = getDb()
  const [profile] = await sql`
    SELECT up.*, u.name, u.email 
    FROM user_profiles up
    JOIN users u ON u.id = up.user_id
    WHERE up.id = ${session.userId}
  `

  const tests = await sql`
    SELECT test_name, accuracy, total_score, max_score, created_at 
    FROM mock_tests WHERE user_id = ${session.userId} 
    ORDER BY created_at DESC LIMIT 5
  `

  const weakTopics = await sql`
    SELECT tq.topic, tq.subject, 
      COUNT(*) as total, 
      SUM(CASE WHEN tq.is_correct THEN 1 ELSE 0 END) as correct
    FROM test_questions tq
    JOIN mock_tests mt ON mt.id = tq.test_id
    WHERE mt.user_id = ${session.userId}
    GROUP BY tq.topic, tq.subject
    HAVING (SUM(CASE WHEN tq.is_correct THEN 1 ELSE 0 END)::float / COUNT(*)) < 0.5
    ORDER BY (SUM(CASE WHEN tq.is_correct THEN 1 ELSE 0 END)::float / COUNT(*)) ASC
    LIMIT 10
  `

  const systemPrompt = `You are an exam preparation assistant for the ${profile?.selected_exam?.toUpperCase() || 'competitive exam'} platform. 
You help students understand their performance, improve their scores, and prepare effectively.

Student Profile:
- Name: ${profile?.display_name || 'Student'}
- Target Exam: ${profile?.selected_exam?.toUpperCase() || 'Not selected'}

Recent Test Performance:
${tests.length > 0 
  ? tests.map((t: { test_name: string; accuracy: number; total_score: number; max_score: number }) => 
    `- ${t.test_name}: Score ${t.total_score}/${t.max_score}, Accuracy ${Number(t.accuracy).toFixed(1)}%`
  ).join('\n')
  : 'No tests taken yet.'}

Weak Topics:
${weakTopics.length > 0 
  ? weakTopics.map((t: { topic: string; subject: string; correct: number; total: number }) => 
    `- ${t.subject} > ${t.topic}: ${t.correct}/${t.total} correct`
  ).join('\n')
  : 'No data yet.'}

Guidelines:
- Provide clear, actionable advice
- Be encouraging but realistic
- Reference their actual performance data
- Suggest specific study strategies
- Keep responses focused and structured with bullet points
- Label all insights as "AI-assisted guidance based on available performance data"`

  const result = streamText({
    model: groq('llama-3.1-8b-instant'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse()
}