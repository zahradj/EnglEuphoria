/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'
const LOGO_WHITE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-white.png'

interface Props {
  studentName?: string
  unitTitle?: string
  stars?: number
  accuracyPct?: number
  masteredCount?: number
  reportUrl: string
}

const ParentUnitReportEmail = ({ studentName, unitTitle, stars, accuracyPct, masteredCount, reportUrl }: Props) => {
  const name = studentName || 'Your child'
  const unit = unitTitle || 'a unit'
  const starRow = '⭐'.repeat(Math.max(0, Math.min(3, stars ?? 0))) || '⭐'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{name} just completed {unit} on {SITE_NAME}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Img src={LOGO_WHITE_URL} width="160" height="44" alt={SITE_NAME} style={{ margin: '0 auto', display: 'block' }} />
          </Section>
          <Section style={contentSection}>
            <div style={{ textAlign: 'center', fontSize: '32px', margin: '0 0 8px' }}>🏆 {starRow}</div>
            <Heading style={h1}>{name} just finished {unit}!</Heading>
            <Text style={highlight}>
              Great news — here's a quick snapshot of the progress report.
            </Text>
            <Section style={statsBox}>
              {typeof accuracyPct === 'number' && (
                <Text style={statLine}><strong>Accuracy:</strong> {Math.round(accuracyPct)}%</Text>
              )}
              {typeof masteredCount === 'number' && (
                <Text style={statLine}><strong>Words mastered:</strong> {masteredCount}</Text>
              )}
              <Text style={statLine}><strong>Stars earned:</strong> {starRow}</Text>
            </Section>
            <Section style={ctaSection}>
              <Button style={button} href={reportUrl}>View the full report</Button>
            </Section>
            <Text style={text}>
              You can view and print this report anytime using the link above.
            </Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>Thank you for supporting {name}'s learning journey.</Text>
          <Text style={footerBrand}>The {SITE_NAME} Team 💙</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: ParentUnitReportEmail,
  subject: (data: Record<string, any>) =>
    `🏆 ${data.studentName || 'Your child'} completed ${data.unitTitle || 'a unit'}!`,
  displayName: 'Parent unit progress report',
  previewData: {
    studentName: 'Alex', unitTitle: 'Colors & Shapes', stars: 3,
    accuracyPct: 92, masteredCount: 12,
    reportUrl: 'https://engleuphoria.lovable.app/reports/demo-token',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#0047AB', padding: '32px 24px', textAlign: 'center' as const }
const contentSection = { padding: '32px 24px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#111827', margin: '0 0 16px', textAlign: 'center' as const }
const highlight = { fontSize: '16px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px', textAlign: 'center' as const }
const statsBox = { backgroundColor: '#eef4fc', padding: '16px 20px', borderRadius: '10px', margin: '0 0 20px', borderLeft: '4px solid #0047AB' }
const statLine = { fontSize: '15px', color: '#111827', margin: '4px 0' }
const text = { fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 8px', textAlign: 'center' as const }
const ctaSection = { textAlign: 'center' as const, margin: '8px 0 20px' }
const button = { backgroundColor: '#0047AB', color: '#ffffff', padding: '14px 32px', borderRadius: '8px', fontWeight: '600' as const, fontSize: '16px', textDecoration: 'none' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#6b7280', textAlign: 'center' as const, margin: '0' }
const footerBrand = { fontSize: '14px', color: '#0047AB', textAlign: 'center' as const, fontWeight: '600' as const, margin: '4px 0 0' }
