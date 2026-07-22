import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Copy, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { CanvasElement, CanvasGameSlide, LivingCanvasSlide, Hub } from './canvasSchema';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  slide: CanvasGameSlide | LivingCanvasSlide;
  hub: Hub;
  onChange: (next: CanvasGameSlide | LivingCanvasSlide) => void;
}

export function CanvasElementEditor({ slide, hub, onChange }: Props) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(slide.elements[0]?.id ?? null);

  const update = (patch: Partial<CanvasGameSlide | LivingCanvasSlide>) => {
    onChange({ ...slide, ...patch } as any);
  };
  const updateEl = (id: string, patch: Partial<CanvasElement>) => {
    update({
      elements: slide.elements.map(e => (e.id === id ? { ...e, ...patch } as CanvasElement : e)),
    } as any);
  };
  const removeEl = (id: string) => {
    update({ elements: slide.elements.filter(e => e.id !== id) } as any);
  };
  const duplicateEl = (id: string) => {
    const el = slide.elements.find(e => e.id === id);
    if (!el) return;
    const copy: CanvasElement = { ...el, id: `${el.id}_copy_${Math.random().toString(36).slice(2, 5)}`, x: Math.min(95, el.x + 5), y: Math.min(95, el.y + 5) };
    update({ elements: [...slide.elements, copy] } as any);
  };
  const addEl = (preset: 'image' | 'target' | 'reveal' | 'text') => {
    const id = `el_${Math.random().toString(36).slice(2, 7)}`;
    const base: CanvasElement = preset === 'target'
      ? { id, type: 'shape', x: 50, y: 35, width: 18, color: '#a7f3d0', text: 'TARGET', interaction: 'target', z_index: 1 }
      : preset === 'reveal'
      ? { id, type: 'image', x: 50, y: 50, width: 18, interaction: 'reveal', reveal_anim: 'lift', z_index: 5, reveal_sfx: 'Surprise!' }
      : preset === 'text'
      ? { id, type: 'text', x: 50, y: 20, width: 30, text: 'Tap me', z_index: 2 }
      : { id, type: 'image', x: 20, y: 80, width: 14, interaction: 'draggable', z_index: 3, target_x: 50, target_y: 35, snap_tolerance: 10, success_sfx: 'Correct!' };
    update({ elements: [...slide.elements, base] } as any);
    setOpenId(id);
  };
  const moveZ = (id: string, dir: 1 | -1) => {
    const el = slide.elements.find(e => e.id === id);
    if (!el) return;
    updateEl(id, { z_index: Math.max(0, (el.z_index ?? 1) + dir) });
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Describe the game first (e.g. "Sort fruit into the basket")');
      return;
    }
    setGenLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-canvas-game', {
        body: {
          prompt: aiPrompt,
          hub,
          mode: slide.type === 'living_canvas' ? 'mixed' : 'drag',
        },
      });
      if (error) throw error;
      const elements = (data?.elements || []) as CanvasElement[];
      if (!elements.length) throw new Error('AI returned no elements');
      update({
        elements,
        instruction: data?.instruction || slide.instruction,
        instruction_audio: data?.instruction_audio || data?.instruction || slide.instruction_audio,
        background_image: data?.background_image || slide.background_image,
      } as any);
      toast.success(`Generated ${elements.length} canvas elements`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate canvas game');
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600 uppercase">Title</label>
        <input
          value={slide.title || ''}
          onChange={(e) => update({ title: e.target.value } as any)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
        />
        <label className="text-xs font-bold text-slate-600 uppercase">Instruction (also TTS)</label>
        <textarea
          value={slide.instruction || ''}
          onChange={(e) => update({ instruction: e.target.value, instruction_audio: e.target.value } as any)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
          placeholder="e.g. Drag the fruit into the basket"
        />
        <label className="text-xs font-bold text-slate-600 uppercase">Background image URL (optional)</label>
        <input
          value={slide.background_image || ''}
          onChange={(e) => update({ background_image: e.target.value } as any)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
          placeholder="https://…"
        />
      </div>

      {/* AI Mini-Generator */}
      <div className="rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/60 p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase">
          <Sparkles className="w-3.5 h-3.5" /> AI level designer
        </div>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={2}
          placeholder="e.g. Sort healthy food into the green box and junk food into the red box"
          className="w-full px-3 py-2 rounded-lg border border-indigo-200 text-sm bg-white"
        />
        <button
          onClick={generateWithAI}
          disabled={genLoading}
          className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg px-3 py-2 text-sm"
        >
          {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate elements
        </button>
      </div>

      {/* Element list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase">Elements ({slide.elements.length})</span>
          <div className="flex gap-1">
            <button onClick={() => addEl('image')} className="text-[10px] bg-slate-200 hover:bg-slate-300 rounded px-1.5 py-1 font-semibold flex items-center gap-1"><Plus className="w-3 h-3" />Drag</button>
            <button onClick={() => addEl('target')} className="text-[10px] bg-emerald-200 hover:bg-emerald-300 rounded px-1.5 py-1 font-semibold flex items-center gap-1"><Plus className="w-3 h-3" />Target</button>
            <button onClick={() => addEl('reveal')} className="text-[10px] bg-purple-200 hover:bg-purple-300 rounded px-1.5 py-1 font-semibold flex items-center gap-1"><Plus className="w-3 h-3" />Reveal</button>
            <button onClick={() => addEl('text')} className="text-[10px] bg-amber-200 hover:bg-amber-300 rounded px-1.5 py-1 font-semibold flex items-center gap-1"><Plus className="w-3 h-3" />Text</button>
          </div>
        </div>

        {slide.elements.length === 0 && (
          <div className="text-xs text-slate-500 italic text-center py-4 border border-dashed rounded-lg">
            No elements yet — add one above or generate with AI.
          </div>
        )}

        {slide.elements.map((el) => {
          const isOpen = openId === el.id;
          return (
            <div key={el.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : el.id)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold hover:bg-slate-50"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <ImageIcon className="w-3 h-3 text-slate-400" />
                  <span className="font-mono truncate">{el.id}</span>
                  <span className="text-[10px] text-slate-500">· {el.interaction || 'static'}</span>
                </span>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => moveZ(el.id, 1)} title="Bring forward" className="text-slate-500 hover:text-slate-900"><ArrowUp className="w-3 h-3" /></button>
                  <button onClick={() => moveZ(el.id, -1)} title="Send back" className="text-slate-500 hover:text-slate-900"><ArrowDown className="w-3 h-3" /></button>
                  <button onClick={() => duplicateEl(el.id)} title="Duplicate" className="text-slate-500 hover:text-slate-900"><Copy className="w-3 h-3" /></button>
                  <button onClick={() => removeEl(el.id)} title="Delete" className="text-rose-500 hover:text-rose-700"><Trash2 className="w-3 h-3" /></button>
                </div>
              </button>

              {isOpen && (
                <div className="p-2 space-y-2 bg-slate-50 border-t">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Field label="Type">
                      <select value={el.type} onChange={(e) => updateEl(el.id, { type: e.target.value as any })} className="w-full px-2 py-1 rounded border">
                        <option value="image">image</option>
                        <option value="text">text</option>
                        <option value="shape">shape</option>
                      </select>
                    </Field>
                    <Field label="Interaction">
                      <select value={el.interaction || 'none'} onChange={(e) => updateEl(el.id, { interaction: e.target.value as any })} className="w-full px-2 py-1 rounded border">
                        <option value="none">none</option>
                        <option value="draggable">draggable</option>
                        <option value="reveal">click to reveal</option>
                        <option value="target">target (snap zone)</option>
                      </select>
                    </Field>
                  </div>
                  {el.type === 'image' && (
                    <Field label="Image URL">
                      <input value={el.src || ''} onChange={(e) => updateEl(el.id, { src: e.target.value })} className="w-full px-2 py-1 rounded border text-xs" />
                    </Field>
                  )}
                  {(el.type === 'text' || el.type === 'shape') && (
                    <Field label="Text">
                      <input value={el.text || ''} onChange={(e) => updateEl(el.id, { text: e.target.value })} className="w-full px-2 py-1 rounded border text-xs" />
                    </Field>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <Slider label={`X ${Math.round(el.x)}%`} value={el.x} onChange={(v) => updateEl(el.id, { x: v })} />
                    <Slider label={`Y ${Math.round(el.y)}%`} value={el.y} onChange={(v) => updateEl(el.id, { y: v })} />
                    <Slider label={`W ${Math.round(el.width)}%`} value={el.width} min={2} onChange={(v) => updateEl(el.id, { width: v })} />
                  </div>

                  {el.interaction === 'draggable' && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <Slider label={`Target X ${Math.round(el.target_x ?? 50)}%`} value={el.target_x ?? 50} onChange={(v) => updateEl(el.id, { target_x: v })} />
                        <Slider label={`Target Y ${Math.round(el.target_y ?? 50)}%`} value={el.target_y ?? 50} onChange={(v) => updateEl(el.id, { target_y: v })} />
                      </div>
                      <Field label="Success voice / audio URL">
                        <input value={el.success_sfx || ''} onChange={(e) => updateEl(el.id, { success_sfx: e.target.value })} className="w-full px-2 py-1 rounded border text-xs" placeholder="Great job!" />
                      </Field>
                    </>
                  )}

                  {el.interaction === 'reveal' && (
                    <>
                      <Field label="Reveal animation">
                        <select value={el.reveal_anim || 'fade'} onChange={(e) => updateEl(el.id, { reveal_anim: e.target.value as any })} className="w-full px-2 py-1 rounded border text-xs">
                          <option value="fade">fade</option>
                          <option value="lift">lift</option>
                          <option value="shrink">shrink</option>
                          <option value="fly">fly</option>
                        </select>
                      </Field>
                      <Field label="Reveal voice / audio URL">
                        <input value={el.reveal_sfx || ''} onChange={(e) => updateEl(el.id, { reveal_sfx: e.target.value })} className="w-full px-2 py-1 rounded border text-xs" placeholder="The sun is shining!" />
                      </Field>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">{label}</span>
      {children}
    </label>
  );
}
function Slider({ label, value, onChange, min = 0, max = 100 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-semibold text-slate-600 mb-0.5">{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}
