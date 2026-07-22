/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'
const LOGO_WHITE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-white.png'

interface ProfileApprovedProps {
  name?: string
}

const ProfileApprovedEmail = ({ name }: ProfileApprovedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're Live on {SITE_NAME}! Your profile has been approved 🚀</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src={LOGO_WHITE_URL} width="160" height="44" alt={SITE_NAME} style={{ margin: '0 auto', display: 'block' }} />
          <Text style={headerSubtitle}>Teaching Excellence Community</Text>
        </Section>
        <Section style={contentSection}>
          <div style={celebrationBanner}>🚀 🎉 🌟</div>
          <Heading style={h1}>You're Live, {name || 'Teacher'}!</Heading>
          <Text style={highlightText}>
            Great news! Your professional profile has been reviewed and <strong>approved</strong> by our team.
            You are now visible to students and ready to start teaching on {SITE_NAME}.
          </Text>
          <Text style={text}>
            Students can now discover your profile, view your introduction video, and book lessons with you.
            Make sure your availability is up to date so students can find the perfect time to learn with you.
          </Text>
          <Section style={cardSection}>
            <Text style={cardTitle}>✅ What You Can Do Now</Text>
            <Text style={cardText}>📅 Set your teaching availability</Text>
            <Text style={cardText}>📚 Browse and prepare lesson materials</Text>
            <Text style={cardText}>🎯 Start accepting student bookings</Text>
            <Text style={cardText}>💬 Join the teacher community</Text>
          </Section>
          <Section style={ctaSection}>
            <Button style={button} href="https://engleuphoria.lovable.app/teacher-dashboard">
              Go to Your Dashboard
            </Button>
          </Section>
          <Text style={motivationText}>
            "Teaching is the greatest act of optimism." — We're so glad you're here!
          </Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>With excitement,</Text>
        <Text style={footerBrand}>The {SITE_NAME} Team 💙</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ProfileApprovedEmail,
  subject: "🚀 You're Live! Your EnglEuphoria Profile is Approved",
  displayName: 'Teacher profile approved',
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
const highlightText = { fontSize: '16px', color: '#374151', lineHeight: '1.7', margin: '0 0 20px', backgroundColor: '#eef4fc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #0047AB' }
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
