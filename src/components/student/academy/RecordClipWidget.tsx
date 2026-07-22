import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfidenceScore {
  pronunciation: number;
  fluency: number;
  grammar: number;
  overall: number;
}

type RecordState = 'idle' | 'recording' | 'analyzing' | 'result';

interface RecordClipWidgetProps {
  isDarkMode?: boolean;
}

const ENCOURAGING_MESSAGES: Record<string, string> = {
  great: "🔥 Incredible! Your speaking skills are on fire!",
  good: "✨ Great job! Keep pushing — you're making real progress.",
  improve: "💪 Nice try! Practice makes perfect. Give it another shot!",
};

const ScoreRow: React.FC<{ label: string; value: number; color: string; delay: number }> = ({
  label, value, color, delay
}) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs font-medium">
      <span className="text-gray-300">{label}</span>
      <span style={{ color }}>{value}%</span>
    </div>
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, delay, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
);

// Animated SVG ring
const ConfidenceRing: React.FC<{ score: number }> = ({ score }) => {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#FBBF24' : '#EF4444';
  const label = score >= 80 ? 'Great' : score >= 60 ? 'Good' : 'Keep Going';

  return (
    <div className="flex flex-col items-center">
      <svg width={112} height={112} className="-rotate-90">
        <circle cx={56} cy={56} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} />
        <motion.circle
          cx={56}
          cy={56}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="flex flex-col items-center -mt-16 mb-6 pointer-events-none">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="text-3xl font-bold"
          style={{ color }}
        >
          {score}%
        </motion.span>
        <span className="text-xs font-medium mt-0.5" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  );
};

export const RecordClipWidget: React.FC<RecordClipWidgetProps> = ({ isDarkMode = true }) => {
  const [state, setState] = useState<RecordState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [scores, setScores] = useState<ConfidenceScore | null>(null);
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(18).fill(4));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const MAX_SECONDS = 30;

  // Randomise waveform while recording
  useEffect(() => {
    if (state === 'recording') {
      waveRef.current = setInterval(() => {
        setWaveHeights(Array.from({ length: 18 }, () => Math.random() * 28 + 4));
      }, 120);
    } else {
      setWaveHeights(Array(18).fill(4));
      if (waveRef.current) clearInterval(waveRef.current);
    }
    return () => { if (waveRef.current) clearInterval(waveRef.current); };
  }, [state]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.start();
      setState('recording');
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s + 1 >= MAX_SECONDS) {
            stopRecording();
            return MAX_SECONDS;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      // Microphone not available — still demo the widget
      setState('recording');
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s + 1 >= MAX_SECONDS) { stopRecording(); return MAX_SECONDS; }
          return s + 1;
        });
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop());
    setState('analyzing');

    // Simulate AI analysis delay
    setTimeout(() => {
      const pronunciation = Math.floor(Math.random() * 25 + 68); // 68–93
      const fluency = Math.floor(Math.random() * 30 + 60);       // 60–90
      const grammar = Math.floor(Math.random() * 20 + 72);        // 72–92
      const overall = Math.round((pronunciation + fluency + grammar) / 3);
      setScores({ pronunciation, fluency, grammar, overall });
      setState('result');
    }, 2000);
  };

  const reset = () => {
    setState('idle');
    setScores(null);
    setSeconds(0);
  };

  const messageKey = scores
    ? scores.overall >= 80 ? 'great' : scores.overall >= 60 ? 'good' : 'improve'
    : 'good';

  return (
    <div className={`rounded-2xl border p-5 ${
      isDarkMode
        ? 'bg-[#1a1a2e] border-purple-500/30 shadow-[0_0_24px_rgba(168,85,247,0.15)]'
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            🎙️ Record a Clip
          </h3>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Speak for up to 30 s — get your AI score instantly
          </p>
        </div>
        {state === 'result' && (
          <button onClick={reset} className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">

        {/* IDLE */}
        {state === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-4"
          >
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={startRecording}
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
            >
              <Mic className="w-8 h-8 text-white" />
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-purple-400 opacity-50"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Tap to start recording
            </p>
          </motion.div>
        )}

        {/* RECORDING */}
        {state === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-2"
          >
            {/* Waveform */}
            <div className="flex items-end gap-0.5 h-10">
              {waveHeights.map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: h }}
                  transition={{ duration: 0.12 }}
                  className="w-1.5 rounded-full bg-gradient-to-t from-purple-500 to-cyan-400"
                  style={{ height: h }}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-lg font-mono font-bold text-red-400">
              {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')} / 0:30
            </div>

            {/* Stop button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={stopRecording}
              className="relative w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/40"
            >
              <MicOff className="w-7 h-7 text-white" />
              <motion.span
                className="absolute inset-0 rounded-full bg-red-400 opacity-30"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.button>
            <p className="text-xs text-red-400">Recording… tap to stop</p>
          </motion.div>
        )}

        {/* ANALYZING */}
        {state === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-6"
          >
            <motion.div
              className="w-12 h-12 rounded-full border-4 border-t-cyan-400 border-purple-600/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              🤖 AI is analysing your clip…
            </p>
          </motion.div>
        )}

        {/* RESULT */}
        {state === 'result' && scores && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Ring */}
            <div className="flex flex-col items-center">
              <ConfidenceRing score={scores.overall} />
              <p className="text-xs text-center font-medium text-gray-300 -mt-2">
                Overall Confidence
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5 bg-white/5 rounded-xl p-4">
              <ScoreRow label="Pronunciation" value={scores.pronunciation} color="#A855F7" delay={0.1} />
              <ScoreRow label="Fluency"       value={scores.fluency}       color="#22D3EE" delay={0.2} />
              <ScoreRow label="Grammar"       value={scores.grammar}       color="#FBBF24" delay={0.3} />
            </div>

            {/* Feedback */}
            <div className={`text-sm text-center px-3 py-2 rounded-lg ${
              isDarkMode ? 'bg-purple-600/20 text-purple-200' : 'bg-purple-50 text-purple-700'
            }`}>
              {ENCOURAGING_MESSAGES[messageKey]}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={reset}
                variant="outline"
                size="sm"
                className="flex-1 border-purple-500/40 text-purple-300 hover:bg-purple-600/20"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Try Again
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Save Score
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
