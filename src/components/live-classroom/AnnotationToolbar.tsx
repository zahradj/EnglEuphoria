import { Pencil, MousePointer2, Eraser, Star, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AnnotationTool } from './AnnotationOverlay';

interface Props {
  role: 'teacher' | 'student';
  tool: AnnotationTool;
  setTool: (t: AnnotationTool) => void;
  color: string;
  setColor: (c: string) => void;
  onClear: () => void;
  onReward?: () => void;
}

const PEN_COLORS = ['#0F172A', '#DC2626', '#2563EB', '#16A34A'];

export function AnnotationToolbar({ role, tool, setTool, color, setColor, onClear, onReward }: Props) {
  return (
    <div className="flex flex-col gap-2 p-2 rounded-2xl bg-card/95 backdrop-blur border border-border shadow-md">
      <ToolBtn active={tool === 'none'} onClick={() => setTool('none')} title="Hand"><Hand className="h-4 w-4" /></ToolBtn>
      <ToolBtn active={tool === 'pen'} onClick={() => setTool('pen')} title="Pen"><Pencil className="h-4 w-4" /></ToolBtn>
      {role === 'teacher' && (
        <ToolBtn active={tool === 'laser'} onClick={() => setTool('laser')} title="Laser pointer">
          <MousePointer2 className="h-4 w-4" />
        </ToolBtn>
      )}
      {tool === 'pen' && (
        <div className="flex flex-col gap-1 items-center pt-1 border-t border-border">
          {(role === 'teacher' ? PEN_COLORS : ['#0F172A']).map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-5 w-5 rounded-full border-2 ${color === c ? 'border-foreground' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
              aria-label={`Pen color ${c}`}
            />
          ))}
        </div>
      )}
      <ToolBtn onClick={onClear} title="Clear all"><Eraser className="h-4 w-4" /></ToolBtn>
      {role === 'teacher' && onReward && (
        <Button
          size="icon"
          onClick={onReward}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
          title="Reward star"
        >
          <Star className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

function ToolBtn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <Button
      size="icon"
      variant={active ? 'default' : 'outline'}
      onClick={onClick}
      title={title}
      className="rounded-xl"
    >
      {children}
    </Button>
  );
}
