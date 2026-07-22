import React, { useState } from 'react';
import { ExternalLink, Library, Loader2, Check, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TrialLessonCard, TrialHub } from './TrialLessonCard';

type TrialEntry = {
  hub: TrialHub;
  label: string;
  name: string;
  baseUrl: string;
  editorUrl: string;
  /** Tailwind classes for the hub-branded badge (per workspace guidelines). */
  badgeClass: string;
  /** Inline left-border accent color (hex from workspace hub palette). */
  accent: string;
};

const ENTRIES: TrialEntry[] = [
  {
    hub: 'playground',
    label: 'Playground Hub · Kids',
    name: 'First English Adventure',
    baseUrl: 'https://first-english-adventure.lovable.app',
    editorUrl: 'https://lovable.dev/projects/1dc5b4b6-9ef4-4514-9a8e-7282d8efd9fb',
    badgeClass: 'bg-[#FE6A2F] text-white',
    accent: '#FE6A2F',
  },
  {
    hub: 'academy',
    label: 'Academy Hub · Teens',
    name: 'Engleuphoria English Adventures',
    baseUrl: 'https://engleuphoria-playhouse.lovable.app',
    editorUrl: 'https://lovable.dev/projects/ed7a612a-494d-4be1-a3f9-27c1c0435cbd',
    badgeClass: 'bg-[#6B21A8] text-white',
    accent: '#6B21A8',
  },
  {
    hub: 'success',
    label: 'Success Hub · Adults',
    name: 'Engleuphoria English Adventures',
    baseUrl: 'https://engleuphoria-english-adventures.lovable.app',
    editorUrl: 'https://lovable.dev/projects/ed7a612a-494d-4be1-a3f9-27c1c0435cbd',
    badgeClass: 'bg-[#059669] text-white',
    accent: '#059669',
  },
];

export const TrialProjectsPanel: React.FC<{ cefr?: string }> = ({ cefr }) => {
  const { user } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const addToLibrary = async (e: TrialEntry) => {
    setBusy(e.hub);
    try {
      const { error } = await (supabase as any).from('library_assets').insert({
        title: `${e.name} — Trial Lesson (${e.label})`,
        description: `Interactive trial lesson. Auto-opens at the student's CEFR difficulty (Pre-A1/A1 → Easy, A2 → Standard, B1+ → Challenge).`,
        file_url: e.baseUrl,
        file_type: 'trial_lesson',
        system_tag: e.hub,
        tags: ['trial', 'interactive', e.hub],
        is_teacher_only: false,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
      setAdded((s) => ({ ...s, [e.hub]: true }));
      toast.success(`Added "${e.name}" to Master Library`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add to Master Library');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Ready-Made Trial Lessons
        </h3>
        <span className="text-xs text-slate-500">Auto-matches student's placement CEFR</span>
      </div>

      {ENTRIES.map((e) => (
        <div
          key={e.hub}
          className="space-y-2 rounded-2xl border-l-4 pl-3"
          style={{ borderLeftColor: e.accent }}
        >
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${e.badgeClass}`}>
              {e.label}
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
              {e.name}
            </span>
          </div>
          <TrialLessonCard hub={e.hub} cefr={cefr} />
          <div className="flex flex-wrap gap-2 pl-2">
            <Button
              size="sm"
              variant="outline"
              asChild
              className="h-8"
            >
              <a href={e.editorUrl} target="_blank" rel="noopener noreferrer">
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit / Improve
                <ExternalLink className="h-3 w-3 ml-1.5 opacity-60" />
              </a>
            </Button>
            <Button
              size="sm"
              variant={added[e.hub] ? 'secondary' : 'default'}
              onClick={() => addToLibrary(e)}
              disabled={busy === e.hub || added[e.hub]}
              className="h-8"
            >
              {busy === e.hub ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : added[e.hub] ? (
                <Check className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <Library className="h-3.5 w-3.5 mr-1.5" />
              )}
              {added[e.hub] ? 'In Master Library' : 'Add to Master Library'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrialProjectsPanel;
