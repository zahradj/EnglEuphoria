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

interface VictoryNotificationProps {
  studentName?: string
  achievementName?: string
  achievementDescription?: string
  rewardType?: string
}

const VictoryNotificationEmail = ({
  studentName,
  achievementName,
  achievementDescription,
  rewardType,
}: VictoryNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>🏆 You've earned a new reward on EnglEuphoria!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerBar} />
        <Section style={logoSection}>
          <Img src={LOGO_URL} width="180" height="50" alt={SITE_NAME} style={logo} />
        </Section>
        <Section style={heroSection}>
          <Heading style={h1}>Victory! 🏆🎉</Heading>
          <Text style={text}>
            {studentName ? `Congratulations, ${studentName}!` : 'Congratulations!'} You've just unlocked a new reward!
          </Text>
          <Section style={rewardBox}>
            <Text style={rewardTitle}>🎖️ {achievementName || 'New Achievement'}</Text>
            <Text style={rewardDesc}>{achievementDescription || 'Keep up the amazing work!'}</Text>
            {rewardType && <Text style={rewardTag}>Reward: {rewardType}</Text>}
          </Section>
          <Text style={text}>
            Head to your dashboard to check out your new achievement and see what's next on your learning journey!
          </Text>
          <Text style={textMuted}>
            Keep pushing — every step brings you closer to mastery.
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
  component: VictoryNotificationEmail,
  subject: '🏆 You earned a new reward on EnglEuphoria!',
  displayName: 'Victory notification',
  previewData: {
    studentName: 'Alex',
    achievementName: 'Grammar Master',
    achievementDescription: 'You completed 10 grammar exercises with 90%+ accuracy!',
    rewardType: 'Golden Badge',
  },
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
const rewardBox = { backgroundColor: '#eef2ff', borderRadius: '8px', padding: '20px', margin: '0 0 20px', border: '1px solid #c7d2fe', textAlign: 'center' as const }
const rewardTitle = { fontSize: '18px', fontWeight: '700' as const, color: '#4f46e5', margin: '0 0 8px' }
const rewardDesc = { fontSize: '14px', color: '#374151', margin: '0 0 8px', lineHeight: '1.5' }
const rewardTag = { fontSize: '12px', color: '#6366f1', fontWeight: '600' as const, margin: '0', textTransform: 'uppercase' as const, letterSpacing: '1px' }
const hr = { borderColor: '#e5e7eb', margin: '20px 25px' }
const darkFooter = { backgroundColor: '#111827', padding: '20px 25px', textAlign: 'center' as const, borderRadius: '0 0 8px 8px' }
const footerText = { fontSize: '12px', color: '#9ca3af', margin: '0', fontWeight: '500' as const }
