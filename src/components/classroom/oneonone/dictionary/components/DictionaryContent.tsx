
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, BookPlus } from "lucide-react";
import { WordDefinition } from "../useDictionaryService";

interface DictionaryContentProps {
  definition: WordDefinition | null;
  isLoading: boolean;
  error: string | null;
  onPlayPronunciation: (word: string) => void;
  onAddToVocab?: () => void;
  onSynonymClick: (synonym: string) => void;
}

export function DictionaryContent({
  definition,
  isLoading,
  error,
  onPlayPronunciation,
  onAddToVocab,
  onSynonymClick
}: DictionaryContentProps) {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-xs text-gray-500 mt-2">Looking up word...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!definition) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">{definition.word}</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPlayPronunciation(definition.word)}
            className="h-6 w-6 p-0"
          >
            <Volume2 size={12} />
          </Button>
          {onAddToVocab && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddToVocab}
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

      <div>
        <p className="text-sm">{definition.definition}</p>
      </div>

      {definition.example && (
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-xs text-gray-600 mb-1">Example:</p>
          <p className="text-sm italic">"{definition.example}"</p>
        </div>
      )}

      {definition.synonyms && definition.synonyms.length > 0 && (
        <div>
          <p className="text-xs text-gray-600 mb-1">Similar words:</p>
          <div className="flex flex-wrap gap-1">
            {definition.synonyms.slice(0, 3).map((synonym, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs cursor-pointer"
                onClick={() => onSynonymClick(synonym)}
              >
                {synonym}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
