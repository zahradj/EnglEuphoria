import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VocabularyImageProps {
  word: string;
  className?: string;
}

export function VocabularyImage({ word, className = '' }: VocabularyImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateImage();
  }, [word]);

  const generateImage = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const prompt = `A simple, clear, educational illustration of a ${word}. Clean, colorful, child-friendly style. No text, just the object.`;

      const { data, error: funcError } = await supabase.functions.invoke('ai-image-generation', {
        body: { 
          prompt,
          style: 'educational'
        }
      });

      if (funcError) throw funcError;
      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        throw new Error('No image URL returned');
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setError('Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <span className="text-6xl">{getEmojiForWord(word)}</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={word}
      className={`rounded-lg object-cover ${className}`}
      onError={() => setError('Image failed to load')}
    />
  );
}

function getEmojiForWord(word: string): string {
  const emojiMap: Record<string, string> = {
    'dog': '🐶',
    'cat': '🐱',
    'sun': '☀️',
    'book': '📖',
    'apple': '🍎',
    'school': '🏫',
    'bus': '🚌',
    'boy': '👦',
    'girl': '👧',
    'tree': '🌳',
    'house': '🏠',
    'car': '🚗',
  };

  return emojiMap[word.toLowerCase()] || '📷';
}
