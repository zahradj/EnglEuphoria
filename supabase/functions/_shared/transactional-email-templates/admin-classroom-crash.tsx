/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'
const ADMIN_EMAIL = 'f.zahra.Djaanine@engleuphoria.com'

interface CrashScene {
  key: string
  count: number
  users: number
  lastSeen?: string
  sample?: string
}

interface AdminClassroomCrashProps {
  scenes?: CrashScene[]
  windowMinutes?: number
}

const AdminClassroomCrashEmail = ({ scenes = [], windowMinutes = 60 }: AdminClassroomCrashProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{scenes.length} classroom activity(ies) keep crashing</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>{SITE_NAME} Admin</Heading>
        </Section>
        <Section style={contentSection}>
          <Heading style={h1}>A classroom activity keeps crashing</Heading>
          <Text style={intro}>
            In the last {windowMinutes} minutes these activities crashed 3 or more times during live lessons.
            Classes are protected (the activity restarts, then runs without live sync, then the teacher can skip),
            but the activity itself needs a fix.
          </Text>
          {scenes.map((s) => (
            <Section key={s.key} style={cardSection}>
              <Text style={cardTitle}>{s.key}</Text>
              <Text style={cardRow}>{s.count} crashes · {s.users} user(s){s.lastSeen ? ` · last ${s.lastSeen}` : ''}</Text>
              {s.sample && <Text style={cardSample}>{s.sample}</Text>}
            </Section>
          ))}
          <Section style={ctaSection}>
            <Button style={button} href="https://engleuphoria.com/dev-console">Open the Dev Console</Button>
          </Section>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>Automated notification from {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminClassroomCrashEmail,
  subject: (data: Record<string, any>) => {
    const first = data.scenes?.[0]?.key
    const more = (data.scenes?.length ?? 0) - 1
    return `⚠️ Classroom crash: ${first ?? 'activity'}${more > 0 ? ` +${more} more` : ''}`
  },
  to: ADMIN_EMAIL,
  displayName: 'Admin: classroom activity crashing',
  previewData: {
    windowMinutes: 60,
    scenes: [{ key: 'Scene l1-model-h [sound-model]', count: 5, users: 2, lastSeen: '2026-10-02T10:05:00Z', sample: "Cannot read properties of undefined (reading 'length')" }],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#6366f1', padding: '24px', textAlign: 'center' as const }
const logoText = { color: '#ffffff', fontSize: '22px', fontWeight: '700' as const, margin: '0' }
const contentSection = { padding: '32px 24px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#111827', margin: '0 0 16px' }
const intro = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 20px' }
const cardSection = { backgroundColor: '#f3f4f6', padding: '16px 20px', borderRadius: '8px', margin: '0 0 12px' }
const cardTitle = { fontSize: '15px', fontWeight: '700' as const, color: '#111827', margin: '0 0 6px' }
const cardRow = { fontSize: '13px', color: '#374151', margin: '0 0 6px', lineHeight: '1.5' }
const cardSample = { fontSize: '12px', color: '#6b7280', fontFamily: 'monospace', margin: '0', lineHeight: '1.5' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0 0' }
const button = { backgroundColor: '#7c3aed', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', fontWeight: '600' as const, fontSize: '14px', textDecoration: 'none' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const, margin: '0' }
