
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpeakingScenario } from '@/types/speaking';
import { ArrowLeft, MessageCircle, Play, Volume2, VolumeX } from 'lucide-react';

interface SessionSetupProps {
  scenario: SpeakingScenario;
  isAudioEnabled: boolean;
  onBack: () => void;
  onStartSession: () => void;
  onToggleAudio: () => void;
}

export const SessionSetup: React.FC<SessionSetupProps> = ({
  scenario,
  isAudioEnabled,
  onBack,
  onStartSession,
  onToggleAudio
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Badge variant="outline">{scenario.cefr_level}</Badge>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{scenario.name}</CardTitle>
          <p className="text-gray-600">{scenario.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">📝 What you'll practice:</h4>
            <p className="text-gray-700">{scenario.context_instructions}</p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>⏱️ Expected time: {Math.floor(scenario.expected_duration / 60)} minutes</span>
            <span>🎯 Difficulty: {scenario.difficulty_rating}/5</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🔊 Voice responses:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleAudio}
              >
                {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {isAudioEnabled ? 'On' : 'Off'}
              </Button>
            </div>
          </div>

          <Button 
            onClick={onStartSession}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            size="lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Practice Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
