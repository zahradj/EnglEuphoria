import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  ArrowLeft,
  MessageCircle,
  Bot,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { speakingPracticeService } from '@/services/speakingPracticeService';
import { LiveAIMessage, AIConversationSession, SpeakingScenario } from '@/types/speaking';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';

interface LiveAIConversationProps {
  scenario?: SpeakingScenario;
  onBack: () => void;
  onComplete?: (sessionData: any) => void;
}

export const LiveAIConversation: React.FC<LiveAIConversationProps> = ({
  scenario,
  onBack,
  onComplete
}) => {
  const [messages, setMessages] = useState<LiveAIMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<AIConversationSession | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    isRecording,
    isProcessing,
    transcript,
    startRecording,
    stopRecording,
    error: voiceError
  } = useVoiceRecording();

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setCurrentMessage(transcript);
    }
  }, [transcript]);

  const initializeSession = async () => {
    try {
      const newSession = await speakingPracticeService.createAIConversationSession({
        session_type: 'live_chat',
        scenario_id: scenario?.id,
        conversation_topic: scenario?.name || 'General Conversation',
        ai_personality: 'friendly_tutor',
        voice_enabled: voiceEnabled
      });
      
      setSession(newSession);
      
      // Add welcome message
      const welcomeMessage: LiveAIMessage = {
        id: '1',
        role: 'assistant',
        content: scenario 
          ? `Hello! I'm your AI tutor. Let's practice "${scenario.name}". ${scenario.context_instructions || ''}`
          : "Hello! I'm your AI tutor. What would you like to practice speaking about today?",
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
      setSessionStarted(true);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      toast({
        title: "Error",
        description: "Failed to start AI conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || !session) return;

    const userMessage: LiveAIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // TODO: Call edge function for AI response
      const aiResponse = await getAIResponse(messageContent, messages, scenario);
      
      const assistantMessage: LiveAIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        feedback: aiResponse.feedback
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update session
      await speakingPracticeService.updateAIConversationSession(session.id, {
        messages_count: messages.length + 2,
        session_duration: Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock AI response - replace with actual edge function call
  const getAIResponse = async (userMessage: string, conversationHistory: LiveAIMessage[], scenario?: SpeakingScenario) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      content: "Thank you for sharing! Can you tell me more about that? I'd love to hear your thoughts on this topic.",
      feedback: {
        rating: 4,
        encouragement: "Great job! Your grammar is improving.",
        grammar_suggestions: [],
        alternative_phrases: []
      }
    };
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleEndSession = async () => {
    if (!session) return;

    try {
      const sessionDuration = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
      
      await speakingPracticeService.updateAIConversationSession(session.id, {
        ended_at: new Date().toISOString(),
        session_duration: sessionDuration,
        messages_count: messages.length
      });

      // Create assessment based on conversation
      if (messages.length > 2) {
        await speakingPracticeService.createSpeakingAssessment({
          session_id: session.id,
          fluency_score: 0.8,
          grammar_score: 0.7,
          vocabulary_score: 0.75,
          coherence_score: 0.8,
          overall_cefr_estimate: 'B1',
          improvement_areas: ['pronunciation', 'vocabulary expansion'],
          strengths: ['fluency', 'confidence'],
          ai_generated_feedback: 'Great conversation! Focus on expanding your vocabulary and work on pronunciation.'
        });
      }

      if (onComplete) {
        onComplete({
          session_id: session.id,
          duration_seconds: sessionDuration,
          messages_count: messages.length,
          xp_earned: Math.min(messages.length * 5, 100)
        });
      }

      onBack();
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "Error",
        description: "Failed to save session. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {scenario && (
            <Badge variant="outline" className="bg-primary/10">
              {scenario.cefr_level} Level
            </Badge>
          )}
        </div>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleEndSession}
          disabled={!sessionStarted}
        >
          End Session
        </Button>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span>Live AI Conversation</span>
            {scenario && <span className="text-sm font-normal">- {scenario.name}</span>}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' ? (
                        <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                      ) : (
                        <User className="h-4 w-4 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{message.content}</p>
                        {message.feedback && (
                          <div className="mt-2 pt-2 border-t border-muted-foreground/20">
                            <p className="text-xs text-muted-foreground">
                              {message.feedback.encouragement}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-2 pt-4 border-t">
            <div className="flex-1 flex items-center space-x-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message or use voice..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(currentMessage)}
                disabled={isLoading}
              />
              
              <Button
                size="icon"
                variant={isRecording ? "destructive" : "outline"}
                onClick={handleVoiceToggle}
                disabled={isLoading || isProcessing}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Button
                size="icon"
                variant="outline"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
            
            <Button 
              onClick={() => sendMessage(currentMessage)}
              disabled={!currentMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {isProcessing && (
            <div className="text-sm text-muted-foreground text-center">
              Processing voice input...
            </div>
          )}
          
          {voiceError && (
            <div className="text-sm text-destructive text-center">
              Voice error: {voiceError}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};