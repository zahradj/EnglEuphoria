// OverrideControls — three primary teacher actions broadcast over the channel.
import { Gift, LifeBuoy, SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';

export interface OverrideControlsProps {
  onTriggerReward: () => void;
  onTriggerFallback: () => void;
  onForceNextBlock: () => void;
  disabled?: boolean;
}

const baseBtn =
  'w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold ring-1 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed';

export function OverrideControls({
  onTriggerReward,
  onTriggerFallback,
  onForceNextBlock,
  disabled,
}: OverrideControlsProps) {
  return (
    <div className="space-y-2">
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        disabled={disabled}
        onClick={onTriggerReward}
        className={`${baseBtn} bg-amber-50 ring-amber-300 text-amber-900 hover:bg-amber-100`}
      >
        <Gift className="h-5 w-5" />
        <span className="flex-1">🎉 Trigger Reward</span>
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        disabled={disabled}
        onClick={onTriggerFallback}
        className={`${baseBtn} bg-sky-50 ring-sky-300 text-sky-900 hover:bg-sky-100`}
      >
        <LifeBuoy className="h-5 w-5" />
        <span className="flex-1">🛟 Trigger Fallback</span>
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        disabled={disabled}
        onClick={onForceNextBlock}
        className={`${baseBtn} bg-violet-50 ring-violet-300 text-violet-900 hover:bg-violet-100`}
      >
        <SkipForward className="h-5 w-5" />
        <span className="flex-1">⏭️ Force Next Block</span>
      </motion.button>
    </div>
  );
}

export default OverrideControls;
