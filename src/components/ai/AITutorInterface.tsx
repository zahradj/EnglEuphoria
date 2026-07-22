import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Brain, LogOut } from 'lucide-react';
import { useAITutor } from '@/hooks/useAITutor';
import ReactMarkdown from 'react-markdown';

interface AITutorInterfaceProps {
  studentId: string;
  cefrLevel: string;
  onSessionComplete?: () => void;
}

export const AITutorInterface: React.FC<AITutorInterfaceProps> = ({
  studentId, cefrLevel, onSessionComplete
}) => {
  const [message, setMessage] = useState('');
  const [hasContext, setHasContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentSession, messages, streamingContent, isConnected, isProcessing, startSession, sendMessage, endSession } = useAITutor();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleStart = () => startSession(studentId, cefrLevel);
  const handleSend = async () => {
    if (message.trim()) {
      const msg = message;
      setMessage('');
      try {
        const result = await sendMessage(msg);
        if (result?.hasContext) setHasContext(true);
      } catch {}
    }
  };
  const handleEnd = async () => {
    await endSession();
    onSessionComplete?.();
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Tutor Chat
          </div>
          <div className="flex items-center gap-2">
            {hasContext && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Brain className="h-3 w-3" />
                Context-Aware
              </Badge>
            )}
            {isConnected && (
              <Button size="sm" variant="ghost" onClick={handleEnd}>
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {!isConnected ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Brain className="h-12 w-12 text-primary/50" />
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Your AI tutor learns from your skills, lessons, and homework to personalize every session.
            </p>
            <Button onClick={handleStart}>Start AI Tutoring Session</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
              {messages.map((msg) => (
                <div key={msg.id} className={`p-3 rounded-lg ${
                  msg.message_type.includes('user')
                    ? 'bg-primary text-primary-foreground ml-8'
                    : 'bg-muted mr-8'
                }`}>
                  {msg.message_type.includes('user') ? (
                    <span>{msg.content}</span>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                      <ReactMarkdown>{msg.content || ''}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
              {streamingContent && (
                <div className="bg-muted mr-8 p-3 rounded-lg">
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                    <ReactMarkdown>{streamingContent}</ReactMarkdown>
                  </div>
                </div>
              )}
              {isProcessing && !streamingContent && (
                <div className="bg-muted mr-8 p-3 rounded-lg">
                  <span className="animate-pulse text-muted-foreground">Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isProcessing}
              />
              <Button onClick={handleSend} disabled={isProcessing || !message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
