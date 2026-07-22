/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-black.png'
const SITE_NAME = 'EnglEuphoria'

interface SkillScore {
  name: string
  score: number
  status: string
  observation: string
}

interface UnitMasteryReportProps {
  studentName?: string
  unitName?: string
  overallScore?: number
  phonicsSummary?: string
  vocabularyCount?: number
  vocabularyWords?: string[]
  grammarPattern?: string
  realWorldWin?: string
  homeActivity?: string
  skillScores?: SkillScore[]
  teacherWin?: string
  teacherWork?: string
}

const statusIcon = (status: string) => {
  switch (status) {
    case 'mastered': return '✅'
    case 'excellent': return '⭐'
    case 'developing': return '📈'
    case 'active': return '🗣️'
    case 'needs_review': return '🔄'
    default: return '📊'
  }
}

const UnitMasteryReportEmail = ({
  studentName,
  unitName,
  overallScore,
  phonicsSummary,
  vocabularyCount,
  vocabularyWords,
  grammarPattern,
  realWorldWin,
  homeActivity,
  skillScores,
  teacherWin,
  teacherWork,
}: UnitMasteryReportProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>🏆 {studentName || 'Your child'} mastered the {unitName || 'Unit'} — see their progress report!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerBar} />
        <Section style={logoSection}>
          <Img src={LOGO_URL} width="180" height="50" alt={SITE_NAME} style={logo} />
        </Section>

        {/* Victory Header */}
        <Section style={heroSection}>
          <Text style={victoryBadge}>🏆</Text>
          <Heading style={h1}>Unit Mastery Achievement!</Heading>
          <Text style={text}>
            Congratulations! {studentName || 'Your child'} has successfully completed the <strong>{unitName || 'Unit'}</strong> with a score of <strong>{overallScore ?? 0}%</strong>.
          </Text>
        </Section>

        {/* Skill Breakdown Table */}
        {skillScores && skillScores.length > 0 && (
          <Section style={sectionBox}>
            <Heading style={h2}>📊 Skill Breakdown</Heading>
            {skillScores.map((skill, i) => (
              <Section key={i} style={skillRow}>
                <Text style={skillName}>
                  {statusIcon(skill.status)} <strong>{skill.name}</strong> — {skill.score}%
                </Text>
                <Text style={skillObservation}>{skill.observation}</Text>
              </Section>
            ))}
          </Section>
        )}

        {/* Phonics & Vocabulary */}
        <Section style={sectionBox}>
          <Heading style={h2}>🔤 Phonics & Vocabulary</Heading>
          {phonicsSummary && (
            <Text style={text}>
              <strong>Phonics:</strong> {phonicsSummary}
            </Text>
          )}
          <Text style={text}>
            <strong>Vocabulary:</strong> {studentName || 'Your child'} learned {vocabularyCount ?? 0} new words in this unit.
          </Text>
          {vocabularyWords && vocabularyWords.length > 0 && (
            <Text style={vocabList}>
              {vocabularyWords.join(' • ')}
            </Text>
          )}
          {grammarPattern && (
            <Text style={text}>
              <strong>Grammar:</strong> Can now use: <em>"{grammarPattern}"</em>
            </Text>
          )}
        </Section>

        {/* Real-World Win */}
        {realWorldWin && (
          <Section style={highlightBox}>
            <Text style={highlightIcon}>🌟</Text>
            <Heading style={h2}>The Real-World Win</Heading>
            <Text style={highlightText}>{realWorldWin}</Text>
          </Section>
        )}

        {/* Voice of the Teacher */}
        {(teacherWin || teacherWork) && (
          <Section style={sectionBox}>
            <Heading style={h2}>🎙️ Voice of the Teacher</Heading>
            {teacherWin && (
              <Text style={text}>
                <strong>The Win:</strong> "{teacherWin}"
              </Text>
            )}
            {teacherWork && (
              <Text style={text}>
                <strong>Next Focus:</strong> "{teacherWork}"
              </Text>
            )}
          </Section>
        )}

        {/* Home Activity Mission */}
        {homeActivity && (
          <Section style={missionBox}>
            <Heading style={h2}>🏠 Home Activity Mission</Heading>
            <Text style={missionText}>{homeActivity}</Text>
          </Section>
        )}

        <Hr style={hr} />
        <Section style={darkFooter}>
          <Text style={footerText}>© 2026 {SITE_NAME}. The Future of Learning.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: UnitMasteryReportEmail,
  subject: (data: Record<string, any>) =>
    `🏆 ${data.studentName || 'Your child'} mastered ${data.unitName || 'the Unit'}!`,
  displayName: 'Unit mastery report (parent)',
  previewData: {
    studentName: 'Alex',
    unitName: 'Animals (Level 1)',
    overallScore: 85,
    phonicsSummary: 'Mastered the short /a/ sound today!',
    vocabularyCount: 15,
    vocabularyWords: ['cat', 'dog', 'bird', 'fish', 'frog', 'rabbit', 'horse', 'cow', 'pig', 'duck', 'lion', 'tiger', 'bear', 'monkey', 'elephant'],
    grammarPattern: 'It is a big dog.',
    realWorldWin: 'They are now able to ask: "What is it?" in English!',
    homeActivity: 'This week, ask your child "What is it?" when you see animals in books or on TV. Encourage them to answer with: "It is a [Color] [Animal]."',
    skillScores: [
      { name: 'Phonics', score: 95, status: 'mastered', observation: 'Can perfectly isolate the short /a/ and /i/ sounds.' },
      { name: 'Vocabulary', score: 87, status: 'excellent', observation: 'Recognized all 15 animals; correctly named 13/15 independently.' },
      { name: 'Grammar', score: 75, status: 'developing', observation: 'Uses "It is a..." correctly. Occasionally forgets "s" for plurals.' },
      { name: 'Speaking', score: 90, status: 'active', observation: 'Successfully asked "What is it?" during shop simulation.' },
    ],
    teacherWin: 'Alex was very excited during the Magic Pencil Case game and spoke with great confidence!',
    teacherWork: 'We will continue to spiral back to the short e sound in the next unit to ensure total accuracy.',
  },
} satisfies TemplateEntry

