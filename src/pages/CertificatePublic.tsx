/**
 * Public shareable certificate view — read-only by token.
 * Includes share-to-social buttons (Twitter/Facebook/copy link).
 */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Award, Twitter, Facebook, Link as LinkIcon, Share2, Download, Linkedin } from "lucide-react";

const LABEL: Record<string, string> = {
  story: "Story Adventurer",
  escape_room: "Escape Master",
  detective_mystery: "Master Detective",
  hidden_object: "Eagle Eye",
};

export default function CertificatePublic() {
  const { token } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const { data } = await supabase
        .from("engine_mastery_certificates")
        .select("engine, hub, cefr_level, runs_count, avg_accuracy, awarded_at")
        .eq("share_token", token)
        .maybeSingle();
      setCert(data);
      setLoading(false);
    })();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const projectId = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID;
    if (!projectId) return;
    const ogUrl = `https://${projectId}.supabase.co/functions/v1/generate-certificate-og?token=${encodeURIComponent(token)}&format=png`;
    const tags = [
      ["property", "og:image", ogUrl],
      ["property", "og:image:type", "image/png"],
      ["property", "og:image:width", "1200"],
      ["property", "og:image:height", "630"],
      ["name", "twitter:image", ogUrl],
      ["name", "twitter:card", "summary_large_image"],
    ];
    const nodes = tags.map(([attr, key, value]) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", value);
      return el;
    });
    return () => { nodes.forEach((n) => n.remove()); };
  }, [token]);

  if (loading) return <div className="min-h-screen grid place-items-center">Loading…</div>;
  if (!cert) return <div className="min-h-screen grid place-items-center text-muted-foreground">Certificate not found.</div>;

  const url = typeof window !== "undefined" ? window.location.href : "";
  const label = LABEL[cert.engine] || cert.engine;
  const shareText = `I earned the "${label}" certificate on Engleuphoria — ${cert.runs_count} quests at ${Math.round(cert.avg_accuracy * 100)}% accuracy!`;

  const share = async (kind: "twitter" | "facebook" | "copy" | "native") => {
    if (kind === "native" && typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share({ title: label, text: shareText, url }); } catch { /* dismissed */ }
      return;
    }
    if (kind === "copy") {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied" });
      return;
    }
    const targets = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    } as const;
    window.open(targets[kind], "_blank", "noopener,noreferrer");
  };

  const projectId = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID;
  const ogUrl = projectId && token
    ? `https://${projectId}.supabase.co/functions/v1/generate-certificate-og?token=${encodeURIComponent(token)}`
    : null;
  const pngUrl = projectId && token
    ? `https://${projectId}.supabase.co/functions/v1/generate-certificate-og?token=${encodeURIComponent(token)}&format=png`
    : null;

  const downloadPng = async () => {
    if (!pngUrl) return;
    try {
      const res = await fetch(pngUrl);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `engleuphoria-${label.replace(/\s+/g, "-").toLowerCase()}-certificate.png`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(objUrl);
    } catch {
      toast({ title: "Download failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const shareLinkedIn = () => {
    const target = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-slate-50">
      <div className="max-w-3xl w-full space-y-4">
        <Card className="shadow-2xl overflow-hidden border-0">
          <CardContent className="p-0">
            {ogUrl ? (
              <img src={ogUrl} alt={`${label} certificate`} className="w-full h-auto block" />
            ) : (
              <div className="p-12 text-center space-y-4">
                <Award className="h-16 w-16 text-yellow-500 mx-auto" />
                <div className="text-4xl font-bold">{label}</div>
                <div className="text-lg">{cert.runs_count} quests · {Math.round(cert.avg_accuracy * 100)}%</div>
                <div className="text-sm text-muted-foreground">{cert.hub} hub{cert.cefr_level ? ` · ${cert.cefr_level}` : ""}</div>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" onClick={downloadPng} disabled={!pngUrl}><Download className="h-4 w-4 mr-1.5" /> Download PNG</Button>
          <Button size="sm" variant="outline" onClick={shareLinkedIn}><Linkedin className="h-4 w-4 mr-1.5" /> LinkedIn</Button>
          <Button size="sm" variant="outline" onClick={() => share("twitter")}><Twitter className="h-4 w-4 mr-1.5" /> Tweet</Button>
          <Button size="sm" variant="outline" onClick={() => share("facebook")}><Facebook className="h-4 w-4 mr-1.5" /> Share</Button>
          <Button size="sm" variant="outline" onClick={() => share("copy")}><LinkIcon className="h-4 w-4 mr-1.5" /> Copy Link</Button>
          <Button size="sm" variant="outline" onClick={() => share("native")}><Share2 className="h-4 w-4 mr-1.5" /> More</Button>
        </div>
        <div className="text-center text-xs text-muted-foreground">
          Awarded {new Date(cert.awarded_at).toLocaleDateString()}
        </div>

      </div>
    </div>
  );
}
