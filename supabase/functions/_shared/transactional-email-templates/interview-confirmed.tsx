/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Html, Img, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_WHITE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-white.png'

interface Props {
  candidateName?: string
  interviewDate?: string
  interviewTime?: string
  meetingLink?: string
}

function InterviewConfirmed({
  candidateName = 'Applicant',
  interviewDate = 'TBD',
  interviewTime = 'TBD',
  meetingLink = '#',
}: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your interview is confirmed — EnglEuphoria</Preview>
      <Body style={{ margin: 0, padding: 0, background: '#f4f5f7', fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <Section style={{ background: '#0047AB', padding: '28px 32px', textAlign: 'center' as const }}>
            <Img src={LOGO_WHITE_URL} width="160" height="44" alt="EnglEuphoria" style={{ margin: '0 auto', display: 'block' }} />
          </Section>
          <Section style={{ padding: '32px' }}>
            <Text style={{ fontSize: '16px', fontWeight: 600, color: '#0047AB', margin: '0 0 20px' }}>Dear {candidateName},</Text>
            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: 1.7, margin: '0 0 16px' }}>
              Your interview is officially booked. We're looking forward to meeting you and seeing your teaching style in action.
            </Text>

            <Section style={{ background: '#F5F5F5', borderRadius: '10px', padding: '20px 24px', margin: '0 0 24px', border: '1px solid #E0E0E0' }}>
              <Text style={{ fontSize: '14px', color: '#455A64', lineHeight: 1.6, margin: '0 0 6px' }}><strong>Date:</strong> {interviewDate}</Text>
              <Text style={{ fontSize: '14px', color: '#455A64', lineHeight: 1.6, margin: '0 0 6px' }}><strong>Time:</strong> {interviewTime}</Text>
              <Text style={{ fontSize: '14px', color: '#455A64', lineHeight: 1.6, margin: 0 }}><strong>Duration:</strong> 25 minutes (interview + short demo)</Text>
            </Section>

            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <a href={meetingLink} style={{ background: '#0047AB', color: '#ffffff', fontSize: '15px', fontWeight: 600, borderRadius: '8px', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
                Enter Interview Classroom
              </a>
            </Section>

            <Text style={{ fontSize: '13px', color: '#78909C', lineHeight: 1.6, margin: '0 0 24px', textAlign: 'center' as const }}>
              Save this email — the link above opens your private classroom on the day, with no login required.
            </Text>

            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: 1.7, margin: '24px 0 4px' }}>See you soon!</Text>
            <Text style={{ fontSize: '14px', color: '#0047AB', fontWeight: 600, margin: 0 }}>The EnglEuphoria Academic Committee</Text>
          </Section>
          <Section style={{ background: '#0D1642', padding: '24px 32px', textAlign: 'center' as const }}>
            <Img src={LOGO_WHITE_URL} width="100" height="28" alt="EnglEuphoria" style={{ margin: '0 auto 12px', display: 'block' }} />
            <Text style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>© 2026 EnglEuphoria. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template: TemplateEntry = {
  component: InterviewConfirmed,
  subject: 'Your interview is confirmed — EnglEuphoria',
  displayName: 'Interview Confirmed',
  previewData: {
    candidateName: 'Jane',
    interviewDate: 'Monday, June 10, 2026',
    interviewTime: '14:00',
    meetingLink: 'https://engleuphoria.com/interview/sample-token',
  },
}
