/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Row, Column, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'

interface Props {
  teacherName?: string
  weekLabel?: string
  overallKpi?: number
  tierLabel?: string
  trendDelta?: number
  weakestArea?: string
  weakestTip?: string
  dashboardUrl?: string
}

const Email = ({
  teacherName, weekLabel, overallKpi = 0, tierLabel = 'On Track',
  trendDelta = 0, weakestArea, weakestTip, dashboardUrl,
}: Props) => {
  const trendUp = trendDelta > 0;
  const trendDown = trendDelta < 0;
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your weekly performance summary</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logoText}>{SITE_NAME}</Heading>
            <Text style={headerSub}>Weekly performance summary</Text>
          </Section>
          <Section style={contentSection}>
            <Heading style={h1}>Hi{teacherName ? ` ${teacherName}` : ''},</Heading>
            <Text style={text}>
              Here's your snapshot{weekLabel ? ` for week of ${weekLabel}` : ''}.
            </Text>

            <Section style={card}>
              <Row><Column style={label}>Overall KPI</Column>
                <Column style={valueBig}>{Number(overallKpi).toFixed(0)} / 100</Column></Row>
              <Row><Column style={label}>Tier</Column>
                <Column style={value}>{tierLabel}</Column></Row>
              <Row><Column style={label}>Trend (30d)</Column>
                <Column style={{ ...value, color: trendUp ? '#059669' : trendDown ? '#dc2626' : '#4b5563' }}>
                  {trendUp ? '↑' : trendDown ? '↓' : '→'} {Math.abs(trendDelta).toFixed(1)} points
                </Column></Row>
            </Section>

            {weakestArea && (
              <Section style={tipCard}>
                <Text style={{ ...text, margin: 0, fontWeight: '600' as const, color: '#92400e' }}>
                  Focus this week: {weakestArea}
                </Text>
                {weakestTip && <Text style={{ ...text, margin: '4px 0 0', color: '#78350f' }}>{weakestTip}</Text>}
              </Section>
            )}

            {dashboardUrl && (
              <Text style={text}>
                See the full breakdown: <a href={dashboardUrl} style={link}>{dashboardUrl}</a>
              </Text>
            )}
          </Section>
          <Hr style={hr} />
          <Text style={footer}>{SITE_NAME} — Small steps, big fluency.</Text>
        </Container>
      </Body>
    </Html>
  );
}

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `Your weekly KPI: ${Number(d.overallKpi ?? 0).toFixed(0)} / 100`,
  displayName: 'Teacher weekly KPI digest',
  previewData: {
    teacherName: 'Maria', weekLabel: 'Jul 3, 2026', overallKpi: 78,
    tierLabel: 'Strong', trendDelta: 3.2, weakestArea: 'Response Time',
    weakestTip: 'Reply to student messages within 12 hours.',
    dashboardUrl: 'https://engleuphoria.com/teacher/kpi',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#4f46e5', padding: '24px', textAlign: 'center' as const }
const logoText = { color: '#ffffff', fontSize: '22px', fontWeight: '700' as const, margin: '0' }
const headerSub = { color: '#e0e7ff', fontSize: '12px', fontWeight: '500' as const, margin: '4px 0 0', letterSpacing: '0.5px' }
const contentSection = { padding: '28px 24px' }
const h1 = { fontSize: '20px', fontWeight: '700' as const, color: '#111827', margin: '0 0 8px' }
const text = { fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#eef2ff', padding: '16px', borderRadius: '8px', border: '1px solid #c7d2fe', marginBottom: '12px' }
const tipCard = { backgroundColor: '#fef3c7', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fde68a', marginBottom: '16px' }
const label = { fontSize: '11px', color: '#3730a3', fontWeight: '600' as const, width: '110px', textTransform: 'uppercase' as const, letterSpacing: '0.4px' }
const value = { fontSize: '14px', color: '#111827', fontWeight: '500' as const }
const valueBig = { fontSize: '20px', color: '#4f46e5', fontWeight: '700' as const }
const link = { color: '#4f46e5', textDecoration: 'underline' }
const hr = { borderColor: '#e5e7eb', margin: '0 24px' }
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const, margin: '16px 0' }
