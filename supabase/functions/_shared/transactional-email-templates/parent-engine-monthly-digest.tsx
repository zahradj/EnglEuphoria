/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  studentName?: string
  month?: string
  totalRuns?: number
  avgAccuracy?: number
  favoriteEngine?: string
}

const ENGINE_LABEL: Record<string, string> = {
  story: 'Story Adventures',
  escape_room: 'Escape Rooms',
  detective_mystery: 'Detective Mysteries',
  hidden_object: 'Hidden Object Hunts',
}

const Email = ({
  studentName = 'your child',
  month = '',
  totalRuns = 0,
  avgAccuracy = 0,
  favoriteEngine = 'story',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{studentName}'s Immersive Quests — monthly summary</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🧭 Immersive Quests Digest</Heading>
        <Text style={sub}>Monthly summary for {month}</Text>
        <Section style={card}>
          <Text style={label}>{studentName} completed</Text>
          <Text style={metric}>{totalRuns} quests</Text>
          <Text style={label}>Average accuracy</Text>
          <Text style={metric}>{avgAccuracy}%</Text>
          <Text style={label}>Favorite engine</Text>
          <Text style={metric}>{ENGINE_LABEL[favoriteEngine] || 'Story Adventures'}</Text>
        </Section>
        <Text style={p}>
          Language Engines let {studentName} practice English through story choices,
          escape puzzles, mysteries, and hidden-object scenes — every quest is bound to
          the vocabulary they're learning that week.
        </Text>
        <Text style={footer}>— The Engleuphoria team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `${d.studentName || 'Your child'}'s Immersive Quests — ${d.month || 'monthly'} digest`,
  displayName: 'Parent monthly engine digest',
  previewData: { studentName: 'Alex', month: '2026-06', totalRuns: 12, avgAccuracy: 82, favoriteEngine: 'story' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', color: '#1e293b' }
const container = { padding: '24px 28px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }
const sub = { color: '#64748b', margin: '0 0 20px', fontSize: '14px' }
const card = { background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '20px', margin: '0 0 20px' }
const label = { fontSize: '12px', color: '#7c3aed', textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '8px 0 2px' }
const metric = { fontSize: '20px', fontWeight: 700, margin: 0 }
const p = { fontSize: '14px', lineHeight: '22px', color: '#334155' }
const footer = { fontSize: '12px', color: '#94a3b8', marginTop: '28px' }
