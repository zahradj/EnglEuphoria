import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'lesson-assets';

export type SlideAssetKind = 'image' | 'video';

export interface UploadResult {
  url: string;
  kind: SlideAssetKind;
  path: string;
}

function inferKind(file: File): SlideAssetKind {
  if (file.type.startsWith('video/')) return 'video';
  return 'image';
}

/**
 * Upload an image or video to the public lesson-assets bucket and return a CDN URL.
 * Files are namespaced under the lesson id so a single deck stays organized.
 */
export async function uploadSlideAsset(file: File, lessonId: string): Promise<UploadResult> {
  const kind = inferKind(file);
  const ext = file.name.split('.').pop()?.toLowerCase() || (kind === 'video' ? 'mp4' : 'png');
  const safeName = `${crypto.randomUUID()}.${ext}`;
  const path = `studio/${lessonId || 'unassigned'}/${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, kind, path };
}
