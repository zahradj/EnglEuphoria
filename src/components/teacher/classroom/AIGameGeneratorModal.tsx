import React, { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2, Sparkles, Save, Trash2, Library, Wand2, BookOpen, Puzzle, Type, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { SmartWorksheet, NativeGameType } from '@/services/whiteboardService';
import { savedGamesService, type SavedGame } from '@/services/savedGamesService';

interface AIGameGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  /** Called when teacher launches a game — modal closes and game appears on the stage. */
  onLaunchGame: (gameType: NativeGameType, worksheet: SmartWorksheet, sourceTitle: string) => void;
}

const AGE_LEVELS = [
  { value: 'playground', label: '🎪 Playground (Ages 4–9)' },
  { value: 'academy', label: '📘 Academy (Ages 10–16)' },
  { value: 'professional', label: '🏆 Adults / Professional' },
];

const LEVEL_TO_CEFR: Record<string, string> = {
  playground: 'A1',
  academy: 'A2',
  professional: 'B1',
};

const GAMES: Array<{
  type: NativeGameType;
  label: string;
  emoji: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    type: 'flashcards',
    label: 'Flashcards',
    emoji: '🃏',
    description: 'Tap to flip — show word, then definition.',
    Icon: BookOpen,
    color: 'from-amber-400 to-orange-500',
  },
  {
    type: 'memory',
    label: 'Memory Match',
    emoji: '🧠',
    description: 'Match the pairs by flipping cards.',
    Icon: Puzzle,
    color: 'from-indigo-400 to-violet-500',
  },
  {
    type: 'sentence',
    label: 'Sentence Builder',
    emoji: '🧩',
    description: 'Drag scrambled words into the right order.',
    Icon: Type,
    color: 'from-emerald-400 to-teal-500',
  },
  {
    type: 'blanks',
    label: 'Fill in the Blanks',
    emoji: '✏️',
    description: 'Choose the right word to complete each sentence.',
    Icon: Pencil,
    color: 'from-rose-400 to-pink-500',
  },
];

type View = 'create' | 'launcher';

