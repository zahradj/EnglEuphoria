/**
 * Student view of all earned Engine Mastery Certificates.
 * Uses browser print for PDF export (`window.print`).
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Printer, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { checkAndAwardCertificates } from "@/lib/engineCertificates";

interface Cert {
  id: string;
  engine: string;
  hub: string;
  runs_count: number;
  avg_accuracy: number;
  awarded_at: string;
  share_token: string | null;
}

const LABEL: Record<string, string> = {
  story: "Story Adventurer",
  escape_room: "Escape Master",
  detective_mystery: "Master Detective",
  hidden_object: "Eagle Eye",
};

export default function EngineCertificates() {
  const [certs, setCerts] = useState<Cert[]>([]);

  useEffect(() => {
    (async () => {
      await checkAndAwardCertificates();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("engine_mastery_certificates")
        .select("*")
        .eq("user_id", user.id)
        .order("awarded_at", { ascending: false });
      if (data) setCerts(data as any);
    })();
  }, []);

  const share = (token: string | null) => {
    if (!token) return;
    const url = `${window.location.origin}/engine-certificate/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: url });
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-6 print:p-0">
      <header className="flex items-center justify-between print:hidden">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Award className="h-7 w-7 text-yellow-500" /> Mastery Certificates
        </h1>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Print / PDF
        </Button>
      </header>

      {certs.length === 0 && (
        <Card><CardContent className="py-10 text-center text-muted-foreground">
          Complete 5+ engine quests with 80%+ average to earn your first certificate.
        </CardContent></Card>
      )}

      <div className="grid gap-4">
        {certs.map((c) => (
          <Card key={c.id} className="overflow-hidden border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50">
            <CardContent className="p-8 text-center space-y-3">
              <Award className="h-12 w-12 text-yellow-500 mx-auto" />
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Certificate of Mastery
              </div>
              <div className="text-2xl font-bold">{LABEL[c.engine] || c.engine}</div>
              <div className="text-sm text-muted-foreground">
                {c.runs_count} quests · {Math.round(c.avg_accuracy * 100)}% average · {c.hub} hub
              </div>
              <div className="text-xs text-muted-foreground">
                Awarded {new Date(c.awarded_at).toLocaleDateString()}
              </div>
              <div className="flex gap-2 justify-center pt-2 print:hidden">
                <Button size="sm" variant="outline" onClick={() => share(c.share_token)}>
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
