
import { useState, useCallback } from 'react';
import { aiContentApiService } from '@/services/ai/aiContentApiService';
import { contentLibraryService } from '@/services/ai/contentLibraryService';
import { ContentLibraryItem, AIContentRequest } from '@/services/ai/types';
import { useToast } from '@/hooks/use-toast';

export function useUnifiedAIContent() {
  const [contentLibrary, setContentLibrary] = useState<ContentLibraryItem[]>(
    contentLibraryService.getContentLibrary()
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateContent = useCallback(async (request: AIContentRequest) => {
    try {
      setIsGenerating(true);
      
      const content = await aiContentApiService.generateContent(request);
      
      contentLibraryService.addToLibrary(content);
      setContentLibrary(contentLibraryService.getContentLibrary());
      
      toast({
        title: "Content Generated",
        description: `${content.type} for ${content.topic} has been created successfully.`,
      });
      
      return content;
    } catch (error) {
      console.error('Content generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const clearContentLibrary = useCallback(() => {
    contentLibraryService.clearLibrary();
    setContentLibrary([]);
    toast({
      title: "Library Cleared",
      description: "All generated content has been removed.",
    });
  }, [toast]);

  const exportContent = useCallback((content: ContentLibraryItem) => {
    const exportData = contentLibraryService.exportContent(content);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Content Exported",
      description: `${content.title} has been downloaded.`,
    });
  }, [toast]);

  return {
    contentLibrary,
    isGenerating,
    generateContent,
    clearContentLibrary,
    exportContent,
    isProduction: contentLibraryService.isProduction()
  };
}
