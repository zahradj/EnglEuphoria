import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SoundButton } from '@/components/ui/sound-button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Layout, Globe, PenTool, Pencil, Eraser, MousePointer2, Hand, Trash2, ChevronLeft, ChevronRight, Check, Unlock, Star, Timer as TimerIcon, Dice6, Smile, Sparkles, Cloud, Loader2, ArrowLeft, ArrowRight, RotateCcw, Home, BookOpen, Disc3 } from 'lucide-react';
import { StageMode } from '@/services/whiteboardService';
import { createHyperbeamSession } from './MultiplayerWebStage';
import { coBrowserController } from './coBrowserController';
import { useToast } from '@/hooks/use-toast';
import { audioService } from '@/services/audioService';

const PEN_COLORS = ['#FF3B30', '#007AFF', '#34C759', '#FF9500', '#AF52DE', '#000000'];

const STICKER_PACK = ['👏', '👍', '❤️', '🔥', '🎉', '🌟', '💯', '😂'];

interface TeacherControlDockProps {
  mode: StageMode;
  onModeChange: (mode: StageMode) => void;
  embeddedUrl: string | null;
  onEmbedUrl: (url: string) => void;

  drawingEnabled: boolean;
  onToggleDrawing: (enabled: boolean) => void;

  activeTool: 'pen' | 'highlighter' | 'eraser' | 'pointer';
  onToolChange: (tool: 'pen' | 'highlighter' | 'eraser' | 'pointer') => void;
  activeColor: string;
  onColorChange: (color: string) => void;

  currentSlideIndex: number;
  totalSlides: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;

  onClearCanvas: () => void;

  iframeUnlocked: boolean;
  onToggleIframeUnlock: (unlocked: boolean) => void;

  /** Whether the student may play the active Playground scene activity (default locked/watch-only). */
  activityUnlocked?: boolean;
  onToggleActivityUnlock?: (unlocked: boolean) => void;
  /** Show the "Unlock Student Activity" toggle — true when a Playground scene lesson is on stage. */
  isSceneLessonActive?: boolean;

  // Consolidated classroom tools (moved from left sidebar)
  onGiveStar?: () => void;
  onOpenTimer?: () => void;
  onRollDice?: () => void;
  onSpinWheel?: () => void;
  onStartXO?: () => void;
  onSendSticker?: (emoji: string) => void;
  onOpenLibrary?: () => void;
  onTogglePenTools?: () => void;
  penToolsOpen?: boolean;
  starCount?: number;
  hubType?: 'playground' | 'academy' | 'professional';

}

/**
 * Dock button styles, kept in lock-step with `getClassroomHubTheme().buttonPrimary`
 * so every hub-themed surface in the classroom (top bar, chat Send, navigator,
 * dock) renders with the *same* shade — no stray dark-purple buttons that look
 * out of place next to the lighter hub buttons elsewhere.
 */
const HUB_ACCENT_CLASSES = {
  playground: {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white',
    outline: 'border-orange-300 text-orange-800 hover:bg-orange-50',
  },
  academy: {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    outline: 'border-purple-300 text-purple-800 hover:bg-purple-50',
  },
  professional: {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    outline: 'border-emerald-300 text-emerald-800 hover:bg-emerald-50',
  },
} as const;

/**
 * Floating glassmorphic control dock for the teacher. Manages stage mode,
 * embedded URL, pen/eraser/color, drawing toggle, and slide navigation.
 */
