import { useState, useRef, useCallback } from 'react';

export interface UseVoiceRecordingReturn {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string | null;
  audioBlob: Blob | null;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
}

export const useVoiceRecording = (): UseVoiceRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript(null);
      setAudioBlob(null);
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Voice recording is not supported in this browser');
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Process the audio for transcription
        await processAudio(audioBlob);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed. Please try again.');
        setIsRecording(false);
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Mock transcription - replace with actual speech-to-text API
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
      
      // Mock transcript based on audio duration
      const mockTranscripts = [
        "Hello, I would like to practice speaking English.",
        "Can you help me improve my pronunciation?",
        "I'm working on my fluency and confidence.",
        "Thank you for the conversation practice.",
        "This is a great way to learn English."
      ];
      
      const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
      setTranscript(randomTranscript);
      
    } catch (err) {
      console.error('Transcription failed:', err);
      setError('Failed to transcribe audio. Please try typing your message.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetRecording = useCallback(() => {
    setIsRecording(false);
    setIsProcessing(false);
    setTranscript(null);
    setAudioBlob(null);
    setError(null);
    audioChunksRef.current = [];
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
  }, []);

  return {
    isRecording,
    isProcessing,
    transcript,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    resetRecording
  };
};