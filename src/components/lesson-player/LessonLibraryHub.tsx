import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getLibraryLessons, LibraryLesson } from '@/services/lessonLibraryService';
import { HUB_CONFIGS } from '@/components/admin/lesson-builder/ai-wizard/hubConfig';
import { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import { BookOpen, Clock, Play, Loader2, CheckCircle2, Library, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const HUB_TABS = [
  { value: 'all', label: 'All', emoji: '📚' },
  { value: 'playground', label: 'Playground', emoji: '🛝' },
  { value: 'academy', label: 'Academy', emoji: '🏫' },
  { value: 'professional', label: 'Professional', emoji: '🏢' },
];

const HUB_CARD_STYLES: Record<string, { bg: string; border: string; badge: string; glow: string }> = {
  playground: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    border: 'border-amber-200/60',
    badge: 'bg-amber-500 text-white',
    glow: 'hover:shadow-[0_8px_30px_rgba(255,159,28,0.25)]',
  },
  academy: {
    bg: 'bg-gradient-to-br from-indigo-950 to-slate-900',
    border: 'border-indigo-500/30',
    badge: 'bg-violet-600 text-white',
    glow: 'hover:shadow-[0_8px_30px_rgba(139,92,246,0.3)]',
  },
  professional: {
    bg: 'bg-gradient-to-br from-slate-50 to-gray-100',
    border: 'border-slate-200',
    badge: 'bg-slate-700 text-white',
    glow: 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
  },
};

/* ── Hub-specific hero backgrounds when no thumbnail ── */
const HUB_HERO: Record<string, React.ReactNode> = {
  playground: (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-300 via-orange-200 to-yellow-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #FF6B6B 0%, transparent 60%), radial-gradient(circle at 70% 30%, #4ECDC4 0%, transparent 50%)' }} />
      <span className="text-6xl z-10 drop-shadow-lg animate-bounce">🐧</span>
    </div>
  ),
  academy: (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(139,92,246,0.1) 20px, rgba(139,92,246,0.1) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(139,92,246,0.1) 20px, rgba(139,92,246,0.1) 21px)' }} />
      <div className="w-16 h-16 rounded-2xl bg-violet-500/30 border border-violet-400/40 backdrop-blur flex items-center justify-center z-10">
        <Play className="h-8 w-8 text-violet-200 ml-1" />
      </div>
    </div>
  ),
  professional: (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 via-gray-100 to-white relative overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-3xl opacity-60" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.1), transparent 70%)' }} />
      <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center z-10 shadow-lg">
        <Library className="h-7 w-7 text-emerald-400" />
      </div>
    </div>
  ),
};

export default function LessonLibraryHub() {
  const [lessons, setLessons] = useState<LibraryLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadLessons();
  }, [activeTab]);

  useEffect(() => {
    loadCompletedLessons();
  }, [user]);

  const [isClearing, setIsClearing] = useState(false);

  const loadLessons = async () => {
    setLoading(true);
    try {
      const data = await getLibraryLessons(activeTab === 'all' ? undefined : activeTab);
      setLessons(data);
    } catch (err) {
      console.error('Failed to load lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLibrary = async () => {
    setIsClearing(true);
    try {
      const { error } = await supabase
        .from('curriculum_lessons')
        .delete()
        .eq('is_published', true);
      if (error) throw error;
      setLessons([]);
      toast.success('All published lessons cleared from the library.');
    } catch (err: any) {
      console.error('Clear library error:', err);
      toast.error('Failed to clear library: ' + err.message);
    } finally {
      setIsClearing(false);
    }
  };

  const loadCompletedLessons = async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('lesson_progress' as any)
        .select('lesson_id')
        .eq('student_id', user.id)
        .eq('is_completed', true);
      if (data) {
        setCompletedIds(new Set(data.map((d: any) => d.lesson_id)));
      }
    } catch {
      // table may not exist yet, ignore
    }
  };

  const openLesson = (lesson: LibraryLesson) => {
    navigate(`/lesson/${lesson.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Lesson Library
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Browse and play AI-generated lessons. Click any card to start.
          </p>
        </div>
        {lessons.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2 shrink-0" disabled={isClearing}>
                {isClearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Clear Library
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Lesson Library?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>all published lessons</strong> from the library.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearLibrary} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Hub filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {HUB_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.value
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Lesson Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No lessons found. Generate one in the AI Wizard!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {lessons.map((lesson, i) => {
              const hub = (lesson.target_system || 'playground') as HubType;
              const cardStyle = HUB_CARD_STYLES[hub] || HUB_CARD_STYLES.playground;
              const slideCount = lesson.content?.slides?.length || 0;
              const isCompleted = completedIds.has(lesson.id);

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => openLesson(lesson)}
                  className={`group cursor-pointer rounded-[20px] border overflow-hidden transition-all hover:scale-[1.02] ${cardStyle.bg} ${cardStyle.border} ${cardStyle.glow}`}
                >
                  {/* Thumbnail / Dynamic Hero */}
                  <div className="relative h-36 overflow-hidden">
                    {lesson.thumbnail_url ? (
                      <img
                        src={lesson.thumbnail_url}
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      HUB_HERO[hub] || HUB_HERO.playground
                    )}

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                      <motion.div
                        className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Play className="h-5 w-5 text-slate-800 ml-0.5" />
                      </motion.div>
                    </div>

                    {/* Badges */}
                    <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${cardStyle.badge}`}>
                      {hub.toUpperCase()}
                    </span>

                    {/* Completed checkmark */}
                    {isCompleted && (
                      <div className="absolute top-2 left-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className={`font-bold text-base mb-1 line-clamp-1 ${hub === 'academy' ? 'text-white' : 'text-foreground'}`}>
                      {lesson.title}
                    </h3>
                    <p className={`text-xs mb-3 line-clamp-2 ${hub === 'academy' ? 'text-indigo-300' : 'text-muted-foreground'}`}>
                      {lesson.description || 'AI-generated lesson'}
                    </p>
                    <div className={`flex items-center gap-3 text-[11px] ${hub === 'academy' ? 'text-indigo-400' : 'text-muted-foreground'}`}>
                      <span className="flex items-center gap-1">
                        <BookOpen size={11} /> {slideCount} slides
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {lesson.duration_minutes || 30}m
                      </span>
                      <span className="uppercase font-medium">{lesson.difficulty_level}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
