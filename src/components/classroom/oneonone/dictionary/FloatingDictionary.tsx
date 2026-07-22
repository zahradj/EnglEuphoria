
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDictionaryService } from "./useDictionaryService";
import { useDraggable } from "./hooks/useDraggable";
import { DictionaryHeader } from "./components/DictionaryHeader";
import { DictionarySearchForm } from "./components/DictionarySearchForm";
import { DictionaryContent } from "./components/DictionaryContent";

interface FloatingDictionaryProps {
  isVisible: boolean;
  onClose: () => void;
  initialWord?: string;
  onAddToVocab?: (word: string, definition: string) => void;
}

export function FloatingDictionary({ 
  isVisible, 
  onClose, 
  initialWord = "",
  onAddToVocab 
}: FloatingDictionaryProps) {
  const [searchTerm, setSearchTerm] = useState(initialWord);
  const [isMinimized, setIsMinimized] = useState(false);

  const { 
    definition, 
    isLoading, 
    error, 
    searchWord, 
    playPronunciation,
    recentSearches 
  } = useDictionaryService();

  const { position, dragRef, handleMouseDown } = useDraggable();

  useEffect(() => {
    if (initialWord && isVisible) {
      setSearchTerm(initialWord);
      searchWord(initialWord);
    }
  }, [initialWord, isVisible, searchWord]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchWord(searchTerm.trim());
    }
  };

  const handleAddToVocab = () => {
    if (definition && onAddToVocab) {
      onAddToVocab(definition.word, definition.definition);
    }
  };

  const handleRecentSearchClick = (word: string) => {
    setSearchTerm(word);
    searchWord(word);
  };

  const handleSynonymClick = (synonym: string) => {
    setSearchTerm(synonym);
    searchWord(synonym);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (!isVisible) {
          const selection = window.getSelection()?.toString().trim();
          if (selection) {
            setSearchTerm(selection);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        width: isMinimized ? 'auto' : '320px'
      }}
    >
      <Card className="shadow-xl border-2 bg-white">
        <DictionaryHeader
          isMinimized={isMinimized}
          onToggleMinimize={() => setIsMinimized(!isMinimized)}
          onClose={onClose}
          onMouseDown={handleMouseDown}
        />

        {!isMinimized && (
          <CardContent className="p-4 space-y-4">
            <DictionarySearchForm
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              onSubmit={handleSearch}
              isLoading={isLoading}
              recentSearches={recentSearches}
              onRecentSearchClick={handleRecentSearchClick}
            />

            <DictionaryContent
              definition={definition}
              isLoading={isLoading}
              error={error}
              onPlayPronunciation={playPronunciation}
              onAddToVocab={onAddToVocab ? handleAddToVocab : undefined}
              onSynonymClick={handleSynonymClick}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
