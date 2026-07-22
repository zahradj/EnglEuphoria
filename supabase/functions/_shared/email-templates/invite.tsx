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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

const LOGO_WHITE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-white.png'

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to the {siteName} Family!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src={LOGO_WHITE_URL} width="160" height="44" alt={siteName} style={logo} />
        </Section>

        <Section style={contentSection}>
          <Heading style={h1}>Welcome to the Family! 🎉</Heading>
          <Text style={text}>
            Congratulations! You&apos;ve been invited to join{' '}
            <Link href={siteUrl} style={link}>
              <strong>{siteName}</strong>
            </Link>
            . Click the button below to accept the invitation and set up your account.
          </Text>

          <Section style={cardSection}>
            <Text style={cardTitle}>Your Onboarding Roadmap</Text>
            <Text style={cardText}>1. Accept this invitation &amp; set your password</Text>
            <Text style={cardText}>2. Complete your professional profile</Text>
            <Text style={cardText}>3. Record your introduction video</Text>
            <Text style={cardText}>4. Set your availability &amp; start teaching</Text>
          </Section>

          <Section style={ctaSection}>
            <Button style={button} href={confirmationUrl}>
              Accept Invitation
            </Button>
          </Section>
          <Text style={helperText}>
            If you weren&apos;t expecting this invitation, you can safely ignore this email.
          </Text>
        </Section>

        <Section style={footerSection}>
          <Text style={footer}>© {siteName}. All rights reserved.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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
const footerSection = { backgroundColor: '#1e293b', padding: '20px 24px', textAlign: 'center' as const }
const footer = { fontSize: '13px', color: '#94a3b8', margin: '0' }
