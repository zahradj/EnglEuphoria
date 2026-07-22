/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Row, Column, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'

interface Props {
  teacherName?: string
  reason?: string
  periodStart?: string
  periodEnd?: string
  dashboardUrl?: string
}

const Email = ({ teacherName, reason, periodStart, periodEnd, dashboardUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Bonus request update</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>{SITE_NAME}</Heading>
          <Text style={headerSub}>Bonus request update</Text>
        </Section>
        <Section style={contentSection}>
          <Heading style={h1}>Hi{teacherName ? ` ${teacherName}` : ''},</Heading>
          <Text style={text}>
            A KPI bonus that was queued for you was not approved this cycle.
            This is not a penalty — it usually means the review criteria for this
            period weren't fully met yet. Keep going, next period resets the counter.
          </Text>
          {(periodStart && periodEnd) && (
            <Section style={card}>
              <Row><Column style={label}>Period</Column>
                <Column style={value}>{periodStart} → {periodEnd}</Column></Row>
              {reason && (
                <Row><Column style={label}>Notes</Column>
                  <Column style={value}>{reason}</Column></Row>
              )}
            </Section>
          )}
          {dashboardUrl && (
            <Text style={text}>
              See what to focus on next: <a href={dashboardUrl} style={link}>{dashboardUrl}</a>
            </Text>
          )}
        </Section>
        <Hr style={hr} />
        <Text style={footer}>{SITE_NAME} — We're rooting for you.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Bonus request update',
  displayName: 'Teacher bonus not approved',
  previewData: {
    teacherName: 'Maria', reason: 'Below threshold for this cycle',
    periodStart: '2026-06-03', periodEnd: '2026-07-03',
    dashboardUrl: 'https://engleuphoria.com/teacher/kpi',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#334155', padding: '24px', textAlign: 'center' as const }
const logoText = { color: '#ffffff', fontSize: '22px', fontWeight: '700' as const, margin: '0' }
const headerSub = { color: '#cbd5e1', fontSize: '12px', fontWeight: '500' as const, margin: '4px 0 0', letterSpacing: '0.5px' }
const contentSection = { padding: '28px 24px' }
const h1 = { fontSize: '20px', fontWeight: '700' as const, color: '#111827', margin: '0 0 8px' }
const text = { fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }
const label = { fontSize: '11px', color: '#475569', fontWeight: '600' as const, width: '90px', textTransform: 'uppercase' as const, letterSpacing: '0.4px' }
const value = { fontSize: '14px', color: '#111827', fontWeight: '500' as const }
const link = { color: '#2563eb', textDecoration: 'underline' }
const hr = { borderColor: '#e5e7eb', margin: '0 24px' }
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const, margin: '16px 0' }
