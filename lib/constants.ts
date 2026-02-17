export const EXAM_TYPES = [
  { value: 'jee', label: 'JEE (Main + Advanced)', description: 'Engineering entrance exam' },
  { value: 'neet', label: 'NEET', description: 'Medical entrance exam' },
  { value: 'upsc', label: 'UPSC CSE', description: 'Civil services examination' },
  { value: 'cat', label: 'CAT', description: 'Management entrance exam' },
  { value: 'gate', label: 'GATE', description: 'Graduate aptitude test' },
  { value: 'ssc', label: 'SSC CGL', description: 'Staff selection commission' },
  { value: 'banking', label: 'Banking (IBPS/SBI)', description: 'Banking sector exams' },
  { value: 'other', label: 'Other', description: 'Custom competitive exam' },
] as const

export type ExamType = (typeof EXAM_TYPES)[number]['value']

export const MISTAKE_TYPES = {
  conceptual: { label: 'Conceptual Error', description: 'Long time + incorrect answer' },
  calculation: { label: 'Calculation Error', description: 'Short time + incorrect answer' },
  guessing: { label: 'Guessing', description: 'Very short time + incorrect answer' },
  time_pressure: { label: 'Time Pressure', description: 'Accuracy drop in final phase' },
} as const

export function classifyMistake(timeSpent: number, isCorrect: boolean, avgTime: number): string | null {
  if (isCorrect) return null
  if (timeSpent > avgTime * 1.5) return 'conceptual'
  if (timeSpent < avgTime * 0.3) return 'guessing'
  if (timeSpent < avgTime * 0.7) return 'calculation'
  return 'conceptual'
}
