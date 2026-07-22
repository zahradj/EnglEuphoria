import React, { useState } from 'react';
import { playElevenLabs, stopElevenLabs } from '@/lib/elevenLabsAudio';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Volume2, BookOpen } from "lucide-react";

interface StudentDictionaryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DictionaryEntry {
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  partOfSpeech: string;
}

export function StudentDictionary({ isOpen, onClose }: StudentDictionaryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock dictionary data - in real app, this would be an API call
  const mockDictionary: Record<string, DictionaryEntry> = {
    'learn': {
      word: 'learn',
      pronunciation: '/lɜːrn/',
      definition: 'To gain knowledge or skill by studying, practicing, being taught, or experiencing something.',
      example: 'I want to learn how to speak French.',
      partOfSpeech: 'verb'
    },
    'student': {
      word: 'student',
      pronunciation: '/ˈstuːdənt/',
      definition: 'A person who is studying at a school, college, or university.',
      example: 'She is a student at the local university.',
      partOfSpeech: 'noun'
    },
    'teacher': {
      word: 'teacher',
      pronunciation: '/ˈtiːtʃər/',
      definition: 'A person whose job it is to teach in a school.',
      example: 'My English teacher is very helpful.',
      partOfSpeech: 'noun'
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const entry = mockDictionary[searchTerm.toLowerCase()];
      setResult(entry || null);
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const playPronunciation = () => {
    if (result) void playElevenLabs(result.word);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Student Dictionary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Type a word to look up..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Results */}
          {result && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Word and Pronunciation */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold capitalize">{result.word}</h3>
                      <p className="text-muted-foreground">{result.pronunciation}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={playPronunciation}
                      className="flex items-center gap-1"
                    >
                      <Volume2 size={16} />
                      Play
                    </Button>
                  </div>

                  {/* Part of Speech */}
                  <div className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                    {result.partOfSpeech}
                  </div>

                  {/* Definition */}
                  <div>
                    <h4 className="font-medium mb-1">Definition:</h4>
                    <p className="text-muted-foreground">{result.definition}</p>
                  </div>

                  {/* Example */}
                  <div>
                    <h4 className="font-medium mb-1">Example:</h4>
                    <p className="text-muted-foreground italic">"{result.example}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {searchTerm && !result && !isLoading && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">
                  No definition found for "{searchTerm}". Try a different word.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Access Words */}
          {!searchTerm && (
            <div>
              <h4 className="font-medium mb-2">Quick Access:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.keys(mockDictionary).map((word) => (
                  <Button
                    key={word}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm(word);
                      setResult(mockDictionary[word]);
                    }}
                    className="text-xs"
                  >
                    {word}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}