import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Loader2, Star, Lock, Volume2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface VocabWord {
  id: string;
  word: string;
  unit_id: string | null;
  times_reviewed: number;
  mastered: boolean;
  mastery_level: number;
  sticker_image_url: string | null;
  audio_url: string | null;
  phoneme_tag: string | null;
  first_seen_at: string;
  last_reviewed_at: string;
}

interface UnitGroup {
  unitId: string | null;
  unitTitle: string;
  category: string;
  words: VocabWord[];
}

const CATEGORIES = ['All', 'Animals', 'Family', 'Toys', 'Other'];

const CATEGORY_ICONS: Record<string, string> = {
  All: '📚',
  Animals: '🦁',
  Family: '👨‍👩‍👧‍👦',
  Toys: '🧸',
  Other: '📝',
};

function inferCategory(unitTitle: string): string {
  const lower = unitTitle.toLowerCase();
  if (lower.includes('animal')) return 'Animals';
  if (lower.includes('family') || lower.includes('people')) return 'Family';
  if (lower.includes('toy') || lower.includes('object')) return 'Toys';
  return 'Other';
}

const MasteryStars = ({ level }: { level: number }) => (
  <div className="flex gap-0.5 mt-1">
    {[1, 2, 3].map((s) => (
      <Star
        key={s}
        className={cn(
          'h-3 w-3 transition-colors',
          s <= level ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
        )}
      />
    ))}
  </div>
);

const StickerCard = ({ word, onClick }: { word: VocabWord; onClick: () => void }) => {
  const hasGoldenSound = word.mastered && word.phoneme_tag;

  return (
    <motion.button
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.08, y: -4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center p-4 rounded-3xl w-[110px] h-[130px] cursor-pointer transition-all border-2',
        // Claymorphism: soft shadow, matte feel
        'bg-gradient-to-b shadow-[4px_6px_12px_rgba(0,0,0,0.12),_inset_0_2px_4px_rgba(255,255,255,0.4)]',
        word.mastered
          ? 'from-amber-50 to-amber-100 border-amber-300/60 dark:from-amber-950/40 dark:to-amber-900/30 dark:border-amber-600/40'
          : 'from-white to-gray-50 border-gray-200/60 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700/40',
        hasGoldenSound && 'ring-2 ring-amber-400/50 ring-offset-2 ring-offset-background'
      )}
    >
      {/* Golden Sound Badge */}
      {hasGoldenSound && (
        <motion.div
          className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full p-1 shadow-lg"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Sparkles className="h-3 w-3 text-white" />
        </motion.div>
      )}

      {/* Sticker Image or Emoji Fallback */}
      <div className="text-3xl mb-1">
        {word.sticker_image_url ? (
          <img
            src={word.sticker_image_url}
            alt={word.word}
            className="w-12 h-12 object-contain drop-shadow-md"
          />
        ) : (
          <span className="drop-shadow-sm">
            {word.mastered ? '⭐' : '📖'}
          </span>
        )}
      </div>

      {/* Word */}
      <p className="text-xs font-bold text-foreground capitalize leading-tight text-center">
        {word.word}
      </p>

      {/* Mastery Stars */}
      <MasteryStars level={word.mastery_level} />

      {/* Audio indicator */}
      {word.audio_url && (
        <Volume2 className="absolute bottom-2 right-2 h-3 w-3 text-muted-foreground/50" />
      )}
    </motion.button>
  );
};

const LockedSticker = () => (
  <div className="flex flex-col items-center justify-center p-4 rounded-3xl w-[110px] h-[130px] bg-muted/40 border-2 border-dashed border-muted-foreground/15 shadow-inner">
    <Lock className="h-6 w-6 text-muted-foreground/25 mb-2" />
    <p className="text-[10px] text-muted-foreground/30 font-medium">???</p>
  </div>
);

