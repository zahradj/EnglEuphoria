import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ArrowLeft, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoBlack from "@/assets/logo-black.png";

type HubType = "Playground" | "Academy" | "Professional";

interface CertData {
  id: string;
  studentName: string;
  cefrLevel: string;
  completionDate: string;
  hubType: HubType;
  uniqueCertId: string;
  certificateNumber: string;
  title: string;
  teacherName?: string;
}

// Map level number (1-3+) to color depth per hub
function getHubPalette(hub: HubType, levelDepth: number) {
  // Clamp depth 1..3
  const d = Math.max(1, Math.min(3, levelDepth));

  if (hub === "Playground") {
    const accent = d === 1 ? "#FACC15" /* yellow-400 */ : d === 2 ? "#F97316" /* orange-500 */ : "#EA580C"; /* orange-600 */
    const deep = d === 1 ? "#CA8A04" : d === 2 ? "#C2410C" : "#9A3412";
    const soft = "#FEF3C7";
    return { accent, deep, soft, label: "Playground Hub" };
  }
  if (hub === "Academy") {
    const accent = d === 1 ? "#A78BFA" /* violet-400 */ : d === 2 ? "#7C3AED" /* violet-600 */ : "#6D28D9"; /* violet-700 */
    const deep = d === 1 ? "#7C3AED" : d === 2 ? "#5B21B6" : "#4C1D95";
    const soft = "#EDE9FE";
    return { accent, deep, soft, label: "Academy Hub" };
  }
  // Professional / Success Hub (Emerald per workspace rules)
  const accent = d === 1 ? "#34D399" : d === 2 ? "#059669" : "#047857";
  const deep = d === 1 ? "#047857" : d === 2 ? "#065F46" : "#064E3B";
  const soft = "#D1FAE5";
  return { accent, deep, soft, label: "Success Hub" };
}

// Derive level depth from CEFR (A1=1, A2=1, B1=2, B2=2, C1=3, C2=3)
function depthFromCefr(cefr: string): number {
  const c = (cefr || "").toUpperCase();
  if (c.startsWith("A")) return 1;
  if (c.startsWith("B")) return 2;
  if (c.startsWith("C")) return 3;
  return 1;
}

// Infer hub from cert metadata or type
function inferHub(certificateType?: string, metadata?: any): HubType {
  const t = (certificateType || "").toLowerCase();
  const m = (metadata?.hub || metadata?.hub_type || "").toString().toLowerCase();
  if (m.includes("playground") || t.includes("playground")) return "Playground";
  if (m.includes("academy") || t.includes("academy")) return "Academy";
  if (m.includes("professional") || m.includes("success") || t.includes("professional") || t.includes("success")) return "Professional";
  return "Academy";
}

