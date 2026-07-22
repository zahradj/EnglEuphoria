import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Archive, AudioLines, BookText, BookOpen, Filter, ArrowLeft } from 'lucide-react';
import { VocabularyVaultTab } from '@/components/student/tabs/VocabularyVaultTab';
import { MapOfSoundsTab } from '@/components/student/tabs/MapOfSoundsTab';
import { GrammarJournalTab } from '@/components/student/tabs/GrammarJournalTab';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';


type HubType = 'playground' | 'academy' | 'professional';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hubType?: HubType;
  /** Optional CEFR level lock (e.g. "B1") for the in-drawer library */
  levelFilter?: string | null;
}

const HUB_THEME: Record<HubType, { accent: string; chip: string; border: string; soft: string }> = {
  playground: {
    accent: 'text-orange-600',
    chip: 'bg-orange-100 text-orange-800 border-orange-200',
    border: 'border-orange-200',
    soft: 'bg-orange-50',
  },
  academy: {
    accent: 'text-indigo-600',
    chip: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    border: 'border-indigo-200',
    soft: 'bg-indigo-50',
  },
  professional: {
    accent: 'text-emerald-600',
    chip: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    border: 'border-emerald-200',
    soft: 'bg-emerald-50',
  },
};

const HUB_LABEL: Record<HubType, string> = {
  playground: 'Playground Hub',
  academy: 'Academy Hub',
  professional: 'Success Hub',
};

/**
 * In-classroom Library Drawer
 * Surfaces the same Vocabulary / Sounds / Grammar / Library content
 * the student has on the dashboard, without leaving the live session.
 * Locked to the student's current hub (and optionally their CEFR level).
 */
export const ClassroomLibraryDrawer: React.FC<Props> = ({
  open,
  onOpenChange,
  hubType = 'academy',
  levelFilter = null,
}) => {
  const theme = HUB_THEME[hubType];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        <SheetHeader className={cn('px-6 pt-6 pb-3 border-b', theme.border)}>
          <div className="flex items-center justify-between mb-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className={cn('gap-1.5 -ml-2 rounded-full', theme.accent)}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to lesson</span>
            </Button>
          </div>
          <SheetTitle className={cn('flex items-center gap-2 text-2xl', theme.accent)}>
            <BookOpen className="w-6 h-6" />
            My Library
          </SheetTitle>
          <SheetDescription>
            Peek at words, sounds, and grammar from your past lessons — without leaving the classroom.
          </SheetDescription>

          {/* Filter chip strip — hub-locked, level-locked */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filtered
            </span>
            <Badge variant="outline" className={cn('text-xs border', theme.chip)}>
              {HUB_LABEL[hubType]}
            </Badge>
            {levelFilter && (
              <Badge variant="outline" className={cn('text-xs border', theme.chip)}>
                Level {levelFilter.toUpperCase()}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <Tabs defaultValue="vocab" className="w-full">
          <TabsList className="sticky top-0 z-10 grid grid-cols-4 mx-6 mt-4 mb-2 bg-muted/80 backdrop-blur">
            <TabsTrigger value="vocab" className="gap-1.5 text-xs">
              <Archive className="w-3.5 h-3.5" /> Vocab
            </TabsTrigger>
            <TabsTrigger value="sounds" className="gap-1.5 text-xs">
              <AudioLines className="w-3.5 h-3.5" /> Sounds
            </TabsTrigger>
            <TabsTrigger value="grammar" className="gap-1.5 text-xs">
              <BookText className="w-3.5 h-3.5" /> Grammar
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-1.5 text-xs">
              <BookOpen className="w-3.5 h-3.5" /> Stories
            </TabsTrigger>
          </TabsList>

          <div className="px-6 pb-10 pt-2">
            <TabsContent value="vocab" className="mt-0">
              <VocabularyVaultTab />
            </TabsContent>
            <TabsContent value="sounds" className="mt-0">
              <MapOfSoundsTab />
            </TabsContent>
            <TabsContent value="grammar" className="mt-0">
              <GrammarJournalTab />
            </TabsContent>
            <TabsContent value="library" className="mt-0 space-y-4">
              <div className="text-center py-8 space-y-3 border-t pt-6">
                <BookOpen className={cn('w-12 h-12 mx-auto opacity-50', theme.accent)} />
                <p className="text-sm text-muted-foreground">
                  Your full library of stories and readings is best explored after class.
                </p>
                <Link
                  to="/library"
                  className={cn('inline-block underline underline-offset-4 text-sm font-medium', theme.accent)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open full library →
                </Link>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ClassroomLibraryDrawer;
