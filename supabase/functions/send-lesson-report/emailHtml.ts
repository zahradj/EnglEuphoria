// Plain-string HTML for the lesson / trial-lesson report email. Self-contained
// (same approach as classroom-invite/emailHtml.ts): no shared template registry,
// so shipping this never touches the other 30+ transactional templates.
//
// Fixed wording (headings, labels, buttons) is translated here by hand for the
// six languages a student can pick (users.preferred_language), so it never
// depends on a machine translation. The teacher's own free text is translated
// separately by the edge function before it reaches these renderers.

export type Hub = 'playground' | 'academy' | 'success'
export type Lang = 'en' | 'fr' | 'es' | 'ar' | 'tr' | 'it'

export const LANGS: Lang[] = ['en', 'fr', 'es', 'ar', 'tr', 'it']

export const LANG_NAME: Record<Lang, string> = {
  en: 'English', fr: 'French', es: 'Spanish', ar: 'Arabic', tr: 'Turkish', it: 'Italian',
}

/** Locale used to format the lesson date in each language. */
export const LANG_LOCALE: Record<Lang, string> = {
  en: 'en-US', fr: 'fr-FR', es: 'es-ES', ar: 'ar', tr: 'tr-TR', it: 'it-IT',
}

type Strings = {
  trialTitle: string; lessonTitle: string; hi: string
  afterTrial: string; afterLesson: string // {t} = teacher
  placement: string; startLevel: string; englishToday: string; inClass: string; goal: string
  howYouDid: string; needs: string; good: string; great: string
  messageFrom: string; homework: string; plan: string; perWeek: string // {n}
  ctaTrial: string; ctaRegular: string; team: string
  subjectTrial: string; subjectRegular: string // {s} student, {title}
}

