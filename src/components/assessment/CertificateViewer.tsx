import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Download, Share2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Certificate {
  id: string;
  title: string;
  description: string;
  certificate_type: string;
  cefr_level: string;
  issue_date: string;
  certificate_number: string;
  verification_code: string;
  score_achieved: number;
  hours_completed: number;
  skills_demonstrated: string[];
  student: { full_name: string };
  teacher: { full_name: string };
}

interface CertificateViewerProps {
  certificateId: string;
  open: boolean;
  onClose: () => void;
}

export function CertificateViewer({ certificateId, open, onClose }: CertificateViewerProps) {
  const { toast } = useToast();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [certificateHtml, setCertificateHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && certificateId) {
      loadCertificate();
    }
  }, [open, certificateId]);

  const loadCertificate = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          student:student_id (full_name),
          teacher:teacher_id (full_name)
        `)
        .eq('id', certificateId)
        .single();

      if (error) throw error;
      setCertificate(data);

      // Generate certificate HTML
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-certificate', {
        body: { certificateId }
      });

      if (functionError) throw functionError;
      setCertificateHtml(functionData.html);
    } catch (error: any) {
      console.error('Error loading certificate:', error);
      toast({
        title: "Error loading certificate",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    if (!certificateHtml) return;
    // Use a Blob URL instead of document.write() so the certificate HTML
    // is rendered in its own origin and cannot execute scripts in this page.
    const blob = new Blob([certificateHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      setTimeout(() => {
        try { printWindow.print(); } catch { /* user can print manually */ }
      }, 800);
    }
    // Revoke after a generous delay to allow rendering/printing.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const handleShare = async () => {
    if (certificate) {
      const shareText = `I've earned a certificate in English! ${certificate.title}\nVerification: ${certificate.verification_code}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: certificate.title,
            text: shareText
          });
        } catch (error) {
          console.error('Error sharing:', error);
        }
      } else {
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard!",
          description: "Share text has been copied to your clipboard."
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            {certificate?.title || "Certificate"}
          </DialogTitle>
        </DialogHeader>

        {certificate && (
          <div className="space-y-4">
            <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <div className="text-center space-y-2">
                <Award className="w-16 h-16 mx-auto text-yellow-500" />
                <h2 className="text-2xl font-bold">{certificate.title}</h2>
                <p className="text-muted-foreground">{certificate.description}</p>
                
                {certificate.cefr_level && (
                  <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    CEFR Level {certificate.cefr_level}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  {certificate.score_achieved && (
                    <div>
                      <div className="text-muted-foreground">Final Score</div>
                      <div className="font-semibold">{certificate.score_achieved}%</div>
                    </div>
                  )}
                  {certificate.hours_completed && (
                    <div>
                      <div className="text-muted-foreground">Hours Completed</div>
                      <div className="font-semibold">{certificate.hours_completed}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-muted-foreground">Issue Date</div>
                    <div className="font-semibold">{new Date(certificate.issue_date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Certificate No.</div>
                    <div className="font-semibold text-xs">{certificate.certificate_number}</div>
                  </div>
                </div>

                {certificate.skills_demonstrated && certificate.skills_demonstrated.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground mb-2">Skills Mastered</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {certificate.skills_demonstrated.map((skill, index) => (
                        <span key={index} className="bg-background px-3 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    Verification Code: <span className="font-mono font-semibold">{certificate.verification_code}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
