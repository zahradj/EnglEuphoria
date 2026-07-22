/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-black.png'
const SITE_NAME = 'EnglEuphoria'

interface BookingConfirmationProps {
  studentName?: string
  teacherName?: string
  lessonDate?: string
  lessonTime?: string
  duration?: string
  meetingLink?: string
}

const BookingConfirmationEmail = ({
  studentName,
  teacherName,
  lessonDate,
  lessonTime,
  duration,
  meetingLink,
}: BookingConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your lesson is booked! See you soon 📚</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerBar} />
        <Section style={logoSection}>
          <Img src={LOGO_URL} width="180" height="50" alt={SITE_NAME} style={logo} />
        </Section>
        <Section style={heroSection}>
          <Heading style={h1}>Lesson Booked! 📚</Heading>
          <Text style={text}>
            {studentName ? `Hey ${studentName}, your` : 'Your'} lesson has been confirmed!
          </Text>
          <Section style={detailsBox}>
            <Text style={detailLine}>👩‍🏫 <strong>Teacher:</strong> {teacherName || 'Your assigned teacher'}</Text>
            <Text style={detailLine}>📅 <strong>Date:</strong> {lessonDate || 'See your dashboard'}</Text>
            <Text style={detailLine}>🕐 <strong>Time:</strong> {lessonTime || 'See your dashboard'}</Text>
            <Text style={detailLine}>⏱️ <strong>Duration:</strong> {duration || '30 minutes'}</Text>
          </Section>
          {meetingLink && (
            <Section style={buttonContainer}>
              <Button style={button} href={meetingLink}>
                Join Lesson
              </Button>
            </Section>
          )}
          <Text style={textMuted}>
            Need to reschedule? Visit your dashboard to manage your bookings.
          </Text>
        </Section>
        <Hr style={hr} />
        <Section style={darkFooter}>
          <Text style={footerText}>© 2026 {SITE_NAME}. The Future of Learning.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookingConfirmationEmail,
  subject: 'Your EnglEuphoria lesson is booked! 📚',
  displayName: 'Booking confirmation',
  previewData: {
    studentName: 'Alex',
    teacherName: 'Ms. Johnson',
    lessonDate: 'January 15, 2026',
    lessonTime: '3:00 PM (GMT+1)',
    duration: '30 minutes',
    meetingLink: 'https://engleuphoria.lovable.app/classroom/demo',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerBar = { backgroundColor: '#4f46e5', height: '4px' }
const logoSection = { padding: '30px 25px 10px', textAlign: 'center' as const }
const logo = { margin: '0 auto' }
const heroSection = { padding: '10px 25px 20px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#4f46e5', margin: '0 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#1f2937', lineHeight: '1.6', margin: '0 0 20px' }
const textMuted = { fontSize: '13px', color: '#6b7280', lineHeight: '1.5', margin: '0 0 20px' }
const detailsBox = { backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px 20px', margin: '0 0 20px', border: '1px solid #e5e7eb' }
const detailLine = { fontSize: '14px', color: '#374151', margin: '0 0 8px', lineHeight: '1.5' }
const buttonContainer = { textAlign: 'center' as const, margin: '8px 0 12px' }
const button = { backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '15px', fontWeight: '600' as const, borderRadius: '8px', padding: '14px 28px', textDecoration: 'none' }
const hr = { borderColor: '#e5e7eb', margin: '20px 25px' }
const darkFooter = { backgroundColor: '#111827', padding: '20px 25px', textAlign: 'center' as const, borderRadius: '0 0 8px 8px' }
const footerText = { fontSize: '12px', color: '#9ca3af', margin: '0', fontWeight: '500' as const }