const S: Record<Lang, Strings> = {
  en: {
    trialTitle: 'Trial lesson report', lessonTitle: 'Lesson report', hi: 'Hi',
    afterTrial: '{t} wrote this after your trial lesson', afterLesson: '{t} wrote this after your lesson',
    placement: 'Placement result', startLevel: 'Starting level', englishToday: 'English today', inClass: 'In class', goal: 'Goal',
    howYouDid: 'How you did', needs: 'Needs practice', good: 'Good', great: 'Great',
    messageFrom: 'Message from {t}', homework: 'Homework', plan: 'Recommended plan', perWeek: '{n} lesson(s) per week',
    ctaTrial: 'Book your next lesson', ctaRegular: 'Open your dashboard', team: 'The EnglEuphoria Team',
    subjectTrial: "{s}'s trial lesson report", subjectRegular: 'Lesson report: {title} — {s}',
  },
  fr: {
    trialTitle: "Rapport du cours d'essai", lessonTitle: 'Rapport de cours', hi: 'Bonjour',
    afterTrial: "{t} a rédigé ce rapport après votre cours d'essai", afterLesson: '{t} a rédigé ce rapport après votre cours',
    placement: 'Résultat de placement', startLevel: 'Niveau de départ', englishToday: "Anglais aujourd'hui", inClass: 'En classe', goal: 'Objectif',
    howYouDid: 'Vos résultats', needs: 'À travailler', good: 'Bien', great: 'Excellent',
    messageFrom: 'Message de {t}', homework: 'Devoirs', plan: 'Plan recommandé', perWeek: '{n} cours par semaine',
    ctaTrial: 'Réservez votre prochain cours', ctaRegular: 'Ouvrir votre tableau de bord', team: "L'équipe EnglEuphoria",
    subjectTrial: "Rapport du cours d'essai de {s}", subjectRegular: 'Rapport de cours : {title} — {s}',
  },
  es: {
    trialTitle: 'Informe de la clase de prueba', lessonTitle: 'Informe de la clase', hi: 'Hola',
    afterTrial: '{t} escribió esto después de tu clase de prueba', afterLesson: '{t} escribió esto después de tu clase',
    placement: 'Resultado de nivel', startLevel: 'Nivel inicial', englishToday: 'Inglés hoy', inClass: 'En clase', goal: 'Objetivo',
    howYouDid: 'Cómo te fue', needs: 'Necesita práctica', good: 'Bien', great: 'Excelente',
    messageFrom: 'Mensaje de {t}', homework: 'Tarea', plan: 'Plan recomendado', perWeek: '{n} clase(s) por semana',
    ctaTrial: 'Reserva tu próxima clase', ctaRegular: 'Abre tu panel', team: 'El equipo de EnglEuphoria',
    subjectTrial: 'Informe de la clase de prueba de {s}', subjectRegular: 'Informe de la clase: {title} — {s}',
  },
  ar: {
    trialTitle: 'تقرير الحصة التجريبية', lessonTitle: 'تقرير الحصة', hi: 'مرحباً',
    afterTrial: 'كتب {t} هذا التقرير بعد حصتك التجريبية', afterLesson: 'كتب {t} هذا التقرير بعد حصتك',
    placement: 'نتيجة تحديد المستوى', startLevel: 'مستوى البداية', englishToday: 'الإنجليزية اليوم', inClass: 'في الحصة', goal: 'الهدف',
    howYouDid: 'أداؤك', needs: 'يحتاج إلى تدريب', good: 'جيد', great: 'ممتاز',
    messageFrom: 'رسالة من {t}', homework: 'الواجب', plan: 'الخطة الموصى بها', perWeek: '{n} حصة في الأسبوع',
    ctaTrial: 'احجز حصتك القادمة', ctaRegular: 'افتح لوحة التحكم', team: 'فريق EnglEuphoria',
    subjectTrial: 'تقرير الحصة التجريبية لـ {s}', subjectRegular: 'تقرير الحصة: {title} — {s}',
  },
  tr: {
    trialTitle: 'Deneme dersi raporu', lessonTitle: 'Ders raporu', hi: 'Merhaba',
    afterTrial: '{t} bu raporu deneme dersinizden sonra yazdı', afterLesson: '{t} bu raporu dersinizden sonra yazdı',
    placement: 'Seviye sonucu', startLevel: 'Başlangıç seviyesi', englishToday: 'Bugünkü İngilizce', inClass: 'Derste', goal: 'Hedef',
    howYouDid: 'Nasıl geçti', needs: 'Pratik gerekli', good: 'İyi', great: 'Harika',
    messageFrom: '{t} tarafından mesaj', homework: 'Ödev', plan: 'Önerilen plan', perWeek: 'Haftada {n} ders',
    ctaTrial: 'Sonraki dersinizi ayırtın', ctaRegular: 'Panelinizi açın', team: 'EnglEuphoria Ekibi',
    subjectTrial: '{s} için deneme dersi raporu', subjectRegular: 'Ders raporu: {title} — {s}',
  },
  it: {
    trialTitle: 'Rapporto della lezione di prova', lessonTitle: 'Rapporto della lezione', hi: 'Ciao',
    afterTrial: '{t} ha scritto questo dopo la tua lezione di prova', afterLesson: '{t} ha scritto questo dopo la tua lezione',
    placement: 'Risultato del livello', startLevel: 'Livello di partenza', englishToday: 'Inglese oggi', inClass: 'In classe', goal: 'Obiettivo',
    howYouDid: 'Come è andata', needs: 'Da esercitare', good: 'Bene', great: 'Ottimo',
    messageFrom: 'Messaggio da {t}', homework: 'Compiti', plan: 'Piano consigliato', perWeek: '{n} lezioni a settimana',
    ctaTrial: 'Prenota la prossima lezione', ctaRegular: 'Apri la tua dashboard', team: 'Il team EnglEuphoria',
    subjectTrial: 'Rapporto della lezione di prova di {s}', subjectRegular: 'Rapporto della lezione: {title} — {s}',
  },
}

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

const LOGO_WHITE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-white.png'
const SITE_URL = 'https://engleuphoria.com'

