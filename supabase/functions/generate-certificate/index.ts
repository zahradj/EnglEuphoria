import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { certificateId } = await req.json();

    const { data: certificate, error: certError } = await supabaseClient
      .from('certificates')
      .select(`
        *,
        student:student_id (full_name, email),
        teacher:teacher_id (full_name)
      `)
      .eq('id', certificateId)
      .single();

    if (certError) throw certError;

    const html = generateCertificateHTML(certificate);
    
    return new Response(
      JSON.stringify({ 
        html,
        certificateNumber: certificate.certificate_number,
        verificationCode: certificate.verification_code
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating certificate:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function escHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateCertificateHTML(certificate: any): string {
  const studentName = escHtml(certificate.student?.full_name || 'Student');
  const teacherName = escHtml(certificate.teacher?.full_name || 'Instructor');
  const issueDate = new Date(certificate.issue_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: A4 landscape; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Georgia', serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          width: 297mm;
          height: 210mm;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20mm;
        }
        .certificate {
          background: white;
          width: 100%;
          height: 100%;
          border: 3px solid #d4af37;
          box-shadow: 0 10px 50px rgba(0,0,0,0.3);
          padding: 40px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }
        .certificate::before {
          content: '';
          position: absolute;
          top: 15px;
          left: 15px;
          right: 15px;
          bottom: 15px;
          border: 1px solid #d4af37;
        }
        .header { text-align: center; z-index: 1; }
        .logo { font-size: 36px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .cert-title { font-size: 48px; color: #333; letter-spacing: 4px; text-transform: uppercase; margin: 20px 0; }
        .subtitle { font-size: 18px; color: #666; font-style: italic; }
        .content { text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center; z-index: 1; max-width: 80%; }
        .presented-to { font-size: 20px; color: #666; margin-bottom: 10px; }
        .student-name { font-size: 42px; color: #333; font-weight: bold; margin: 15px 0; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
        .description { font-size: 18px; color: #555; line-height: 1.6; margin: 20px 0; }
        .cefr-badge { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 30px; border-radius: 25px; font-size: 24px; font-weight: bold; margin: 15px 0; }
        .footer { display: flex; justify-content: space-between; width: 100%; z-index: 1; }
        .signature-block { text-align: center; flex: 1; }
        .signature-line { border-top: 2px solid #333; margin-top: 30px; padding-top: 8px; font-size: 14px; color: #666; }
        .date { font-size: 16px; color: #555; margin-top: 5px; }
        .cert-number { text-align: center; font-size: 12px; color: #999; margin-top: 15px; }
        .verification { text-align: center; font-size: 11px; color: #aaa; margin-top: 5px; }
        .skills { margin: 15px 0; font-size: 14px; color: #666; }
        .skill-tag { display: inline-block; background: #f0f0f0; padding: 5px 12px; border-radius: 12px; margin: 3px; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="header">
          <div class="logo">EnglEuphoria</div>
          <h1 class="cert-title">Certificate of Achievement</h1>
          <p class="subtitle">This certifies that</p>
        </div>
        
        <div class="content">
          <p class="presented-to">This is proudly presented to</p>
          <h2 class="student-name">${studentName}</h2>
          
          <p class="description">${escHtml(certificate.description || 'Has successfully completed the English language program and demonstrated exceptional proficiency.')}</p>
          
          ${certificate.cefr_level ? `<div class="cefr-badge">CEFR Level ${escHtml(certificate.cefr_level)}</div>` : ''}
          
          ${certificate.score_achieved ? `<p class="description">Final Score: ${escHtml(certificate.score_achieved)}%</p>` : ''}
          
          ${certificate.hours_completed ? `<p class="description">${escHtml(certificate.hours_completed)} hours of instruction completed</p>` : ''}
          
          ${certificate.skills_demonstrated && certificate.skills_demonstrated.length > 0 ? `
            <div class="skills">
              <strong>Skills Mastered:</strong><br>
              ${certificate.skills_demonstrated.map((skill: string) => `<span class="skill-tag">${escHtml(skill)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <div class="signature-block">
            <div class="signature-line">${teacherName}</div>
            <div class="date">Instructor</div>
          </div>
          <div class="signature-block">
            <div class="signature-line">${escHtml(issueDate)}</div>
            <div class="date">Date Issued</div>
          </div>
        </div>
        
        <div class="cert-number">Certificate No: ${escHtml(certificate.certificate_number)}</div>
        <div class="verification">Verification Code: ${escHtml(certificate.verification_code)}</div>
      </div>
    </body>
    </html>
  `;
}
