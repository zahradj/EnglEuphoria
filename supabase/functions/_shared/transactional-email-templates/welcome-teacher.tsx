/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'
const LOGO_WHITE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-white.png'

interface WelcomeTeacherProps {
  name?: string
}

const WelcomeTeacherEmail = ({ name }: WelcomeTeacherProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Congratulations! Welcome to the {SITE_NAME} Family 🌟</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src={LOGO_WHITE_URL} width="160" height="44" alt={SITE_NAME} style={{ margin: '0 auto', display: 'block' }} />
          <Text style={headerSubtitle}>Teaching Excellence Community</Text>
        </Section>
        <Section style={contentSection}>
          <div style={celebrationBanner}>🌟 🎓 🌟</div>
          <Heading style={h1}>Congratulations, {name || 'Teacher'}!</Heading>
          <Text style={highlightText}>
            We were highly impressed by your application. You are one step closer to joining our elite team of educators who are transforming the way English is learned around the world.
          </Text>
          <Text style={text}>
            Welcome to the {SITE_NAME} family! We are thrilled to have you on board. Your expertise and passion for teaching will make a real difference in our students' lives.
          </Text>
          <Section style={cardSection}>
            <Text style={cardTitle}>🚀 Your Onboarding Journey</Text>
            <Text style={cardText}>✅ Application Approved — You made it!</Text>
            <Text style={cardText}>📋 Complete Your Professional Profile</Text>
            <Text style={cardText}>📸 Upload your headshot, bio & certificates</Text>
            <Text style={cardText}>🎬 Add your introduction video</Text>
            <Text style={cardText}>🏫 Start accepting students!</Text>
          </Section>
          <Section style={ctaSection}>
            <Button style={button} href="https://engleuphoria.lovable.app/teacher-application">
              Set Up Your Profile
            </Button>
          </Section>
          <Text style={motivationText}>
            "The best teachers don't give you the answer — they spark the desire to find it yourself."
          </Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>With gratitude,</Text>
        <Text style={footerBrand}>The {SITE_NAME} Team 💙</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeTeacherEmail,
  subject: '🌟 Congratulations! Welcome to the EnglEuphoria Family!',
  displayName: 'Teacher welcome (congratulatory)',
  previewData: { name: 'Maria' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#0047AB', padding: '40px 24px 32px', textAlign: 'center' as const }
const logoText = { color: '#ffffff', fontSize: '32px', fontWeight: '700' as const, margin: '0' }
const headerSubtitle = { color: '#a8c8f0', fontSize: '13px', margin: '8px 0 0', letterSpacing: '1px', textTransform: 'uppercase' as const }
const contentSection = { padding: '32px 24px' }
const celebrationBanner = { textAlign: 'center' as const, fontSize: '32px', margin: '0 0 16px' }
const h1 = { fontSize: '26px', fontWeight: '700' as const, color: '#111827', margin: '0 0 16px', textAlign: 'center' as const }
const highlightText = { fontSize: '16px', color: '#4b5563', lineHeight: '1.7', margin: '0 0 20px', backgroundColor: '#eef4fc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #0047AB' }
const text = { fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px' }
const cardSection = { backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', margin: '0 0 24px', border: '1px solid #e5e7eb' }
const cardTitle = { fontSize: '17px', fontWeight: '600' as const, color: '#0047AB', margin: '0 0 14px' }
const cardText = { fontSize: '14px', color: '#4b5563', margin: '0 0 8px', lineHeight: '1.6' }
const ctaSection = { textAlign: 'center' as const, margin: '8px 0 28px' }
const button = { backgroundColor: '#0047AB', color: '#ffffff', padding: '16px 40px', borderRadius: '8px', fontWeight: '600' as const, fontSize: '16px', textDecoration: 'none' }
const motivationText = { fontSize: '14px', color: '#9ca3af', lineHeight: '1.6', fontStyle: 'italic' as const, textAlign: 'center' as const, margin: '0 0 8px', padding: '0 16px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#6b7280', textAlign: 'center' as const, margin: '0' }
const footerBrand = { fontSize: '14px', color: '#0047AB', textAlign: 'center' as const, fontWeight: '600' as const, margin: '4px 0 0' }