export interface LessonReportEmailProps {
  hub: Hub
  lang: Lang
  isTrial: boolean
  studentName: string
  teacherName: string
  lessonTitle: string
  /** Already formatted in the report's language. */
  lessonDateLabel: string
  progress: 'finished' | 'most' | 'early'
  skills: { label: string; level: 'low' | 'mid' | 'good' }[]
  message: string
  homework?: string
  trial?: {
    level?: string
    englishToday?: string
    confidence?: string
    lessonsPerWeek?: number
    goal?: string
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const fill = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))

function nl2br(s: string): string {
  return esc(s).replace(/\n/g, '<br>')
}

function faces(t: Strings) {
  return {
    low: { emoji: '😕', label: t.needs, color: '#d97706' },
    mid: { emoji: '🙂', label: t.good, color: '#2563eb' },
    good: { emoji: '🤩', label: t.great, color: '#059669' },
  } as const
}

export function reportSubject(p: LessonReportEmailProps): string {
  const t = S[p.lang]
  return p.isTrial
    ? fill(t.subjectTrial, { s: p.studentName })
    : fill(t.subjectRegular, { s: p.studentName, title: p.lessonTitle }).replace(': — ', ' — ')
}

export function renderLessonReportHtml(p: LessonReportEmailProps): string {
  const t = S[p.lang]
  const F = faces(t)
  const pal = PALETTES[p.hub] || PALETTES.academy
  const rtl = p.lang === 'ar'
  const dir = rtl ? 'rtl' : 'ltr'
  const start = rtl ? 'right' : 'left'
  const end = rtl ? 'left' : 'right'
  const title = p.isTrial ? t.trialTitle : t.lessonTitle

  const skillRows = p.skills.map((s) => {
    const f = F[s.level]
    return `<tr>
      <td style="padding:8px 0;font-size:14px;color:#374151;text-align:${start};border-bottom:1px solid #eef0f3;">${esc(s.label)}</td>
      <td style="padding:8px 0;font-size:14px;font-weight:700;text-align:${end};color:${f.color};border-bottom:1px solid #eef0f3;">${f.emoji} ${f.label}</td>
    </tr>`
  }).join('')

  const trial = p.trial
  const accentSide = rtl ? 'border-right' : 'border-left'
  const trialBlock = p.isTrial && trial ? `
      <div style="background:${pal.soft};border-radius:10px;padding:18px 22px;margin:0 0 24px;${accentSide}:4px solid ${pal.primary};">
        <p style="font-size:14px;color:${pal.text};font-weight:700;margin:0 0 10px;">${t.placement}</p>
        ${trial.level ? `<p style="font-size:15px;color:#111827;margin:0 0 6px;"><strong>${t.startLevel}:</strong> ${esc(trial.level)}</p>` : ''}
        ${trial.englishToday ? `<p style="font-size:14px;color:#374151;margin:0 0 6px;"><strong>${t.englishToday}:</strong> ${esc(trial.englishToday)}</p>` : ''}
        ${trial.confidence ? `<p style="font-size:14px;color:#374151;margin:0 0 6px;"><strong>${t.inClass}:</strong> ${esc(trial.confidence)}</p>` : ''}
        ${trial.goal ? `<p style="font-size:14px;color:#374151;margin:0;"><strong>${t.goal}:</strong> ${esc(trial.goal)}</p>` : ''}
      </div>` : ''

  const planBlock = p.isTrial && trial?.lessonsPerWeek ? `
      <div style="background:#f9fafb;border-radius:10px;padding:18px 22px;margin:0 0 24px;border:1px solid #e5e7eb;">
        <p style="font-size:14px;color:${pal.text};font-weight:700;margin:0 0 6px;">${t.plan}</p>
        <p style="font-size:15px;color:#111827;margin:0;">${fill(t.perWeek, { n: trial.lessonsPerWeek })}</p>
      </div>` : ''

  const intro = fill(p.isTrial ? t.afterTrial : t.afterLesson, { t: esc(p.teacherName) })

  return `<!DOCTYPE html>
<html lang="${p.lang}" dir="${dir}">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Inter','Segoe UI',Arial,sans-serif;" dir="${dir}">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);direction:${dir};text-align:${start};">
    <div style="background:${pal.primary};padding:28px 32px;text-align:center;">
      <img src="${pal.mascotUrl}" width="80" height="80" alt="${pal.mascotName}" style="display:block;margin:0 auto 10px;border-radius:999px;border:3px solid rgba(255,255,255,0.85);object-fit:cover;">
      <p style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:800;color:rgba(255,255,255,0.9);margin:0;">${esc(title)}</p>
    </div>
    <div style="padding:32px;">
      <p style="font-size:16px;font-weight:600;color:${pal.text};margin:0 0 6px;">${t.hi} ${esc(p.studentName)},</p>
      <p style="font-size:14px;color:#6b7280;margin:0 0 22px;">${intro}${p.lessonTitle ? ` “${esc(p.lessonTitle)}”` : ''}${p.lessonDateLabel ? ` (${esc(p.lessonDateLabel)})` : ''}.</p>
      ${trialBlock}
      ${skillRows ? `<p style="font-size:14px;color:${pal.text};font-weight:700;margin:0 0 4px;">${t.howYouDid}</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">${skillRows}</table>` : ''}
      ${p.message ? `<div style="background:${pal.soft};border-radius:10px;padding:18px 22px;margin:0 0 24px;">
        <p style="font-size:14px;color:${pal.text};font-weight:700;margin:0 0 8px;">${fill(t.messageFrom, { t: esc(p.teacherName) })}</p>
        <p style="font-size:14px;color:#374151;line-height:1.7;margin:0;">${nl2br(p.message)}</p>
      </div>` : ''}
      ${p.homework ? `<p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 24px;"><strong>📚 ${t.homework}:</strong> ${esc(p.homework)}</p>` : ''}
      ${planBlock}
      <div style="text-align:center;margin:28px 0 8px;">
        <a href="${SITE_URL}/dashboard" style="background:${pal.primary};color:#ffffff;font-size:15px;font-weight:600;border-radius:8px;padding:14px 32px;text-decoration:none;display:inline-block;">${p.isTrial ? t.ctaTrial : t.ctaRegular}</a>
      </div>
      <p style="font-size:14px;color:${pal.text};font-weight:600;margin:24px 0 0;">${t.team}</p>
    </div>
    <div style="background:${pal.footer};padding:24px 32px;text-align:center;">
      <img src="${LOGO_WHITE_URL}" width="28" height="28" alt="EnglEuphoria" style="display:block;margin:0 auto 10px;">
      <p style="font-size:12px;color:#d1d5db;margin:0;">© 2026 EnglEuphoria. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}

