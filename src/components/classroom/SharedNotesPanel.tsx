import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface SharedNotesPanelProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  sessionContext: Record<string, any>;
  readOnly?: boolean;
  typingUsers?: Array<{ userName: string; userId: string }>;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
}

const CONVERSATION_TEMPLATES = [
  { interest: 'minecraft', prompt: "Tell me about your favorite Minecraft world. What did you build?" },
  { interest: 'gaming', prompt: "What's the last game you played? Tell me about it in English." },
  { interest: 'music', prompt: "Who is your favorite singer? Why do you like their music?" },
  { interest: 'technology', prompt: "What technology do you use every day? Describe it." },
  { interest: 'travel', prompt: "If you could visit any country, where would you go and why?" },
  { interest: 'sports', prompt: "What sport do you enjoy? Tell me about a recent game." },
  { interest: 'animals', prompt: "Do you have a pet? Describe your favorite animal." },
  { interest: 'social media', prompt: "What social media do you use? What do you post about?" },
];

const FALLBACK_STARTERS = [
  "What did you do last weekend? Tell me about it.",
  "Have you ever visited another country? Where did you go?",
  "Describe your daily routine in English.",
];

export const SharedNotesPanel: React.FC<SharedNotesPanelProps> = ({
  notes,
  onNotesChange,
  sessionContext,
  readOnly = false,
  typingUsers = [],
  onTypingStart,
  onTypingEnd
}) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const handleChange = useCallback((value: string) => {
    setLocalNotes(value);

    // Signal typing start
    onTypingStart?.();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTypingEnd?.();
    }, 1500);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onNotesChange(value);
    }, 500);
  }, [onNotesChange, onTypingStart, onTypingEnd]);

  const handleAiSuggest = useCallback(() => {
    const interests: string[] = sessionContext?.interests || [];
    const lastMistake: string = sessionContext?.lastMistake || '';
    const suggestions: string[] = [];

    for (const interest of interests) {
      const match = CONVERSATION_TEMPLATES.find(t =>
        interest.toLowerCase().includes(t.interest)
      );
      if (match && suggestions.length < 2) {
        suggestions.push(match.prompt);
      }
    }

    if (lastMistake && lastMistake !== 'None recorded') {
      suggestions.push(`Practice area: "${lastMistake}" — Try using it in a sentence.`);
    }

    while (suggestions.length < 3) {
      const fallback = FALLBACK_STARTERS[suggestions.length % FALLBACK_STARTERS.length];
      if (!suggestions.includes(fallback)) suggestions.push(fallback);
      else break;
    }

    const suggestText = `\n\n--- AI Conversation Starters ---\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    const newNotes = localNotes + suggestText;
    setLocalNotes(newNotes);
    onNotesChange(newNotes);
  }, [localNotes, onNotesChange, sessionContext]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-400">Shared Notes</p>
        {!readOnly && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAiSuggest}
            className="h-7 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            AI Suggest
          </Button>
        )}
      </div>
      <Textarea
        value={localNotes}
        onChange={(e) => handleChange(e.target.value)}
        readOnly={readOnly}
        placeholder={readOnly ? 'Notes will appear here...' : 'Type lesson notes here...'}
        className="min-h-[120px] bg-gray-800/50 border-gray-700 text-gray-200 text-sm resize-none placeholder:text-gray-500"
      />
      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <p className="text-[10px] text-purple-400 animate-pulse">
          {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </p>
      )}
    </div>
  );
};
