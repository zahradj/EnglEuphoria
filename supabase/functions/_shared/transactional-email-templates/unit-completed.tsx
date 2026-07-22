/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'
const LOGO_WHITE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-white.png'

interface UnitCompletedProps {
  name?: string
  unitName?: string
  unitNumber?: number
  badgeName?: string
  xpEarned?: number
}

const UnitCompletedEmail = ({ name, unitName, unitNumber, badgeName, xpEarned }: UnitCompletedProps) => {
  const studentName = name || 'Student'
  const unit = unitName || `Unit ${unitNumber || '?'}`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Bravo! You just completed {unit} on {SITE_NAME}! 🏆</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Img src={LOGO_WHITE_URL} width="160" height="44" alt={SITE_NAME} style={{ margin: '0 auto', display: 'block' }} />
          </Section>
          <Section style={contentSection}>
            <div style={celebrationBanner}>🏆 🎉 ⭐</div>
            <Heading style={h1}>Bravo, {studentName}!</Heading>
            <Text style={highlightText}>
              You just mastered <strong>{unit}</strong>! That's an incredible achievement.
              {xpEarned ? ` You earned ${xpEarned} XP for your hard work.` : ''}
            </Text>
            {badgeName && (
              <Section style={badgeSection}>
                <Text style={badgeTitle}>🎖️ New Badge Unlocked!</Text>
                <Text style={badgeText}>{badgeName}</Text>
              </Section>
            )}
            <Text style={text}>
              Keep the momentum going! Your next unit is waiting for you. Every lesson brings you closer
              to English fluency.
            </Text>
            <Section style={ctaSection}>
              <Button style={button} href="https://engleuphoria.lovable.app/student-dashboard">
                Check Your Progress Hub
              </Button>
            </Section>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>Keep learning, keep growing!</Text>
          <Text style={footerBrand}>The {SITE_NAME} Team 💙</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: UnitCompletedEmail,
  subject: (data: Record<string, any>) =>
    `🏆 Bravo! You just mastered ${data.unitName || `Unit ${data.unitNumber || ''}`}!`,
  displayName: 'Student unit completed',
  previewData: { name: 'Alex', unitName: 'Colors & Shapes', unitNumber: 3, badgeName: 'Shape Master', xpEarned: 150 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#0047AB', padding: '32px 24px', textAlign: 'center' as const }
const logoText = { color: '#ffffff', fontSize: '28px', fontWeight: '700' as const, margin: '0' }
const contentSection = { padding: '32px 24px' }
const celebrationBanner = { textAlign: 'center' as const, fontSize: '36px', margin: '0 0 16px' }
const h1 = { fontSize: '26px', fontWeight: '700' as const, color: '#111827', margin: '0 0 16px', textAlign: 'center' as const }
const highlightText = { fontSize: '16px', color: '#374151', lineHeight: '1.7', margin: '0 0 20px', backgroundColor: '#eef4fc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #0047AB' }
const text = { fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px' }
const badgeSection = { backgroundColor: '#fef9e7', padding: '16px', borderRadius: '10px', margin: '0 0 20px', textAlign: 'center' as const, border: '1px solid #f5e6a3' }
const badgeTitle = { fontSize: '16px', fontWeight: '600' as const, color: '#92400e', margin: '0 0 4px' }
const badgeText = { fontSize: '18px', fontWeight: '700' as const, color: '#b45309', margin: '0' }
const ctaSection = { textAlign: 'center' as const, margin: '8px 0 24px' }
const button = { backgroundColor: '#0047AB', color: '#ffffff', padding: '14px 36px', borderRadius: '8px', fontWeight: '600' as const, fontSize: '16px', textDecoration: 'none' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#6b7280', textAlign: 'center' as const, margin: '0' }
const footerBrand = { fontSize: '14px', color: '#0047AB', textAlign: 'center' as const, fontWeight: '600' as const, margin: '4px 0 0' }
