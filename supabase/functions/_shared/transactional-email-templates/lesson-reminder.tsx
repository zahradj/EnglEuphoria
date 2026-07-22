/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'

interface LessonReminderProps {
  recipientName?: string
  lessonTitle?: string
  lessonDate?: string
  teacherName?: string
  studentName?: string
  reminderType?: string
  roomLink?: string
}

const LessonReminderEmail = ({ recipientName, lessonTitle, lessonDate, teacherName, studentName, reminderType, roomLink }: LessonReminderProps) => {
  const timeLabel = reminderType === '24h_before' ? '24 hours' : reminderType === '1h_before' ? '1 hour' : '15 minutes'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>⏰ Your lesson starts in {timeLabel}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logoText}>{SITE_NAME}</Heading>
          </Section>
          <Section style={contentSection}>
            <Heading style={h1}>⏰ Lesson Reminder</Heading>
            <Text style={text}>Hello {recipientName || 'there'}, your lesson is coming up in <strong>{timeLabel}</strong>.</Text>
            <Section style={cardSection}>
              <Text style={cardTitle}>{lessonTitle || 'Your Lesson'}</Text>
              <Text style={cardRow}><strong>Date & Time:</strong> {lessonDate || 'TBD'}</Text>
              {teacherName && <Text style={cardRow}><strong>Teacher:</strong> {teacherName}</Text>}
              {studentName && <Text style={cardRow}><strong>Student:</strong> {studentName}</Text>}
            </Section>
            {roomLink && (
              <Section style={ctaSection}>
                <Button style={button} href={roomLink}>Join Lesson Room</Button>
              </Section>
            )}
            <Text style={muted}>See you soon! — The {SITE_NAME} Team</Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>{SITE_NAME} — Your English Learning Journey</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: LessonReminderEmail,
  subject: (data: Record<string, any>) => `⏰ Reminder: ${data.lessonTitle || 'Your lesson'} starts soon`,
  displayName: 'Lesson reminder',
  previewData: { recipientName: 'Alex', lessonTitle: 'Present Perfect', lessonDate: 'Monday 10:00 AM', teacherName: 'Maria', reminderType: '1h_before', roomLink: 'https://engleuphoria.lovable.app/classroom/123' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#9b6dba', padding: '32px 24px', textAlign: 'center' as const }
const logoText = { color: '#ffffff', fontSize: '28px', fontWeight: '700' as const, margin: '0' }
const contentSection = { padding: '32px 24px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#111827', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px' }
const cardSection = { backgroundColor: '#f5f0fa', padding: '20px', borderRadius: '8px', margin: '0 0 24px' }
const cardTitle = { fontSize: '18px', fontWeight: '700' as const, color: '#7c3aed', margin: '0 0 12px' }
const cardRow = { fontSize: '14px', color: '#374151', margin: '0 0 6px', lineHeight: '1.5' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 24px' }
const button = { backgroundColor: '#9b6dba', color: '#ffffff', padding: '14px 32px', borderRadius: '8px', fontWeight: '600' as const, fontSize: '16px', textDecoration: 'none' }
const muted = { fontSize: '13px', color: '#6b7280', margin: '0' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#9ca3af', textAlign: 'center' as const, margin: '0' }
