import React from 'react';
import { motion } from 'framer-motion';
import { GeneratedSlide, HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import { HUB_CONFIGS } from '@/components/admin/lesson-builder/ai-wizard/hubConfig';

interface Props {
  slide: GeneratedSlide;
  hub: HubType;
}

export default function SlideConcept({ slide, hub }: Props) {
  const config = HUB_CONFIGS[hub];
  const prompt = slide.content?.prompt || slide.teacherNotes || '';
  const hasImage = slide.imageUrl && slide.imageUrl.length > 5;

  return (
    <div className="flex flex-col items-center gap-6 p-10 w-full max-w-3xl mx-auto">
      <motion.h2
        className="text-3xl font-bold text-center"
        style={{ color: config.colorPalette.primary }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {slide.title}
      </motion.h2>

      {hasImage && (
        <img src={slide.imageUrl} alt={slide.title} className="w-full max-w-lg rounded-xl object-cover" style={{ maxHeight: 260 }} />
      )}

      <motion.div
        className="w-full p-6 rounded-xl text-lg leading-relaxed whitespace-pre-line"
        style={{
          background: config.colorPalette.highlight,
          color: config.colorPalette.text,
          border: hub === 'academy' ? '1px solid #4338ca' : '1px solid #e2e8f0',
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {prompt}
      </motion.div>

      {slide.content?.sentence && (
        <div className="text-base italic opacity-70" style={{ color: config.colorPalette.text }}>
          Example: "{slide.content.sentence}"
        </div>
      )}
    </div>
  );
}
