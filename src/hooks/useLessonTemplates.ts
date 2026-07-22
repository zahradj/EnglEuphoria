import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LessonTemplate {
  id: string;
  created_by: string;
  hub: 'playground' | 'academy' | 'success';
  title: string;
  description: string | null;
  level: string | null;
  cover_image_url: string | null;
  tags: string[];
  slide_count: number;
  payload: any;
  clone_count: number;
  is_published: boolean;
  created_at: string;
}

export interface TemplateFilters {
  hub?: 'playground' | 'academy' | 'all';
  level?: string | 'all';
  search?: string;
}

export function useLessonTemplates(filters: TemplateFilters = {}) {
  const [templates, setTemplates] = useState<LessonTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let q = supabase
        .from('lesson_templates')
        .select('id, created_by, hub, title, description, level, cover_image_url, tags, slide_count, payload, clone_count, is_published, created_at')
        .eq('is_published', true)
        .order('clone_count', { ascending: false })
        .limit(120);

      if (filters.hub && filters.hub !== 'all') q = q.eq('hub', filters.hub);
      if (filters.level && filters.level !== 'all') q = q.eq('level', filters.level);
      if (filters.search?.trim()) q = q.ilike('title', `%${filters.search.trim()}%`);

      const { data, error } = await q;
      if (error) throw error;
      setTemplates((data || []) as LessonTemplate[]);
    } catch (e: any) {
      setError(e.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.hub, filters.level, filters.search]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  return { templates, loading, error, refetch: fetchTemplates };
}

const STORAGE_KEY = 'engl_imported_lesson_payload';

export async function cloneTemplateIntoEditor(t: LessonTemplate, navigate: (p: string) => void) {
  const payload = {
    title: t.payload?.title || t.title,
    level: t.payload?.level || t.level,
    slides: t.payload?.slides || [],
    hub: t.hub,
    importedAt: Date.now(),
    fromTemplate: t.id,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  // Fire-and-forget clone count bump
  supabase.rpc('increment_template_clone', { template_id: t.id }).then(() => {});
  navigate(t.hub === 'playground' ? '/playground-creator?imported=1' : t.hub === 'success' ? '/success-creator?imported=1' : '/academy-creator?imported=1');
}
