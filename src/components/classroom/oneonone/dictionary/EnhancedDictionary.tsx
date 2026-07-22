
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Volume2, BookPlus, Globe, Image } from "lucide-react";
import { useDictionaryService } from "./useDictionaryService";

interface EnhancedDictionaryProps {
  onAddToVocab?: (word: string, definition: string) => void;
}

export function EnhancedDictionary({ onAddToVocab }: EnhancedDictionaryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("ar"); // Arabic by default
  
  const { 
    definition, 
    translation,
    images,
    isLoading, 
    error, 
    searchWord, 
    playPronunciation,
    recentSearches 
  } = useDictionaryService();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchWord(searchTerm.trim(), targetLanguage);
    }
  };

  const handleRecentSearch = (word: string) => {
    setSearchTerm(word);
    searchWord(word, targetLanguage);
  };

  const handleAddToVocab = () => {
    if (definition && onAddToVocab) {
      onAddToVocab(definition.word, definition.definition);
    }
  };

  const languages = [
    { code: "ar", name: "Arabic" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" }
  ];

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a word..."
          className="text-sm"
        />
        <Button type="submit" size="sm" disabled={isLoading}>
          <Search size={14} />
        </Button>
      </form>

      {/* Language Selection */}
      <div className="flex gap-1 flex-wrap">
        {languages.map((lang) => (
          <Badge
            key={lang.code}
            variant={targetLanguage === lang.code ? "default" : "secondary"}
            className="cursor-pointer text-xs"
            onClick={() => setTargetLanguage(lang.code)}
          >
            <Globe size={10} className="mr-1" />
            {lang.name}
          </Badge>
        ))}
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && !definition && (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Recent</div>
          <div className="flex flex-wrap gap-1">
            {recentSearches.slice(0, 5).map((word, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer text-xs"
                onClick={() => handleRecentSearch(word)}
              >
                {word}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-xs text-gray-500 mt-2">Looking up word...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-4 text-red-600">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Definition Display */}
      {definition && (
        <div className="space-y-3 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{definition.word}</h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => playPronunciation(definition.word)}
                className="h-6 w-6 p-0"
              >
                <Volume2 size={12} />
              </Button>
              {onAddToVocab && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddToVocab}
                  className="h-6 w-6 p-0"
                >
                  <BookPlus size={12} />
                </Button>
              )}
            </div>
          </div>

          {definition.phonetic && (
            <p className="text-sm text-gray-600 italic">
              /{definition.phonetic}/
            </p>
          )}

          {definition.partOfSpeech && (
            <Badge variant="outline" className="text-xs">
              {definition.partOfSpeech}
            </Badge>
          )}

          {/* English Definition */}
          <Card>
            <CardContent className="p-3">
              <div className="text-xs font-medium text-gray-600 mb-1">English Definition:</div>
              <p className="text-sm">{definition.definition}</p>
            </CardContent>
          </Card>

          {/* Translation */}
          {translation && (
            <Card>
              <CardContent className="p-3">
                <div className="text-xs font-medium text-gray-600 mb-1">
                  Translation ({languages.find(l => l.code === targetLanguage)?.name}):
                </div>
                <p className="text-sm font-medium">{translation}</p>
              </CardContent>
            </Card>
          )}

          {/* Example */}
          {definition.example && (
            <Card className="bg-gray-50">
              <CardContent className="p-3">
                <div className="text-xs font-medium text-gray-600 mb-1">Example:</div>
                <p className="text-sm italic">"{definition.example}"</p>
              </CardContent>
            </Card>
          )}

          {/* Images */}
          {images && images.length > 0 && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-2">
                  <Image size={12} />
                  Visual References:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {images.slice(0, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={image.description}
                      className="w-full h-16 object-cover rounded border"
                      loading="lazy"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Synonyms */}
          {definition.synonyms && definition.synonyms.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Similar words:</div>
              <div className="flex flex-wrap gap-1">
                {definition.synonyms.slice(0, 3).map((synonym, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs cursor-pointer"
                    onClick={() => handleRecentSearch(synonym)}
                  >
                    {synonym}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
