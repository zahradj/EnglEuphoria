import React, { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Eye, Send, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { SortableBlockCard, type LessonBlock } from './SortableBlockCard';
import { StudentSandboxFrame } from './StudentSandboxFrame';
import { PublishLessonModal } from './PublishLessonModal';
import type { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';

interface LessonBlockEditorProps {
  lessonId: string;
  teacherId: string;
}

interface LessonRow {
  id: string;
  title: string;
  content: any;
  target_system: string | null;
}

function ensureBlockIds(arr: any[]): LessonBlock[] {
  return (arr ?? []).map((b, i) => ({
    ...b,
    id: b?.id ?? `block-${i}-${Math.random().toString(36).slice(2, 8)}`,
  }));
}

export const LessonBlockEditor: React.FC<LessonBlockEditorProps> = ({ lessonId, teacherId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lesson, setLesson] = useState<LessonRow | null>(null);
  const [blocks, setBlocks] = useState<LessonBlock[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [previewMode, setPreviewMode] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Load lesson
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('id, title, content, target_system')
        .eq('id', lessonId)
        .maybeSingle();
      if (!alive) return;
      if (error || !data) {
        toast.error(error?.message ?? 'Lesson not found.');
        setLoading(false);
        return;
      }
      const slides = ensureBlockIds(data.content?.slides ?? []);
      setLesson(data as LessonRow);
      setBlocks(slides);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [lessonId]);

  // Debounced autosave
  useEffect(() => {
    if (!dirty || !lesson) return;
    const t = setTimeout(async () => {
      setSaving(true);
      const nextContent = {
        ...(lesson.content ?? {}),
        slides: blocks,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('curriculum_lessons')
        .update({ content: nextContent })
        .eq('id', lessonId);
      setSaving(false);
      if (error) {
        toast.error('Autosave failed: ' + error.message);
      } else {
        setDirty(false);
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [dirty, blocks, lesson, lessonId]);

  const hub: HubType = useMemo(() => {
    const h = (lesson?.content?.hub ?? lesson?.target_system ?? 'academy') as string;
    if (h === 'playground' || h === 'success' || h === 'professional' || h === 'academy') {
      return (h === 'success' ? 'professional' : (h as HubType));
    }
    return 'academy';
  }, [lesson]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id);
      const newIndex = prev.findIndex((b) => b.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      setDirty(true);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const patchBlock = (id: string, patch: Partial<LessonBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    setDirty(true);
  };

  const duplicateBlock = (id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx < 0) return prev;
      const copy: LessonBlock = {
        ...prev[idx],
        id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      setDirty(true);
      return next;
    });
  };

  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setDirty(true);
  };

  const addBlock = () => {
    const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setBlocks((prev) => [...prev, { id, type: 'multiple_choice', title: 'New block', hint: '' }]);
    setDirty(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return <div className="text-center text-muted-foreground py-20">Lesson not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-foreground truncate">{lesson.title}</h2>
          <p className="text-xs text-muted-foreground capitalize">
            {hub} hub · {blocks.length} blocks · {saving ? 'Saving…' : dirty ? 'Unsaved changes' : 'All changes saved'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <Label htmlFor="preview-toggle" className="text-sm font-medium cursor-pointer">
              Preview as Student
            </Label>
            <Switch id="preview-toggle" checked={previewMode} onCheckedChange={setPreviewMode} />
          </div>
          <Button onClick={() => setPublishOpen(true)} className="bg-primary hover:bg-primary/90">
            <Send className="mr-2 h-4 w-4" /> Publish Lesson
          </Button>
        </div>
      </div>

      {previewMode ? (
        <StudentSandboxFrame slides={blocks as any} hub={hub} lessonTitle={lesson.title} />
      ) : (
        <div className="space-y-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {blocks.map((b, i) => (
                  <SortableBlockCard
                    key={b.id}
                    block={b}
                    index={i}
                    expanded={!!expanded[b.id]}
                    onToggle={() => setExpanded((e) => ({ ...e, [b.id]: !e[b.id] }))}
                    onChange={(patch) => patchBlock(b.id, patch)}
                    onDuplicate={() => duplicateBlock(b.id)}
                    onDelete={() => deleteBlock(b.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {blocks.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-10 text-center text-muted-foreground">
              No blocks yet. Add one to get started.
            </div>
          )}

          <Button variant="outline" onClick={addBlock} className="w-full border-primary/30 text-primary hover:bg-primary/10">
            <Plus className="mr-2 h-4 w-4" /> Add Block
          </Button>

          {dirty && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Save className="h-3 w-3" /> Autosaving…
            </div>
          )}
        </div>
      )}

      <PublishLessonModal
        open={publishOpen}
        onOpenChange={setPublishOpen}
        lessonId={lesson.id}
        teacherId={teacherId}
        hub={hub}
        blocks={blocks}
      />
    </div>
  );
};

export default LessonBlockEditor;
