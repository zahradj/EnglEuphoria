import { describe, expect, it, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import i18n from '@/lib/i18n';
import { SpeakingHeader } from '../components/SpeakingHeader';
import { VoiceControls } from '../components/VoiceControls';
import { SpeakingLevelIndicator } from '../SpeakingLevelIndicator';

// The speaking-practice screens follow the student's chosen language (English stays the default).
describe('speaking practice is translated', () => {
  afterEach(async () => { await i18n.changeLanguage('en'); });

  it('shows English by default', () => {
    render(<SpeakingHeader />);
    expect(screen.getByText('Real-time Feedback')).toBeTruthy();
  });

  it('switches the header to Spanish', async () => {
    await i18n.changeLanguage('es');
    render(<SpeakingHeader />);
    expect(screen.getByText('Comentarios al instante')).toBeTruthy();
    expect(screen.queryByText('Real-time Feedback')).toBeNull();
  });

  it('switches the voice buttons to Arabic', async () => {
    await i18n.changeLanguage('ar');
    render(<VoiceControls recordingState={{ isRecording: false, isProcessing: false } as never} onVoiceInput={() => {}} onEndSession={() => {}} />);
    expect(screen.getByText('اضغط مطوّلًا للتحدّث')).toBeTruthy();
    expect(screen.getByText('إنهاء الجلسة')).toBeTruthy();
  });

  it('fills the level and XP placeholders in French', async () => {
    await i18n.changeLanguage('fr');
    render(<SpeakingLevelIndicator currentLevel="A1" speakingXP={100} />);
    expect(screen.getByText('Niveau CECR A1')).toBeTruthy();
    expect(screen.getByText('400 XP pour atteindre A2')).toBeTruthy();
  });
});
