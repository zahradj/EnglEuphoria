/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'

interface StudentRow {
  name: string
  hub?: string
  sessions: number
  avgAccuracy: number   // 0-100
  passRate: number      // 0-100
  weakWords?: string[]
}

interface EngineStats {
  totalRuns: number
  avgAccuracy: number
  byType: Array<{ type: string; runs: number; avgAccuracy: number }>
  topStudents: Array<{ name: string; runs: number; avgAccuracy: number }>
}

interface Props {
  teacherName?: string
  weekLabel?: string
  totals?: {
    students: number
    sessions: number
    avgAccuracy: number
    avgPassRate: number
  }
  students?: StudentRow[]
  engines?: EngineStats
  dashboardUrl?: string
}

const ENGINE_LABEL: Record<string, string> = {
  story_engine: 'Story Quest',
  escape_room: 'Escape Room',
  detective_mystery: 'Detective Mystery',
  hidden_object: 'Hidden Object',
}

const Email = ({
  teacherName = 'Teacher',
  weekLabel = 'this week',
  totals = { students: 0, sessions: 0, avgAccuracy: 0, avgPassRate: 0 },
  students = [],
  engines,
  dashboardUrl = 'https://engleuphoria.com/dashboard/teacher',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Vocab Games weekly digest — {weekLabel}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Vocab Games — Weekly Digest</Heading>
        <Text style={p}>Hi {teacherName}, here is how your students played the Vocab Games {weekLabel}.</Text>

        <Section style={statsWrap}>
          <Text style={statLine}><b>{totals.students}</b> active students</Text>
          <Text style={statLine}><b>{totals.sessions}</b> game sessions</Text>
          <Text style={statLine}><b>{Math.round(totals.avgAccuracy)}%</b> average accuracy</Text>
          <Text style={statLine}><b>{Math.round(totals.avgPassRate)}%</b> quiz pass rate</Text>
        </Section>

        <Hr />

        <Heading as="h2" style={h2}>Students</Heading>
        {students.length === 0 ? (
          <Text style={p}>No student activity recorded this week.</Text>
        ) : (
          students.map((s) => (
            <Section key={s.name} style={row}>
              <Text style={rowName}>{s.name} {s.hub ? <span style={hub}>· {s.hub}</span> : null}</Text>
              <Text style={rowMeta}>
                {s.sessions} sessions · {Math.round(s.avgAccuracy)}% accuracy · {Math.round(s.passRate)}% pass
              </Text>
              {s.weakWords && s.weakWords.length > 0 && (
                <Text style={weak}>Needs review: {s.weakWords.slice(0, 6).join(', ')}</Text>
              )}
            </Section>
          ))
        )}

        {engines && engines.totalRuns > 0 && (
          <>
            <Hr />
            <Heading as="h2" style={h2}>Language Engines</Heading>
            <Section style={statsWrap}>
              <Text style={statLine}><b>{engines.totalRuns}</b> immersive quest runs</Text>
              <Text style={statLine}><b>{Math.round(engines.avgAccuracy)}%</b> average accuracy</Text>
            </Section>
            {engines.byType.length > 0 && (
              <Section style={row}>
                {engines.byType.map((e) => (
                  <Text key={e.type} style={rowMeta}>
                    {ENGINE_LABEL[e.type] ?? e.type} · {e.runs} runs · {Math.round(e.avgAccuracy)}% accuracy
                  </Text>
                ))}
              </Section>
            )}
            {engines.topStudents.length > 0 && (
              <>
                <Text style={p}><b>Top explorers</b></Text>
                {engines.topStudents.map((s) => (
                  <Text key={s.name} style={rowMeta}>
                    {s.name} — {s.runs} runs · {Math.round(s.avgAccuracy)}% accuracy
                  </Text>
                ))}
              </>
            )}
          </>
        )}

        <Hr />
        <Text style={p}>
          Open the <a href={dashboardUrl} style={link}>Vocab Games report</a> for per-student drill-downs.
        </Text>
        <Text style={footer}>— {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Vocab Games weekly digest — ${d?.weekLabel ?? 'this week'}`,
  displayName: 'Teacher · Vocab Games weekly digest',
  previewData: {
    teacherName: 'Sara',
    weekLabel: 'Nov 24 – Nov 30',
    totals: { students: 8, sessions: 42, avgAccuracy: 78, avgPassRate: 71 },
    students: [
      { name: 'Ali', hub: 'Playground', sessions: 6, avgAccuracy: 82, passRate: 80, weakWords: ['giraffe', 'window'] },
      { name: 'Mira', hub: 'Academy', sessions: 5, avgAccuracy: 74, passRate: 60, weakWords: ['achieve'] },
    ],
    engines: {
      totalRuns: 14,
      avgAccuracy: 76,
      byType: [
        { type: 'story_engine', runs: 6, avgAccuracy: 82 },
        { type: 'detective_mystery', runs: 5, avgAccuracy: 71 },
        { type: 'escape_room', runs: 3, avgAccuracy: 74 },
      ],
      topStudents: [
        { name: 'Ali', runs: 4, avgAccuracy: 85 },
        { name: 'Mira', runs: 3, avgAccuracy: 78 },
      ],
    } as EngineStats,
    dashboardUrl: 'https://engleuphoria.com/dashboard/teacher',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', color: '#0f172a' }
const container = { padding: '24px', maxWidth: '600px', margin: '0 auto' }
const h1 = { fontSize: '22px', margin: '0 0 8px' }
const h2 = { fontSize: '16px', margin: '16px 0 8px' }
const p = { fontSize: '14px', lineHeight: '22px', margin: '8px 0' }
const statsWrap = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '14px 16px', margin: '12px 0' }
const statLine = { fontSize: '14px', margin: '2px 0' }
const row = { padding: '10px 0', borderBottom: '1px solid #f1f5f9' }
const rowName = { fontSize: '14px', fontWeight: 600 as const, margin: 0 }
const rowMeta = { fontSize: '13px', color: '#475569', margin: '2px 0' }
const hub = { color: '#94a3b8', fontWeight: 400 as const }
const weak = { fontSize: '12px', color: '#b45309', margin: '2px 0' }
const link = { color: '#2563eb', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#94a3b8', marginTop: '16px' }
