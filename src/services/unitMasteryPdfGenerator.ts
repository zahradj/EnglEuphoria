import jsPDF from 'jspdf';

// ─── Engleuphoria Brand Colors ────────────────────────────
const NAVY = '#6B21A8';
const GOLD = '#C9A84C';
const SAGE = '#5A8A5C';
const LIGHT_SAGE = '#E8F0E8';
const DARK_GRAY = '#2D2D2D';
const MID_GRAY = '#6B7280';
const LIGHT_BG = '#FAFBFC';
const WHITE = '#FFFFFF';

interface PhonemeResult {
  phoneme: string;
  status: 'mastered' | 'developing';
  accuracy: number;
}

interface VocabWord {
  word: string;
  activeRecall: number;
  passiveRecognition: number;
}

interface SkillScores {
  phonics: number;
  vocabulary: number;
  listening: number;
  confidence: number;
}

interface UnitReportData {
  studentName: string;
  unitName: string;
  completionDate: string;
  overallScore: number;
  phonemes: PhonemeResult[];
  vocabulary: VocabWord[];
  skillScores: SkillScores;
  wizardObservation: string;
  homeMission: string;
  teacherNote: string;
}

function drawRoundedRect(
  doc: jsPDF,
  x: number, y: number, w: number, h: number, r: number,
  style: 'S' | 'F' | 'FD' = 'F'
) {
  doc.roundedRect(x, y, w, h, r, r, style);
}

function drawRadarChart(
  doc: jsPDF,
  cx: number, cy: number, radius: number,
  scores: SkillScores
) {
  const labels = ['Phonics', 'Vocabulary', 'Listening', 'Confidence'];
  const values = [scores.phonics, scores.vocabulary, scores.listening, scores.confidence];
  const n = labels.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  // Background circles
  for (let ring = 1; ring <= 4; ring++) {
    const r = (radius * ring) / 4;
    doc.setDrawColor(220, 220, 230);
    doc.setLineWidth(0.2);
    doc.circle(cx, cy, r, 'S');
  }

  // Axis lines and labels
  doc.setFontSize(6);
  doc.setTextColor(NAVY);
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    const ex = cx + radius * Math.cos(angle);
    const ey = cy + radius * Math.sin(angle);
    doc.setDrawColor(200, 200, 210);
    doc.setLineWidth(0.15);
    doc.line(cx, cy, ex, ey);

    const lx = cx + (radius + 6) * Math.cos(angle);
    const ly = cy + (radius + 6) * Math.sin(angle);
    doc.text(labels[i], lx, ly, { align: 'center', baseline: 'middle' });
  }

  // Data polygon
  const points: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    const val = values[i] / 100;
    points.push([
      cx + radius * val * Math.cos(angle),
      cy + radius * val * Math.sin(angle),
    ]);
  }

  // Fill
  doc.setFillColor(26, 35, 126);
  doc.setGState(doc.GState({ opacity: 0.15 }));
  const fillPath = points.map(([x, y], i) =>
    i === 0 ? `${x} ${y} m` : `${x} ${y} l`
  ).join(' ') + ' h';
  // Use lines approach instead
  doc.setGState(doc.GState({ opacity: 1 }));

  // Stroke polygon
  doc.setDrawColor(NAVY);
  doc.setLineWidth(0.6);
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    doc.line(x1, y1, x2, y2);
  }

  // Data points
  doc.setFillColor(NAVY);
  for (const [x, y] of points) {
    doc.circle(x, y, 1.2, 'F');
  }
}

