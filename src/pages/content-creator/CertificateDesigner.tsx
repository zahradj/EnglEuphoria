/**
 * Certificate Designer — content-creator surface for editing per-hub,
 * per-CEFR-level certificate templates. Uploads logo + background to the
 * `certificate-assets` bucket and persists design tokens to
 * `certificate_templates`.
 */
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { renderCertificateSVG } from "@/lib/certificateRenderer";
import { CEFR_LEVELS, HUB_LABEL, paletteFor, type CefrLevel, type HubKey } from "@/lib/certificatePalette";
import { Upload, Save, RotateCcw, ImageIcon } from "lucide-react";

const HUBS: HubKey[] = ["playground", "academy", "success"];

/** The saved picture address always points at the live site (it is read by the share-image function too). */
const SITE = "https://www.engleuphoria.com";
/** In the preview, load our own pictures from the site being used (a preview build has them before the live site). */
const previewUrl = (u: string | null) => (u && u.startsWith(SITE) ? window.location.origin + u.slice(SITE.length) : u);

/** Finished illustrated certificates made in Canva (public/certificates), one per hub × level. Owner, 2026-10-12:
 *  Playground = yellow → orange shades + white, each level its own style, 1 medal for Pre-A1, 2 for A1, 3 for A2. */
const ILLUSTRATED_ART: Partial<Record<`${HubKey}:${CefrLevel}`, { file: string; primary: string; accent: string; text: string; heading: string; textShift: number }>> = {
  "playground:Pre-A1": { file: "/certificates/playground-pre-a1.png", primary: "#FE6A2F", accent: "#FFF4D6", text: "#7A3B0E", heading: "LITTLE EXPLORER CERTIFICATE", textShift: 0 },
  "playground:A1": { file: "/certificates/playground-a1.png", primary: "#E8590C", accent: "#FFE9A8", text: "#6B3A00", heading: "RISING STAR CERTIFICATE", textShift: -62 },
};

interface TemplateRow {
  id?: string;
  hub: HubKey;
  cefr_level: CefrLevel;
  template_type: "engine_mastery";
  primary_color: string | null;
  accent_color: string | null;
  text_color: string | null;
  logo_url: string | null;
  background_url: string | null;
  heading: string | null;
  subheading: string | null;
  name: string;
  design_config: Record<string, unknown>;
  is_active: boolean;
}

function defaultRow(hub: HubKey, level: CefrLevel): TemplateRow {
  const p = paletteFor(hub, level);
  return {
    hub,
    cefr_level: level,
    template_type: "engine_mastery",
    primary_color: p.primary,
    accent_color: p.accent,
    text_color: p.text,
    logo_url: null,
    background_url: null,
    heading: "ENGLEUPHORIA · CERTIFICATE OF MASTERY",
    subheading: "engleuphoria.com",
    name: `${HUB_LABEL[hub]} · ${level}`,
    design_config: {},
    is_active: true,
  };
}

