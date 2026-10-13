/**
 * Deterministic certificate SVG renderer. Same output on client preview
 * and on the OG edge function so what teachers design is what students share.
 */
import { paletteFor, HUB_LABEL, type HubKey } from "./certificatePalette";

export interface CertificateRenderInput {
  hub: string;
  cefrLevel?: string | null;
  title: string;          // e.g. "Story Adventurer" or "A2 Mastery"
  subtitle?: string;      // e.g. "12 quests · 88% accuracy"
  recipientName?: string;
  awardedAt?: string;     // ISO
  logoUrl?: string | null;
  backgroundUrl?: string | null;
  heading?: string;       // top eyebrow
  subheading?: string;    // footer signature
  primaryOverride?: string;
  accentOverride?: string;
  textOverride?: string;
  /** 'full': the background is a finished illustration (e.g. the Canva Playground certificate) — shown at full
   *  strength, no drawn frame, and the text sits inside the picture's blank panel. Default 'wash' keeps the old look. */
  artMode?: "wash" | "full";
  /** Full-art only: move the whole text block up (−) or down (+) in px to fit that picture's white panel. */
  textShift?: number;
}

function esc(s: string) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/** Text laid inside the blank panel of a full illustrated certificate (Playground Pre-A1 art: medal over the top of the panel, characters at the bottom corners — text stays in the middle column, y 250–560). */
function renderFullArt(input: CertificateRenderInput, primary: string, text: string, awarded: string): string {
  const hubLabel = HUB_LABEL[input.hub as HubKey] || input.hub;
  const font = "Nunito,'Arial Rounded MT Bold','Trebuchet MS',Arial,sans-serif";
  const heading = input.heading || "CERTIFICATE OF ACHIEVEMENT";
  const name = input.recipientName
    ? `<text x="600" y="352" text-anchor="middle" font-family="${font}" font-size="50" font-weight="900" fill="${primary}" stroke="#ffffff" stroke-width="2" paint-order="stroke">${esc(input.recipientName)}</text>`
    : "";
  const sub = input.subtitle
    ? `<text x="600" y="436" text-anchor="middle" font-family="${font}" font-size="19" font-weight="700" fill="${text}" opacity="0.8">${esc(input.subtitle)}</text>`
    : "";
  const pill = input.cefrLevel
    ? `<g><rect x="495" y="452" width="210" height="40" rx="20" fill="${primary}"/><text x="600" y="479" text-anchor="middle" font-family="${font}" font-size="19" font-weight="900" fill="#ffffff">${esc(hubLabel)} · ${esc(input.cefrLevel)}</text></g>`
    : "";
  const date = awarded
    ? `<text x="600" y="520" text-anchor="middle" font-family="${font}" font-size="16" font-weight="700" fill="${text}" opacity="0.7">${esc(awarded)}</text>`
    : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FFEFE2"/>
  <image href="${esc(input.backgroundUrl || "")}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>
  <g transform="translate(0 ${Number(input.textShift) || 0})">
  <text x="600" y="277" text-anchor="middle" font-family="${font}" font-size="17" font-weight="900" letter-spacing="5" fill="${primary}">${esc(heading)}</text>
  <text x="600" y="300" text-anchor="middle" font-family="${font}" font-size="16" font-weight="700" fill="${text}" opacity="0.75">This certificate is proudly given to</text>
  ${name}
  <text x="600" y="404" text-anchor="middle" font-family="${font}" font-size="34" font-weight="900" fill="${text}">${esc(input.title)}</text>
  ${sub}
  ${pill}
  ${date}
  <text x="600" y="550" text-anchor="middle" font-family="${font}" font-size="13" font-weight="800" letter-spacing="3" fill="${primary}">${esc(input.subheading || "engleuphoria.com")}</text>
  </g>
</svg>`;
}

export function renderCertificateSVG(input: CertificateRenderInput): string {
  const base = paletteFor(input.hub, input.cefrLevel);
  const primary = input.primaryOverride || base.primary;
  const accent = input.accentOverride || base.accent;
  const text = input.textOverride || base.text;
  const hubLabel = HUB_LABEL[input.hub as HubKey] || input.hub;
  const heading = input.heading || "ENGLEUPHORIA · CERTIFICATE OF MASTERY";
  const subheading = input.subheading || "engleuphoria.com";
  const awarded = input.awardedAt ? new Date(input.awardedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";
  if (input.artMode === "full" && input.backgroundUrl) return renderFullArt(input, primary, text, awarded);
  const bg = input.backgroundUrl
    ? `<image href="${esc(input.backgroundUrl)}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice" opacity="0.18"/>`
    : "";
  const logo = input.logoUrl
    ? `<image href="${esc(input.logoUrl)}" x="540" y="60" width="120" height="60" preserveAspectRatio="xMidYMid meet"/>`
    : `<text x="600" y="105" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="900" fill="${primary}" letter-spacing="4">ENGLEUPHORIA</text>`;
  const recipient = input.recipientName
    ? `<text x="600" y="240" text-anchor="middle" font-family="Georgia,serif" font-size="30" font-style="italic" fill="${text}">Awarded to ${esc(input.recipientName)}</text>`
    : "";
  const subtitle = input.subtitle
    ? `<text x="600" y="410" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="30" fill="${text}" opacity="0.85">${esc(input.subtitle)}</text>`
    : "";
  const levelTag = input.cefrLevel
    ? `<g><rect x="510" y="450" width="180" height="46" rx="23" fill="${primary}"/><text x="600" y="481" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="800" fill="#ffffff">${esc(hubLabel)} · ${esc(input.cefrLevel)}</text></g>`
    : `<text x="600" y="480" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="22" fill="${primary}" font-weight="800" letter-spacing="4">${esc(hubLabel.toUpperCase())} HUB</text>`;
  const dateLine = awarded
    ? `<text x="600" y="540" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="18" fill="${text}" opacity="0.7">Awarded ${esc(awarded)}</text>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  ${bg}
  <rect x="30" y="30" width="1140" height="570" fill="none" stroke="${primary}" stroke-width="6" rx="24"/>
  <rect x="50" y="50" width="1100" height="530" fill="none" stroke="${primary}" stroke-width="1" stroke-opacity="0.4" rx="18"/>
  ${logo}
  <text x="600" y="160" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="18" letter-spacing="6" fill="${primary}" font-weight="700">${esc(heading)}</text>
  ${recipient}
  <text x="600" y="340" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="72" font-weight="900" fill="${text}">${esc(input.title)}</text>
  ${subtitle}
  ${levelTag}
  ${dateLine}
  <text x="600" y="580" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="16" fill="${primary}" font-weight="700" letter-spacing="3">${esc(subheading)}</text>
</svg>`;
}
