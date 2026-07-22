/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const LOGO_WHITE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-white.png'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src={LOGO_WHITE_URL} width="160" height="44" alt="EnglEuphoria" style={logo} />
        </Section>

        <Section style={contentSection}>
          <Heading style={h1}>Verification Code</Heading>
          <Text style={text}>Use the code below to confirm your identity:</Text>
          <Section style={codeContainer}>
            <Text style={codeStyle}>{token}</Text>
          </Section>
          <Text style={helperText}>
            This code will expire shortly. If you didn&apos;t request this, you can safely ignore this email.
          </Text>
        </Section>

        <Section style={footerSection}>
          <Text style={footer}>© EnglEuphoria. All rights reserved.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#0047AB', padding: '32px 24px', textAlign: 'center' as const }
const logo = { margin: '0 auto', display: 'block' }
const contentSection = { padding: '32px 24px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#111827', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px' }
const codeContainer = { backgroundColor: '#eef4fc', padding: '20px', borderRadius: '8px', textAlign: 'center' as const, margin: '0 0 24px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '32px', fontWeight: 'bold' as const, color: '#0047AB', margin: '0', letterSpacing: '4px' }
const helperText = { fontSize: '13px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 8px' }
const footerSection = { backgroundColor: '#1e293b', padding: '20px 24px', textAlign: 'center' as const }
const footer = { fontSize: '13px', color: '#94a3b8', margin: '0' }