export default function CertificateDesigner() {
  const [hub, setHub] = useState<HubKey>("playground");
  const [level, setLevel] = useState<CefrLevel>("A1");
  const [row, setRow] = useState<TemplateRow>(defaultRow("playground", "A1"));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("certificate_templates")
        .select("*")
        .eq("hub", hub)
        .eq("cefr_level", level)
        .eq("template_type", "engine_mastery")
        .maybeSingle();
      if (cancel) return;
      setRow(data ? { ...defaultRow(hub, level), ...data } as TemplateRow : defaultRow(hub, level));
      setLoading(false);
    })();
    return () => { cancel = true; };
  }, [hub, level]);

  const artMode = (row.design_config?.artMode as "wash" | "full" | undefined) ?? "wash";
  const preset = ILLUSTRATED_ART[`${hub}:${level}`];
  const usePreset = () => {
    if (!preset) return;
    setRow((r) => ({
      ...r,
      background_url: `${SITE}${preset.file}`,
      primary_color: preset.primary, accent_color: preset.accent, text_color: preset.text,
      heading: preset.heading,
      design_config: { ...r.design_config, artMode: "full", textShift: preset.textShift },
    }));
  };

  const svg = useMemo(() => renderCertificateSVG({
    hub,
    cefrLevel: level,
    title: artMode === "full" ? (level === "Pre-A1" ? "Explorer Graduation" : `${level} English`) : `${level} Mastery`,
    subtitle: artMode === "full" ? (level === "Pre-A1" ? "Pre-A1 English · Units 1–10" : `${level} English · course complete`) : "12 quests · 88% accuracy",
    recipientName: "Alex Learner",
    awardedAt: new Date().toISOString(),
    logoUrl: row.logo_url || undefined,
    backgroundUrl: previewUrl(row.background_url) || undefined,
    heading: row.heading || undefined,
    subheading: row.subheading || undefined,
    primaryOverride: row.primary_color || undefined,
    accentOverride: row.accent_color || undefined,
    textOverride: row.text_color || undefined,
    artMode,
    textShift: Number(row.design_config?.textShift) || 0,
  }), [hub, level, row, artMode]);

  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  const upload = async (kind: "logo" | "background", file: File) => {
    const path = `${hub}/${level}/${kind}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("certificate-assets").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from("certificate-assets").getPublicUrl(path);
    setRow((r) => ({ ...r, [kind === "logo" ? "logo_url" : "background_url"]: data.publicUrl }));
    toast.success(`${kind === "logo" ? "Logo" : "Background"} uploaded`);
  };

  const save = async () => {
    setSaving(true);
    const payload = { ...row, hub, cefr_level: level, template_type: "engine_mastery" as const };
    const { error } = await supabase.from("certificate_templates").upsert(payload, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- design_config is Json in the generated types
      onConflict: "hub,cefr_level,template_type" as any,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Certificate design saved");
  };

  const reset = () => setRow(defaultRow(hub, level));

  const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-1">
      <Label className="text-xs text-slate-400">{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 rounded border border-slate-700 bg-slate-900" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="bg-slate-900 border-slate-700 text-slate-100 font-mono text-xs" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Certificate Designer</h1>
        <p className="text-sm text-slate-400">Design the certificate students earn — one per hub × CEFR level. Colors, logo, and background are yours to control.</p>
      </div>

      <Tabs value={hub} onValueChange={(v) => setHub(v as HubKey)}>
        <TabsList className="bg-slate-900 border border-slate-800">
          {HUBS.map((h) => (
            <TabsTrigger key={h} value={h}>{HUB_LABEL[h]} Hub</TabsTrigger>
          ))}
        </TabsList>

        {HUBS.map((h) => (
          <TabsContent key={h} value={h} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {CEFR_LEVELS.map((lv) => {
                const active = level === lv;
                const p = paletteFor(h, lv);
                return (
                  <button
                    key={lv}
                    onClick={() => setLevel(lv)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${active ? "text-white shadow-lg scale-105" : "text-slate-300 border-slate-700 hover:border-slate-500"}`}
                    style={active ? { background: p.primary, borderColor: p.primary } : { background: p.accent + "20" }}
                  >
                    {lv}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-slate-950 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-200 text-base">Design tokens</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="text-slate-500 text-sm">Loading…</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <ColorInput label="Primary" value={row.primary_color || "#000"} onChange={(v) => setRow((r) => ({ ...r, primary_color: v }))} />
                        <ColorInput label="Accent" value={row.accent_color || "#fff"} onChange={(v) => setRow((r) => ({ ...r, accent_color: v }))} />
                        <ColorInput label="Text" value={row.text_color || "#111"} onChange={(v) => setRow((r) => ({ ...r, text_color: v }))} />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-slate-400">Heading</Label>
                        <Input value={row.heading || ""} onChange={(e) => setRow((r) => ({ ...r, heading: e.target.value }))} className="bg-slate-900 border-slate-700 text-slate-100" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-slate-400">Signature line</Label>
                        <Input value={row.subheading || ""} onChange={(e) => setRow((r) => ({ ...r, subheading: e.target.value }))} className="bg-slate-900 border-slate-700 text-slate-100" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-400 flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Logo (PNG/SVG)</Label>
                          <label className="flex items-center gap-2 px-3 py-2 rounded border border-dashed border-slate-700 bg-slate-900 hover:bg-slate-800 cursor-pointer text-xs text-slate-300">
                            <Upload className="h-3.5 w-3.5" /> Upload
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload("logo", e.target.files[0])} />
                          </label>
                          {row.logo_url && <div className="text-[10px] text-slate-500 truncate">{row.logo_url}</div>}
                          {row.logo_url && <Button size="sm" variant="ghost" className="h-6 text-xs text-slate-400" onClick={() => setRow((r) => ({ ...r, logo_url: null }))}>Remove</Button>}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-400 flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Background</Label>
                          <label className="flex items-center gap-2 px-3 py-2 rounded border border-dashed border-slate-700 bg-slate-900 hover:bg-slate-800 cursor-pointer text-xs text-slate-300">
                            <Upload className="h-3.5 w-3.5" /> Upload
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload("background", e.target.files[0])} />
                          </label>
                          {row.background_url && <div className="text-[10px] text-slate-500 truncate">{row.background_url}</div>}
                          {row.background_url && <Button size="sm" variant="ghost" className="h-6 text-xs text-slate-400" onClick={() => setRow((r) => ({ ...r, background_url: null }))}>Remove</Button>}
                        </div>
                      </div>

                      <div className="space-y-2 rounded border border-slate-800 p-3">
                        <label className="flex items-center gap-2 text-xs text-slate-300">
                          <input type="checkbox" checked={artMode === "full"}
                            onChange={(e) => setRow((r) => ({ ...r, design_config: { ...r.design_config, artMode: e.target.checked ? "full" : "wash" } }))} />
                          Illustrated certificate — show the background picture at full strength, text inside its white panel
                        </label>
                        {preset && (
                          <Button size="sm" variant="outline" onClick={usePreset} className="border-amber-500/60 text-amber-300">
                            Use the {HUB_LABEL[hub]} {level} illustration
                          </Button>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button onClick={save} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-slate-950">
                          <Save className="h-4 w-4 mr-1.5" /> {saving ? "Saving…" : "Save design"}
                        </Button>
                        <Button variant="outline" onClick={reset} className="border-slate-700 text-slate-300">
                          <RotateCcw className="h-4 w-4 mr-1.5" /> Reset to defaults
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-950 border-slate-800">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-slate-200 text-base">Live preview</CardTitle>
                  <a href={dataUrl} download={`certificate-${hub}-${level}.svg`} className="text-xs text-amber-400 hover:underline">Download SVG</a>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-slate-800 bg-white">
                    {/* inline SVG (not <img>): an <img> SVG may not load its background picture. Text is escaped by the renderer. */}
                    <div role="img" aria-label="Certificate preview" className="w-full [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
                      dangerouslySetInnerHTML={{ __html: svg.replace(/^<\?xml[^>]*>\s*/, "") }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
