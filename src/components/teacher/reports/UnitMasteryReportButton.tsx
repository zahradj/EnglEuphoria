import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2, Eye } from 'lucide-react';
import { generateUnitMasteryPdf, generateDemoReport } from '@/services/unitMasteryPdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface Props {
  studentName?: string;
  unitName?: string;
  score?: number;
  variant?: 'default' | 'demo';
}

export const UnitMasteryReportButton: React.FC<Props> = ({
  studentName,
  unitName,
  score,
  variant = 'demo',
}) => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const reportData = generateDemoReport();

      if (studentName) reportData.studentName = studentName;
      if (unitName) reportData.unitName = unitName;
      if (score) reportData.overallScore = score;

      const doc = generateUnitMasteryPdf(reportData);
      const filename = `Engleuphoria_Report_${reportData.studentName.replace(/\s+/g, '_')}_${reportData.unitName.replace(/\s+/g, '_')}.pdf`;

      doc.save(filename);

      toast({
        title: '📄 Report Generated',
        description: `Diagnostic report for ${reportData.studentName} downloaded successfully.`,
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate the PDF report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = async () => {
    setGenerating(true);
    try {
      const reportData = generateDemoReport();
      if (studentName) reportData.studentName = studentName;
      if (unitName) reportData.unitName = unitName;
      if (score) reportData.overallScore = score;

      const doc = generateUnitMasteryPdf(reportData);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('PDF preview error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleGenerate}
        disabled={generating}
        className="bg-[#6B21A8] hover:bg-[#6B21A8]/90 text-white"
        size="sm"
      >
        {generating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4 mr-2" />
        )}
        Download Report
      </Button>
      <Button
        onClick={handlePreview}
        disabled={generating}
        variant="outline"
        size="sm"
        className="border-[#6B21A8]/30 text-[#6B21A8]"
      >
        <Eye className="h-4 w-4 mr-2" />
        Preview
      </Button>
    </div>
  );
};
