/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Row, Column, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'

interface TeacherBookingProps {
  teacherName?: string
  studentName?: string
  lessonTitle?: string
  lessonDate?: string
  lessonTime?: string
  durationLabel?: string
  roomLink?: string
  googleCalendarUrl?: string
  icsUrl?: string
}

const TeacherBookingEmail = ({
  teacherName, studentName, lessonTitle, lessonDate, lessonTime, durationLabel,
  roomLink, googleCalendarUrl, icsUrl,
}: TeacherBookingProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{studentName || 'A student'} booked a lesson with you — {lessonDate || 'soon'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>{SITE_NAME}</Heading>
          <Text style={headerSub}>Teacher Notification</Text>
        </Section>

        <Section style={contentSection}>
          <Heading style={h1}>You have a new booking 🎉</Heading>
          <Text style={text}>
            Hi {teacherName || 'Teacher'},<br />
            <strong>{studentName || 'A student'}</strong> just booked a lesson with you. Here are the details — please add it to your calendar so you don't miss it.
          </Text>

          <Section style={cardSection}>
            <Text style={cardTitle}>Lesson details</Text>
            <Row style={cardRowWrap}><Column style={cardLabel}>Lesson</Column><Column style={cardValue}>{lessonTitle || 'Untitled lesson'}</Column></Row>
            <Row style={cardRowWrap}><Column style={cardLabel}>Student</Column><Column style={cardValue}>{studentName || '—'}</Column></Row>
            <Row style={cardRowWrap}><Column style={cardLabel}>Date</Column><Column style={cardValue}>{lessonDate || 'TBD'}</Column></Row>
            <Row style={cardRowWrap}><Column style={cardLabel}>Time</Column><Column style={cardValue}>{lessonTime || 'TBD'}</Column></Row>
            {durationLabel && (
              <Row style={cardRowWrap}><Column style={cardLabel}>Duration</Column><Column style={cardValue}>{durationLabel}</Column></Row>
            )}
          </Section>

          {roomLink && (
            <Section style={ctaSection}>
              <Button style={button} href={roomLink}>Enter Classroom</Button>
            </Section>
          )}

          {(googleCalendarUrl || icsUrl) && (
            <Section style={calSection}>
              <Text style={calTitle}>Add to your calendar</Text>
              <Text style={calLinks}>
                {googleCalendarUrl && (
                  <Link href={googleCalendarUrl} style={calLink}>Google Calendar</Link>
                )}
                {googleCalendarUrl && icsUrl && <span style={calDot}> · </span>}
                {icsUrl && (
                  <Link href={icsUrl} style={calLink}>Apple / Outlook (.ics)</Link>
                )}
              </Text>
            </Section>
          )}

          <Text style={muted}>
            You'll get a reminder before the lesson starts. If you can't make it, please reschedule from your teacher dashboard as soon as possible.
          </Text>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>{SITE_NAME} — Teaching English with joy.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TeacherBookingEmail,
  subject: (data: Record<string, any>) =>
    `New booking with ${data.studentName || 'a student'} — ${data.lessonDate || 'upcoming'}`,
  displayName: 'Teacher booking notification',
  previewData: {
    teacherName: 'Maria',
    studentName: 'Alex',
    lessonTitle: 'Present Perfect Tense',
    lessonDate: 'Monday, Jan 20, 2025',
    lessonTime: '10:00 AM',
    durationLabel: '60 minutes',
    roomLink: 'https://engleuphoria.lovable.app/classroom/123',
    googleCalendarUrl: 'https://www.google.com/calendar/render?action=TEMPLATE',
    icsUrl: 'data:text/calendar;charset=utf-8,BEGIN:VCALENDAR',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#9b6dba', padding: '28px 24px', textAlign: 'center' as const }
const logoText = { color: '#ffffff', fontSize: '26px', fontWeight: '700' as const, margin: '0' }
const headerSub = { color: '#ede4f7', fontSize: '13px', fontWeight: '500' as const, margin: '6px 0 0', letterSpacing: '0.5px' }
const contentSection = { padding: '32px 28px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#111827', margin: '0 0 12px' }
const text = { fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 24px' }
const cardSection = { backgroundColor: '#f5f0fa', padding: '20px 22px', borderRadius: '10px', margin: '0 0 24px' }
const cardTitle = { fontSize: '13px', fontWeight: '700' as const, color: '#7c3aed', textTransform: 'uppercase' as const, letterSpacing: '0.6px', margin: '0 0 14px' }
const cardRowWrap = { marginBottom: '8px' }
const cardLabel = { fontSize: '13px', color: '#7c3aed', fontWeight: '600' as const, width: '90px', verticalAlign: 'top' as const }
const cardValue = { fontSize: '14px', color: '#1f2937', fontWeight: '500' as const, lineHeight: '1.5' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 20px' }
const button = { backgroundColor: '#9b6dba', color: '#ffffff', padding: '14px 36px', borderRadius: '10px', fontWeight: '600' as const, fontSize: '15px', textDecoration: 'none' }
const calSection = { textAlign: 'center' as const, margin: '0 0 24px', padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px' }
const calTitle = { fontSize: '13px', fontWeight: '600' as const, color: '#6b7280', margin: '0 0 8px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const calLinks = { fontSize: '14px', margin: '0', color: '#9b6dba' }
const calLink = { color: '#9b6dba', textDecoration: 'underline', fontWeight: '600' as const }
const calDot = { color: '#d1d5db', margin: '0 4px' }
const muted = { fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' as const, margin: '0', lineHeight: '1.5' }
const hr = { borderColor: '#e5e7eb', margin: '0 28px' }
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const, margin: '20px 0' }
