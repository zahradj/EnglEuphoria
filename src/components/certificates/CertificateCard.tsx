import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Eye, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface CertificateCardProps {
  certificate: {
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
  };
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    navigate(`/certificate/${certificate.id}`);
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-2">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg text-white">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{certificate.title}</h3>
              <p className="text-sm text-muted-foreground">{certificate.description}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white dark:bg-slate-900">
            {certificate.certificate_type}
          </Badge>
        </div>

        {certificate.cefr_level && (
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              CEFR Level: {certificate.cefr_level}
            </Badge>
          </div>
        )}

        {certificate.skills_demonstrated && certificate.skills_demonstrated.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Skills Demonstrated:</p>
            <div className="flex flex-wrap gap-1">
              {certificate.skills_demonstrated.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {certificate.score_achieved && (
            <div>
              <span className="text-muted-foreground">Score:</span>
              <span className="ml-2 font-semibold">{certificate.score_achieved}%</span>
            </div>
          )}
          {certificate.hours_completed && (
            <div>
              <span className="text-muted-foreground">Hours:</span>
              <span className="ml-2 font-semibold">{certificate.hours_completed}h</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Issued:</span>
            <span className="ml-2 font-semibold">
              {new Date(certificate.issue_date).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <Shield className="w-3 h-3 text-green-600" />
            <span className="font-medium">Certificate #{certificate.certificate_number}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Verification: {certificate.verification_code}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpen}
            disabled={loading}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={handleOpen}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Download className="w-4 h-4 mr-1" />
            Download PDF
          </Button>
        </div>
      </div>
    </Card>
  );
}