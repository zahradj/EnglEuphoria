import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Volume2, BookPlus, Globe, Star, TrendingUp, Clock } from "lucide-react";
import { useDictionaryService, WordDefinition } from "@/components/classroom/oneonone/dictionary/useDictionaryService";
import { toast } from "sonner";

interface ModernDictionaryPanelProps {
  onAddToVocab?: (word: string, definition: string) => void;
}

const WORD_OF_THE_DAY = {
  word: "perseverance",
  definition: "Continued effort to do or achieve something despite difficulties, failure, or opposition",
  partOfSpeech: "noun",
  phonetic: "ˌpɜːrsəˈvɪərəns",
  example: "Through perseverance and hard work, she achieved her dream of becoming a doctor."
};

const LANGUAGES = [
  { code: "ar", name: "Arabic", flag: "🇦🇪" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" }
];

export function ModernDictionaryPanel({ onAddToVocab }: ModernDictionaryPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("ar");
  const [showWordOfDay, setShowWordOfDay] = useState(true);
  
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
      setShowWordOfDay(false);
    }
  };

  const handleRecentSearch = (word: string) => {
    setSearchTerm(word);
    searchWord(word, targetLanguage);
    setShowWordOfDay(false);
  };

  const handleAddToVocab = () => {
    if (definition && onAddToVocab) {
      onAddToVocab(definition.word, definition.definition);
      toast.success(`"${definition.word}" added to vocabulary!`);
    }
  };

  const handleSearchWordOfDay = () => {
    setSearchTerm(WORD_OF_THE_DAY.word);
    searchWord(WORD_OF_THE_DAY.word, targetLanguage);
    setShowWordOfDay(false);
  };

  return (
    <GlassCard className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-classroom-accent/20 flex items-center justify-center">
            <Search className="w-4 h-4 text-classroom-accent" />
          </div>
          <h3 className="font-semibold text-lg">Dictionary</h3>
        </div>
        <p className="text-xs text-muted-foreground">Look up words and expand your vocabulary</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a word..."
          className="flex-1 glass"
        />
        <GlassButton type="submit" variant="primary" disabled={isLoading}>
          <Search className="w-4 h-4" />
        </GlassButton>
      </form>

      {/* Language Selection */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-classroom-primary/30 scrollbar-track-transparent">
        {LANGUAGES.map((lang) => (
          <GlassButton
            key={lang.code}
            variant={targetLanguage === lang.code ? "accent" : "default"}
            size="sm"
            onClick={() => setTargetLanguage(lang.code)}
            className="flex items-center gap-1 whitespace-nowrap"
          >
            <span>{lang.flag}</span>
            <span className="text-xs">{lang.name}</span>
          </GlassButton>
        ))}
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {/* Word of the Day */}
          {showWordOfDay && !definition && !isLoading && (
            <GlassCard 
              variant="light" 
              className="p-4 bg-gradient-to-br from-classroom-reward/20 to-classroom-accent/20 border-classroom-reward/30 cursor-pointer hover:scale-102 transition-all"
              onClick={handleSearchWordOfDay}
            >
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-classroom-reward fill-classroom-reward" />
                <span className="text-sm font-semibold text-classroom-reward">Word of the Day</span>
              </div>
              <h4 className="text-xl font-bold mb-1">{WORD_OF_THE_DAY.word}</h4>
              <p className="text-xs text-muted-foreground italic mb-2">/{WORD_OF_THE_DAY.phonetic}/</p>
              <p className="text-sm">{WORD_OF_THE_DAY.definition}</p>
              <div className="mt-3 text-xs text-muted-foreground">
                Click to see full definition and translation →
              </div>
            </GlassCard>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && !definition && !isLoading && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Recent Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.slice(0, 8).map((word, index) => (
                  <GlassButton
                    key={index}
                    variant="default"
                    size="sm"
                    onClick={() => handleRecentSearch(word)}
                    className="text-xs"
                  >
                    {word}
                  </GlassButton>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-classroom-primary/20 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-classroom-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">Looking up word...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <GlassCard variant="light" className="p-4 bg-destructive/10 border-destructive/30">
              <p className="text-sm text-destructive">{error}</p>
            </GlassCard>
          )}

          {/* Definition Display */}
          {definition && (
            <div className="space-y-4 animate-fade-in">
              {/* Word Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold">{definition.word}</h3>
                  <div className="flex items-center gap-1">
                    <GlassButton
                      variant="accent"
                      size="sm"
                      onClick={() => playPronunciation(definition.word)}
                      title="Pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </GlassButton>
                    {onAddToVocab && (
                      <GlassButton
                        variant="success"
                        size="sm"
                        onClick={handleAddToVocab}
                        title="Add to vocabulary"
                      >
                        <BookPlus className="w-4 h-4" />
                      </GlassButton>
                    )}
                  </div>
                </div>
                
                {definition.phonetic && (
                  <p className="text-sm text-muted-foreground italic">
                    /{definition.phonetic}/
                  </p>
                )}
                
                {definition.partOfSpeech && (
                  <div className="inline-block mt-2 px-3 py-1 rounded-full glass text-xs font-medium">
                    {definition.partOfSpeech}
                  </div>
                )}
              </div>

              {/* English Definition */}
              <GlassCard variant="light" className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-classroom-primary" />
                  <span className="text-xs font-semibold text-classroom-primary">English Definition</span>
                </div>
                <p className="text-sm leading-relaxed">{definition.definition}</p>
              </GlassCard>

              {/* Translation */}
              {translation && (
                <GlassCard variant="light" className="p-4 bg-gradient-to-br from-classroom-accent/20 to-classroom-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">
                      {LANGUAGES.find(l => l.code === targetLanguage)?.flag}
                    </span>
                    <span className="text-xs font-semibold text-classroom-accent">
                      {LANGUAGES.find(l => l.code === targetLanguage)?.name} Translation
                    </span>
                  </div>
                  <p className="text-base font-semibold">{translation}</p>
                </GlassCard>
              )}

              {/* Example */}
              {definition.example && (
                <GlassCard variant="light" className="p-4 bg-classroom-success/10">
                  <div className="text-xs font-semibold text-classroom-success mb-2">Example Usage:</div>
                  <p className="text-sm italic">"{definition.example}"</p>
                </GlassCard>
              )}

              {/* Images */}
              {images && images.length > 0 && (
                <GlassCard variant="light" className="p-4">
                  <div className="text-xs font-semibold text-muted-foreground mb-3">
                    Visual References
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {images.slice(0, 4).map((image, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden aspect-square">
                        <img
                          src={image.url}
                          alt={image.description}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Synonyms */}
              {definition.synonyms && definition.synonyms.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Similar Words</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {definition.synonyms.slice(0, 6).map((synonym, index) => (
                      <GlassButton
                        key={index}
                        variant="accent"
                        size="sm"
                        onClick={() => handleRecentSearch(synonym)}
                        className="text-xs"
                      >
                        {synonym}
                      </GlassButton>
                    ))}
                  </div>
                </div>
              )}

              {/* Context Sentences */}
              <GlassCard variant="light" className="p-4">
                <div className="text-xs font-semibold text-muted-foreground mb-3">
                  More Context Sentences
                </div>
                <div className="space-y-2 text-sm">
                  <p className="leading-relaxed">
                    • The scientist showed great <strong>{definition.word}</strong> in pursuing her research despite setbacks.
                  </p>
                  <p className="leading-relaxed">
                    • Understanding the meaning of <strong>{definition.word}</strong> is essential for language learners.
                  </p>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </ScrollArea>
    </GlassCard>
  );
}
