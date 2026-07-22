/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_WHITE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-white.png'
const LOGO_BLACK_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-black.png'

interface TeacherWelcomeApprovedProps {
  name?: string
  setPasswordUrl?: string
}

function TeacherWelcomeApproved({
  name = 'Teacher',
  setPasswordUrl = '#',
}: TeacherWelcomeApprovedProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to the EnglEuphoria Family! 🌟</Preview>
      <Body style={{ margin: '0', padding: '0', background: '#f4f5f7', fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          {/* Navy Header — white logo on dark background */}
          <Section style={{ background: '#0047AB', padding: '28px 32px', textAlign: 'center' as const }}>
            <Img src={LOGO_WHITE_URL} width="160" height="44" alt="EnglEuphoria" style={{ margin: '0 auto', display: 'block' }} />
          </Section>
          {/* Gold Seal — light background */}
          <Section style={{ background: '#FFF8E1', padding: '12px 32px', textAlign: 'center' as const, borderBottom: '2px solid #F9A825' }}>
            <Text style={{ fontSize: '14px', fontWeight: '700', color: '#F57F17', letterSpacing: '2px', textTransform: 'uppercase' as const, margin: '0' }}>🌟 WELCOME TO THE FAMILY</Text>
          </Section>
          {/* Content */}
          <Section style={{ padding: '32px' }}>
            <Text style={{ fontSize: '18px', fontWeight: '700', color: '#0047AB', margin: '0 0 16px' }}>Congratulations, {name}! 🎓</Text>
            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: '1.7', margin: '0 0 16px' }}>
              Your application stands out among many talented educators. After careful review, our Academic Committee has selected you to join the <strong>EnglEuphoria Pedagogical Team</strong>.
            </Text>
            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: '1.7', margin: '0 0 24px' }}>
              Click below to create your account and begin your onboarding journey. You'll gain access to your <strong>Professional Hub</strong>, the <strong>II Wizard ecosystem</strong>, and your personal interview room.
            </Text>
            {/* CTA Button */}
            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <a href={setPasswordUrl} style={{ background: '#0047AB', color: '#ffffff', fontSize: '16px', fontWeight: '600', borderRadius: '8px', padding: '16px 36px', textDecoration: 'none', display: 'inline-block' }}>
                Accept Invitation & Set Password
              </a>
            </Section>
            {/* Roadmap */}
            <Section style={{ background: '#F5F5F5', borderRadius: '10px', padding: '20px 24px', margin: '24px 0', border: '1px solid #E0E0E0' }}>
              <Text style={{ fontSize: '16px', fontWeight: '700', color: '#0047AB', margin: '0 0 12px' }}>📋 Your Onboarding Roadmap</Text>
              <Text style={{ fontSize: '14px', color: '#455A64', lineHeight: '1.6', margin: '0 0 6px' }}>✅ <strong>Step 1:</strong> Set your password (click the button above)</Text>
              <Text style={{ fontSize: '14px', color: '#455A64', lineHeight: '1.6', margin: '0 0 6px' }}>📝 <strong>Step 2:</strong> Complete your professional profile</Text>
              <Text style={{ fontSize: '14px', color: '#455A64', lineHeight: '1.6', margin: '0 0 6px' }}>🎥 <strong>Step 3:</strong> Upload your intro video</Text>
              <Text style={{ fontSize: '14px', color: '#455A64', lineHeight: '1.6', margin: '0' }}>🚀 <strong>Step 4:</strong> Final review & activation</Text>
            </Section>
            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: '1.7', margin: '24px 0 4px' }}>Warm regards,</Text>
            <Text style={{ fontSize: '14px', color: '#0047AB', fontWeight: '600', margin: '0 0 4px' }}>The EnglEuphoria Academic Committee</Text>
            <Text style={{ fontSize: '12px', color: '#78909C', fontStyle: 'italic', margin: '0' }}>Precision in Phonics. Excellence in Education.</Text>
          </Section>
          {/* Dark Footer — white logo on dark background */}
          <Section style={{ background: '#0D1642', padding: '24px 32px', textAlign: 'center' as const }}>
            <Img src={LOGO_WHITE_URL} width="100" height="28" alt="EnglEuphoria" style={{ margin: '0 auto 12px', display: 'block' }} />
            <Text style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 8px' }}>© 2026 EnglEuphoria. The Future of Learning.</Text>
            <Text style={{ fontSize: '11px', color: '#6B7280', margin: '0', lineHeight: '1.5', fontStyle: 'italic' }}>"Progress is a marathon, not a sprint. We celebrate every sound, every word, and every step."</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template: TemplateEntry = {
  component: TeacherWelcomeApproved,
  subject: 'Welcome to the EnglEuphoria Family! 🌟',
  displayName: 'Teacher Welcome (Approved)',
  previewData: {
    name: 'Jane Doe',
    setPasswordUrl: 'https://engleuphoria.lovable.app/set-password',
  },
}
