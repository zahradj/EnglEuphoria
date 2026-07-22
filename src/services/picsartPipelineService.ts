/**
 * Picsart Pipeline Service
 * 
 * Transforms raw AI-generated images into polished, interactive lesson assets.
 * Pipeline stages:
 *   1. Remove Background → Extract subject as transparent PNG asset
 *   2. Smart Enhance → Upscale original to 2K+ resolution
 *   3. Style Transfer → Apply hub-specific visual filter
 *   4. Text Overlay → Generate consistent Word Bank graphics
 *   5. Save all artifacts to Supabase storage
 */

import { supabase } from '@/integrations/supabase/client';

export type PicsartStage = 'remove-bg' | 'enhance' | 'style-transfer' | 'text-overlay' | 'save-assets';
export type PicsartStageStatus = 'pending' | 'processing' | 'done' | 'error' | 'skipped';
export type HubFilter = 'playground' | 'academy' | 'professional';

export interface PicsartStageProgress {
  stage: PicsartStage;
  status: PicsartStageStatus;
  outputUrl: string | null;
  error: string | null;
}

export interface PicsartSlideResult {
  slideNumber: number;
  originalImageUrl: string;
  subjectAssetUrl: string | null;
  enhancedBgUrl: string | null;
  styledBgUrl: string | null;
  wordBankOverlayUrl: string | null;
  stages: PicsartStageProgress[];
}

export interface PicsartPipelineResult {
  lessonId: string;
  hub: HubFilter;
  slides: PicsartSlideResult[];
  totalProcessed: number;
  totalErrors: number;
  durationMs: number;
}

// ─── Picsart Edge Function Caller ─────────────────────────────────

async function callPicsart(action: string, params: Record<string, any>): Promise<{
  success: boolean;
  outputUrl: string | null;
  error: string | null;
}> {
  try {
    const response = await supabase.functions.invoke('picsart-process', {
      body: { action, ...params },
    });

    if (response.error) {
      throw new Error(response.error.message || 'Edge function error');
    }

    const data = response.data;
    if (!data?.success) {
      throw new Error(data?.error || 'Picsart processing failed');
    }

    return { success: true, outputUrl: data.outputUrl, error: null };
  } catch (err: any) {
    console.error(`Picsart ${action} failed:`, err);
    return { success: false, outputUrl: null, error: err.message };
  }
}

// ─── Storage Upload Helper ────────────────────────────────────────

