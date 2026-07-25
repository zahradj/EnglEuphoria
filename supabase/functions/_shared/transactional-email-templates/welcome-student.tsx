/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { EmailLogo } from './emailBranding.tsx'

const SITE_NAME = 'EnglEuphoria'

interface WelcomeStudentProps {
  name?: string
  studentLevel?: string
}

const HUB_LABELS: Record<string, string> = {
  playground: '🌈 Playground',
  academy: '⚡ Academy',
  success: '📊 Success',
}

const WelcomeStudentEmail = ({ name, studentLevel }: WelcomeStudentProps) => {
  const firstName = name || 'Student'
  // Canonical hubs only. Legacy 'professional' maps to 'success'.
  const normalized = studentLevel === 'professional' ? 'success' : studentLevel
  const levelLabel = normalized ? HUB_LABELS[normalized] : undefined

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Welcome to {SITE_NAME} — your English adventure starts today! 🎈</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <EmailLogo size={44} />
          </Section>
          <Section style={contentSection}>
            <Heading style={h1}>Welcome, {firstName}! 🎉</Heading>
            <Text style={text}>
              We're thrilled to have you join {SITE_NAME}! Your language adventure starts today.
              {levelLabel
                ? <> You've been placed in <strong>{levelLabel}</strong> — your personalized learning path is ready.</>
                : <> Your personalized learning path is ready.</>}
            </Text>
            <Section style={cardSection}>
              <Text style={cardTitle}>🚀 What's Next?</Text>
              <Text style={cardText}>• Complete your learning profile</Text>
              <Text style={cardText}>• Take a placement test to find your level</Text>
              <Text style={cardText}>• Start your first interactive lesson</Text>
              <Text style={cardText}>• Connect with amazing teachers</Text>
            </Section>
            <Section style={ctaSection}>
              <Button style={button} href="https://engleuphoria.lovable.app/student-dashboard">
                Let's Go!
              </Button>
            </Section>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            {SITE_NAME} — Your English Learning Journey 💙
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: WelcomeStudentEmail,
  subject: '🎈 Welcome to EnglEuphoria! Your language adventure starts today',
  displayName: 'Student welcome',
  previewData: { name: 'Sarah', studentLevel: 'academy' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#0047AB', padding: '32px 24px', textAlign: 'center' as const }
const logoText = { color: '#ffffff', fontSize: '28px', fontWeight: '700' as const, margin: '0' }
const contentSection = { padding: '32px 24px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#111827', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px' }
const cardSection = { backgroundColor: '#eef4fc', padding: '20px', borderRadius: '8px', margin: '0 0 24px' }
const cardTitle = { fontSize: '16px', fontWeight: '600' as const, color: '#0047AB', margin: '0 0 12px' }
const cardText = { fontSize: '14px', color: '#4b5563', margin: '0 0 6px', lineHeight: '1.5' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 24px' }
const button = { backgroundColor: '#0047AB', color: '#ffffff', padding: '14px 32px', borderRadius: '8px', fontWeight: '600' as const, fontSize: '16px', textDecoration: 'none' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#9ca3af', textAlign: 'center' as const, margin: '0' }
