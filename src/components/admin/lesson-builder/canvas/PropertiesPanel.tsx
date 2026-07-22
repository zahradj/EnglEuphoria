import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Plus, X, Check, Upload, Mic, MicOff, Sparkles, ImageIcon } from 'lucide-react';
import type { CanvasElementData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PropertiesPanelProps {
  element: CanvasElementData | null;
  onUpdate: (updates: Partial<CanvasElementData>) => void;
  onClose?: () => void;
  floating?: boolean;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ element, onUpdate, onClose, floating }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activityImageRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [aiText, setAiText] = useState('');
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [activityImageTarget, setActivityImageTarget] = useState<{ key: string; index: number; field: string } | null>(null);

  if (!element) {
    if (floating) return null;
    return (
      <div className="w-64 bg-card border-l border-border p-4 flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center">Select an element to edit its properties</p>
      </div>
    );
  }

  const wrapperClass = floating
    ? 'w-72 bg-card border border-border rounded-lg shadow-xl p-4 overflow-y-auto space-y-4 max-h-[80vh]'
    : 'w-64 bg-card border-l border-border p-4 overflow-y-auto space-y-4';

  const updateContent = (key: string, value: any) => {
    onUpdate({ content: { ...element.content, [key]: value } });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop();
    const filePath = `canvas/${element.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('lesson-slides').upload(filePath, file, { upsert: true });
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return;
    }
    const { data } = supabase.storage.from('lesson-slides').getPublicUrl(filePath);
    updateContent('src', data.publicUrl);
    toast({ title: 'Image uploaded' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleActivityImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activityImageTarget) return;
    const ext = file.name.split('.').pop();
    const filePath = `canvas/${element.id}/activity-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('lesson-slides').upload(filePath, file, { upsert: true });
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return;
    }
    const { data } = supabase.storage.from('lesson-slides').getPublicUrl(filePath);
    const { key, index, field } = activityImageTarget;

    if (key === 'pairs') {
      const pairs = [...(element.content?.pairs || [])];
      pairs[index] = { ...pairs[index], [field]: data.publicUrl };
      updateContent('pairs', pairs);
    } else if (key === 'options') {
      const opts = [...(element.content?.options || [])];
      opts[index] = { ...opts[index], image: data.publicUrl };
      updateContent('options', opts);
    } else if (key === 'items') {
      const items = [...(element.content?.items || [])];
      if (typeof items[index] === 'string') {
        items[index] = { text: items[index], image: data.publicUrl };
      } else {
        items[index] = { ...items[index], image: data.publicUrl };
      }
      updateContent('items', items);
    }
    toast({ title: 'Image uploaded' });
    setActivityImageTarget(null);
    if (activityImageRef.current) activityImageRef.current.value = '';
  };

  const triggerActivityImageUpload = (key: string, index: number, field: string) => {
    setActivityImageTarget({ key, index, field });
    setTimeout(() => activityImageRef.current?.click(), 50);
  };

  // Mic recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const ext = 'webm';
        const filePath = `canvas/${element.id}/recording-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('lesson-slides').upload(filePath, blob, { upsert: true });
        if (error) {
          toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
          return;
        }
        const { data } = supabase.storage.from('lesson-slides').getPublicUrl(filePath);
        updateContent('src', data.publicUrl);
        toast({ title: 'Recording saved!' });
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      toast({ title: 'Mic access denied', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
    setMediaRecorder(null);
  };

  // AI Voice generation
  const generateAIVoice = async () => {
    if (!aiText.trim()) {
      toast({ title: 'Enter text first', variant: 'destructive' });
      return;
    }
    setIsGeneratingVoice(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: aiText, voiceId: 'Xb7hH8MSUJpSbSDYk0k2' }),
        }
      );
      if (!response.ok) throw new Error('TTS failed');
      const audioBlob = await response.blob();
      const filePath = `canvas/${element.id}/ai-voice-${Date.now()}.mp3`;
      const { error } = await supabase.storage.from('lesson-slides').upload(filePath, audioBlob, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('lesson-slides').getPublicUrl(filePath);
      updateContent('src', data.publicUrl);
      updateContent('label', aiText);
      toast({ title: 'AI Voice generated!' });
    } catch (err: any) {
      toast({ title: 'Voice generation failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const updateListItem = (key: string, index: number, value: string) => {
    const items = [...(element.content?.[key] || [])];
    if (typeof items[index] === 'object' && items[index] !== null) {
      items[index] = { ...items[index], text: value };
    } else {
      items[index] = value;
    }
    updateContent(key, items);
  };

  const addListItem = (key: string, defaultVal: any = '') => {
    updateContent(key, [...(element.content?.[key] || []), defaultVal]);
  };

  const removeListItem = (key: string, index: number) => {
    updateContent(key, (element.content?.[key] || []).filter((_: any, i: number) => i !== index));
  };

  const getItemText = (item: any): string => {
    if (typeof item === 'string') return item;
    return item?.text || '';
  };

  const getItemImage = (item: any): string => {
    if (typeof item === 'object' && item !== null) return item?.image || '';
    return '';
  };

  return (
    <div className={wrapperClass}>
      {floating && onClose && (
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-foreground capitalize">{element.elementType} Properties</h3>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose}><X className="h-3.5 w-3.5" /></Button>
        </div>
      )}
      {!floating && <h3 className="text-sm font-semibold text-foreground capitalize">{element.elementType} Properties</h3>}

      <input ref={activityImageRef} type="file" accept="image/*" className="hidden" onChange={handleActivityImageUpload} />

      {/* Position & Size */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Position & Size</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">X</Label>
            <Input type="number" value={element.x} onChange={(e) => onUpdate({ x: Number(e.target.value) })} className="h-7 text-xs" />
          </div>
          <div>
            <Label className="text-[10px]">Y</Label>
            <Input type="number" value={element.y} onChange={(e) => onUpdate({ y: Number(e.target.value) })} className="h-7 text-xs" />
          </div>
          <div>
            <Label className="text-[10px]">W</Label>
            <Input type="number" value={element.width} onChange={(e) => onUpdate({ width: Number(e.target.value) })} className="h-7 text-xs" />
          </div>
          <div>
            <Label className="text-[10px]">H</Label>
            <Input type="number" value={element.height} onChange={(e) => onUpdate({ height: Number(e.target.value) })} className="h-7 text-xs" />
          </div>
        </div>
        <div>
          <Label className="text-[10px]">Layer (z-index)</Label>
          <Slider value={[element.zIndex]} onValueChange={([v]) => onUpdate({ zIndex: v })} min={0} max={100} step={1} />
        </div>
      </div>

      {/* Text properties */}
      {element.elementType === 'text' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Text</Label>
          <Textarea
            value={element.content?.text || ''}
            onChange={(e) => updateContent('text', e.target.value)}
            placeholder="Enter text..."
            className="min-h-[80px] text-sm"
          />
          <div className="flex gap-1">
            <Button size="icon" variant={element.content?.bold ? 'default' : 'outline'} className="h-7 w-7" onClick={() => updateContent('bold', !element.content?.bold)}>
              <Bold className="h-3 w-3" />
            </Button>
            <Button size="icon" variant={element.content?.italic ? 'default' : 'outline'} className="h-7 w-7" onClick={() => updateContent('italic', !element.content?.italic)}>
              <Italic className="h-3 w-3" />
            </Button>
            <Button size="icon" variant={element.content?.align === 'left' ? 'default' : 'outline'} className="h-7 w-7" onClick={() => updateContent('align', 'left')}>
              <AlignLeft className="h-3 w-3" />
            </Button>
            <Button size="icon" variant={element.content?.align === 'center' ? 'default' : 'outline'} className="h-7 w-7" onClick={() => updateContent('align', 'center')}>
              <AlignCenter className="h-3 w-3" />
            </Button>
            <Button size="icon" variant={element.content?.align === 'right' ? 'default' : 'outline'} className="h-7 w-7" onClick={() => updateContent('align', 'right')}>
              <AlignRight className="h-3 w-3" />
            </Button>
          </div>
          <div>
            <Label className="text-[10px]">Font Size</Label>
            <Slider value={[element.content?.fontSize || 24]} onValueChange={([v]) => updateContent('fontSize', v)} min={10} max={120} step={1} />
          </div>
          <div>
            <Label className="text-[10px]">Color</Label>
            <Input type="color" value={element.content?.color || '#000000'} onChange={(e) => updateContent('color', e.target.value)} className="h-7" />
          </div>
        </div>
      )}

      {/* Image properties */}
      {element.elementType === 'image' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Image</Label>
          <Button size="sm" variant="outline" className="w-full text-xs h-7 gap-1" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3 w-3" /> Upload Image
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <Input value={element.content?.src || ''} onChange={(e) => updateContent('src', e.target.value)} placeholder="Or paste URL..." className="text-xs" />
        </div>
      )}

      {/* Video properties */}
      {element.elementType === 'video' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Video URL</Label>
          <Input value={element.content?.url || ''} onChange={(e) => updateContent('url', e.target.value)} placeholder="YouTube or Vimeo URL..." className="text-xs" />
          <p className="text-[10px] text-muted-foreground">Supports YouTube & Vimeo links</p>
        </div>
      )}

      {/* Shape properties */}
      {element.elementType === 'shape' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Shape</Label>
          <Select value={element.content?.shape || 'rectangle'} onValueChange={(v) => updateContent('shape', v)}>
            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rectangle">Rectangle</SelectItem>
              <SelectItem value="rounded">Rounded</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
            </SelectContent>
          </Select>
          <div>
            <Label className="text-[10px]">Fill Color</Label>
            <Input type="color" value={element.content?.fill || '#6366f1'} onChange={(e) => updateContent('fill', e.target.value)} className="h-7" />
          </div>
          <div>
            <Label className="text-[10px]">Opacity</Label>
            <Slider value={[element.content?.opacity ?? 1]} onValueChange={([v]) => updateContent('opacity', v)} min={0} max={1} step={0.05} />
          </div>
        </div>
      )}

      {/* Quiz properties */}
      {element.elementType === 'quiz' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Question</Label>
          <Textarea value={element.content?.question || ''} onChange={(e) => updateContent('question', e.target.value)} placeholder="Enter question..." className="min-h-[60px] text-xs" />
          <Label className="text-xs text-muted-foreground">Options</Label>
          {(element.content?.options || []).map((opt: any, i: number) => (
            <div key={opt.id} className="space-y-1">
              <div className="flex items-center gap-1">
                <Button size="icon" variant={opt.isCorrect ? 'default' : 'outline'} className="h-6 w-6 shrink-0"
                  onClick={() => {
                    const opts = (element.content?.options || []).map((o: any) => ({ ...o, isCorrect: o.id === opt.id }));
                    updateContent('options', opts);
                  }}>
                  {opt.isCorrect ? <Check className="h-3 w-3" /> : <span className="text-[10px]">{String.fromCharCode(65 + i)}</span>}
                </Button>
                <Input value={opt.text} onChange={(e) => {
                  const opts = [...(element.content?.options || [])];
                  opts[i] = { ...opts[i], text: e.target.value };
                  updateContent('options', opts);
                }} className="h-6 text-xs" />
                <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => triggerActivityImageUpload('options', i, 'image')}>
                  <ImageIcon className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => {
                  updateContent('options', (element.content?.options || []).filter((_: any, j: number) => j !== i));
                }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              {opt.image && <img src={opt.image} alt="" className="h-8 w-12 object-cover rounded ml-7" />}
            </div>
          ))}
          <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={() => {
            updateContent('options', [...(element.content?.options || []), { id: uuidv4(), text: '', isCorrect: false }]);
          }}>
            <Plus className="h-3 w-3 mr-1" /> Add Option
          </Button>
        </div>
      )}

      {/* Matching properties */}
      {element.elementType === 'matching' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Title</Label>
          <Input value={element.content?.title || ''} onChange={(e) => updateContent('title', e.target.value)} className="text-xs h-7" />
          <Label className="text-xs text-muted-foreground">Pairs (text or image)</Label>
          {(element.content?.pairs || []).map((pair: any, i: number) => (
            <div key={i} className="space-y-1 border border-border rounded p-1.5">
              <div className="flex items-center gap-1">
                <Input value={pair.left} onChange={(e) => {
                  const pairs = [...(element.content?.pairs || [])];
                  pairs[i] = { ...pairs[i], left: e.target.value };
                  updateContent('pairs', pairs);
                }} placeholder="Left" className="h-6 text-xs flex-1" />
                <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => triggerActivityImageUpload('pairs', i, 'leftImage')}>
                  <ImageIcon className="h-3 w-3" />
                </Button>
              </div>
              {pair.leftImage && <img src={pair.leftImage} alt="" className="h-8 w-12 object-cover rounded" />}
              <div className="flex items-center gap-1">
                <Input value={pair.right} onChange={(e) => {
                  const pairs = [...(element.content?.pairs || [])];
                  pairs[i] = { ...pairs[i], right: e.target.value };
                  updateContent('pairs', pairs);
                }} placeholder="Right" className="h-6 text-xs flex-1" />
                <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => triggerActivityImageUpload('pairs', i, 'rightImage')}>
                  <ImageIcon className="h-3 w-3" />
                </Button>
              </div>
              {pair.rightImage && <img src={pair.rightImage} alt="" className="h-8 w-12 object-cover rounded" />}
              <Button size="icon" variant="ghost" className="h-5 w-5 ml-auto" onClick={() => {
                updateContent('pairs', (element.content?.pairs || []).filter((_: any, j: number) => j !== i));
              }}><X className="h-3 w-3" /></Button>
            </div>
          ))}
          <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={() => {
            updateContent('pairs', [...(element.content?.pairs || []), { left: '', right: '' }]);
          }}>
            <Plus className="h-3 w-3 mr-1" /> Add Pair
          </Button>
        </div>
      )}

      {/* Fill-blank properties */}
      {element.elementType === 'fill-blank' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Sentence (use ___ for blank)</Label>
          <Textarea value={element.content?.sentence || ''} onChange={(e) => updateContent('sentence', e.target.value)} placeholder="The cat ___ on the mat." className="min-h-[60px] text-xs" />
          <Label className="text-xs text-muted-foreground">Answer</Label>
          <Input value={element.content?.answer || ''} onChange={(e) => updateContent('answer', e.target.value)} className="text-xs h-7" />
        </div>
      )}

      {/* Drag & Drop properties */}
      {element.elementType === 'drag-drop' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Instruction</Label>
          <Input value={element.content?.instruction || ''} onChange={(e) => updateContent('instruction', e.target.value)} className="text-xs h-7" />
          <Label className="text-xs text-muted-foreground">Items (text + optional image)</Label>
          {(element.content?.items || []).map((item: any, i: number) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-1">
                <Input value={getItemText(item)} onChange={(e) => updateListItem('items', i, e.target.value)} className="h-6 text-xs" />
                <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => triggerActivityImageUpload('items', i, 'image')}>
                  <ImageIcon className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeListItem('items', i)}><X className="h-3 w-3" /></Button>
              </div>
              {getItemImage(item) && <img src={getItemImage(item)} alt="" className="h-8 w-12 object-cover rounded ml-1" />}
            </div>
          ))}
          <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={() => addListItem('items')}>
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
          <Label className="text-xs text-muted-foreground">Drop Zones</Label>
          {(element.content?.zones || []).map((zone: string, i: number) => (
            <div key={i} className="flex items-center gap-1">
              <Input value={zone} onChange={(e) => {
                const zones = [...(element.content?.zones || [])];
                zones[i] = e.target.value;
                updateContent('zones', zones);
              }} className="h-6 text-xs" />
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeListItem('zones', i)}><X className="h-3 w-3" /></Button>
            </div>
          ))}
          <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={() => addListItem('zones')}>
            <Plus className="h-3 w-3 mr-1" /> Add Zone
          </Button>
        </div>
      )}

      {/* Sorting properties */}
      {element.elementType === 'sorting' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Instruction</Label>
          <Input value={element.content?.instruction || ''} onChange={(e) => updateContent('instruction', e.target.value)} className="text-xs h-7" />
          <Label className="text-xs text-muted-foreground">Items (correct order)</Label>
          {(element.content?.items || []).map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground w-4">{i + 1}.</span>
              <Input value={item} onChange={(e) => updateListItem('items', i, e.target.value)} className="h-6 text-xs" />
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeListItem('items', i)}><X className="h-3 w-3" /></Button>
            </div>
          ))}
          <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={() => addListItem('items')}>
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
        </div>
      )}

      {/* Sentence Builder properties */}
      {element.elementType === 'sentence-builder' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Instruction</Label>
          <Input value={element.content?.instruction || ''} onChange={(e) => updateContent('instruction', e.target.value)} className="text-xs h-7" />
          <Label className="text-xs text-muted-foreground">Correct Sentence</Label>
          <Input value={element.content?.correctSentence || ''} onChange={(e) => updateContent('correctSentence', e.target.value)} placeholder="I am happy" className="text-xs h-7" />
          <Label className="text-xs text-muted-foreground">Words (shuffled for student)</Label>
          {(element.content?.words || []).map((word: string, i: number) => (
            <div key={i} className="flex items-center gap-1">
              <Input value={word} onChange={(e) => updateListItem('words', i, e.target.value)} className="h-6 text-xs" />
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeListItem('words', i)}><X className="h-3 w-3" /></Button>
            </div>
          ))}
          <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={() => addListItem('words')}>
            <Plus className="h-3 w-3 mr-1" /> Add Word
          </Button>
        </div>
      )}

      {/* Character properties */}
      {element.elementType === 'character' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Animation</Label>
          <Select value={element.content?.animation || 'idle'} onValueChange={(v) => updateContent('animation', v)}>
            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="idle">Idle (Float)</SelectItem>
              <SelectItem value="wave">Wave</SelectItem>
              <SelectItem value="jump">Jump</SelectItem>
              <SelectItem value="shake">Shake</SelectItem>
            </SelectContent>
          </Select>
          <Label className="text-xs text-muted-foreground">Speech Bubble</Label>
          <Input value={element.content?.speechBubble || ''} onChange={(e) => updateContent('speechBubble', e.target.value)} placeholder="Hello! I'm Pip!" className="text-xs h-7" />
        </div>
      )}

      {/* Audio properties with Mic + AI Voice */}
      {element.elementType === 'audio' && (
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Audio</Label>
          
          {/* Manual URL */}
          <Input value={element.content?.src || ''} onChange={(e) => updateContent('src', e.target.value)} placeholder="Audio URL..." className="text-xs" />
          <Input value={element.content?.label || ''} onChange={(e) => updateContent('label', e.target.value)} placeholder="Label (e.g. vocabulary word)" className="text-xs h-7" />

          {/* Mic Recording */}
          <div className="border border-border rounded p-2 space-y-2">
            <Label className="text-[10px] font-semibold">🎙️ Record Audio</Label>
            <Button
              size="sm"
              variant={isRecording ? 'destructive' : 'outline'}
              className="w-full text-xs h-7 gap-1"
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <><MicOff className="h-3 w-3" /> Stop Recording</> : <><Mic className="h-3 w-3" /> Start Recording</>}
            </Button>
            {isRecording && <p className="text-[10px] text-destructive animate-pulse">● Recording...</p>}
          </div>

          {/* AI Voice */}
          <div className="border border-border rounded p-2 space-y-2">
            <Label className="text-[10px] font-semibold">✨ AI Voice Generator</Label>
            <Input value={aiText} onChange={(e) => setAiText(e.target.value)} placeholder="Type word or phrase..." className="text-xs h-7" />
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-7 gap-1"
              onClick={generateAIVoice}
              disabled={isGeneratingVoice}
            >
              <Sparkles className="h-3 w-3" />
              {isGeneratingVoice ? 'Generating...' : 'Generate AI Voice'}
            </Button>
          </div>

          {/* Preview */}
          {element.content?.src && (
            <audio controls className="w-full h-8" src={element.content.src} />
          )}
        </div>
      )}
    </div>
  );
};
