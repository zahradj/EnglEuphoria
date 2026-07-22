
export interface VoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  audioBlob?: Blob;
  transcript?: string;
}

export interface MediaRecorderConfig {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface SpeechRecognitionHook {
  recordingState: VoiceRecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  processAudio: (audioBlob: Blob) => Promise<string>;
  reset: () => void;
}
