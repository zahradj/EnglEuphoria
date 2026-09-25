/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Html, Img, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { EmailLogo } from './emailBranding.tsx'

type Hub = 'playground' | 'academy' | 'success'

interface Props {
  studentName?: string
  teacherName?: string
  lessonDateLabel?: string
  lessonTimeLabel?: string
  joinLink?: string
  hub?: Hub
}

// Palette matches the real, currently-live hub theme in
// src/pages/placement/PlacementChoice.tsx (hubTheme / DEFAULT_AVATAR) --
// same mascots (Pip/Nova/Atlas), same orange-amber / violet-fuchsia /
// emerald-teal families, rather than a separately invented email palette.
const PALETTES: Record<Hub, { primary: string; soft: string; footer: string; text: string; mascotUrl: string; mascotName: string }> = {
  playground: {
    primary: '#f97316', soft: '#fff7ed', footer: '#7c2d12', text: '#ea580c',
    mascotUrl: 'https://www.engleuphoria.com/mascots/pip-fox-welcome.png', mascotName: 'Pip',
  },
  academy: {
    primary: '#7c3aed', soft: '#f5f3ff', footer: '#2e1065', text: '#6d28d9',
    mascotUrl: 'https://www.engleuphoria.com/mascots/nova-owl-welcome.png', mascotName: 'Nova',
  },
  success: {
    primary: '#059669', soft: '#ecfdf5', footer: '#022c22', text: '#047857',
    mascotUrl: 'https://www.engleuphoria.com/mascots/atlas-falcon-welcome.png', mascotName: 'Atlas',
  },
}

function ClassroomInvitation({
  studentName = 'there',
  teacherName = 'your teacher',
  lessonDateLabel = '',
  lessonTimeLabel = '',
  joinLink = '#',
  hub = 'academy',
}: Props) {
  const palette = PALETTES[hub] || PALETTES.academy

  return (
    <Html lang="en">
      <Head />
      <Preview>Your English lesson with {teacherName} — tap to join</Preview>
      <Body style={{ margin: 0, padding: 0, background: '#f4f5f7', fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <Section style={{ background: palette.primary, padding: '28px 32px', textAlign: 'center' as const }}>
            <Img
              src={palette.mascotUrl}
              width={88}
              height={88}
              alt={palette.mascotName}
              style={{ margin: '0 auto', display: 'block', borderRadius: '999px', border: '3px solid rgba(255,255,255,0.85)', objectFit: 'cover' as const }}
            />
          </Section>
          <Section style={{ padding: '32px' }}>
            <Text style={{ fontSize: '16px', fontWeight: 600, color: palette.text, margin: '0 0 20px' }}>Hi {studentName},</Text>
            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: 1.7, margin: '0 0 16px' }}>
              {teacherName} has scheduled your English lesson{lessonDateLabel ? ` for ${lessonDateLabel}` : ''}{lessonTimeLabel ? ` at ${lessonTimeLabel}` : ''}.
            </Text>
            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: 1.7, margin: '0 0 24px' }}>
              No password or account setup needed — just tap the button below when it's time for class, and you'll be taken straight into the live classroom.
            </Text>

            <Section style={{ background: palette.soft, borderRadius: '10px', padding: '16px 24px', margin: '0 0 24px', borderLeft: `4px solid ${palette.primary}` }}>
              <Text style={{ fontSize: '14px', color: palette.text, fontWeight: 700, margin: '0 0 4px' }}>Lesson time</Text>
              <Text style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>
                {lessonDateLabel || 'TBD'}{lessonTimeLabel ? ` at ${lessonTimeLabel}` : ''}
              </Text>
            </Section>

            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <a href={joinLink} style={{ background: palette.primary, color: '#ffffff', fontSize: '15px', fontWeight: 600, borderRadius: '8px', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
                Join Your Classroom
              </a>
            </Section>

            <Text style={{ fontSize: '13px', color: '#78909C', lineHeight: 1.6, margin: '0 0 24px', textAlign: 'center' as const }}>
              This link is unique to you — please don't share it. It works for your scheduled lesson time.
            </Text>

            <Text style={{ fontSize: '15px', color: '#37474F', lineHeight: 1.7, margin: '24px 0 4px' }}>{palette.mascotName} and the team can't wait to see you!</Text>
            <Text style={{ fontSize: '14px', color: palette.text, fontWeight: 600, margin: 0 }}>The EnglEuphoria Team</Text>
          </Section>
          <Section style={{ background: palette.footer, padding: '24px 32px', textAlign: 'center' as const }}>
            <EmailLogo variant="white" size={28} style={{ marginBottom: '10px' }} />
            <Text style={{ fontSize: '12px', color: '#d1d5db', margin: 0 }}>© 2026 EnglEuphoria. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template: TemplateEntry = {
  component: ClassroomInvitation,
  subject: (data: Record<string, any>) => `Your lesson with ${data?.teacherName || 'your teacher'} — join here`,
  displayName: 'Classroom Invitation',
  previewData: {
    studentName: 'Amina',
    teacherName: 'Ms. Sarah',
    lessonDateLabel: 'Thursday, October 2',
    lessonTimeLabel: '18:00',
    joinLink: 'https://engleuphoria.com/join-classroom/sample-token',
    hub: 'playground',
  },
}
