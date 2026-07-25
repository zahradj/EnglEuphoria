/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { EmailLogo } from './emailBranding.tsx'

const SITE_NAME = 'EnglEuphoria'
const SITE_URL = 'https://engleuphoria.lovable.app'

interface InterviewInvitationProps {
  name?: string
  interviewDate?: string
  interviewTime?: string
  meetingLink?: string
  applicationId?: string
  confirmUrl?: string
  reminderType?: string
  candidateTimezone?: string
}

const InterviewInvitationEmail = ({
  name,
  interviewDate,
  interviewTime,
  meetingLink,
  applicationId,
  confirmUrl,
  reminderType,
  candidateTimezone,
}: InterviewInvitationProps) => {
  const isReminder = !!reminderType
  // Only show the "Enter Demo Classroom" button when an explicit meetingLink is provided
  // (i.e. after the candidate has chosen their hub + slot). Before scheduling, only the
  // confirmUrl (hub & time selection) should be shown.
  const interviewLink = meetingLink || ''
  void applicationId

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        {isReminder
          ? `${reminderType} — ${SITE_NAME} Interview`
          : `Invitation to Interview & Demo Lesson - ${SITE_NAME}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Navy Header */}
          <Section style={navyHeader}>
            <EmailLogo size={44} />
          </Section>

          {/* Reminder Badge */}
          {isReminder && (
            <Section style={reminderBadge}>
              <Text style={reminderBadgeText}>⏰ {reminderType}</Text>
            </Section>
          )}

          {/* Main Content */}
          <Section style={contentSection}>
            <Text style={greeting}>
              Dear {name || 'Candidate'},
            </Text>

            {!isReminder ? (
              <>
                <Text style={bodyText}>
                  Congratulations on passing the initial review phase. We would like to invite you to an interview and a short demo lesson.
                </Text>
                <Text style={bodyText}>
                  Please use the link below to join our internal interview room at your scheduled time.
                </Text>
              </>
            ) : (
              <Text style={bodyText}>
                This is a friendly reminder about your upcoming interview with {SITE_NAME}.
                Please ensure you are in a quiet environment with a stable internet connection.
              </Text>
            )}

            {/* Interview Details Box */}
            <Section style={detailsCard}>
              <Text style={detailsTitle}>📅 Your Interview Details</Text>
              <Hr style={detailsDivider} />
              {interviewDate && (
                <Text style={detailRow}>
                  <strong>Date:</strong> {interviewDate}
                </Text>
              )}
              {interviewTime && (
                <Text style={detailRow}>
                  <strong>Time:</strong> {interviewTime}{candidateTimezone ? ` (${candidateTimezone})` : ''}
                </Text>
              )}
              <Text style={detailRow}>
                <strong>Duration:</strong> ~25 minutes (Interview + Demo Lesson)
              </Text>
            </Section>

            {/* Choose hub + schedule (primary CTA before the interview is booked) */}
            {confirmUrl && (
              <Section style={buttonContainer}>
                <a href={confirmUrl} style={confirmButton}>
                  🎯 Choose Your Hub & Schedule Interview
                </a>
                <Text style={{ ...bodyText, fontSize: '13px', color: '#607D8B', marginTop: '8px' }}>
                  You'll pick which hub you'd like to demo for (Playground, Academy, or Success),
                  then select a date and time.
                </Text>
              </Section>
            )}

            {/* Join Meeting Button — only shown once a meeting link has been issued */}
            {interviewLink && (
              <Section style={buttonContainer}>
                <a href={interviewLink} style={joinButton}>
                  Enter Demo Classroom
                </a>
              </Section>
            )}

            <Text style={bodyText}>
              We look forward to {isReminder ? 'speaking with you soon' : 'meeting you'}.
            </Text>

            <Text style={signoff}>Warm regards,</Text>
            <Text style={signoffTitle}><strong>The EnglEuphoria Academic Committee</strong></Text>
          </Section>

          {/* Dark Footer */}
          <Section style={darkFooter}>
            <EmailLogo size={32} style={{ marginBottom: '12px' }} />
            <Text style={footerText}>© 2026 {SITE_NAME}. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: InterviewInvitationEmail,
  subject: ({ name, reminderType }: Record<string, any>) =>
    reminderType
      ? `Reminder: ${SITE_NAME} Interview — ${name || 'Teacher'}`
      : `Invitation to Interview & Demo Lesson - ${SITE_NAME}`,
  displayName: 'Interview invitation',
  previewData: {
    name: 'Sarah Johnson',
    interviewDate: 'Monday, April 14, 2026',
    interviewTime: '14:00',
    meetingLink: 'https://engleuphoria.lovable.app/classroom/demo-abc-123',
    confirmUrl: 'https://engleuphoria.lovable.app/confirm-interview?token=abc123',
    candidateTimezone: 'CET',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#f4f5f7',
  fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
}
const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden' as const,
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
}
const navyHeader = {
  backgroundColor: '#0047AB',
  padding: '28px 32px',
  textAlign: 'center' as const,
}
const reminderBadge = {
  backgroundColor: '#E3F2FD',
  padding: '10px 32px',
  textAlign: 'center' as const,
  borderBottom: '2px solid #1565C0',
}
const reminderBadgeText = {
  fontSize: '14px',
  fontWeight: '600' as const,
  color: '#1565C0',
  margin: '0',
}
const contentSection = {
  padding: '32px 32px 24px',
}
const greeting = {
  fontSize: '16px',
  color: '#0047AB',
  fontWeight: '600' as const,
  margin: '0 0 20px',
}
const bodyText = {
  fontSize: '15px',
  color: '#37474F',
  lineHeight: '1.7',
  margin: '0 0 16px',
}
const detailsCard = {
  backgroundColor: '#F5F5F5',
  borderRadius: '10px',
  padding: '20px 24px',
  margin: '24px 0',
  border: '1px solid #E0E0E0',
}
const detailsTitle = {
  fontSize: '16px',
  fontWeight: '700' as const,
  color: '#0047AB',
  margin: '0 0 8px',
}
const detailsDivider = {
  borderColor: '#E0E0E0',
  margin: '12px 0',
}
const detailRow = {
  fontSize: '14px',
  color: '#455A64',
  lineHeight: '1.6',
  margin: '0 0 6px',
}
const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
}
const joinButton = {
  backgroundColor: '#0047AB',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '8px',
  padding: '14px 32px',
  textDecoration: 'none',
  display: 'inline-block',
}
const confirmButton = {
  backgroundColor: '#2E7D32',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '8px',
  padding: '14px 32px',
  textDecoration: 'none',
  display: 'inline-block',
}
const signoff = {
  fontSize: '15px',
  color: '#37474F',
  margin: '24px 0 4px',
}
const signoffTitle = {
  fontSize: '14px',
  color: '#0047AB',
  margin: '0',
}
const darkFooter = {
  backgroundColor: '#0D1642',
  padding: '24px 32px',
  textAlign: 'center' as const,
}
const footerText = {
  fontSize: '12px',
  color: '#9CA3AF',
  margin: '0',
}
