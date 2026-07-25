import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { GeneratedSlide, HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import { HUB_CONFIGS } from '@/components/admin/lesson-builder/ai-wizard/hubConfig';
import PipMascot from '../PipMascot';
import { Play, Loader2, Square, Music, Volume2 } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { SlideBrandHeader } from './SlideBrandHeader';
import { supabaseUrl, supabaseAnonKey } from '@/integrations/supabase/client';

interface Props {
  slide: GeneratedSlide;
  hub: HubType;
}

// Kid-friendly expressive voice for reading lyrics
const SONG_VOICE_ID = 'pFZP5JQG7iQjIQuC4Bku'; // Lily

export default function SlideHook({ slide, hub }: Props) {
  const config = HUB_CONFIGS[hub];
  const content = slide.content?.prompt || slide.title;
  const hasImage = slide.imageUrl && slide.imageUrl.length > 5;
  const { speak, stop: stopTTS, isLoading: ttsLoading, isPlaying: ttsPlaying } = useTextToSpeech();

  // Music generation state
  const [musicLoading, setMusicLoading] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicBlobUrlRef = useRef<string | null>(null);

  // Detect song slides
  const isSong = slide.keywords?.some(k => ['song', 'warm-up', 'music', 'chant'].includes(k))
    || slide.title?.toLowerCase().includes('song')
    || slide.title?.toLowerCase().includes('chant');

  const generateAndPlayMusic = async () => {
    if (musicPlaying && musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current.currentTime = 0;
      setMusicPlaying(false);
      return;
    }

    // If we already have a cached blob, replay it
    if (musicBlobUrlRef.current) {
      const audio = new Audio(musicBlobUrlRef.current);
      musicAudioRef.current = audio;
      audio.onplay = () => setMusicPlaying(true);
      audio.onended = () => setMusicPlaying(false);
      audio.onerror = () => setMusicPlaying(false);
      await audio.play();
      return;
    }

    setMusicLoading(true);
    try {
      // Build a music prompt from the song lyrics/title
      const lyrics = slide.content?.prompt || slide.title || '';
      const musicPrompt = `Children singing a fun, upbeat educational song for young English learners. Happy, playful melody with singing vocals. Lyrics: ${lyrics.substring(0, 300)}`;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/elevenlabs-music`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            prompt: musicPrompt,
            duration: 30,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Music generation failed: ${response.status}`);
      }

      // Reject the 200-with-JSON fallback body (ElevenLabs quota exhausted).
      // Only accept real audio bytes so the player never plays non-ElevenLabs
      // audio dressed as a song.
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('audio/')) {
        const info = await response.json().catch(() => ({}));
        throw new Error((info as any)?.message || 'ElevenLabs music unavailable (quota or config).');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      musicBlobUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      musicAudioRef.current = audio;
      audio.onplay = () => setMusicPlaying(true);
      audio.onended = () => setMusicPlaying(false);
      audio.onerror = () => {
        setMusicPlaying(false);
        console.error("Failed to play music");
      };

      await audio.play();
    } catch (err) {
      console.error("Music generation error:", err);
    } finally {
      setMusicLoading(false);
    }
  };

  const handleReadLyrics = () => {
    if (ttsPlaying) {
      stopTTS();
      return;
    }
    const lyrics = slide.content?.prompt || slide.title || '';
    speak(lyrics, { voiceId: SONG_VOICE_ID, speed: 0.95 });
  };

  return (
    <div className="flex flex-col items-center justify-start gap-6 p-6 md:p-8 w-full text-center">
      <SlideBrandHeader hub={hub} />

      <motion.h1
        className="text-4xl md:text-6xl font-extrabold tracking-tight uppercase"
        style={{ color: config.colorPalette.primary, fontFamily: hub === 'playground' ? "'Quicksand', sans-serif" : undefined }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {slide.title}
      </motion.h1>

      {hasImage && (
        <motion.img
          src={slide.imageUrl}
          alt={slide.title}
          className="w-full max-w-3xl rounded-2xl object-contain"
          style={{ maxHeight: 520 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          loading="lazy"
        />
      )}

      <motion.p
        className="text-2xl md:text-3xl font-medium leading-relaxed max-w-3xl whitespace-pre-line text-slate-800 dark:text-slate-100"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {content}
      </motion.p>

      {/* Song Controls */}
      {isSong && (
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          {/* Generate & Play Music Button */}
          <button
            onClick={generateAndPlayMusic}
            disabled={musicLoading}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            style={{
              background: musicPlaying
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              color: '#ffffff',
              fontFamily: "'Quicksand', sans-serif",
            }}
          >
            {musicLoading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : musicPlaying ? (
              <Square size={24} />
            ) : (
              <Music size={24} />
            )}
            {musicLoading ? 'Generating Song...' : musicPlaying ? 'Stop Music' : '🎵 Play Song with Music'}
          </button>

          {/* Read Lyrics Button */}
          <button
            onClick={handleReadLyrics}
            disabled={ttsLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            style={{
              background: ttsPlaying
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #FF9F1C, #FFBF00)',
              color: '#1a1a2e',
              fontFamily: "'Quicksand', sans-serif",
            }}
          >
            {ttsLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : ttsPlaying ? (
              <Square size={18} />
            ) : (
              <Volume2 size={18} />
            )}
            {ttsLoading ? 'Loading...' : ttsPlaying ? 'Stop' : '📖 Read Lyrics Aloud'}
          </button>

          {musicLoading && (
            <p className="text-xs opacity-50" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              ⏳ Music generation takes ~30 seconds...
            </p>
          )}
        </motion.div>
      )}

      {hub === 'playground' && config.mascot && (
        <PipMascot size={80} animation="wave" />
      )}
    </div>
  );
}
