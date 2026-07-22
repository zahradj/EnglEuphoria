
import { useEnhancedDictionaryService } from './enhancedDictionaryService';

export interface WordDefinition {
  word: string;
  phonetic?: string;
  definition: string;
  partOfSpeech?: string;
  example?: string;
  synonyms?: string[];
  audioUrl?: string;
}

export interface ImageResult {
  url: string;
  description: string;
}

// This hook now acts as a wrapper around the enhanced service
// to maintain backwards compatibility with existing components
export function useDictionaryService() {
  const enhancedService = useEnhancedDictionaryService();

  return {
    definition: enhancedService.definition,
    translation: enhancedService.translation,
    images: enhancedService.images,
    isLoading: enhancedService.isLoading,
    error: enhancedService.error,
    recentSearches: enhancedService.recentSearches,
    searchWord: enhancedService.searchWord,
    playPronunciation: enhancedService.playPronunciation
  };
}
