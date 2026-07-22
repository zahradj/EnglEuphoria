/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

const LOGO_WHITE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-white.png'

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your login link for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src={LOGO_WHITE_URL} width="160" height="44" alt={siteName} style={logo} />
        </Section>

        <Section style={contentSection}>
          <Heading style={h1}>Your Login Link</Heading>
          <Text style={text}>
            Click the button below to log in to {siteName}. This link will expire shortly.
          </Text>
          <Section style={ctaSection}>
            <Button style={button} href={confirmationUrl}>
              Log In to {siteName}
            </Button>
          </Section>
          <Text style={helperText}>
            If you didn&apos;t request this link, you can safely ignore this email.
          </Text>
        </Section>

        <Section style={footerSection}>
          <Text style={footer}>© {siteName}. All rights reserved.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#0047AB', padding: '32px 24px', textAlign: 'center' as const }
const logo = { margin: '0 auto', display: 'block' }
const contentSection = { padding: '32px 24px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#111827', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 24px' }
const button = { backgroundColor: '#0047AB', color: '#ffffff', padding: '14px 32px', borderRadius: '8px', fontWeight: '600' as const, fontSize: '16px', textDecoration: 'none' }
const helperText = { fontSize: '13px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 8px' }
const footerSection = { backgroundColor: '#1e293b', padding: '20px 24px', textAlign: 'center' as const }
const footer = { fontSize: '13px', color: '#94a3b8', margin: '0' }
