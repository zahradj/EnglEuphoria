/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Row, Column, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'

interface Props {
  teacherName?: string
  amount?: number
  currency?: string
  periodStart?: string
  periodEnd?: string
  ratePct?: number
  notes?: string
  dashboardUrl?: string
}

const Email = ({
  teacherName, amount = 0, currency = 'USD', periodStart, periodEnd,
  ratePct, notes, dashboardUrl,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your KPI bonus has been approved</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>{SITE_NAME}</Heading>
          <Text style={headerSub}>Bonus approved 🎉</Text>
        </Section>
        <Section style={contentSection}>
          <Heading style={h1}>Great work{teacherName ? `, ${teacherName}` : ''}!</Heading>
          <Text style={text}>
            Your KPI-driven bonus has been approved and will be paid with your next payout.
          </Text>
          <Section style={card}>
            <Row><Column style={label}>Amount</Column>
              <Column style={valueBig}>{currency} {Number(amount).toFixed(2)}</Column></Row>
            {ratePct != null && (
              <Row><Column style={label}>Rate</Column>
                <Column style={value}>{Number(ratePct).toFixed(0)}% of period earnings</Column></Row>
            )}
            {(periodStart && periodEnd) && (
              <Row><Column style={label}>Period</Column>
                <Column style={value}>{periodStart} → {periodEnd}</Column></Row>
            )}
            {notes && (
              <Row><Column style={label}>Notes</Column>
                <Column style={value}>{notes}</Column></Row>
            )}
          </Section>
          {dashboardUrl && (
            <Text style={text}>Track your KPI: <a href={dashboardUrl} style={link}>{dashboardUrl}</a></Text>
          )}
        </Section>
        <Hr style={hr} />
        <Text style={footer}>{SITE_NAME} — Keep it up.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `Bonus approved — ${d.currency ?? 'USD'} ${Number(d.amount ?? 0).toFixed(2)}`,
  displayName: 'Teacher bonus approved',
  previewData: {
    teacherName: 'Maria', amount: 42.5, currency: 'USD',
    periodStart: '2026-06-03', periodEnd: '2026-07-03', ratePct: 13,
    notes: 'KPI bonus 2026-06-03 → 2026-07-03: Excellent base 10% + 3% kickers (Attendance, Quality, Feedback) = 13% × 327.00 earnings',
    dashboardUrl: 'https://engleuphoria.com/teacher/kpi',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#059669', padding: '24px', textAlign: 'center' as const }
const logoText = { color: '#ffffff', fontSize: '22px', fontWeight: '700' as const, margin: '0' }
const headerSub = { color: '#d1fae5', fontSize: '12px', fontWeight: '500' as const, margin: '4px 0 0', letterSpacing: '0.5px' }
const contentSection = { padding: '28px 24px' }
const h1 = { fontSize: '20px', fontWeight: '700' as const, color: '#111827', margin: '0 0 8px' }
const text = { fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#ecfdf5', padding: '16px', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '16px' }
const label = { fontSize: '11px', color: '#065f46', fontWeight: '600' as const, width: '90px', textTransform: 'uppercase' as const, letterSpacing: '0.4px' }
const value = { fontSize: '14px', color: '#111827', fontWeight: '500' as const }
const valueBig = { fontSize: '20px', color: '#059669', fontWeight: '700' as const }
const link = { color: '#059669', textDecoration: 'underline' }
const hr = { borderColor: '#e5e7eb', margin: '0 24px' }
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const, margin: '16px 0' }
