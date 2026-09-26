import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search, CheckCircle2, AlertTriangle, AlertCircle, ExternalLink, Globe, FileCode2, Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Impact = 'high' | 'medium' | 'low';

interface Finding {
  issue: string;
  impact: Impact;
  evidence: string;
  fix: string;
}

// Real findings from a manual audit against the live site, following this
// project's own mkt-seo-audit methodology (.agents/skills/mkt-seo-audit).
// Snapshot, not a live scan — there's no PageSpeed/Search Console API wired
// up yet, so this is read-only reference data until that changes. Re-check
// periodically and update this list rather than treating it as live.
const AUDIT_DATE = '2026-09-26';

const FINDINGS: Finding[] = [
  {
    issue: 'Hero H1 concatenates the translated headline with an always-English tagline',
    impact: 'high',
    evidence:
      'HeroSection.tsx renders {t(\'lp.hero.headline\')} then a hardcoded theme.tagline (e.g. "Level Up Your English!") inside the same <h1>, with no i18n key for the tagline. On the Arabic locale this reads as "تعلَّم الإنجليزيةLevel Up Your English!" in the raw text content — confirmed live via a DOM query against engleuphoria.com.',
    fix: 'Move each hub\'s tagline into the translation resources and pull it via t() alongside the headline, for all 6 locales (en/ar/ar-DZ/fr/es/tr). Affects the single most important heading on the site for 5 of 6 locales.',
  },
  {
    issue: 'Title tag is short — leaves keyword real estate unused',
    impact: 'medium',
    evidence: '"EnglEuphoria Joyful English Learning" — 36 characters. Recommended range is 50–60.',
    fix: 'Lengthen to include what the audience searches for, e.g. "EnglEuphoria — Live 1-on-1 English Lessons for Kids, Teens & Adults".',
  },
  {
    issue: 'Meta description under-uses the available length',
    impact: 'low',
    evidence: 'Current description is 122 characters; recommended range is 150–160.',
    fix: 'Extend with a concrete call to action (e.g. mention trial lesson, the three hubs by name) to use the full SERP snippet.',
  },
  {
    issue: 'Sitemap has no entry for the localized routes',
    impact: 'medium',
    evidence: 'sitemap.xml lists 12 URLs, all on the default (English) path. The 5 locale routes referenced in hreflang (/ar, /ar-DZ, /fr, /es, /tr) aren\'t listed as their own <url> entries.',
    fix: 'Add each locale homepage as its own sitemap entry (with <xhtml:link> alternates) — hreflang in HTML is enough for Google to find them eventually, but an explicit sitemap entry speeds up discovery and re-crawl.',
  },
  {
    issue: 'Sitemap lastmod dates are stale',
    impact: 'low',
    evidence: `Every entry is dated 2026-08-18, over a month before this audit (${AUDIT_DATE}), despite the site shipping changes since.`,
    fix: 'Regenerate sitemap.xml on deploy (or at least on content changes) instead of a fixed static file.',
  },
  {
    issue: 'Structured data covers only the organization, not individual pages',
    impact: 'low',
    evidence: 'Homepage JSON-LD is a single EducationalOrganization block (name/url/logo/image/description) — no sameAs (social profiles), no Course/Product markup on hub or pricing pages, no WebSite + SearchAction.',
    fix: 'Add sameAs links to real social profiles, and Course schema on the three hub demo pages once they have stable, indexable content.',
  },
];

const PASSES: { label: string; note: string }[] = [
  { label: 'robots.txt', note: 'Present, correctly disallows private routes (/dashboard, /admin, /classroom, /auth), references the sitemap.' },
  { label: 'XML sitemap', note: 'Exists at /sitemap.xml, valid, includes priorities and changefreq.' },
  { label: 'HTTPS + canonical', note: 'Self-referencing canonical present on the homepage, served over HTTPS.' },
  { label: 'Hreflang set', note: 'All 6 locales (en, ar, ar-DZ, fr, es, tr) plus x-default present and reciprocal on the homepage.' },
  { label: 'Image alt text', note: '9/9 homepage images have alt attributes — no missing-alt issues found.' },
  { label: 'Mobile viewport', note: 'Configured correctly (width=device-width, initial-scale=1.0).' },
  { label: 'Heading count', note: 'Exactly one H1 on the homepage (content issue above, not a structural one).' },
];

const IMPACT_META: Record<Impact, { label: string; className: string; Icon: typeof AlertCircle }> = {
  high: { label: 'High impact', className: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30', Icon: AlertCircle },
  medium: { label: 'Medium impact', className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30', Icon: AlertTriangle },
  low: { label: 'Low impact', className: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30', Icon: Search },
};

const FindingCard = ({ f }: { f: Finding }) => {
  const meta = IMPACT_META[f.impact];
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-foreground text-sm leading-snug">{f.issue}</h3>
        <Badge variant="outline" className={cn('shrink-0 gap-1 border', meta.className)}>
          <meta.Icon className="h-3 w-3" /> {meta.label}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/80">Evidence: </span>{f.evidence}</p>
      <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/80">Fix: </span>{f.fix}</p>
    </div>
  );
};

export const SeoTab = () => {
  const highCount = FINDINGS.filter((f) => f.impact === 'high').length;
  const medCount = FINDINGS.filter((f) => f.impact === 'medium').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> engleuphoria.com — technical &amp; on-page audit
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manual snapshot from {AUDIT_DATE}, following this project's own SEO audit checklist. Not a live scan.
          </p>
        </div>
        <a
          href="https://www.engleuphoria.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          View live site <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Findings</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-foreground">{FINDINGS.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">High impact</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{highCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Medium impact</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{medCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Checks passing</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{PASSES.length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileCode2 className="h-4 w-4 text-primary" /> Findings, most impactful first
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {FINDINGS.map((f, i) => <FindingCard key={i} f={f} />)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Already passing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PASSES.map((p) => (
              <div key={p.label} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-foreground">{p.label}</span>
                  <p className="text-xs text-muted-foreground">{p.note}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="pt-6 flex items-start gap-3">
          <ImageIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            This tab is a manual snapshot, not a live crawler — re-run the audit after significant homepage or
            i18n changes and update the findings above. Wiring up Google Search Console / PageSpeed Insights
            would let this refresh automatically; ask to have that added if it'd be useful.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
