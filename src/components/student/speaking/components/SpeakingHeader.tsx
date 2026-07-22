
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, Mic, Bot, Headphones } from 'lucide-react';

export const SpeakingHeader: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-3xl" />
      
      <Card className="relative border-0 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm shadow-2xl">
        <div className="p-8 text-center">
          {/* Floating icons decoration */}
          <div className="absolute top-4 left-4 animate-bounce delay-100">
            <Mic className="h-6 w-6 text-primary/30" />
          </div>
          <div className="absolute top-8 right-8 animate-bounce delay-300">
            <Bot className="h-6 w-6 text-secondary/30" />
          </div>
          <div className="absolute bottom-4 left-8 animate-bounce delay-500">
            <Headphones className="h-5 w-5 text-accent/30" />
          </div>
          <div className="absolute bottom-8 right-4 animate-bounce delay-700">
            <Sparkles className="h-5 w-5 text-primary/40" />
          </div>

          {/* Main content */}
          <div className="relative z-10">
            <div className="mb-4">
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Learning
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in">
              🎙️ AI Speaking Practice
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-200">
              Master English conversation with our intelligent AI assistant. Practice real-world scenarios, 
              get instant feedback, and build confidence through personalized speaking sessions.
            </p>
            
            <div className="flex justify-center items-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Real-time Feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-300" />
                <span>Adaptive Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-600" />
                <span>Level-Based Content</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
