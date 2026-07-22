import React from 'react';
import { ChevronDown, Zap, Mic, Upload } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Props {
  hub: 'playground' | 'academy' | 'success';
  onGenerateMissingAudio: () => void;
  /** Count of slides missing audio — for the badge */
  missingAudioCount: number;
  onPublishTemplate?: () => void;
  canPublishTemplate?: boolean;
}

export const BulkActionsMenu: React.FC<Props> = ({
  hub, onGenerateMissingAudio, missingAudioCount, onPublishTemplate, canPublishTemplate = true,
}) => {
  const trigger =
    hub === 'playground'
      ? 'bg-white border-2 border-orange-400 text-orange-700 hover:bg-orange-50 rounded-xl px-3 py-2 text-xs font-bold'
      : 'border border-slate-300 text-slate-700 hover:border-indigo-400 rounded-lg px-3 py-2 text-sm font-semibold';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn('inline-flex items-center gap-2 transition active:scale-95', trigger)}>
          <Zap className={hub === 'playground' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          Bulk Actions
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onGenerateMissingAudio}
          disabled={missingAudioCount === 0}
          className="cursor-pointer"
        >
          <Mic className="w-4 h-4 mr-2 text-indigo-600" />
          <div className="flex-1">
            <div className="text-sm font-semibold">Generate Missing Audio</div>
            <div className="text-[10px] text-slate-500">
              {missingAudioCount > 0
                ? `${missingAudioCount} slide${missingAudioCount === 1 ? '' : 's'} need audio`
                : 'All slides have audio'}
            </div>
          </div>
        </DropdownMenuItem>

        {onPublishTemplate && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onPublishTemplate}
              disabled={!canPublishTemplate}
              className="cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2 text-emerald-600" />
              <div className="flex-1">
                <div className="text-sm font-semibold">Publish as Template</div>
                <div className="text-[10px] text-slate-500">
                  {canPublishTemplate ? 'Share with the marketplace' : 'Need 8+ slides to publish'}
                </div>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
