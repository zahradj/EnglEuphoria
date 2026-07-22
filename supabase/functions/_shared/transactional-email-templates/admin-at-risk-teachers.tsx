/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body, Container, Head, Heading, Hr, Html, Preview, Row, Column, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'

interface AtRiskTeacher {
  name: string
  email?: string
  teacherId?: string
  overallScore: number
  consecutiveWeeks: number
  weakestSubScore?: string
}

interface Props {
  weekLabel?: string
  teachers?: AtRiskTeacher[]
  dashboardUrl?: string
}

const Email = ({ weekLabel, teachers = [], dashboardUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{teachers.length} teacher(s) at risk this week</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>{SITE_NAME}</Heading>
          <Text style={headerSub}>Teacher KPI · At-Risk Digest</Text>
        </Section>

        <Section style={contentSection}>
          <Heading style={h1}>Weekly at-risk report</Heading>
          <Text style={text}>
            {weekLabel ? `Week of ${weekLabel}. ` : ''}
            {teachers.length === 0
              ? 'Great news — no teachers are flagged as at-risk this week.'
              : `${teachers.length} teacher${teachers.length === 1 ? ' is' : 's are'} scoring below 55 KPI and may need coaching.`}
          </Text>

          {teachers.map((t, i) => {
            const deepLink = t.teacherId && dashboardUrl
              ? `${dashboardUrl}?teacher=${encodeURIComponent(t.teacherId)}`
              : null;
            return (
              <Section key={i} style={cardSection}>
                <Row style={cardRowWrap}>
                  <Column style={cardLabel}>Teacher</Column>
                  <Column style={cardValue}>
                    {deepLink ? <a href={deepLink} style={link}>{t.name}</a> : t.name}
                    {t.email ? ` · ${t.email}` : ''}
                  </Column>
                </Row>
                <Row style={cardRowWrap}>
                  <Column style={cardLabel}>KPI</Column>
                  <Column style={{ ...cardValue, color: '#dc2626', fontWeight: '700' as const }}>
                    {t.overallScore}/100
                  </Column>
                </Row>
                <Row style={cardRowWrap}>
                  <Column style={cardLabel}>Weeks Low</Column>
                  <Column style={cardValue}>{t.consecutiveWeeks}</Column>
                </Row>
                {t.weakestSubScore && (
                  <Row style={cardRowWrap}>
                    <Column style={cardLabel}>Weakest</Column>
                    <Column style={cardValue}>{t.weakestSubScore}</Column>
                  </Row>
                )}
                {deepLink && (
                  <Row style={cardRowWrap}>
                    <Column style={cardLabel}></Column>
                    <Column style={cardValue}>
                      <a href={deepLink} style={link}>Open profile →</a>
                    </Column>
                  </Row>
                )}
              </Section>
            );
          })}

          {dashboardUrl && (
            <Text style={{ ...text, marginTop: '20px' }}>
              Open the full dashboard: <a href={dashboardUrl} style={link}>{dashboardUrl}</a>
            </Text>
          )}
        </Section>

        <Hr style={hr} />
        <Text style={footer}>{SITE_NAME} — Automated admin digest</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `[At-Risk] ${(data.teachers?.length ?? 0)} teacher(s) need attention this week`,
  displayName: 'Admin at-risk teachers digest',
  previewData: {
    weekLabel: 'Jan 20, 2026',
    dashboardUrl: 'https://engleuphoria.com/admin/teacher-kpi',
    teachers: [
      { name: 'Maria', email: 'maria@example.com', overallScore: 48, consecutiveWeeks: 3, weakestSubScore: 'Attendance' },
      { name: 'John', email: 'john@example.com', overallScore: 52, consecutiveWeeks: 2, weakestSubScore: 'Quality' },
    ],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#111827', padding: '24px', textAlign: 'center' as const }
const logoText = { color: '#ffffff', fontSize: '22px', fontWeight: '700' as const, margin: '0' }
const headerSub = { color: '#9ca3af', fontSize: '12px', fontWeight: '500' as const, margin: '4px 0 0', letterSpacing: '0.5px' }
const contentSection = { padding: '28px 24px' }
const h1 = { fontSize: '20px', fontWeight: '700' as const, color: '#111827', margin: '0 0 8px' }
const text = { fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px' }
const cardSection = { backgroundColor: '#fef2f2', padding: '16px 18px', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '12px' }
const cardRowWrap = { marginBottom: '4px' }
const cardLabel = { fontSize: '11px', color: '#6b7280', fontWeight: '600' as const, width: '90px', verticalAlign: 'top' as const, textTransform: 'uppercase' as const, letterSpacing: '0.4px' }
const cardValue = { fontSize: '14px', color: '#111827', fontWeight: '500' as const, lineHeight: '1.5' }
const link = { color: '#2563eb', textDecoration: 'underline' }
const hr = { borderColor: '#e5e7eb', margin: '0 24px' }
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const, margin: '16px 0' }