export const TeacherControlDock: React.FC<TeacherControlDockProps> = ({
  mode,
  onModeChange,
  embeddedUrl,
  onEmbedUrl,
  drawingEnabled,
  onToggleDrawing,
  activeTool,
  onToolChange,
  activeColor,
  onColorChange,
  currentSlideIndex,
  totalSlides,
  onPrevSlide,
  onNextSlide,
  onClearCanvas,
  iframeUnlocked,
  onToggleIframeUnlock,
  activityUnlocked = false,
  onToggleActivityUnlock,
  isSceneLessonActive = false,
  onGiveStar,
  onOpenTimer,
  onRollDice,
  onSpinWheel,
  onStartXO,
  onSendSticker,
  onOpenLibrary,
  onTogglePenTools,
  penToolsOpen,
  starCount = 0,
  hubType = 'academy',

}) => {
  const [urlDraft, setUrlDraft] = useState(embeddedUrl ?? '');
  const [coPlayLoading, setCoPlayLoading] = useState(false);
  const { toast } = useToast();
  const accent = HUB_ACCENT_CLASSES[hubType] ?? HUB_ACCENT_CLASSES.academy;

  const isCoPlay = !!embeddedUrl && /\.hyperbeam\.com\//i.test(embeddedUrl);

  const submitUrl = () => {
    if (!urlDraft.trim()) return;
    let normalized = urlDraft.trim();
    if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;
    coBrowserController.homeUrl = normalized;
    // If a co-play session is already live, navigate inside it instead of
    // swapping the embed URL (which would tear down the cloud browser).
    if (isCoPlay) {
      coBrowserController.emit('home', normalized);
    } else {
      onEmbedUrl(normalized);
    }
  };

  const launchCoPlay = async () => {
    setCoPlayLoading(true);
    try {
      const start = urlDraft.trim() || 'https://www.gamestolearnenglish.com/';
      const startNormalized = /^https?:\/\//i.test(start) ? start : `https://${start}`;
      coBrowserController.homeUrl = startNormalized;
      const { embedUrl } = await createHyperbeamSession(startNormalized, 'teacher');
      onEmbedUrl(embedUrl);
      toast({ title: 'Co-Play stage ready', description: 'You and the student are now in the same browser.' });
    } catch (err: any) {
      console.error('[Co-Play] failed:', err);
      const msg: string = err?.message ?? 'Could not start cloud browser.';
      const isRateLimit = /rate[- ]limit|too[_ ]many/i.test(msg);
      // Fall back to a regular iframe so the teacher can still share the page.
      const fallback = urlDraft.trim();
      if (fallback) {
        const normalized = /^https?:\/\//i.test(fallback) ? fallback : `https://${fallback}`;
        onEmbedUrl(normalized);
        toast({
          title: isRateLimit ? 'Co-Play unavailable — using regular embed' : 'Co-Play failed — using regular embed',
          description: isRateLimit
            ? 'Hyperbeam is rate-limited. Showing the page in a normal iframe instead. Try Co-Play again in ~60s.'
            : msg,
          variant: isRateLimit ? 'default' : 'destructive',
        });
      } else {
        toast({ title: 'Co-Play failed', description: msg, variant: 'destructive' });
      }
    } finally {
      setCoPlayLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] pointer-events-auto max-w-[calc(100vw-1rem)]">
      <div className="flex items-center gap-2 bg-background/85 backdrop-blur-xl rounded-2xl px-3 py-2 shadow-2xl border border-border overflow-x-auto max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Mode switcher */}
        <div className="flex items-center gap-1 pr-2 border-r border-border">
          <ModeButton active={mode === 'slide'} onClick={() => onModeChange('slide')} Icon={Layout} label="Slide" activeClassName={accent.primary} />
          <ModeButton active={mode === 'web'} onClick={() => onModeChange('web')} Icon={Globe} label="Web" activeClassName={accent.primary} />
          <ModeButton active={mode === 'blank'} onClick={() => onModeChange('blank')} Icon={PenTool} label="Blank" activeClassName={accent.primary} />
        </div>

        {/* URL input — visible only when web mode */}
        {mode === 'web' && (
          <div className="flex items-center gap-1 pr-2 border-r border-border">
            <Input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitUrl(); }}
              placeholder="Paste a URL…"
              className="h-8 w-56 text-xs"
            />
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={submitUrl} title="Load URL (iframe)">
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="default"
              className={`h-8 gap-1.5 text-xs ${accent.primary}`}
              onClick={launchCoPlay}
              disabled={coPlayLoading}
              title="Launch a true co-play cloud browser session"
            >
              {coPlayLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Cloud className="h-3.5 w-3.5" />}
              Co-Play
            </Button>
          </div>
        )}

        {/* Co-browser navigation — Back / Forward / Reload / Home (Co-Play only) */}
        {mode === 'web' && isCoPlay && (
          <div className="flex items-center gap-1 pr-2 border-r border-border">
            <Button
              size="icon" variant="ghost" className="h-8 w-8"
              onClick={() => coBrowserController.emit('back')}
              title="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon" variant="ghost" className="h-8 w-8"
              onClick={() => coBrowserController.emit('forward')}
              title="Forward"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="icon" variant="ghost" className="h-8 w-8"
              onClick={() => coBrowserController.emit('reload')}
              title="Reload"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              size="icon" variant="ghost" className="h-8 w-8"
              onClick={() => coBrowserController.emit('home')}
              disabled={!coBrowserController.homeUrl}
              title={coBrowserController.homeUrl ? `Home: ${coBrowserController.homeUrl}` : 'Set a Home URL by submitting a URL above'}
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Independent Play toggle — only when web mode */}
        {mode === 'web' && (
          <div className="flex items-center gap-2 pr-2 border-r border-border">
            <Unlock className={`h-3.5 w-3.5 ${iframeUnlocked ? 'text-primary' : 'text-muted-foreground'}`} />
            <label className="text-xs text-foreground select-none cursor-pointer" htmlFor="iframe-unlock-toggle">
              Unlock Student Interaction
            </label>
            <Switch
              id="iframe-unlock-toggle"
              checked={iframeUnlocked}
              onCheckedChange={onToggleIframeUnlock}
              aria-label="Unlock student interaction with embedded web page"
            />
          </div>
        )}

        {/* Slide nav — visible only when slide mode */}
        {mode === 'slide' && totalSlides > 0 && (
          <div className="flex items-center gap-1 pr-2 border-r border-border">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onPrevSlide} disabled={currentSlideIndex === 0} title="Previous slide">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums px-1">
              {currentSlideIndex + 1}/{totalSlides}
            </span>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onNextSlide} disabled={currentSlideIndex >= totalSlides - 1} title="Next slide">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Pen tools, color picker, drawing toggle, and clear moved to the
            floating left rail over the learning content. */}



        {/* Hub-branded Give Star — prominent on the bottom toolbar */}
        {onGiveStar && (
          <div className="pl-2 ml-1 border-l border-border">
            <SoundButton
              soundType="star"
              onClick={onGiveStar}
              title="Give a star"
              aria-label="Give star reward"
              className={`group h-9 gap-1.5 px-3 rounded-full text-sm font-semibold shadow-sm ${accent.primary}`}
            >
              <Star className="h-4 w-4 fill-current group-hover:rotate-12 transition-transform" />
              <span>Star</span>
              {starCount > 0 && (
                <span className="ml-1 min-w-[20px] h-5 px-1.5 rounded-full bg-white/95 text-foreground text-[11px] font-extrabold flex items-center justify-center">
                  {starCount}
                </span>
              )}
            </SoundButton>
          </div>
        )}

        {/* Consolidated Classroom Tools (Timer / Dice / Reactions) */}
        {(onOpenTimer || onRollDice || onSpinWheel || onStartXO || onSendSticker || (isSceneLessonActive && onToggleActivityUnlock)) && (
          <div className="pl-2 ml-1 border-l border-border">

            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="default" className={`h-9 gap-1.5 text-sm ${accent.primary}`} title="Classroom Tools">
                  <Sparkles className="h-3.5 w-3.5" />
                  Tools
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="end" side="top">
                <div className="space-y-3">
                  {/* Unlock/lock the student's ability to play the active Playground scene game */}
                  {isSceneLessonActive && onToggleActivityUnlock && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-2">
                      <Unlock className={`h-3.5 w-3.5 shrink-0 ${activityUnlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                      <label className="flex-1 text-xs font-medium text-foreground select-none cursor-pointer" htmlFor="activity-unlock-toggle">
                        Unlock Student Activity
                      </label>
                      <Switch
                        id="activity-unlock-toggle"
                        checked={activityUnlocked}
                        onCheckedChange={onToggleActivityUnlock}
                        aria-label="Unlock student interaction with the scene activity"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Star promoted to its own hub-branded button on the dock. */}

                    {onOpenTimer && (
                      <SoundButton variant="ghost" soundType="timer" onClick={onOpenTimer} className={`h-16 flex flex-col items-center justify-center gap-1 ${accent.primary}`}>
                        <TimerIcon className="h-5 w-5" />
                        <span className="text-[10px] font-semibold">Timer</span>
                      </SoundButton>
                    )}
                    {onRollDice && (
                      <SoundButton variant="ghost" soundType="dice" onClick={onRollDice} className={`h-16 flex flex-col items-center justify-center gap-1 ${accent.primary}`}>
                        <Dice6 className="h-5 w-5" />
                        <span className="text-[10px] font-semibold">Roll Dice</span>
                      </SoundButton>
                    )}
                    {onSpinWheel && (
                      <SoundButton variant="ghost" soundType="dice" onClick={onSpinWheel} className={`h-16 flex flex-col items-center justify-center gap-1 ${accent.primary}`}>
                        <Disc3 className="h-5 w-5" />
                        <span className="text-[10px] font-semibold">Spin Wheel</span>
                      </SoundButton>
                    )}
                    {onStartXO && (
                      <SoundButton variant="ghost" soundType="dice" onClick={onStartXO} className={`h-16 flex flex-col items-center justify-center gap-1 ${accent.primary}`}>
                        <span className="text-xl leading-none font-black">XO</span>
                        <span className="text-[10px] font-semibold">Tic-Tac-Toe</span>
                      </SoundButton>
                    )}
                  </div>
                  {onSendSticker && (
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5">
                        <Smile className="h-3 w-3" /> Reactions
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {STICKER_PACK.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              audioService.playEmojiSound(emoji);
                              onSendSticker(emoji);
                            }}
                            className="h-10 w-full text-xl rounded-lg hover:bg-pink-100 active:scale-95 transition-all flex items-center justify-center"
                            aria-label={`Send ${emoji} reaction`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Pen tools toggle */}
        {onTogglePenTools && (
          <div className="pl-2 ml-1 border-l border-border">
            <Button
              size="sm"
              variant={penToolsOpen ? 'default' : 'outline'}
              className={`h-9 gap-1.5 text-sm ${penToolsOpen ? accent.primary : accent.outline}`}
              onClick={onTogglePenTools}
              title={penToolsOpen ? 'Hide pen tools' : 'Show pen tools'}
            >
              <PenTool className="h-3.5 w-3.5" />
              Pen Tools
            </Button>
          </div>
        )}

        {/* Library quick-load */}
        {onOpenLibrary && (
          <div className="pl-2 ml-1 border-l border-border">
            <Button size="sm" variant="outline" className={`h-9 gap-1.5 text-sm ${accent.outline}`} onClick={onOpenLibrary} title="Open Lesson Library">
              <BookOpen className="h-3.5 w-3.5" />
              Library
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const ModeButton: React.FC<{ active: boolean; onClick: () => void; Icon: React.ComponentType<{ className?: string }>; label: string; activeClassName: string }> = ({ active, onClick, Icon, label, activeClassName }) => (
  <Button
    size="sm"
    variant={active ? 'default' : 'ghost'}
    onClick={onClick}
    className={`h-8 gap-1.5 text-xs ${active ? activeClassName : ''}`}
  >
    <Icon className="h-3.5 w-3.5" />
    {label}
  </Button>
);

const ToolButton: React.FC<{ active: boolean; onClick: () => void; Icon: React.ComponentType<{ className?: string }>; title: string; activeClassName: string }> = ({ active, onClick, Icon, title, activeClassName }) => (
  <Button
    size="icon"
    variant={active ? 'default' : 'ghost'}
    onClick={onClick}
    className={`h-8 w-8 ${active ? activeClassName : ''}`}
    title={title}
  >
    <Icon className="h-4 w-4" />
  </Button>
);