export default function StudentCertificatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: data ? `EnglEuphoria-Certificate-${data.certificateNumber}` : "EnglEuphoria-Certificate",
    pageStyle: `
      @page { size: A4 landscape; margin: 0; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `,
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data: cert, error } = await supabase
          .from("certificates")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        if (!cert) {
          toast({ title: "Certificate not found", variant: "destructive" });
          setLoading(false);
          return;
        }

        // Fetch student name
        let studentName = "Student";
        if (cert.student_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, first_name, last_name")
            .eq("user_id", cert.student_id)
            .maybeSingle();
          studentName =
            profile?.full_name ||
            [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
            "Student";
        }

        let teacherName: string | undefined;
        if (cert.teacher_id) {
          const { data: tProfile } = await supabase
            .from("profiles")
            .select("full_name, first_name, last_name")
            .eq("user_id", cert.teacher_id)
            .maybeSingle();
          teacherName =
            tProfile?.full_name ||
            [tProfile?.first_name, tProfile?.last_name].filter(Boolean).join(" ") ||
            undefined;
        }

        setData({
          id: cert.id,
          studentName,
          cefrLevel: cert.cefr_level || "A1",
          completionDate: cert.issue_date || new Date().toISOString().slice(0, 10),
          hubType: inferHub(cert.certificate_type, cert.metadata),
          uniqueCertId: cert.verification_code || cert.id,
          certificateNumber: cert.certificate_number || cert.id.slice(0, 8).toUpperCase(),
          title: cert.title || "Certificate of Achievement",
          teacherName,
        });
      } catch (err: any) {
        console.error("Certificate load error:", err);
        toast({ title: "Error loading certificate", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-muted/40 p-8 flex items-center justify-center">
        <div className="w-full max-w-5xl space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Certificate not found.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  const depth = depthFromCefr(data.cefrLevel);
  const palette = getHubPalette(data.hubType, depth);
  const formattedDate = new Date(data.completionDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 p-4 md:p-8">
      {/* Toolbar — hidden on print */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          onClick={() => handlePrint()}
          size="lg"
          className="shadow-lg"
          style={{ backgroundColor: palette.deep, color: "white" }}
        >
          <Download className="w-5 h-5 mr-2" /> Download PDF / Print
        </Button>
      </div>

      {/* Printable certificate */}
      <div className="max-w-6xl mx-auto">
        <div
          ref={printRef}
          className="certificate-sheet relative mx-auto shadow-2xl print:shadow-none"
          style={{
            backgroundColor: "#FCFDFB",
            aspectRatio: "297 / 210",
            width: "100%",
            maxWidth: "1123px",
            color: palette.deep,
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
          }}
        >
          {/* Outer ornamental border */}
          <div
            className="absolute inset-4"
            style={{
              border: `3px solid ${palette.accent}`,
              borderRadius: "4px",
            }}
          />
          <div
            className="absolute inset-6"
            style={{
              border: `1px solid ${palette.deep}`,
              borderRadius: "2px",
            }}
          />

          {/* Corner ornaments */}
          {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((pos) => (
            <CornerOrnament key={pos} position={pos} color={palette.accent} deep={palette.deep} />
          ))}

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-between px-16 py-12 text-center">
            {/* Logo */}
            <div className="flex flex-col items-center gap-2">
              <img src={logoBlack} alt="EnglEuphoria" className="h-16 object-contain" />
              <div
                className="text-[10px] tracking-[0.4em] font-semibold uppercase"
                style={{ color: palette.deep, opacity: 0.7 }}
              >
                {palette.label} · CEFR {data.cefrLevel}
              </div>
            </div>

            {/* Title block */}
            <div className="space-y-3">
              <h1
                className="text-5xl md:text-6xl font-bold tracking-wide"
                style={{ color: palette.deep, fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Certificate of Achievement
              </h1>
              <div
                className="mx-auto h-[2px] w-40"
                style={{ backgroundColor: palette.accent }}
              />
              <p className="text-sm tracking-[0.3em] uppercase" style={{ color: palette.deep, opacity: 0.7 }}>
                Awarded with distinction
              </p>
            </div>

            {/* Body */}
            <div className="space-y-4 max-w-3xl">
              <p className="text-base italic" style={{ color: "#475569" }}>
                This is to certify that
              </p>
              <h2
                className="text-4xl md:text-5xl font-semibold pb-2"
                style={{
                  color: palette.deep,
                  borderBottom: `1px solid ${palette.accent}`,
                  fontFamily: "'Great Vibes', 'Pinyon Script', cursive",
                }}
              >
                {data.studentName}
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: "#1f2937" }}>
                has successfully completed the{" "}
                <span className="font-semibold" style={{ color: palette.deep }}>
                  {data.cefrLevel}
                </span>{" "}
                Level at <span className="font-semibold">EnglEuphoria</span>, demonstrating mastery of the
                language skills, fluency, and cultural awareness required at this stage.
              </p>
            </div>

            {/* Signatures + date */}
            <div className="w-full grid grid-cols-3 items-end gap-8 pt-8">
              <SignatureBlock
                label="Date of Completion"
                value={formattedDate}
                color={palette.deep}
              />
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: palette.soft,
                    border: `2px solid ${palette.accent}`,
                  }}
                >
                  <ShieldCheck className="w-10 h-10" style={{ color: palette.deep }} />
                </div>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: palette.deep, opacity: 0.7 }}>
                  Verified · #{data.certificateNumber}
                </div>
                <div className="text-[9px] font-mono" style={{ color: "#64748b" }}>
                  {data.uniqueCertId}
                </div>
              </div>
              <SignatureBlock
                label={data.teacherName ? "Mentor Signature" : "Academic Director"}
                value={data.teacherName || "EnglEuphoria"}
                color={palette.deep}
                script
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignatureBlock({
  label,
  value,
  color,
  script,
}: {
  label: string;
  value: string;
  color: string;
  script?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={script ? "text-2xl pb-1" : "text-base font-medium pb-1"}
        style={{
          color,
          fontFamily: script ? "'Great Vibes', cursive" : undefined,
        }}
      >
        {value}
      </div>
      <div className="w-full h-[1px]" style={{ backgroundColor: color, opacity: 0.4 }} />
      <div className="text-[10px] uppercase tracking-widest mt-2" style={{ color, opacity: 0.7 }}>
        {label}
      </div>
    </div>
  );
}

function CornerOrnament({
  position,
  color,
  deep,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color: string;
  deep: string;
}) {
  const rot = {
    "top-left": 0,
    "top-right": 90,
    "bottom-right": 180,
    "bottom-left": 270,
  }[position];
  const placement = {
    "top-left": "top-8 left-8",
    "top-right": "top-8 right-8",
    "bottom-right": "bottom-8 right-8",
    "bottom-left": "bottom-8 left-8",
  }[position];
  return (
    <div className={`absolute ${placement}`} style={{ transform: `rotate(${rot}deg)` }}>
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 30 Q2 2 30 2" stroke={color} strokeWidth="2" fill="none" />
        <path d="M2 22 Q2 8 22 8" stroke={deep} strokeWidth="1" fill="none" opacity="0.6" />
        <circle cx="2" cy="2" r="3" fill={deep} />
        <circle cx="14" cy="14" r="2" fill={color} />
      </svg>
    </div>
  );
}
