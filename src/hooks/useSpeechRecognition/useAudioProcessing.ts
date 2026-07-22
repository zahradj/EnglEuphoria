
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { convertBlobToBase64 } from './audioUtils';
import { VoiceRecordingState } from './types';

export const useAudioProcessing = (
  updateRecordingState: (updates: Partial<VoiceRecordingState>) => void
) => {
  const processAudio = useCallback(async (audioBlob: Blob): Promise<string> => {
    updateRecordingState({ isProcessing: true });

    try {
      
      const base64Audio = await convertBlobToBase64(audioBlob);


      // Call Supabase edge function for speech-to-text
      const { data, error } = await supabase.functions.invoke('speech-to-text', {
        body: { audio: base64Audio }
      });

      if (error) {
        console.error('Speech-to-text error:', error);
        throw error;
      }

      const transcript = data.text || '';
      
      updateRecordingState({
        isProcessing: false,
        transcript
      });

      return transcript;
    } catch (error) {
      console.error('Error processing audio:', error);
      updateRecordingState({ isProcessing: false });
      throw error;
    }
  }, [updateRecordingState]);

  return { processAudio };
};
