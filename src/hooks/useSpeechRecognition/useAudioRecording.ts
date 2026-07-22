
import { useState, useRef, useCallback } from 'react';
import { VoiceRecordingState } from './types';
import { getMediaRecorderConfig, getSupportedMimeType } from './audioUtils';

export const useAudioRecording = () => {
  const [recordingState, setRecordingState] = useState<VoiceRecordingState>({
    isRecording: false,
    isProcessing: false
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const config = getMediaRecorderConfig();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: config
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: getSupportedMimeType()
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordingState(prev => ({
          ...prev,
          isRecording: false,
          audioBlob
        }));
      };

      mediaRecorder.start(1000); // Capture data every second
      setRecordingState(prev => ({ ...prev, isRecording: true }));
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingState(prev => ({ ...prev, isRecording: false }));
      throw error;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [recordingState.isRecording]);

  const updateRecordingState = useCallback((updates: Partial<VoiceRecordingState>) => {
    setRecordingState(prev => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setRecordingState({
      isRecording: false,
      isProcessing: false
    });
  }, []);

  return {
    recordingState,
    startRecording,
    stopRecording,
    updateRecordingState,
    reset
  };
};
