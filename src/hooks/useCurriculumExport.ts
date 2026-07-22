import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ExportFormat = 'scorm' | 'h5p' | 'html5';

export interface ExportOptions {
  includeTeacherNotes?: boolean;
  includeAnswerKeys?: boolean;
  packageName?: string;
  courseTitle?: string;
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  downloadData?: string;
  fileName: string;
  format: ExportFormat;
  lessonCount: number;
  fileSizeBytes?: number;
  error?: string;
}

export interface ExportHistoryItem {
  id: string;
  format: ExportFormat;
  lesson_count: number;
  file_name: string;
  storage_path: string;
  file_size_bytes: number | null;
  created_at: string;
  expires_at: string;
}

interface UseExportState {
  isExporting: boolean;
  progress: number;
  currentStep: string;
  lastResult: ExportResult | null;
  error: string | null;
}

export function useCurriculumExport() {
  const [state, setState] = useState<UseExportState>({
    isExporting: false,
    progress: 0,
    currentStep: '',
    lastResult: null,
    error: null
  });
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const { toast } = useToast();

  const loadExportHistory = useCallback(async () => {
    const { data, error } = await supabase
      .from('curriculum_exports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setExportHistory(data as ExportHistoryItem[]);
    }
  }, []);

  const exportLessons = useCallback(async (
    lessonIds: string[],
    format: ExportFormat,
    options: ExportOptions = {}
  ): Promise<ExportResult> => {
    if (lessonIds.length === 0) {
      toast({
        title: "No Lessons Selected",
        description: "Please select at least one lesson to export.",
        variant: "destructive"
      });
      return { success: false, fileName: '', format, lessonCount: 0, error: "No lessons selected" };
    }

    setState(prev => ({
      ...prev,
      isExporting: true,
      progress: 10,
      currentStep: 'Preparing export...',
      error: null
    }));

    try {
      setState(prev => ({ ...prev, progress: 30, currentStep: 'Generating package...' }));

      const { data, error } = await supabase.functions.invoke('export-curriculum', {
        body: { lessonIds, format, options }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Export failed');

      setState(prev => ({ ...prev, progress: 90, currentStep: 'Finalizing...' }));

      const result: ExportResult = {
        success: true,
        downloadUrl: data.downloadUrl,
        downloadData: data.downloadData,
        fileName: data.fileName,
        format,
        lessonCount: data.lessonCount,
        fileSizeBytes: data.fileSizeBytes
      };

      setState(prev => ({
        ...prev,
        isExporting: false,
        progress: 100,
        currentStep: 'Complete!',
        lastResult: result
      }));

      toast({
        title: "Export Complete! 📦",
        description: `${data.lessonCount} lessons exported as ${format.toUpperCase()}.`
      });

      // Trigger download if we have direct data
      if (data.downloadData) {
        downloadBase64File(data.downloadData, data.fileName);
      } else if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }

      // Refresh history
      loadExportHistory();

      return result;

    } catch (error: any) {
      console.error('Export error:', error);
      const errorMessage = error.message || 'Export failed';

      setState(prev => ({
        ...prev,
        isExporting: false,
        progress: 0,
        currentStep: '',
        error: errorMessage
      }));

      toast({
        title: "Export Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return {
        success: false,
        fileName: '',
        format,
        lessonCount: 0,
        error: errorMessage
      };
    }
  }, [toast, loadExportHistory]);

  const downloadHistoryItem = useCallback(async (item: ExportHistoryItem) => {
    try {
      const { data: signedUrlData } = await supabase.storage
        .from('exports')
        .createSignedUrl(item.storage_path, 3600);

      if (signedUrlData?.signedUrl) {
        window.open(signedUrlData.signedUrl, '_blank');
      } else {
        throw new Error('Could not generate download link');
      }
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Could not download file",
        variant: "destructive"
      });
    }
  }, [toast]);

  const reset = useCallback(() => {
    setState({
      isExporting: false,
      progress: 0,
      currentStep: '',
      lastResult: null,
      error: null
    });
  }, []);

  return {
    ...state,
    exportHistory,
    exportLessons,
    loadExportHistory,
    downloadHistoryItem,
    reset
  };
}

// Helper function to download base64 data
function downloadBase64File(base64Data: string, fileName: string) {
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
