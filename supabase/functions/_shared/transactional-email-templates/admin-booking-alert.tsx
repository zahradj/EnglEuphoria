/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body, Container, Head, Heading, Hr, Html, Preview, Row, Column, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'

interface AdminBookingAlertProps {
  teacherName?: string
  teacherEmail?: string
  studentName?: string
  lessonTitle?: string
  lessonDate?: string
  lessonTime?: string
  durationLabel?: string
}

const AdminBookingAlertEmail = ({
  teacherName, teacherEmail, studentName, lessonTitle, lessonDate, lessonTime, durationLabel,
}: AdminBookingAlertProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New booking: {studentName || 'student'} → {teacherName || 'teacher'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>{SITE_NAME}</Heading>
          <Text style={headerSub}>Admin Alert</Text>
        </Section>

        <Section style={contentSection}>
          <Heading style={h1}>New lesson booking</Heading>
          <Text style={text}>A student just booked a lesson. Copy below for your records.</Text>

          <Section style={cardSection}>
            <Row style={cardRowWrap}><Column style={cardLabel}>Student</Column><Column style={cardValue}>{studentName || '—'}</Column></Row>
            <Row style={cardRowWrap}><Column style={cardLabel}>Teacher</Column><Column style={cardValue}>{teacherName || '—'}{teacherEmail ? ` · ${teacherEmail}` : ''}</Column></Row>
            <Row style={cardRowWrap}><Column style={cardLabel}>Lesson</Column><Column style={cardValue}>{lessonTitle || 'Untitled'}</Column></Row>
            <Row style={cardRowWrap}><Column style={cardLabel}>Date</Column><Column style={cardValue}>{lessonDate || 'TBD'}</Column></Row>
            <Row style={cardRowWrap}><Column style={cardLabel}>Time</Column><Column style={cardValue}>{lessonTime || 'TBD'}</Column></Row>
            {durationLabel && (
              <Row style={cardRowWrap}><Column style={cardLabel}>Duration</Column><Column style={cardValue}>{durationLabel}</Column></Row>
            )}
          </Section>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>{SITE_NAME} — Automated admin alert</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminBookingAlertEmail,
  subject: (data: Record<string, any>) =>
    `[Booking] ${data.studentName || 'Student'} → ${data.teacherName || 'Teacher'} · ${data.lessonDate || ''}`,
  displayName: 'Admin booking alert',
  previewData: {
    teacherName: 'Maria',
    teacherEmail: 'maria@example.com',
    studentName: 'Alex',
    lessonTitle: 'Present Perfect Tense',
    lessonDate: 'Monday, Jan 20, 2025',
    lessonTime: '10:00 AM',
    durationLabel: '60 minutes',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#111827', padding: '24px', textAlign: 'center' as const }
const logoText = { color: '#ffffff', fontSize: '22px', fontWeight: '700' as const, margin: '0' }
const headerSub = { color: '#9ca3af', fontSize: '12px', fontWeight: '500' as const, margin: '4px 0 0', letterSpacing: '0.5px' }
const contentSection = { padding: '28px 24px' }
const h1 = { fontSize: '20px', fontWeight: '700' as const, color: '#111827', margin: '0 0 8px' }
const text = { fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px' }
const cardSection = { backgroundColor: '#f9fafb', padding: '18px 20px', borderRadius: '8px', border: '1px solid #e5e7eb' }
const cardRowWrap = { marginBottom: '6px' }
const cardLabel = { fontSize: '12px', color: '#6b7280', fontWeight: '600' as const, width: '85px', verticalAlign: 'top' as const, textTransform: 'uppercase' as const, letterSpacing: '0.4px' }
const cardValue = { fontSize: '14px', color: '#111827', fontWeight: '500' as const, lineHeight: '1.5' }
const hr = { borderColor: '#e5e7eb', margin: '0 24px' }
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const, margin: '16px 0' }
