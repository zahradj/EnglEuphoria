import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Option { type: string; label: string; emoji?: string }

interface Props {
  options: Option[];
  onInsert: (type: string) => void;
  hub: 'playground' | 'academy' | 'success';
}

const ACCENT: Record<Props['hub'], string> = {
  playground: 'border-orange-300 text-orange-600 hover:bg-orange-50',
  academy: 'border-indigo-300 text-indigo-600 hover:bg-indigo-50',
  success: 'border-emerald-300 text-emerald-600 hover:bg-emerald-50',
};

/** Hover-revealed `+` chip that sits between two slide thumbnails. */
export function InsertSlideButton({ options, onInsert, hub }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative h-2 group">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={`absolute left-1/2 -translate-x-1/2 -top-1 inline-flex items-center justify-center w-5 h-5 rounded-full border-2 bg-white opacity-0 group-hover:opacity-100 transition ${ACCENT[hub]}`}
            title="Insert slide here"
          >
            <Plus className="w-3 h-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="center">
          <div className="grid gap-0.5">
            {options.map((o) => (
              <button
                key={o.type}
                onClick={() => { onInsert(o.type); setOpen(false); }}
                className="text-left text-xs px-2 py-1.5 rounded hover:bg-slate-100 flex items-center gap-2"
              >
                {o.emoji && <span>{o.emoji}</span>}
                <span className="font-medium">{o.label}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default InsertSlideButton;
