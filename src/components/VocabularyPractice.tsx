
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { VocabularyImage } from "@/components/ui/VocabularyImage";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Volume2, Loader2 } from "lucide-react";

export interface VocabWord {
  id: string;
  word: string;
  translation: string;
  image?: string;
  options: string[];
  correctOption: number;
}

interface VocabularyPracticeProps {
  words: VocabWord[];
  onComplete: (score: number, totalQuestions: number) => void;
  className?: string;
}

export function VocabularyPractice({
  words,
  onComplete,
  className = "",
}: VocabularyPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { languageText } = useLanguage();
  const { toast } = useToast();
  const { speak, isLoading: isSpeaking } = useTextToSpeech();

  const currentWord = words[currentIndex];
  const isLastWord = currentIndex === words.length - 1;

  const handleOptionSelect = (optionIndex: number) => {
    if (isCorrect !== null) return; // Already answered
    setSelectedOption(optionIndex);
    
    const correct = optionIndex === currentWord.correctOption;
    setIsCorrect(correct);
    
    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLastWord) {
      setCompleted(true);
      onComplete(score + (isCorrect ? 1 : 0), words.length);
      toast({
        title: languageText.practiceCompleted,
        description: `${languageText.youScored} ${score + (isCorrect ? 1 : 0)}/${words.length}`,
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setCompleted(false);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{languageText.vocabularyPractice}</CardTitle>
        {!completed && (
          <div className="text-sm text-muted-foreground">
            {languageText.question} {currentIndex + 1} {languageText.of} {words.length}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {completed ? (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-2">{languageText.practiceCompleted}</h3>
            <p className="mb-4">{languageText.yourScore}: {score}/{words.length}</p>
            <Button onClick={handleRestart}>{languageText.practiceAgain}</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="mb-4 rounded-lg overflow-hidden w-40 h-40 flex items-center justify-center bg-muted">
                {currentWord.image ? (
                  <img
                    src={currentWord.image}
                    alt={currentWord.word}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <VocabularyImage
                    prompt={`A clear, friendly illustration of "${currentWord.word}"`}
                    alt={currentWord.word}
                    style="flat2d"
                    aspectRatio="1:1"
                    className="w-full h-full"
                  />
                )}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold">{currentWord.word}</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  onClick={() => speak(currentWord.word)}
                  disabled={isSpeaking}
                  aria-label={`Hear ${currentWord.word}`}
                >
                  {isSpeaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-muted-foreground">{languageText.selectTranslation}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentWord.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedOption === index 
                    ? index === currentWord.correctOption 
                      ? "default" 
                      : "destructive" 
                    : "outline"
                  }
                  className={
                    isCorrect !== null && index === currentWord.correctOption 
                      ? "bg-green-500 hover:bg-green-600 text-white" 
                      : ""
                  }
                  onClick={() => handleOptionSelect(index)}
                  disabled={isCorrect !== null}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {!completed && isCorrect !== null && (
        <CardFooter>
          <Button onClick={handleNext} className="w-full">
            {isLastWord ? languageText.finish : languageText.nextWord}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