async function uploadToStorage(
  imageUrl: string,
  path: string,
): Promise<string | null> {
  try {
    // Fetch the image
    const resp = await fetch(imageUrl);
    if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`);
    const blob = await resp.blob();

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('lesson-slides')
      .upload(path, blob, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('lesson-slides')
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  } catch (err) {
    console.error('Storage upload failed:', err);
    return null;
  }
}

// ─── Process Single Slide ─────────────────────────────────────────

async function processSlide(
  slideNumber: number,
  imageUrl: string,
  hub: HubFilter,
  wordBankText: string | null,
  lessonId: string,
  onStageUpdate: (stages: PicsartStageProgress[]) => void,
): Promise<PicsartSlideResult> {
  const stages: PicsartStageProgress[] = [
    { stage: 'remove-bg', status: 'pending', outputUrl: null, error: null },
    { stage: 'enhance', status: 'pending', outputUrl: null, error: null },
    { stage: 'style-transfer', status: 'pending', outputUrl: null, error: null },
    { stage: 'text-overlay', status: wordBankText ? 'pending' : 'skipped', outputUrl: null, error: null },
    { stage: 'save-assets', status: 'pending', outputUrl: null, error: null },
  ];

  const result: PicsartSlideResult = {
    slideNumber,
    originalImageUrl: imageUrl,
    subjectAssetUrl: null,
    enhancedBgUrl: null,
    styledBgUrl: null,
    wordBankOverlayUrl: null,
    stages,
  };

  // Stage 1: Remove Background → extract subject
  stages[0].status = 'processing';
  onStageUpdate([...stages]);

  const bgResult = await callPicsart('remove-background', { imageUrl });
  if (bgResult.success && bgResult.outputUrl) {
    stages[0].status = 'done';
    stages[0].outputUrl = bgResult.outputUrl;
    result.subjectAssetUrl = bgResult.outputUrl;
  } else {
    stages[0].status = 'error';
    stages[0].error = bgResult.error;
  }
  onStageUpdate([...stages]);

  // Stage 2: Smart Enhance → upscale original to 2K
  stages[1].status = 'processing';
  onStageUpdate([...stages]);

  const enhanceResult = await callPicsart('enhance', { imageUrl });
  if (enhanceResult.success && enhanceResult.outputUrl) {
    stages[1].status = 'done';
    stages[1].outputUrl = enhanceResult.outputUrl;
    result.enhancedBgUrl = enhanceResult.outputUrl;
  } else {
    stages[1].status = 'error';
    stages[1].error = enhanceResult.error;
  }
  onStageUpdate([...stages]);

  // Stage 3: Style Transfer → apply hub filter
  const sourceForStyle = result.enhancedBgUrl || imageUrl;
  stages[2].status = 'processing';
  onStageUpdate([...stages]);

  const styleResult = await callPicsart('style-transfer', {
    imageUrl: sourceForStyle,
    hub,
  });
  if (styleResult.success && styleResult.outputUrl) {
    stages[2].status = 'done';
    stages[2].outputUrl = styleResult.outputUrl;
    result.styledBgUrl = styleResult.outputUrl;
  } else {
    stages[2].status = 'error';
    stages[2].error = styleResult.error;
  }
  onStageUpdate([...stages]);

  // Stage 4: Text Overlay → Word Bank
  if (wordBankText) {
    const bgForText = result.styledBgUrl || result.enhancedBgUrl || imageUrl;
    stages[3].status = 'processing';
    onStageUpdate([...stages]);

    const textResult = await callPicsart('text-overlay', {
      imageUrl: bgForText,
      text: wordBankText,
      fontSize: hub === 'playground' ? 56 : hub === 'academy' ? 44 : 40,
      fontColor: hub === 'playground' ? '#FFD700' : hub === 'academy' ? '#00FFAA' : '#FFFFFF',
    });
    if (textResult.success && textResult.outputUrl) {
      stages[3].status = 'done';
      stages[3].outputUrl = textResult.outputUrl;
      result.wordBankOverlayUrl = textResult.outputUrl;
    } else {
      stages[3].status = 'error';
      stages[3].error = textResult.error;
    }
    onStageUpdate([...stages]);
  }

  // Stage 5: Save all assets to Supabase storage
  stages[4].status = 'processing';
  onStageUpdate([...stages]);

  try {
    const prefix = `picsart/${lessonId}/slide-${slideNumber}`;

    // Save subject asset (transparent PNG)
    if (result.subjectAssetUrl) {
      const storedUrl = await uploadToStorage(result.subjectAssetUrl, `${prefix}/subject.png`);
      if (storedUrl) result.subjectAssetUrl = storedUrl;
    }

    // Save enhanced background
    if (result.enhancedBgUrl) {
      const storedUrl = await uploadToStorage(result.enhancedBgUrl, `${prefix}/enhanced-bg.png`);
      if (storedUrl) result.enhancedBgUrl = storedUrl;
    }

    // Save styled background
    if (result.styledBgUrl) {
      const storedUrl = await uploadToStorage(result.styledBgUrl, `${prefix}/styled-bg.png`);
      if (storedUrl) result.styledBgUrl = storedUrl;
    }

    // Save word bank overlay
    if (result.wordBankOverlayUrl) {
      const storedUrl = await uploadToStorage(result.wordBankOverlayUrl, `${prefix}/wordbank.png`);
      if (storedUrl) result.wordBankOverlayUrl = storedUrl;
    }

    stages[4].status = 'done';
  } catch (err: any) {
    stages[4].status = 'error';
    stages[4].error = err.message;
  }
  onStageUpdate([...stages]);

  return result;
}

// ─── Save Asset Record to DB ──────────────────────────────────────

async function saveAssetRecord(
  lessonId: string,
  slideNumber: number,
  assetType: string,
  publicUrl: string,
  userId: string,
) {
  try {
    await supabase.from('ai_lesson_artifacts').insert({
      lesson_id: lessonId,
      artifact_type: assetType,
      format: 'image/png',
      public_url: publicUrl,
      user_id: userId,
      metadata: { slideNumber, processedBy: 'picsart', stage: assetType },
    } as any);
  } catch (err) {
    console.error('Failed to save asset record:', err);
  }
}

// ─── Main Pipeline ────────────────────────────────────────────────

export async function runPicsartPipeline(
  lessonId: string,
  hub: HubFilter,
  slideImages: Array<{ slideNumber: number; imageUrl: string; wordBankText?: string | null }>,
  userId: string,
  onProgress?: (slides: PicsartSlideResult[]) => void,
): Promise<PicsartPipelineResult> {
  const startTime = Date.now();
  const results: PicsartSlideResult[] = [];
  let totalErrors = 0;

  // Process slides sequentially to avoid rate limits
  for (const slide of slideImages) {
    const slideResult = await processSlide(
      slide.slideNumber,
      slide.imageUrl,
      hub,
      slide.wordBankText || null,
      lessonId,
      (stages) => {
        // Update progress for this slide
        const existing = results.find((r) => r.slideNumber === slide.slideNumber);
        if (existing) {
          existing.stages = stages;
        }
        onProgress?.([...results]);
      },
    );

    results.push(slideResult);
    onProgress?.([...results]);

    // Count errors
    const slideErrors = slideResult.stages.filter((s) => s.status === 'error').length;
    totalErrors += slideErrors;

    // Save asset records to DB
    if (slideResult.subjectAssetUrl) {
      await saveAssetRecord(lessonId, slide.slideNumber, 'subject_cutout', slideResult.subjectAssetUrl, userId);
    }
    if (slideResult.styledBgUrl) {
      await saveAssetRecord(lessonId, slide.slideNumber, 'styled_background', slideResult.styledBgUrl, userId);
    }

    // Brief delay between slides to respect rate limits
    await new Promise((r) => setTimeout(r, 300));
  }

  // Save pipeline results to lesson content
  try {
    const { data: lessonData } = await supabase
      .from('curriculum_lessons')
      .select('content')
      .eq('id', lessonId)
      .single();

    if (lessonData) {
      const existingContent = (lessonData.content as any) || {};
      const updatedContent = {
        ...existingContent,
        picsartAssets: results.map((r) => ({
          slideNumber: r.slideNumber,
          subjectAssetUrl: r.subjectAssetUrl,
          enhancedBgUrl: r.enhancedBgUrl,
          styledBgUrl: r.styledBgUrl,
          wordBankOverlayUrl: r.wordBankOverlayUrl,
        })),
        picsartProcessedAt: new Date().toISOString(),
        picsartHub: hub,
      };

      await supabase
        .from('curriculum_lessons')
        .update({ content: updatedContent } as any)
        .eq('id', lessonId);
    }
  } catch (err) {
    console.error('Failed to save Picsart results to lesson:', err);
  }

  return {
    lessonId,
    hub,
    slides: results,
    totalProcessed: results.length,
    totalErrors,
    durationMs: Date.now() - startTime,
  };
}
