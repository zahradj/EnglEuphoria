
import React from 'react';
import { Button } from '@/components/ui/button';
import { VoiceRecordingState } from '@/types/speaking';
import { Mic, MicOff } from 'lucide-react';

interface VoiceControlsProps {
  recordingState: VoiceRecordingState;
  onVoiceInput: () => void;
  onEndSession: () => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  recordingState,
  onVoiceInput,
  onEndSession
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onVoiceInput}
          disabled={recordingState.isProcessing}
          className={`${
            recordingState.isRecording
              ? 'bg-red-100 hover:bg-red-200 text-red-700 border-red-300'
              : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300'
          }`}
        >
          {recordingState.isRecording ? (
            <>
              <MicOff className="h-5 w-5 mr-2" />
              Stop Recording
            </>
          ) : recordingState.isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Mic className="h-5 w-5 mr-2" />
              Hold to Speak
            </>
          )}
        </Button>

        <Button variant="outline" onClick={onEndSession}>
          Finish Session
        </Button>
      </div>

      {recordingState.isRecording && (
        <div className="text-center">
          <div className="flex justify-center items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-600 font-medium">Recording... Speak clearly!</span>
          </div>
        </div>
      )}
    </div>
  );
};
