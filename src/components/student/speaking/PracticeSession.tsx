
import React, { useState, useEffect, useRef } from 'react';
import { SpeakingScenario, ConversationMessage, MessageFeedback } from '@/types/speaking';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { speakingPracticeService } from '@/services/speakingPracticeService';
import { supabase } from '@/integrations/supabase/client';
const isSupabaseConfigured = () => true; // Always configured in Engleuphoria deployments
import { useToast } from '@/hooks/use-toast';
import { SessionHeader } from './components/SessionHeader';
import { AIAvatar } from './components/AIAvatar';
import { ChatMessages } from './components/ChatMessages';
import { VoiceControls } from './components/VoiceControls';
import { SessionSetup } from './components/SessionSetup';

interface PracticeSessionProps {
  scenario: SpeakingScenario;
  onComplete: (sessionData: any) => void;
  onBack: () => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  scenario,
  onComplete,
  onBack
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [aiAvatar, setAiAvatar] = useState<string>('😊');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const { recordingState, startRecording, stopRecording, processAudio, reset } = useSpeechRecognition();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setIsDemoMode(!isSupabaseConfigured());
  }, []);

  useEffect(() => {
    if (isSessionActive && sessionStartTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive, sessionStartTime]);

  // Process audio queue
  useEffect(() => {
    if (audioQueue.length > 0 && !isPlayingAudio && isAudioEnabled) {
      playNextAudio();
    }
  }, [audioQueue, isPlayingAudio, isAudioEnabled]);

  const playNextAudio = async () => {
    if (audioQueue.length === 0 || !isAudioEnabled) return;

    setIsPlayingAudio(true);
    setIsAiSpeaking(true);
    
    const audioContent = audioQueue[0];
    setAudioQueue(prev => prev.slice(1));

    try {
      const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], {
        type: 'audio/mpeg'
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsPlayingAudio(false);
          setIsAiSpeaking(false);
        };
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlayingAudio(false);
      setIsAiSpeaking(false);
    }
  };

  const startSession = async () => {
    setIsSessionActive(true);
    setSessionStartTime(new Date());
    setAiAvatar('👋');
    
    // Add initial AI message
    const welcomeMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: scenario.prompt,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);

    // Generate TTS for welcome message if audio is enabled and not in demo mode
    if (isAudioEnabled && !isDemoMode) {
      try {
        const { data } = await supabase.functions.invoke('text-to-speech', {
          body: { text: scenario.prompt }
        });
        
        if (data?.audioContent) {
          setAudioQueue([data.audioContent]);
        }
      } catch (error) {
        console.error('Error generating welcome TTS:', error);
      }
    }
    
    setTimeout(() => setAiAvatar('😊'), 3000);
  };

  const handleVoiceInput = async () => {
    if (recordingState.isRecording) {
      try {
        stopRecording();
        
        // Wait for the audio blob to be available
        setTimeout(async () => {
          if (recordingState.audioBlob) {
            const transcript = await processAudio(recordingState.audioBlob);
            if (transcript.trim()) {
              await handleUserMessage(transcript);
            }
          }
        }, 500);
      } catch (error) {
        console.error('Error processing voice input:', error);
        toast({
          title: "Recording Error",
          description: "Failed to process your recording. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      try {
        await startRecording();
      } catch (error) {
        console.error('Error starting recording:', error);
        toast({
          title: "Microphone Error",
          description: "Could not access microphone. Please check permissions.",
          variant: "destructive"
        });
      }
    }
  };

  const handleUserMessage = async (text: string) => {
    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      let aiResponse = "That's great! Keep practicing and you'll improve your English speaking skills.";
      let feedback: MessageFeedback = {
        rating: 4,
        encouragement: "Good effort! Keep practicing!",
        grammar_suggestions: ["Try using more descriptive words"],
        alternative_phrases: ["You could also say..."]
      };

      // Try to get AI response and feedback if not in demo mode
      if (!isDemoMode) {
        try {
          // Generate AI response
          const { data: aiData } = await supabase.functions.invoke('ai-conversation', {
            body: { 
              userMessage: text, 
              scenario,
              conversationHistory: messages 
            }
          });

          if (aiData?.response) {
            aiResponse = aiData.response;
          }

          // Generate feedback for user message
          const { data: feedbackData } = await supabase.functions.invoke('ai-core', {
            body: { action: 'speaking_feedback', text, scenario }
          });

          if (feedbackData?.feedback) {
            feedback = feedbackData.feedback;
          }
        } catch (error) {
          console.error('Error getting AI response:', error);
          // Continue with default response in case of error
        }
      }

      // Update user message with feedback
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, feedback }
          : msg
      ));

      // Add AI response
      const aiMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Generate TTS for AI response if enabled and not in demo mode
      if (isAudioEnabled && !isDemoMode) {
        try {
          const { data: ttsData } = await supabase.functions.invoke('text-to-speech', {
            body: { text: aiResponse }
          });
          
          if (ttsData?.audioContent) {
            setAudioQueue(prev => [...prev, ttsData.audioContent]);
          }
        } catch (error) {
          console.error('Error generating TTS:', error);
        }
      }

      setAiAvatar(getRandomAiAvatar());
    } catch (error) {
      console.error('Error handling user message:', error);
      toast({
        title: "AI Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getRandomAiAvatar = () => {
    const avatars = ['😊', '🤖', '👨‍🏫', '👩‍🏫', '😄', '🙂', '😌'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  };

  const endSession = async () => {
    if (!sessionStartTime) return;

    const duration = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
    const xpEarned = Math.max(10, Math.floor(duration / 30) * 5);

    const sessionData = {
      session_type: scenario.type,
      scenario_name: scenario.name,
      cefr_level: scenario.cefr_level,
      duration_seconds: duration,
      xp_earned: xpEarned,
      overall_rating: 4
    };

    try {
      await speakingPracticeService.createSession(sessionData);
      onComplete(sessionData);
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Session completed!",
        description: `Great job practicing! You earned ${xpEarned} XP.`
      });
      onComplete(sessionData);
    }
  };

  if (!isSessionActive) {
    return (
      <SessionSetup
        scenario={scenario}
        isAudioEnabled={isAudioEnabled}
        onBack={onBack}
        onStartSession={startSession}
        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-6">
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      {isDemoMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-yellow-800 text-sm">
            Demo mode: AI responses and audio features are limited. Your progress is saved locally.
          </p>
        </div>
      )}
      
      <SessionHeader
        scenario={scenario}
        elapsedTime={elapsedTime}
        isAudioEnabled={isAudioEnabled}
        onEndSession={endSession}
        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <AIAvatar avatar={aiAvatar} isAiSpeaking={isAiSpeaking} />
        
        <div className="lg:col-span-3 space-y-4">
          <ChatMessages messages={messages} />
          <VoiceControls
            recordingState={recordingState}
            onVoiceInput={handleVoiceInput}
            onEndSession={endSession}
          />
        </div>
      </div>
    </div>
  );
};
