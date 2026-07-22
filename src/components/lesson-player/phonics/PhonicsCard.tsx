// PhonicsCard router — picks the hub-native skin and renders it.
// All three hub cards share the same `PhonicsCardData` contract but render
// genuinely separate UIs (per user spec: "Fully separate per hub").

import React from 'react';
import type { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import type { PhonicsCardData } from './phonicsCardTypes';
import PlaygroundPhonicsCard from './PlaygroundPhonicsCard';
import AcademyPhonicsCard from './AcademyPhonicsCard';
import SuccessPhonicsCard from './SuccessPhonicsCard';

export interface PhonicsCardProps {
  hub: HubType;
  data: PhonicsCardData;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

export default function PhonicsCard({ hub, data, onCorrect, onIncorrect }: PhonicsCardProps) {
  if (hub === 'academy') return <AcademyPhonicsCard data={data} onCorrect={onCorrect} onIncorrect={onIncorrect} />;
  if (hub === 'professional' || (hub as string) === 'success') return <SuccessPhonicsCard data={data} onCorrect={onCorrect} onIncorrect={onIncorrect} />;
  return <PlaygroundPhonicsCard data={data} onCorrect={onCorrect} onIncorrect={onIncorrect} />;
}