export function generateUnitMasteryPdf(data: UnitReportData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ─── HEADER ──────────────────────────────────────────────
  // Navy header bar
  doc.setFillColor(NAVY);
  drawRoundedRect(doc, margin, y, contentW, 28, 3, 'F');

  // Logo text (left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(WHITE);
  doc.text('ENGLEUPHORIA', margin + 6, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(200, 210, 255);
  doc.text('Linguistic Diagnostic Report', margin + 6, y + 17);

  // Student info (right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(WHITE);
  doc.text(data.studentName, pageW - margin - 6, y + 9, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(200, 210, 255);
  doc.text(`Unit: ${data.unitName}`, pageW - margin - 6, y + 14, { align: 'right' });
  doc.text(`Completed: ${data.completionDate}`, pageW - margin - 6, y + 19, { align: 'right' });

  // Mastery seal
  const sealX = pageW - margin - 24;
  const sealY = y + 1;
  doc.setDrawColor(GOLD);
  doc.setLineWidth(1);
  doc.setFillColor(GOLD);
  drawRoundedRect(doc, sealX, sealY + 20, 22, 7, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(NAVY);
  doc.text('UNIT CONQUERED', sealX + 11, sealY + 24.5, { align: 'center' });

  y += 34;

  // ─── SECTION 1: PHONETIC BREAKDOWN ────────────────────
  doc.setFillColor(LIGHT_BG);
  drawRoundedRect(doc, margin, y, contentW, 40, 2, 'F');
  doc.setDrawColor(220, 225, 235);
  doc.setLineWidth(0.3);
  drawRoundedRect(doc, margin, y, contentW, 40, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(NAVY);
  doc.text('1. Phonetic Breakdown', margin + 5, y + 7);

  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.8);
  doc.line(margin + 5, y + 9, margin + 55, y + 9);

  // Phoneme circles
  const phonemeStartX = margin + 8;
  const phonemeY = y + 20;
  const circleR = 7;
  const spacing = Math.min(20, (contentW - 16) / Math.max(data.phonemes.length, 1));

  data.phonemes.forEach((p, i) => {
    const cx = phonemeStartX + i * spacing;
    const isMastered = p.status === 'mastered';

    // Circle
    doc.setFillColor(isMastered ? SAGE : '#FEF3C7');
    doc.setDrawColor(isMastered ? '#2D5A3D' : '#D97706');
    doc.setLineWidth(0.5);
    doc.circle(cx, phonemeY, circleR, 'FD');

    // Phoneme label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(isMastered ? WHITE : '#92400E');
    doc.text(p.phoneme, cx, phonemeY - 1, { align: 'center', baseline: 'middle' });

    // Status icon
    doc.setFontSize(7);
    doc.text(isMastered ? '✓' : '◷', cx, phonemeY + 4, { align: 'center' });
  });

  // Teacher note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(MID_GRAY);
  const noteLines = doc.splitTextToSize(data.teacherNote, contentW - 14);
  doc.text(noteLines, margin + 5, y + 35);

  y += 45;

  // ─── SECTION 2: VOCABULARY ACQUISITION ────────────────
  doc.setFillColor(WHITE);
  drawRoundedRect(doc, margin, y, contentW, 62, 2, 'F');
  doc.setDrawColor(220, 225, 235);
  doc.setLineWidth(0.3);
  drawRoundedRect(doc, margin, y, contentW, 62, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(NAVY);
  doc.text('2. Vocabulary Acquisition — The Lexicon', margin + 5, y + 7);

  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.8);
  doc.line(margin + 5, y + 9, margin + 75, y + 9);

  // 3x3 word grid
  const gridStartX = margin + 6;
  const gridStartY = y + 14;
  const cellW = (contentW - 16) / 3;
  const cellH = 14;

  data.vocabulary.slice(0, 9).forEach((v, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = gridStartX + col * cellW;
    const cy = gridStartY + row * cellH;

    // Cell background
    doc.setFillColor(LIGHT_SAGE);
    drawRoundedRect(doc, cx, cy, cellW - 2, cellH - 2, 1.5, 'F');

    // Word
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(DARK_GRAY);
    doc.text(v.word, cx + (cellW - 2) / 2, cy + 4.5, { align: 'center' });

    // Scores
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(MID_GRAY);
    doc.text(`AR: ${v.activeRecall}%  PR: ${v.passiveRecognition}%`, cx + (cellW - 2) / 2, cy + 9, { align: 'center' });
  });

  // Legend
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(MID_GRAY);
  doc.text('AR = Active Recall  |  PR = Passive Recognition', margin + 5, y + 58);

  y += 67;

  // ─── SKILL RADAR CHART ────────────────────────────────
  doc.setFillColor(LIGHT_BG);
  drawRoundedRect(doc, margin, y, contentW / 2 - 2, 50, 2, 'F');
  doc.setDrawColor(220, 225, 235);
  doc.setLineWidth(0.3);
  drawRoundedRect(doc, margin, y, contentW / 2 - 2, 50, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(NAVY);
  doc.text('Skill Radar', margin + 5, y + 6);

  drawRadarChart(doc, margin + (contentW / 4) - 1, y + 28, 16, data.skillScores);

  // ─── SECTION 3: WIZARD'S OBSERVATION (right side) ─────
  const rightX = margin + contentW / 2 + 2;
  const rightW = contentW / 2 - 2;

  doc.setFillColor(WHITE);
  drawRoundedRect(doc, rightX, y, rightW, 50, 2, 'F');
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.5);
  drawRoundedRect(doc, rightX, y, rightW, 50, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(NAVY);
  doc.text("3. The Wizard's Observation", rightX + 4, y + 7);

  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.6);
  doc.line(rightX + 4, y + 9, rightX + rightW - 4, y + 9);

  // Brain icon placeholder
  doc.setFillColor(NAVY);
  doc.circle(rightX + 8, y + 15, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(WHITE);
  doc.text('🧠', rightX + 8, y + 15.5, { align: 'center', baseline: 'middle' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(DARK_GRAY);
  const obsLines = doc.splitTextToSize(data.wizardObservation, rightW - 10);
  doc.text(obsLines, rightX + 4, y + 22);

  y += 55;

  // ─── SECTION 4: HOME MISSION ──────────────────────────
  doc.setFillColor(NAVY);
  drawRoundedRect(doc, margin, y, contentW, 30, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(GOLD);
  doc.text('4. Home Mission', margin + 5, y + 7);

  doc.setFillColor(255, 255, 255);
  doc.setGState(doc.GState({ opacity: 0.1 }));
  drawRoundedRect(doc, margin + 3, y + 10, contentW - 6, 16, 1.5, 'F');
  doc.setGState(doc.GState({ opacity: 1 }));

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(WHITE);
  const missionLines = doc.splitTextToSize(data.homeMission, contentW - 14);
  doc.text(missionLines, margin + 6, y + 15);

  y += 36;

  // ─── OVERALL SCORE BADGE ───────────────────────────────
  doc.setFillColor(GOLD);
  drawRoundedRect(doc, pageW / 2 - 20, y, 40, 12, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(NAVY);
  doc.text(`${data.overallScore}%`, pageW / 2, y + 8, { align: 'center' });

  y += 18;

  // ─── FOOTER ───────────────────────────────────────────
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.3);
  doc.line(margin, 280, pageW - margin, 280);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6);
  doc.setTextColor(MID_GRAY);
  doc.text(
    '"Progress is a marathon, not a sprint. We celebrate every sound, every word, and every step. Slowly, slowly, we build a world."',
    pageW / 2,
    284,
    { align: 'center', maxWidth: contentW }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.text('© Engleuphoria Academy — engleuphoria.com', pageW / 2, 290, { align: 'center' });

  return doc;
}

// Demo/test data generator
export function generateDemoReport(): UnitReportData {
  return {
    studentName: 'Noah Rodriguez',
    unitName: 'Animals — Island 1',
    completionDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    overallScore: 95,
    phonemes: [
      { phoneme: '/l/', status: 'mastered', accuracy: 92 },
      { phoneme: '/b/', status: 'mastered', accuracy: 88 },
      { phoneme: '/d/', status: 'mastered', accuracy: 95 },
      { phoneme: '/c/', status: 'mastered', accuracy: 90 },
      { phoneme: '/p/', status: 'developing', accuracy: 72 },
      { phoneme: '/m/', status: 'mastered', accuracy: 97 },
      { phoneme: '/e/', status: 'developing', accuracy: 68 },
    ],
    vocabulary: [
      { word: 'LION', activeRecall: 95, passiveRecognition: 100 },
      { word: 'CAT', activeRecall: 90, passiveRecognition: 98 },
      { word: 'DOG', activeRecall: 88, passiveRecognition: 95 },
      { word: 'BEAR', activeRecall: 92, passiveRecognition: 97 },
      { word: 'DUCK', activeRecall: 85, passiveRecognition: 93 },
      { word: 'PIG', activeRecall: 91, passiveRecognition: 99 },
      { word: 'MONKEY', activeRecall: 78, passiveRecognition: 90 },
      { word: 'ELEPHANT', activeRecall: 82, passiveRecognition: 94 },
      { word: 'TIGER', activeRecall: 87, passiveRecognition: 96 },
    ],
    skillScores: {
      phonics: 88,
      vocabulary: 92,
      listening: 85,
      confidence: 78,
    },
    wizardObservation:
      "During the Production phase, Noah showed high confidence in using full sentences. He naturally progressed from 'It is a lion' to 'The lion is big and yellow.' We are now working on smoothing his transition between initial consonants and vowel sounds, especially in multi-syllable words like 'elephant.'",
    homeMission:
      "Play 'I Spy' with animals today! Focus on words starting with the /l/ and /p/ sounds. Ask Noah to describe each animal using at least two adjectives. Example: 'I spy a big, brown bear.' Aim for 10 minutes of playful practice.",
    teacherNote:
      "Noah has achieved 90% accuracy in initial consonant placement for the /l/ sound. The /p/ and /e/ sounds are developing well and should reach mastery within the next unit cycle.",
  };
}
