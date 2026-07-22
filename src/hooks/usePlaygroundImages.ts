import { supabase } from '@/integrations/supabase/client';

export interface GeneratedImage { subject: string; url: string }

export async function generatePlaygroundImages(subjects: string[]): Promise<GeneratedImage[]> {
  const unique = Array.from(new Set(subjects.map((s) => s.trim()).filter(Boolean)));
  if (unique.length === 0) return [];
  const { data, error } = await supabase.functions.invoke('generate-playground-images', {
    body: { subjects: unique },
  });
  if (error) throw error;
  return (data?.images as GeneratedImage[]) ?? [];
}

export async function generateOnePlaygroundImage(subject: string): Promise<string | null> {
  const r = await generatePlaygroundImages([subject]);
  return r[0]?.url ?? null;
}
