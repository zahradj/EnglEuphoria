/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Html, Img, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_WHITE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-white.png'

interface Props {
  candidateName?: string
  bookingLink?: string
  expiresAtLabel?: string
}

function BookingInvitation({ candidateName = 'Applicant', bookingLink = '#', expiresAtLabel }: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>You're invited — pick a time for your EnglEuphoria interview (link expires in 48 hours)</Preview>
      <Body style={{ margin: 0, padding: 0, background: '#f4f5f7', fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <Section style={{ background: '#0047AB', padding: '28px 32px', textAlign: 'center' as const }}>
            <Img src={LOGO_WHITE_URL} width="160" height="44" alt="EnglEuphoria" style={{ margin: '0 auto', display: 'block' }} />
          </Section>
          <Section style={{ padding: '32px' }}>
            <Text style={{ fontSize: '16px', fontWeight: 600, color: '#0047AB', margin: '0 0 20px' }}>Dear {candidateName},</Text>
            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: 1.7, margin: '0 0 16px' }}>
              Congratulations on going through the interview process.
            </Text>
            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: 1.7, margin: '0 0 24px' }}>
              Please pick a date for the interview. The link below opens our self-serve calendar — no account or password required.
            </Text>

            <Section style={{ background: '#EBF5FF', borderRadius: '10px', padding: '16px 24px', margin: '0 0 24px', borderLeft: '4px solid #0047AB' }}>
              <Text style={{ fontSize: '14px', color: '#0047AB', fontWeight: 700, margin: '0 0 8px' }}>What happens next</Text>
              <Text style={{ fontSize: '14px', color: '#455A64', lineHeight: 1.8, margin: '0 0 4px' }}>1. Click the button below and choose any open slot.</Text>
              <Text style={{ fontSize: '14px', color: '#455A64', lineHeight: 1.8, margin: '0 0 4px' }}>2. You'll receive a confirmation email with the same link.</Text>
              <Text style={{ fontSize: '14px', color: '#455A64', lineHeight: 1.8, margin: 0 }}>3. On the day, click the link to enter the live interview classroom.</Text>
            </Section>

            <Section style={{ background: '#FFF4E5', borderRadius: '10px', padding: '14px 20px', margin: '0 0 24px', borderLeft: '4px solid #F59E0B' }}>
              <Text style={{ fontSize: '14px', color: '#92400E', fontWeight: 700, margin: '0 0 4px' }}>⏰ This invitation expires in 48 hours</Text>
              <Text style={{ fontSize: '13px', color: '#78350F', lineHeight: 1.6, margin: 0 }}>
                Please pick your slot by {expiresAtLabel ?? 'the deadline above'}. After that, the link will stop working and the team will need to send you a new invitation.
              </Text>
            </Section>

            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <a href={bookingLink} style={{ background: '#0047AB', color: '#ffffff', fontSize: '15px', fontWeight: 600, borderRadius: '8px', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
                Pick Your Interview Time
              </a>
            </Section>

            <Text style={{ fontSize: '13px', color: '#78909C', lineHeight: 1.6, margin: '0 0 24px', textAlign: 'center' as const }}>
              This link is unique to you — please don't share it.
            </Text>


            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: 1.7, margin: '24px 0 4px' }}>We look forward to meeting you.</Text>
            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: 1.7, margin: '0 0 4px' }}>Warm regards,</Text>
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
  component: BookingInvitation,
  subject: 'Pick your interview time — EnglEuphoria',
  displayName: 'Booking Invitation',
  previewData: { candidateName: 'Jane', bookingLink: 'https://engleuphoria.com/interview/sample-token', expiresAtLabel: 'Friday, June 7, 18:00 UTC' },
}
