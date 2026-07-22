
import { useAudioRecording } from './useAudioRecording';
import { useAudioProcessing } from './useAudioProcessing';
import { SpeechRecognitionHook } from './types';

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const {
    recordingState,
    startRecording,
    stopRecording,
    updateRecordingState,
    reset
  } = useAudioRecording();

  const { processAudio } = useAudioProcessing(updateRecordingState);

  return {
    recordingState,
    startRecording,
    stopRecording,
    processAudio,
    reset
  };
};

// Export types for external use
export type { VoiceRecordingState, SpeechRecognitionHook } from './types';
