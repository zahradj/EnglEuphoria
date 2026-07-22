import { motion } from 'framer-motion';
import { Headphones, BookOpen, PenLine, Mic, Check } from 'lucide-react';

const STAGES = [
  { key: 'listening', label: 'Listening', Icon: Headphones },
  { key: 'reading',   label: 'Reading',   Icon: BookOpen },
  { key: 'writing',   label: 'Writing',   Icon: PenLine },
  { key: 'speaking',  label: 'Speaking',  Icon: Mic },
] as const;

export type StageKey = typeof STAGES[number]['key'];

interface Props {
  current: StageKey;
}

const ComprehensiveProgressBar: React.FC<Props> = ({ current }) => {
  const currentIdx = STAGES.findIndex(s => s.key === current);
  return (
    <div className="px-4 sm:px-6 pt-4 pb-3">
      <div className="flex items-center justify-between gap-2">
        {STAGES.map((s, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          const { Icon } = s;
          return (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  initial={false}
                  animate={{ scale: active ? 1.1 : 1 }}
                  className={[
                    'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors',
                    done   ? 'bg-emerald-500/90 border-emerald-300 text-white' :
                    active ? 'bg-white text-slate-900 border-white shadow-lg' :
                             'bg-white/10 border-white/20 text-white/60',
                  ].join(' ')}
                >
                  {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </motion.div>
                <span className={[
                  'text-[10px] sm:text-[11px] font-semibold tracking-wide',
                  active ? 'text-white' : 'text-white/60',
                ].join(' ')}>{s.label}</span>
              </div>
              {idx < STAGES.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-white/15 rounded-full overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: idx < currentIdx ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComprehensiveProgressBar;
