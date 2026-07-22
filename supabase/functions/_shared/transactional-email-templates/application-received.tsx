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
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_WHITE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-white.png'

interface ApplicationReceivedProps {
  name?: string
}

function ApplicationReceivedEmail({ name }: ApplicationReceivedProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Application Received - EnglEuphoria</Preview>
      <Body style={{ margin: '0', padding: '0', background: '#f4f5f7', fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          {/* Navy Header */}
          <Section style={{ background: '#0047AB', padding: '28px 32px', textAlign: 'center' as const }}>
            <Img src={LOGO_WHITE_URL} width="160" height="44" alt="EnglEuphoria" style={{ margin: '0 auto', display: 'block' }} />
          </Section>
          {/* Content */}
          <Section style={{ padding: '32px' }}>
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#0047AB', margin: '0 0 20px' }}>Dear {name || 'Applicant'},</Text>
            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: '1.7', margin: '0 0 16px' }}>
              Thank you for applying to <strong>EnglEuphoria</strong>. We have received your application and our academic team is currently reviewing your profile.
            </Text>
            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: '1.7', margin: '0 0 16px' }}>
              We will contact you regarding the next steps in our recruitment process.
            </Text>
            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: '1.7', margin: '24px 0 4px' }}>Warm regards,</Text>
            <Text style={{ fontSize: '14px', color: '#0047AB', fontWeight: '600', margin: '0 0 4px' }}>The EnglEuphoria Academic Committee</Text>
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
  component: ApplicationReceivedEmail,
  subject: 'Application Received - EnglEuphoria',
  displayName: 'Application received',
  previewData: { name: 'Sarah' },
}
