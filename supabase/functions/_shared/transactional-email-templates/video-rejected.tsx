/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body,
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

interface VideoRejectedProps {
  name?: string
  reason?: string
}

const VideoRejectedEmail = ({ name, reason }: VideoRejectedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your intro video needs a re-upload</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerBar} />
        <Section style={logoSection}>
          <Img src={LOGO_URL} width="180" height="50" alt={SITE_NAME} style={logo} />
        </Section>
        <Section style={heroSection}>
          <Heading style={h1}>Video Update Required 🎥</Heading>
          <Text style={text}>
            {name ? `Hi ${name},` : 'Hi Teacher,'}
          </Text>
          <Text style={text}>
            We reviewed your intro video and unfortunately it doesn't meet our quality standards yet. Please re-upload a new video addressing the feedback below.
          </Text>
          {reason && (
            <Section style={detailsBox}>
              <Text style={detailLine}><strong>Feedback:</strong> {reason}</Text>
            </Section>
          )}
          <Text style={textMuted}>
            Once you upload a new video, our team will review it promptly.
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
  component: VideoRejectedEmail,
  subject: 'Your intro video needs a re-upload',
  displayName: 'Video rejected',
  previewData: { name: 'Sarah', reason: 'Background is too cluttered/unprofessional.' },
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
const detailsBox = { backgroundColor: '#fef2f2', borderRadius: '8px', padding: '16px 20px', margin: '0 0 20px', border: '1px solid #fecaca' }
const detailLine = { fontSize: '14px', color: '#374151', margin: '0', lineHeight: '1.5' }
const hr = { borderColor: '#e5e7eb', margin: '20px 25px' }
const darkFooter = { backgroundColor: '#111827', padding: '20px 25px', textAlign: 'center' as const, borderRadius: '0 0 8px 8px' }
const footerText = { fontSize: '12px', color: '#9ca3af', margin: '0', fontWeight: '500' as const }