export const VocabularyVault: React.FC = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['vocabulary-vault', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: vocabData, error } = await supabase
        .from('student_vocabulary_progress')
        .select('*')
        .eq('student_id', user.id)
        .order('first_seen_at', { ascending: true });

      if (error) throw error;
      if (!vocabData?.length) return [];

      const unitIds = [...new Set(vocabData.map((v: any) => v.unit_id).filter(Boolean))];
      let unitMap: Record<string, string> = {};
      if (unitIds.length) {
        const { data: units } = await supabase
          .from('curriculum_units')
          .select('id, title')
          .in('id', unitIds);
        if (units) {
          unitMap = Object.fromEntries(units.map((u: any) => [u.id, u.title]));
        }
      }

      const grouped: Record<string, VocabWord[]> = {};
      for (const word of vocabData) {
        const key = word.unit_id || 'ungrouped';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(word as VocabWord);
      }

      return Object.entries(grouped).map(([unitId, words]) => {
        const title = unitId === 'ungrouped' ? 'Other Words' : (unitMap[unitId] || 'Unknown Unit');
        return {
          unitId: unitId === 'ungrouped' ? null : unitId,
          unitTitle: title,
          category: inferCategory(title),
          words,
        };
      }) as UnitGroup[];
    },
    enabled: !!user?.id,
    staleTime: 3 * 60 * 1000,
  });

  const filteredGroups = activeCategory === 'All'
    ? groups
    : groups.filter(g => g.category === activeCategory);

  const totalWords = groups.reduce((sum, g) => sum + g.words.length, 0);
  const masteredWords = groups.reduce((sum, g) => sum + g.words.filter(w => w.mastered).length, 0);
  const goldenSounds = groups.reduce((sum, g) => sum + g.words.filter(w => w.mastered && w.phoneme_tag).length, 0);

  const playAudio = (url: string | null) => {
    if (!url) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(url);
    audioRef.current.play().catch(() => {});
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header — Claymorphic Card */}
      <Card className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border-amber-200/40 dark:border-amber-800/30 shadow-[0_8px_30px_rgba(245,158,11,0.1)]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">🏆</span>
            My Vocabulary Vault
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-black text-foreground">{totalWords}</p>
              <p className="text-xs text-muted-foreground font-medium">Collected</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-amber-500">{masteredWords}</p>
              <p className="text-xs text-muted-foreground font-medium">Mastered</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-yellow-500">{goldenSounds}</p>
              <p className="text-xs text-muted-foreground font-medium">Golden Sounds</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-primary">
                {totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground font-medium">Mastery</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter Bar — Claymorphic Buttons */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant="outline"
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'rounded-2xl px-4 py-2 font-semibold transition-all border-2',
              'shadow-[2px_3px_6px_rgba(0,0,0,0.08),_inset_0_1px_2px_rgba(255,255,255,0.5)]',
              activeCategory === cat
                ? 'bg-gradient-to-b from-primary/90 to-primary text-primary-foreground border-primary/60 shadow-primary/20'
                : 'bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200/60 dark:border-gray-700/40 hover:from-gray-50 hover:to-gray-100'
            )}
          >
            <span className="mr-1">{CATEGORY_ICONS[cat]}</span>
            {cat}
          </Button>
        ))}
      </div>

      {/* Sticker Grid */}
      {filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No stickers yet!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete lessons to unlock vocabulary stickers 🌟
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredGroups.map((group) => (
          <Card key={group.unitId || 'ungrouped'} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span>{CATEGORY_ICONS[group.category] || '📝'}</span>
                <span>{group.unitTitle}</span>
                <Badge variant="outline" className="text-xs rounded-full">
                  {group.words.length} stickers
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <AnimatePresence>
                  {group.words.map((word) => (
                    <StickerCard
                      key={word.id}
                      word={word}
                      onClick={() => playAudio(word.audio_url)}
                    />
                  ))}
                </AnimatePresence>
                {/* Locked placeholders to tease upcoming words */}
                {group.words.length < 8 &&
                  Array.from({ length: Math.min(3, 8 - group.words.length) }).map((_, i) => (
                    <LockedSticker key={`locked-${i}`} />
                  ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