export const AIGameGeneratorModal: React.FC<AIGameGeneratorModalProps> = ({
  open,
  onOpenChange,
  teacherId,
  onLaunchGame,
}) => {
  const [tab, setTab] = useState<'create' | 'library'>('create');
  const [view, setView] = useState<View>('create');

  // Create form state
  const [topic, setTopic] = useState('');
  const [ageLevel, setAgeLevel] = useState('academy');
  const [generating, setGenerating] = useState(false);

  // Generated worksheet (shared by Create & Library)
  const [worksheet, setWorksheet] = useState<SmartWorksheet | null>(null);
  const [worksheetTitle, setWorksheetTitle] = useState('');

  // Library
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [saving, setSaving] = useState(false);

  const refreshLibrary = useCallback(async () => {
    if (!teacherId) return;
    setLoadingLibrary(true);
    try {
      const list = await savedGamesService.list(teacherId);
      setSavedGames(list);
    } catch (e: any) {
      toast.error('Could not load library', { description: e.message });
    } finally {
      setLoadingLibrary(false);
    }
  }, [teacherId]);

  useEffect(() => {
    if (open && tab === 'library') void refreshLibrary();
  }, [open, tab, refreshLibrary]);

  useEffect(() => {
    if (!open) {
      // Reset transient state on close
      setView('create');
      setWorksheet(null);
      setWorksheetTitle('');
    }
  }, [open]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic.');
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-smart-worksheet', {
        body: {
          topic: topic.trim(),
          level: LEVEL_TO_CEFR[ageLevel] ?? 'A2',
          count: 6,
        },
      });
      if (error) throw error;
      if (!data?.worksheet) throw new Error('No worksheet returned.');
      setWorksheet(data.worksheet as SmartWorksheet);
      setWorksheetTitle(topic.trim());
      setView('launcher');
      toast.success('Mini-games generated!', { description: '4 games ready to play.' });
    } catch (e: any) {
      toast.error('Generation failed', { description: e?.message ?? 'Please try again.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleLaunch = (gameType: NativeGameType) => {
    if (!worksheet) return;
    onLaunchGame(gameType, worksheet, worksheetTitle || 'Smart Worksheet');
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!worksheet) return;
    const title = window.prompt('Save game as:', worksheetTitle || topic || 'Untitled game');
    if (!title || !title.trim()) return;
    setSaving(true);
    try {
      await savedGamesService.create({
        teacherId,
        title: title.trim(),
        topic: worksheetTitle || topic || title.trim(),
        ageLevel,
        gameData: worksheet,
      });
      toast.success('Game saved to your library!');
      void refreshLibrary();
    } catch (e: any) {
      toast.error('Save failed', { description: e?.message });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSavedGame = (game: SavedGame) => {
    setWorksheet(game.game_data);
    setWorksheetTitle(game.title);
    setView('launcher');
    setTab('create'); // launcher shares space — switch tab to make scope clear
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-gradient-to-br from-white via-purple-50/40 to-blue-50/40 backdrop-blur-xl border-2 border-purple-200/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Wand2 className="h-6 w-6 text-purple-600" />
            AI Game Generator
          </DialogTitle>
          <DialogDescription>
            Generate a synced mini-game in seconds, or replay a saved one from your library.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as 'create' | 'library'); if (v === 'create') setView('create'); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="gap-2">
              <Sparkles className="h-4 w-4" /> Create New
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <Library className="h-4 w-4" /> My Library
            </TabsTrigger>
          </TabsList>

          {/* CREATE TAB */}
          <TabsContent value="create" className="mt-4">
            {view === 'create' ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic">Topic / Vocabulary Focus</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Food and Drinks, Past Tense Irregular Verbs, Animals…"
                    disabled={generating}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !generating) handleGenerate();
                    }}
                  />
                </div>
                <div>
                  <Label>Target Age / Level</Label>
                  <Select value={ageLevel} onValueChange={setAgeLevel} disabled={generating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_LEVELS.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generating || !topic.trim()}
                  className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Gemini is building your games…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>

                {generating && (
                  <p className="text-sm text-center text-muted-foreground italic animate-pulse">
                    Crafting flashcards, memory pairs, sentence builders, and fill-in-the-blanks…
                  </p>
                )}
              </div>
            ) : (
              <GameLauncher
                title={worksheetTitle}
                onLaunch={handleLaunch}
                onBack={() => setView('create')}
                onSave={handleSave}
                saving={saving}
              />
            )}
          </TabsContent>

          {/* LIBRARY TAB */}
          <TabsContent value="library" className="mt-4">
            {loadingLibrary ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : savedGames.length === 0 ? (
              <div className="text-center py-12">
                <Library className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="font-semibold text-foreground">No saved games yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate a game in <span className="font-medium">Create New</span> and save it
                  to reuse later.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {savedGames.map((g) => (
                  <Card
                    key={g.id}
                    className="p-3 flex items-center justify-between hover:bg-purple-50/60 transition-colors"
                  >
                    <button
                      onClick={() => handleOpenSavedGame(g)}
                      className="flex-1 text-left"
                    >
                      <div className="font-semibold text-foreground">{g.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {g.topic} · {new Date(g.created_at).toLocaleDateString()}
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        if (!window.confirm(`Delete "${g.title}"? This cannot be undone.`)) return;
                        try {
                          await savedGamesService.remove(g.id);
                          toast.success('Game deleted');
                          void refreshLibrary();
                        } catch (e: any) {
                          toast.error('Delete failed', { description: e?.message });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

interface LauncherProps {
  title: string;
  onLaunch: (game: NativeGameType) => void;
  onBack: () => void;
  onSave: () => void;
  saving: boolean;
}

const GameLauncher: React.FC<LauncherProps> = ({ title, onLaunch, onBack, onSave, saving }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Worksheet ready</p>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
      </div>
      <Button variant="outline" size="sm" onClick={onSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        Save to Library
      </Button>
    </div>

    <div className="grid grid-cols-2 gap-3">
      {GAMES.map((g) => (
        <button
          key={g.type}
          onClick={() => onLaunch(g.type)}
          className={`group relative overflow-hidden rounded-2xl p-5 text-left bg-gradient-to-br ${g.color} text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all`}
        >
          <div className="text-3xl mb-2">{g.emoji}</div>
          <div className="text-lg font-bold">{g.label}</div>
          <div className="text-xs opacity-90 mt-1">{g.description}</div>
          <div className="absolute bottom-2 right-3 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            Play →
          </div>
        </button>
      ))}
    </div>

    <Button variant="ghost" onClick={onBack} className="w-full">
      ← Generate another game
    </Button>
  </div>
);
