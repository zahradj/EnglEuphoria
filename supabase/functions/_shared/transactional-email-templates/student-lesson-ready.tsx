/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'

interface StudentLessonReadyProps {
  studentName?: string
  lessonTitle?: string
  studentLevel?: string
}

const HUB_CONFIG: Record<string, { emoji: string; label: string; cta: string }> = {
  playground: { emoji: '🌟', label: 'Playground', cta: 'Start My Adventure! 🚀' },
  academy: { emoji: '🔥', label: 'Academy', cta: 'Start My Challenge ⚡' },
  success: { emoji: '📊', label: 'Success Hub', cta: 'View My Briefing →' },
}

const StudentLessonReadyEmail = ({ studentName, lessonTitle, studentLevel }: StudentLessonReadyProps) => {
  const firstName = studentName?.split(' ')[0] || 'Student'
  const normalized = studentLevel === 'professional' ? 'success' : studentLevel
  const levelConfig = (normalized && HUB_CONFIG[normalized])
    || { emoji: '✨', label: 'Your Lesson', cta: 'Open My Lesson →' }

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{levelConfig.emoji} Your lesson is ready — {lessonTitle || 'New lesson'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logoText}>{SITE_NAME}</Heading>
            <Text style={headerSub}>{levelConfig.label}</Text>
          </Section>
          <Section style={contentSection}>
            <Heading style={h1}>Hi {firstName}! {levelConfig.emoji}</Heading>
            <Text style={text}>Your personalized lesson is ready and waiting for you.</Text>
            <Section style={cardSection}>
              <Text style={cardLabel}>TODAY'S LESSON</Text>
              <Text style={cardTitle}>{lessonTitle || 'Your Daily Lesson'}</Text>
              <Text style={cardMuted}>✨ AI-generated just for you</Text>
            </Section>
            <Text style={text}>Your lesson includes:</Text>
            <Text style={listItem}>📚 <strong>Vocabulary Spotlight</strong> — 5 words with pronunciation</Text>
            <Text style={listItem}>🎯 <strong>Quick Quiz</strong> — Test your understanding</Text>
            <Text style={listItem}>🤖 <strong>AI Tutor</strong> — Practice with your personal coach</Text>
            <Section style={ctaSection}>
              <Button style={button} href="https://engleuphoria.lovable.app/student-dashboard">
                {levelConfig.cta}
              </Button>
            </Section>
            <Text style={muted}>⏰ Lessons refresh every morning. Don't miss today's!</Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>{SITE_NAME} — Your English Learning Journey</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: StudentLessonReadyEmail,
  subject: (data: Record<string, any>) => {
    const lvl = data.studentLevel === 'professional' ? 'success' : data.studentLevel
    const emoji = lvl === 'playground' ? '🌟' : lvl === 'success' ? '📊' : lvl === 'academy' ? '🔥' : '✨'
    return `${emoji} Your lesson is ready — ${data.lessonTitle || 'New Lesson'}`
  },
  displayName: 'Student lesson ready',
  previewData: { studentName: 'Alex Johnson', lessonTitle: 'Present Perfect Tense', studentLevel: 'academy' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#9b6dba', padding: '32px 24px', textAlign: 'center' as const }
const logoText = { color: '#ffffff', fontSize: '28px', fontWeight: '700' as const, margin: '0' }
const headerSub = { color: 'rgba(255,255,255,0.85)', fontSize: '14px', margin: '4px 0 0' }
const contentSection = { padding: '32px 24px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#111827', margin: '0 0 12px' }
const text = { fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }
const cardSection = { backgroundColor: '#f5f0fa', border: '1px solid #e9d5ff', padding: '20px', borderRadius: '12px', margin: '0 0 24px' }
const cardLabel = { fontSize: '11px', fontWeight: '700' as const, letterSpacing: '1px', color: '#9b6dba', margin: '0 0 4px' }
const cardTitle = { fontSize: '18px', fontWeight: '700' as const, color: '#111827', margin: '0 0 8px' }
const cardMuted = { fontSize: '13px', color: '#6b7280', margin: '0' }
const listItem = { fontSize: '14px', color: '#4b5563', margin: '0 0 8px', lineHeight: '1.5' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#9b6dba', color: '#ffffff', padding: '16px 40px', borderRadius: '12px', fontWeight: '700' as const, fontSize: '16px', textDecoration: 'none' }
const muted = { fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' as const, margin: '0' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#9ca3af', textAlign: 'center' as const, margin: '0' }
