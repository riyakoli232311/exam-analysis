'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Settings, Loader2, Check } from 'lucide-react'
import { EXAM_TYPES } from '@/lib/constants'
import { useTheme } from 'next-themes'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function SettingsPage() {
  const { data: userData, mutate } = useSWR('/api/auth/me', fetcher)
  const { theme, setTheme } = useTheme()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [selectedExam, setSelectedExam] = useState('')

  const user = userData?.user || {}

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName || undefined,
          selectedExam: selectedExam || undefined,
        }),
      })
      mutate()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Settings
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-foreground">Profile Settings</CardTitle>
          <CardDescription>Update your name and target exam</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              placeholder={user.display_name || 'Your name'}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Target Exam</Label>
            <Select value={selectedExam || user.selected_exam || ''} onValueChange={setSelectedExam}>
              <SelectTrigger>
                <SelectValue placeholder="Select exam" />
              </SelectTrigger>
              <SelectContent>
                {EXAM_TYPES.map((exam) => (
                  <SelectItem key={exam.value} value={exam.value}>{exam.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={saving} className="self-start gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
            {saved ? 'Saved' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-foreground">Appearance</CardTitle>
          <CardDescription>Toggle between light and dark mode</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Use dark theme across the application</p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
