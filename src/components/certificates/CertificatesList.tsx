import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { CertificateCard } from "./CertificateCard";
import { Award } from "lucide-react";

interface Certificate {
  id: string;
  title: string;
  description: string;
  certificate_type: string;
  cefr_level?: string;
  issue_date: string;
  certificate_number: string;
  verification_code: string;
  score_achieved?: number;
  hours_completed?: number;
  skills_demonstrated?: string[];
}

export function CertificatesList() {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', user.id)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading certificates...</div>;
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Certificates Yet</h3>
        <p className="text-muted-foreground">
          Complete assessments and courses to earn certificates
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Certificates</h2>
        <div className="text-sm text-muted-foreground">
          {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {certificates.map((certificate) => (
          <CertificateCard key={certificate.id} certificate={certificate} />
        ))}
      </div>
    </div>
  );
}