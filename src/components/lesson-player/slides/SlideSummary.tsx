import React from 'react';
import { motion } from 'framer-motion';
import { GeneratedSlide, HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import { HUB_CONFIGS } from '@/components/admin/lesson-builder/ai-wizard/hubConfig';
import PipMascot from '../PipMascot';

interface Props {
  slide: GeneratedSlide;
  hub: HubType;
}

export default function SlideSummary({ slide, hub }: Props) {
  const config = HUB_CONFIGS[hub];

  return (
    <div className="flex flex-col items-center gap-6 p-8 w-full text-center">
      <motion.h2
        className="text-3xl font-bold"
        style={{ color: config.colorPalette.primary }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {hub === 'playground' ? '🌟 ' : hub === 'academy' ? '🏆 ' : ''}
        {slide.title}
      </motion.h2>

      {slide.content?.prompt && (
        <p className="text-lg" style={{ color: config.colorPalette.text }}>
          {slide.content.prompt}
        </p>
      )}

      {slide.keywords?.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center mt-2">
          {slide.keywords.map((kw, i) => (
            <motion.span
              key={kw}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="px-4 py-2 rounded-full text-sm font-bold"
              style={{ background: config.colorPalette.primary, color: '#fff' }}
            >
              {kw}
            </motion.span>
          ))}
        </div>
      )}

      {hub === 'playground' && <PipMascot size={80} animation="celebrate" />}
    </div>
  );
}
