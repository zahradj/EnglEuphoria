import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageGenerationResult {
  slideId: string;
  imageUrl: string | null;
  error?: string;
}

interface VocabularySlide {
  id: string;
  type: string;
  content: {
    word?: string;
    imageKeyword?: string;
  };
  imageUrl?: string;
}

export const useVocabularyImageGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentWord, setCurrentWord] = useState<string>("");

  const generateImagesForLesson = useCallback(async (
    slides: VocabularySlide[],
    lessonId?: string
  ): Promise<Map<string, string>> => {
    const imageMap = new Map<string, string>();
    
    // Filter vocabulary slides that need images
    const vocabularySlides = slides.filter(
      (slide) => 
        slide.type === "vocabulary" && 
        slide.content?.word && 
        !slide.imageUrl
    );

    if (vocabularySlides.length === 0) {
      return imageMap;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Build prompts for batch generation
      const imagePrompts: Record<string, string> = {};
      
      vocabularySlides.forEach((slide) => {
        const word = slide.content.word!;
        const keyword = slide.content.imageKeyword || word;
        imagePrompts[slide.id] = `A clear, colorful illustration of "${keyword}" suitable for ESL students learning the word "${word}". Simple, child-friendly, educational style.`;
      });

      toast.info(`Generating ${vocabularySlides.length} vocabulary images...`);

      // Call the batch image generation edge function
      const { data, error } = await supabase.functions.invoke("batch-generate-lesson-images", {
        body: { imagePrompts }
      });

      if (error) {
        throw error;
      }

      if (data?.results) {
        Object.entries(data.results).forEach(([slideId, imageUrl]) => {
          if (typeof imageUrl === 'string') {
            imageMap.set(slideId, imageUrl);
          }
        });
      }

      const successCount = imageMap.size;
      const failedCount = vocabularySlides.length - successCount;

      if (successCount > 0) {
        toast.success(`Generated ${successCount} vocabulary images`);
      }
      
      if (failedCount > 0 && data?.errors) {
        console.warn("Some images failed to generate:", data.errors);
        toast.warning(`${failedCount} images could not be generated`);
      }

      setProgress(100);
      return imageMap;

    } catch (error: any) {
      console.error("Error generating vocabulary images:", error);
      toast.error("Failed to generate vocabulary images");
      return imageMap;
    } finally {
      setIsGenerating(false);
      setCurrentWord("");
    }
  }, []);

  const generateSingleImage = useCallback(async (
    word: string,
    imageKeyword?: string
  ): Promise<string | null> => {
    setIsGenerating(true);
    setCurrentWord(word);

    try {
      const prompt = `A clear, colorful illustration of "${imageKeyword || word}" suitable for ESL students learning the word "${word}". Simple, child-friendly, educational style.`;

      const { data, error } = await supabase.functions.invoke("batch-generate-lesson-images", {
        body: { 
          imagePrompts: { single: prompt }
        }
      });

      if (error) throw error;

      const imageUrl = data?.results?.single;
      
      if (imageUrl) {
        return imageUrl;
      }

      return null;
    } catch (error: any) {
      console.error("Error generating image:", error);
      return null;
    } finally {
      setIsGenerating(false);
      setCurrentWord("");
    }
  }, []);

  // Apply generated images to lesson slides
  const applyImagesToSlides = useCallback((
    slides: any[],
    imageMap: Map<string, string>
  ): any[] => {
    return slides.map((slide) => {
      if (imageMap.has(slide.id)) {
        return {
          ...slide,
          imageUrl: imageMap.get(slide.id),
        };
      }
      return slide;
    });
  }, []);

  return {
    isGenerating,
    progress,
    currentWord,
    generateImagesForLesson,
    generateSingleImage,
    applyImagesToSlides,
  };
};
