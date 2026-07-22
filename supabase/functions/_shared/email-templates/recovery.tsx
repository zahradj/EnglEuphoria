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
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  siteUrl?: string
  recipient?: string
  confirmationUrl: string
}

const LOGO_WHITE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-white.png'

export const RecoveryEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your {siteName} password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src={LOGO_WHITE_URL} width="160" height="44" alt={siteName} style={logo} />
        </Section>

        <Section style={contentSection}>
          <Heading style={h1}>Reset your password 🔐</Heading>

          <Text style={text}>
            We received a request to reset the password for your{' '}
            <Link href={siteUrl || 'https://engleuphoria.com'} style={link}>
              <strong>{siteName}</strong>
            </Link>{' '}
            account
            {recipient ? (
              <>
                {' '}(
                <Link href={`mailto:${recipient}`} style={link}>
                  {recipient}
                </Link>
                )
              </>
            ) : null}
            .
          </Text>

          <Text style={text}>
            Click the button below to create a new, secure password and get back to learning.
          </Text>

          <Section style={cardSection}>
            <Text style={cardTitle}>🛡️ Security tips</Text>
            <Text style={cardText}>• This link will expire in 1 hour</Text>
            <Text style={cardText}>• Use at least 8 characters</Text>
            <Text style={cardText}>• Mix uppercase, lowercase &amp; numbers</Text>
            <Text style={cardText}>• Never share your password with anyone</Text>
          </Section>

          <Section style={ctaSection}>
            <Button style={button} href={confirmationUrl}>
              Reset My Password
            </Button>
          </Section>

          <Text style={helperText}>
            If the button doesn&apos;t work, copy and paste this link into your browser:
          </Text>
          <Text style={urlText}>{confirmationUrl}</Text>
        </Section>

        <Text style={footer}>
          If you didn&apos;t request a password reset, you can safely ignore this email — your account remains secure.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#0047AB', padding: '32px 24px', textAlign: 'center' as const }
const logo = { margin: '0 auto', display: 'block' }
const contentSection = { padding: '32px 24px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#111827', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: '#0047AB', textDecoration: 'underline' }
const cardSection = { backgroundColor: '#eef4fc', padding: '20px', borderRadius: '8px', margin: '0 0 24px' }
const cardTitle = { fontSize: '16px', fontWeight: '600' as const, color: '#0047AB', margin: '0 0 12px' }
const cardText = { fontSize: '14px', color: '#4b5563', margin: '0 0 6px', lineHeight: '1.5' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 24px' }
const button = { backgroundColor: '#0047AB', color: '#ffffff', padding: '14px 32px', borderRadius: '8px', fontWeight: '600' as const, fontSize: '16px', textDecoration: 'none' }
const helperText = { fontSize: '13px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 8px' }
const urlText = { fontSize: '12px', color: '#0047AB', lineHeight: '1.6', wordBreak: 'break-all' as const, margin: '0 0 24px' }
const footer = { fontSize: '13px', color: '#9ca3af', textAlign: 'center' as const, margin: '0', padding: '0 24px 24px' }
