
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface MicrophoneTestCardProps {
  microphoneStatus: 'unknown' | 'working' | 'error';
  audioLevel: number;
  isMuted: boolean;
}

export const MicrophoneTestCard = ({
  microphoneStatus,
  audioLevel,
  isMuted
}: MicrophoneTestCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Microphone Test
          {microphoneStatus === 'working' && <CheckCircle className="h-4 w-4 text-green-500" />}
          {microphoneStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
          {microphoneStatus === 'unknown' && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Audio Level:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-150 ${
                  audioLevel > 50 ? 'bg-green-500' : 
                  audioLevel > 20 ? 'bg-yellow-500' : 'bg-gray-400'
                }`}
                style={{ width: `${Math.min(audioLevel, 100)}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 w-12">
              {Math.round(audioLevel)}%
            </span>
          </div>
          
          {microphoneStatus === 'working' && !isMuted && audioLevel > 5 && (
            <p className="text-sm text-green-600">
              ✓ Microphone is working! Audio detected.
            </p>
          )}

          {microphoneStatus === 'working' && !isMuted && audioLevel <= 5 && (
            <p className="text-sm text-orange-600">
              Microphone connected but no audio detected. Try speaking louder.
            </p>
          )}
          
          {isMuted && (
            <p className="text-sm text-orange-600">
              Microphone is muted - unmute to test audio levels
            </p>
          )}

          {microphoneStatus === 'error' && (
            <p className="text-sm text-red-600">
              Microphone not working. Check permissions and try again.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
