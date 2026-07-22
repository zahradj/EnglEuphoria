import { supabase } from '@/integrations/supabase/client';
import { imageGenerationService } from '@/services/imageGeneration';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload vocabulary image to Supabase Storage
 */
export async function uploadVocabularyImage(
  lessonId: string,
  word: string,
  file: File
): Promise<ImageUploadResult> {
  try {
    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Please use JPG, PNG, or WebP.' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 5MB.' };
    }

    // Create safe filename
    const safeWord = word.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileExt = file.name.split('.').pop();
    const fileName = `vocabulary/${lessonId}/${safeWord}.${fileExt}`;

    // Upload to Storage
    const { data, error } = await supabase.storage
      .from('lesson-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('lesson-images')
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading vocabulary image:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to upload image' 
    };
  }
}

/**
 * Upload intro screen image to Supabase Storage
 */
export async function uploadIntroScreen(
  lessonId: string,
  file: File
): Promise<ImageUploadResult> {
  try {
    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Please use JPG, PNG, or WebP.' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 5MB.' };
    }

    // Create filename
    const fileExt = file.name.split('.').pop();
    const fileName = `intro/${lessonId}.${fileExt}`;

    // Upload to Storage
    const { data, error } = await supabase.storage
      .from('lesson-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('lesson-images')
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading intro screen:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to upload intro screen' 
    };
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('lesson-images')
      .remove([path]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

/**
 * Generate image using AI
 */
export async function generateImageWithAI(
  prompt: string,
  ageGroup: string,
  cefrLevel: string,
  character?: { name: string; visual_blueprint: string; image_prompt?: string } | null
): Promise<ImageUploadResult> {
  try {
    const characterBlock = character
      ? ` Featuring the character "${character.name}" performing/showing the concept. Character visual lock: ${character.visual_blueprint}.${character.image_prompt ? ` Style reference: ${character.image_prompt}` : ''} Keep the character on-model in every detail.`
      : '';

    const enhancedPrompt = `${prompt}, educational illustration for ${ageGroup} learners, ${cefrLevel} level, colorful, clear subject, child-friendly, no text, simple background, suitable for ESL classroom.${characterBlock}`;

    const result = await imageGenerationService.generateImage({
      prompt: enhancedPrompt,
      style: character ? 'kawaii-chibi' : 'educational',
      aspectRatio: '4:3',
      quality: 'high',
      background: 'colored'
    });

    return { success: true, url: result.url };
  } catch (error) {
    console.error('Error generating image with AI:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate image' 
    };
  }
}


/**
 * Generate intro screen with AI
 */
export async function generateIntroScreenWithAI(
  topic: string,
  ageGroup: string,
  cefrLevel: string
): Promise<ImageUploadResult> {
  try {
    const prompt = `Engaging lesson intro screen for "${topic}", ${ageGroup} age group, educational setting, welcoming atmosphere, colorful design, ESL classroom theme, professional quality, ${cefrLevel} level`;

    const result = await imageGenerationService.generateImage({
      prompt,
      style: 'educational',
      aspectRatio: '16:9',
      quality: 'high',
      background: 'colored'
    });

    return { success: true, url: result.url };
  } catch (error) {
    console.error('Error generating intro screen:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate intro screen' 
    };
  }
}