export function renderLessonReportText(p: LessonReportEmailProps): string {
  const t = S[p.lang]
  const F = faces(t)
  const lines = [
    `${t.hi} ${p.studentName},`,
    '',
    `${fill(p.isTrial ? t.afterTrial : t.afterLesson, { t: p.teacherName })}${p.lessonTitle ? ` “${p.lessonTitle}”` : ''}.`,
    '',
  ]
  if (p.isTrial && p.trial) {
    if (p.trial.level) lines.push(`${t.startLevel}: ${p.trial.level}`)
    if (p.trial.englishToday) lines.push(`${t.englishToday}: ${p.trial.englishToday}`)
    if (p.trial.confidence) lines.push(`${t.inClass}: ${p.trial.confidence}`)
    if (p.trial.goal) lines.push(`${t.goal}: ${p.trial.goal}`)
    if (p.trial.lessonsPerWeek) lines.push(`${t.plan}: ${fill(t.perWeek, { n: p.trial.lessonsPerWeek })}`)
    lines.push('')
  }
  if (p.skills.length) {
    lines.push(`${t.howYouDid}:`)
    for (const s of p.skills) lines.push(`- ${s.label}: ${F[s.level].label}`)
    lines.push('')
  }
  if (p.message) lines.push(p.message, '')
  if (p.homework) lines.push(`${t.homework}: ${p.homework}`, '')
  lines.push(`${SITE_URL}/dashboard`, '', t.team)
  return lines.join('\n')
}