// ============= STYLES =============
const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerBar = { backgroundColor: '#4f46e5', height: '4px' }
const logoSection = { padding: '30px 25px 10px', textAlign: 'center' as const }
const logo = { margin: '0 auto' }
const heroSection = { padding: '10px 25px 20px', textAlign: 'center' as const }
const victoryBadge = { fontSize: '48px', margin: '0 0 8px', lineHeight: '1' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#4f46e5', margin: '0 0 16px', lineHeight: '1.3' }
const h2 = { fontSize: '18px', fontWeight: '600' as const, color: '#1f2937', margin: '0 0 12px', lineHeight: '1.3' }
const text = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 12px' }
const sectionBox = { backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', margin: '0 25px 16px', border: '1px solid #e5e7eb' }
const highlightBox = { backgroundColor: '#fef3c7', borderRadius: '8px', padding: '20px', margin: '0 25px 16px', border: '1px solid #fcd34d', textAlign: 'center' as const }
const highlightIcon = { fontSize: '32px', margin: '0 0 4px', lineHeight: '1' }
const highlightText = { fontSize: '15px', color: '#92400e', lineHeight: '1.6', margin: '0', fontWeight: '500' as const }
const missionBox = { backgroundColor: '#eff6ff', borderRadius: '8px', padding: '20px', margin: '0 25px 16px', border: '1px solid #bfdbfe' }
const missionText = { fontSize: '14px', color: '#1e40af', lineHeight: '1.6', margin: '0' }
const skillRow = { margin: '0 0 10px', padding: '0 0 10px', borderBottom: '1px solid #e5e7eb' }
const skillName = { fontSize: '14px', color: '#1f2937', margin: '0 0 2px', fontWeight: '500' as const }
const skillObservation = { fontSize: '13px', color: '#6b7280', margin: '0', lineHeight: '1.4' }
const vocabList = { fontSize: '13px', color: '#4f46e5', fontWeight: '500' as const, backgroundColor: '#eef2ff', borderRadius: '6px', padding: '10px 14px', margin: '0 0 12px' }
const hr = { borderColor: '#e5e7eb', margin: '20px 25px' }
const darkFooter = { backgroundColor: '#111827', padding: '20px 25px', textAlign: 'center' as const, borderRadius: '0 0 8px 8px' }
const footerText = { fontSize: '12px', color: '#9ca3af', margin: '0', fontWeight: '500' as const }
