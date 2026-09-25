// Plain-string HTML builder for the classroom-invite email -- deliberately
// NOT routed through send-transactional-email's React-Email registry. That
// shared function serves 30+ existing templates; redeploying it just to add
// one more would mean re-uploading its entire file bundle, for no benefit
// and real risk to templates this feature has nothing to do with. This
// keeps the classroom-invite feature fully self-contained, matching the
// "additive only, nothing else touched" design of the rest of the feature.
//
// Palette/copy mirrors supabase/functions/_shared/transactional-email-templates/
// classroom-invitation.tsx (kept in that registry too, for future reuse /
// admin preview) -- same hub colors as PlacementChoice.tsx, same mascots
// (Pip/Nova/Atlas) already live at https://www.engleuphoria.com/mascots/.

export type Hub = 'playground' | 'academy' | 'success'

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

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export interface ClassroomInviteEmailProps {
  studentName: string
  teacherName: string
  lessonDateLabel: string
  lessonTimeLabel: string
  joinLink: string
  hub: Hub
}

export function renderClassroomInviteHtml(props: ClassroomInviteEmailProps): string {
  const palette = PALETTES[props.hub] || PALETTES.academy
  const studentName = esc(props.studentName)
  const teacherName = esc(props.teacherName)
  const lessonDateLabel = esc(props.lessonDateLabel)
  const lessonTimeLabel = esc(props.lessonTimeLabel)
  const joinLink = esc(props.joinLink)

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Inter','Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:${palette.primary};padding:28px 32px;text-align:center;">
      <img src="${palette.mascotUrl}" width="88" height="88" alt="${palette.mascotName}" style="display:block;margin:0 auto;border-radius:999px;border:3px solid rgba(255,255,255,0.85);object-fit:cover;">
    </div>
    <div style="padding:32px;">
      <p style="font-size:16px;font-weight:600;color:${palette.text};margin:0 0 20px;">Hi ${studentName},</p>
      <p style="font-size:15px;color:#37474F;line-height:1.7;margin:0 0 16px;">
        ${teacherName} has scheduled your English lesson${lessonDateLabel ? ` for ${lessonDateLabel}` : ''}${lessonTimeLabel ? ` at ${lessonTimeLabel}` : ''}.
      </p>
      <p style="font-size:15px;color:#37474F;line-height:1.7;margin:0 0 24px;">
        No password or account setup needed — just tap the button below when it's time for class, and you'll be taken straight into the live classroom.
      </p>
      <div style="background:${palette.soft};border-radius:10px;padding:16px 24px;margin:0 0 24px;border-left:4px solid ${palette.primary};">
        <p style="font-size:14px;color:${palette.text};font-weight:700;margin:0 0 4px;">Lesson time</p>
        <p style="font-size:14px;color:#374151;line-height:1.6;margin:0;">${lessonDateLabel || 'TBD'}${lessonTimeLabel ? ` at ${lessonTimeLabel}` : ''}</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${joinLink}" style="background:${palette.primary};color:#ffffff;font-size:15px;font-weight:600;border-radius:8px;padding:14px 32px;text-decoration:none;display:inline-block;">Join Your Classroom</a>
      </div>
      <p style="font-size:13px;color:#78909C;line-height:1.6;margin:0 0 24px;text-align:center;">
        This link is unique to you — please don't share it. It works for your scheduled lesson time.
      </p>
      <p style="font-size:15px;color:#37474F;line-height:1.7;margin:24px 0 4px;">${palette.mascotName} and the team can't wait to see you!</p>
      <p style="font-size:14px;color:${palette.text};font-weight:600;margin:0;">The EnglEuphoria Team</p>
    </div>
    <div style="background:${palette.footer};padding:24px 32px;text-align:center;">
      <img src="${LOGO_WHITE_URL}" width="28" height="28" alt="EnglEuphoria" style="display:block;margin:0 auto 10px;">
      <p style="font-size:12px;color:#d1d5db;margin:0;">© 2026 EnglEuphoria. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}

export function renderClassroomInviteText(props: ClassroomInviteEmailProps): string {
  return [
    `Hi ${props.studentName},`,
    '',
    `${props.teacherName} has scheduled your English lesson${props.lessonDateLabel ? ` for ${props.lessonDateLabel}` : ''}${props.lessonTimeLabel ? ` at ${props.lessonTimeLabel}` : ''}.`,
    '',
    `Join your classroom: ${props.joinLink}`,
    '',
    `See you in class!`,
    `The EnglEuphoria Team`,
  ].join('\n')
}
