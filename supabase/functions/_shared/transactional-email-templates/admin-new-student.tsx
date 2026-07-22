/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'EnglEuphoria'
const ADMIN_EMAIL = 'f.zahra.Djaanine@engleuphoria.com'

interface AdminNewStudentProps {
  studentName?: string
  studentEmail?: string
  studentId?: string
}

const AdminNewStudentEmail = ({ studentName, studentEmail, studentId }: AdminNewStudentProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New student registered: {studentName || 'Unknown'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>{SITE_NAME} Admin</Heading>
        </Section>
        <Section style={contentSection}>
          <Heading style={h1}>🎉 New Student Registered</Heading>
          <Section style={cardSection}>
            <Text style={cardRow}><strong>Name:</strong> {studentName || 'N/A'}</Text>
            <Text style={cardRow}><strong>Email:</strong> {studentEmail || 'N/A'}</Text>
          </Section>
          {studentId && (
            <Section style={ctaSection}>
              <Button style={button} href={`https://engleuphoria.lovable.app/admin?tab=students&student_id=${studentId}`}>
                View Student Profile
              </Button>
            </Section>
          )}
        </Section>
        <Hr style={hr} />
        <Text style={footer}>Automated notification from {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminNewStudentEmail,
  subject: (data: Record<string, any>) => `👨‍🎓 New Student: ${data.studentName || 'Unknown'}`,
  to: ADMIN_EMAIL,
  displayName: 'Admin: new student',
  previewData: { studentName: 'Jane Smith', studentEmail: 'jane@example.com', studentId: 'abc123' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#6366f1', padding: '24px', textAlign: 'center' as const }
const logoText = { color: '#ffffff', fontSize: '22px', fontWeight: '700' as const, margin: '0' }
const contentSection = { padding: '32px 24px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#111827', margin: '0 0 20px' }
const cardSection = { backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', margin: '0 0 24px' }
const cardRow = { fontSize: '14px', color: '#374151', margin: '0 0 8px', lineHeight: '1.5' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 24px' }
const button = { backgroundColor: '#7c3aed', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', fontWeight: '600' as const, fontSize: '14px', textDecoration: 'none' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const, margin: '0' }
