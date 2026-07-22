/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_WHITE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-white.png'
const LOGO_DARK_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-black.png'
const SITE_URL = 'https://engleuphoria.lovable.app'

interface InterviewInvitationBrandedProps {
  candidateName?: string
  interviewDate?: string
  interviewTime?: string
  meetingLink?: string
  applicationId?: string
}

function InterviewInvitationBranded({
  candidateName = 'Applicant',
  interviewDate = 'TBD',
  interviewTime = 'TBD',
  meetingLink,
  applicationId = '',
}: InterviewInvitationBrandedProps) {
  const classroomLink = meetingLink || `${SITE_URL}/teach-with-us`

  return (
    <Html lang="en">
      <Head />
      <Preview>Your Interview & Demo Lesson — EnglEuphoria</Preview>
      <Body style={{ margin: '0', padding: '0', background: '#f4f5f7', fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          {/* Navy Header */}
          <Section style={{ background: '#0047AB', padding: '28px 32px', textAlign: 'center' as const }}>
            <Img src={LOGO_WHITE_URL} width="160" height="44" alt="EnglEuphoria" style={{ margin: '0 auto', display: 'block' }} />
          </Section>
          {/* Content */}
          <Section style={{ padding: '32px' }}>
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#0047AB', margin: '0 0 20px' }}>Dear {candidateName},</Text>
            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: '1.7', margin: '0 0 16px' }}>
              Congratulations on moving to the next phase! We are pleased to invite you to an interview followed by a 15-minute demo lesson.
            </Text>
            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: '1.7', margin: '0 0 24px' }}>
              You will be teaching from our standard lesson slides, which are already loaded in the classroom. The session will include:
            </Text>

            {/* Session Breakdown */}
            <Section style={{ background: '#EBF5FF', borderRadius: '10px', padding: '16px 24px', margin: '0 0 24px', borderLeft: '4px solid #0047AB' }}>
              <Text style={{ fontSize: '14px', color: '#0047AB', fontWeight: '700', margin: '0 0 8px' }}>Session Format</Text>
              <Text style={{ fontSize: '14px', color: '#455A64', lineHeight: '1.8', margin: '0 0 4px' }}>• <strong>Stage 1:</strong> 10-minute face-to-face interview</Text>
              <Text style={{ fontSize: '14px', color: '#455A64', lineHeight: '1.8', margin: '0' }}>• <strong>Stage 2:</strong> 15-minute demo lesson using our classroom tools</Text>
            </Section>

            {/* Details Card */}
            <Section style={{ background: '#F5F5F5', borderRadius: '10px', padding: '20px 24px', margin: '0 0 24px', border: '1px solid #E0E0E0' }}>
              <Text style={{ fontSize: '14px', color: '#455A64', lineHeight: '1.6', margin: '0 0 6px' }}><strong>Date:</strong> {interviewDate}</Text>
              <Text style={{ fontSize: '14px', color: '#455A64', lineHeight: '1.6', margin: '0 0 6px' }}><strong>Time:</strong> {interviewTime}</Text>
              <Text style={{ fontSize: '14px', color: '#455A64', lineHeight: '1.6', margin: '0' }}><strong>Duration:</strong> ~25 minutes</Text>
            </Section>

            {/* Enter Classroom Button */}
            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <a href={classroomLink} style={{ background: '#0047AB', color: '#ffffff', fontSize: '15px', fontWeight: '600', borderRadius: '8px', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
                Enter Demo Classroom
              </a>
            </Section>

            <Text style={{ fontSize: '13px', color: '#78909C', lineHeight: '1.6', margin: '0 0 24px', textAlign: 'center' as const }}>
              The classroom includes a whiteboard, lesson slides, and video — everything you need for the demo.
            </Text>

            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: '1.7', margin: '24px 0 4px' }}>We look forward to seeing you teach!</Text>
            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: '1.7', margin: '0 0 4px' }}>Warm regards,</Text>
            <Text style={{ fontSize: '14px', color: '#0047AB', fontWeight: '600', margin: '0' }}>The EnglEuphoria Academic Committee</Text>
          </Section>
          {/* Dark Footer */}
          <Section style={{ background: '#0D1642', padding: '24px 32px', textAlign: 'center' as const }}>
            <Img src={LOGO_WHITE_URL} width="100" height="28" alt="EnglEuphoria" style={{ margin: '0 auto 12px', display: 'block' }} />
            <Text style={{ fontSize: '12px', color: '#9CA3AF', margin: '0' }}>© 2026 EnglEuphoria. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template: TemplateEntry = {
  component: InterviewInvitationBranded,
  subject: 'Your Interview & Demo Lesson — EnglEuphoria',
  displayName: 'Interview & Demo Lesson Invitation (Branded)',
  previewData: {
    candidateName: 'Jane Doe',
    interviewDate: 'Monday, January 15, 2026',
    interviewTime: '14:00',
    meetingLink: 'https://engleuphoria.lovable.app/classroom/demo-123',
    applicationId: '123',
  },
}
