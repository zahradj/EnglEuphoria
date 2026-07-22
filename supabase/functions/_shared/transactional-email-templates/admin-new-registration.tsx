/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'
const ADMIN_EMAIL = 'f.zahra.Djaanine@engleuphoria.com'

interface AdminNewRegistrationProps {
  name?: string
  email?: string
  role?: string
  registeredAt?: string
}

const AdminNewRegistrationEmail = ({ name, email, role, registeredAt }: AdminNewRegistrationProps) => {
  const roleEmoji = role === 'teacher' ? '👩‍🏫' : '👨‍🎓'
  const roleLabel = role === 'teacher' ? 'Teacher' : 'Student'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{roleEmoji} New {roleLabel} registration: {name || 'Unknown'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logoText}>{SITE_NAME} Admin</Heading>
          </Section>
          <Section style={contentSection}>
            <Heading style={h1}>{roleEmoji} New {roleLabel} Registration</Heading>
            <Section style={cardSection}>
              <Text style={cardRow}><strong>Name:</strong> {name || 'N/A'}</Text>
              <Text style={cardRow}><strong>Email:</strong> {email || 'N/A'}</Text>
              <Text style={cardRow}><strong>Role:</strong> {roleLabel}</Text>
              <Text style={cardRow}><strong>Registered:</strong> {registeredAt ? new Date(registeredAt).toLocaleString('en-US') : 'Just now'}</Text>
            </Section>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>Automated notification from {SITE_NAME}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AdminNewRegistrationEmail,
  subject: (data: Record<string, any>) => `${data.role === 'teacher' ? '👩‍🏫' : '👨‍🎓'} New ${data.role === 'teacher' ? 'Teacher' : 'Student'} Registration — ${data.name || 'Unknown'}`,
  to: ADMIN_EMAIL,
  displayName: 'Admin: new registration',
  previewData: { name: 'John Doe', email: 'john@example.com', role: 'student', registeredAt: '2025-01-15T10:30:00Z' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#6366f1', padding: '24px', textAlign: 'center' as const }
const logoText = { color: '#ffffff', fontSize: '22px', fontWeight: '700' as const, margin: '0' }
const contentSection = { padding: '32px 24px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#111827', margin: '0 0 20px' }
const cardSection = { backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', margin: '0 0 24px' }
const cardRow = { fontSize: '14px', color: '#374151', margin: '0 0 8px', lineHeight: '1.5' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const, margin: '0' }
