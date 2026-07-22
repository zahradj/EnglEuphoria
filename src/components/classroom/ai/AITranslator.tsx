import React, { useState } from 'react';
import { playElevenLabs, stopElevenLabs } from '@/lib/elevenLabsAudio';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Languages, ArrowRightLeft, Volume2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AITranslatorProps {
  onInsertToWhiteboard?: (text: string) => void;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
];

export function AITranslator({ onInsertToWhiteboard }: AITranslatorProps) {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Enter text to translate",
        description: "Please enter some text before translating.",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    try {
      // Simulate AI translation - in real app would call AI service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock translation response
      const mockTranslations: Record<string, Record<string, string>> = {
        en: {
          es: sourceText.replace(/hello/gi, 'hola').replace(/how are you/gi, 'cómo estás'),
          fr: sourceText.replace(/hello/gi, 'bonjour').replace(/how are you/gi, 'comment allez-vous'),
          de: sourceText.replace(/hello/gi, 'hallo').replace(/how are you/gi, 'wie geht es dir'),
        }
      };

      const translation = mockTranslations[sourceLanguage]?.[targetLanguage] || 
        `[AI Translation] ${sourceText} → ${languages.find(l => l.code === targetLanguage)?.name}`;
      
      setTranslatedText(translation);
      
      toast({
        title: "Translation complete",
        description: "Text has been successfully translated.",
      });
    } catch (error) {
      toast({
        title: "Translation failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Translation copied successfully.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSpeak = (text: string, _language: string) => {
    void playElevenLabs(text).catch(() => {
      toast({
        title: "Speech unavailable",
        description: "Could not generate audio. Please try again.",
        variant: "destructive",
      });
    });
  };

  const getLanguageName = (code: string) => {
    return languages.find(l => l.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return languages.find(l => l.code === code)?.flag || '🌍';
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Languages className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Translator</h3>
        <Badge variant="secondary" className="ml-auto">
          Real-time
        </Badge>
      </div>

      {/* Language Selection */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <span className="flex items-center gap-2">
                  {getLanguageFlag(sourceLanguage)} {getLanguageName(sourceLanguage)}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center gap-2">
                    {lang.flag} {lang.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleSwapLanguages}
          className="px-3"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex-1">
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <span className="flex items-center gap-2">
                  {getLanguageFlag(targetLanguage)} {getLanguageName(targetLanguage)}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center gap-2">
                    {lang.flag} {lang.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Source Text */}
      <Card className="flex-1 p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{getLanguageName(sourceLanguage)}</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSpeak(sourceText, sourceLanguage)}
            disabled={!sourceText.trim()}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
        <Textarea
          placeholder="Enter text to translate..."
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          className="min-h-[120px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
        />
      </Card>

      {/* Translate Button */}
      <Button 
        onClick={handleTranslate} 
        disabled={isTranslating || !sourceText.trim()}
        className="w-full"
      >
        {isTranslating ? 'Translating...' : 'Translate'}
      </Button>

      {/* Translated Text */}
      <Card className="flex-1 p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{getLanguageName(targetLanguage)}</Badge>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSpeak(translatedText, targetLanguage)}
              disabled={!translatedText.trim()}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!translatedText.trim()}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="min-h-[120px] text-sm text-muted-foreground">
          {translatedText || 'Translation will appear here...'}
        </div>
      </Card>

      {/* Action Buttons */}
      {translatedText && onInsertToWhiteboard && (
        <Button
          variant="outline"
          onClick={() => onInsertToWhiteboard(translatedText)}
          className="w-full"
        >
          Insert to Whiteboard
        </Button>
      )}
    </div>
  );
}