import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { saveStudentCompanion } from '@/services/companionService';
import {
  Companion,
  CompanionHub,
  getCompanionsForHub,
} from '@/constants/companions';
import { toast } from 'sonner';

export interface CompanionSelectorProps {
  hub: CompanionHub | string;
  onComplete: (companion: Companion) => void;
  onBack?: () => void;
}

export const CompanionSelector: React.FC<CompanionSelectorProps> = ({
  hub,
  onComplete,
  onBack,
}) => {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Companion | null>(null);
  const [saving, setSaving] = useState(false);

  const companions = getCompanionsForHub(hub as CompanionHub);
  const isPlayground = hub === 'playground';

  const accent = isPlayground
    ? { ring: 'ring-orange-400', bg: 'bg-orange-50', text: 'text-orange-700', btn: 'bg-orange-500 hover:bg-orange-600' }
    : { ring: 'ring-purple-400', bg: 'bg-purple-50', text: 'text-purple-700', btn: 'bg-purple-600 hover:bg-purple-700' };

  const handleConfirm = async () => {
    const chosen = companions.find((c) => c.id === selectedId);
    if (!chosen || !user?.id) return;
    setSaving(true);
    try {
      await saveStudentCompanion(user.id, chosen.id);
      setConfirmed(chosen);
      setTimeout(() => onComplete(chosen), 1400);
    } catch (e) {
      console.error(e);
      toast.error('Could not save your companion. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (companions.length === 0) {
    // Hub has no companions defined — skip silently.
    return (
      <div className="text-center py-12">
        <Button onClick={() => onComplete({ id: '', name: '', hub: 'academy', description: '', avatar_url: '' })}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${accent.bg} ${accent.text} text-xs font-semibold uppercase tracking-wide mb-3`}>
          <Sparkles className="w-3.5 h-3.5" /> Choose Your Companion
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Pick your learning buddy</h2>
        <p className="text-slate-600 mt-2">
          Your companion will cheer you on through every lesson.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {companions.map((c) => {
          const isSelected = selectedId === c.id;
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative text-left rounded-2xl border-2 bg-white p-5 transition-all ${
                isSelected
                  ? `${accent.ring} ring-4 border-transparent shadow-xl`
                  : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              {isSelected && (
                <span className={`absolute top-3 right-3 inline-flex items-center justify-center w-6 h-6 rounded-full ${accent.btn} text-white shadow`}>
                  <Check className="w-4 h-4" />
                </span>
              )}
              <div className={`w-full aspect-square rounded-xl ${accent.bg} flex items-center justify-center overflow-hidden mb-3`}>
                <img
                  src={c.avatar_url}
                  alt={c.name}
                  className="w-3/4 h-3/4 object-contain transition-transform group-hover:scale-110"
                />
              </div>
              <div className="font-bold text-slate-900">{c.name}</div>
              <div className="text-xs text-slate-600 mt-1 leading-relaxed">{c.description}</div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        {onBack ? (
          <Button variant="ghost" onClick={onBack} disabled={saving}>
            Back
          </Button>
        ) : <span />}
        <Button
          onClick={handleConfirm}
          disabled={!selectedId || saving}
          className={`${accent.btn} text-white px-8`}
        >
          {saving ? 'Saving…' : 'Select companion'}
        </Button>
      </div>

      <AnimatePresence>
        {confirmed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4"
            >
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 6, -6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-28 h-28 mx-auto rounded-full ${accent.bg} flex items-center justify-center mb-4`}
              >
                <img src={confirmed.avatar_url} alt={confirmed.name} className="w-20 h-20 object-contain" />
              </motion.div>
              <h3 className="text-2xl font-bold text-slate-900">Welcome, {confirmed.name}!</h3>
              <p className="text-slate-600 mt-2 text-sm">Your companion is ready to learn with you.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanionSelector;
