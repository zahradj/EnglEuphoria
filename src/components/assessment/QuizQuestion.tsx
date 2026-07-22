
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

export interface QuizQuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionProps {
  id: string;
  question: string;
  options: QuizQuestionOption[];
  type: "multiple-choice" | "fill-in-blank" | "matching";
  onAnswer: (questionId: string, isCorrect: boolean) => void;
  className?: string;
}

export function QuizQuestion({ 
  id, 
  question, 
  options, 
  type,
  onAnswer,
  className = "" 
}: QuizQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { languageText } = useLanguage();
  const { toast } = useToast();

  const handleOptionSelect = (optionId: string) => {
    if (isSubmitted) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOption) {
      toast({
        title: languageText.selectOption,
        description: languageText.pleaseSelectOption,
        variant: "destructive",
      });
      return;
    }

    const selectedOptionData = options.find(option => option.id === selectedOption);
    if (selectedOptionData) {
      setIsSubmitted(true);
      onAnswer(id, selectedOptionData.isCorrect);
    }
  };

  const isCorrectAnswer = selectedOption ? 
    options.find(option => option.id === selectedOption)?.isCorrect : false;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl">{question}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {type === "multiple-choice" && (
          <div className="grid grid-cols-1 gap-3">
            {options.map((option) => (
              <Button
                key={option.id}
                variant={!isSubmitted ? "outline" : (
                  option.isCorrect ? "default" : (
                    selectedOption === option.id ? "destructive" : "outline"
                  )
                )}
                className={`justify-start text-left h-auto py-3 px-4 ${
                  isSubmitted && option.isCorrect ? "bg-green-500 hover:bg-green-600 text-white" : ""
                }`}
                onClick={() => handleOptionSelect(option.id)}
                disabled={isSubmitted}
              >
                <div className="flex items-center w-full">
                  <span className="flex-1">{option.text}</span>
                  {isSubmitted && option.isCorrect && (
                    <CheckCircle className="h-5 w-5 text-white" />
                  )}
                  {isSubmitted && !option.isCorrect && selectedOption === option.id && (
                    <XCircle className="h-5 w-5" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
      
      {!isSubmitted && (
        <CardFooter>
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!selectedOption}
          >
            {languageText.submit}
          </Button>
        </CardFooter>
      )}

      {isSubmitted && (
        <CardFooter className="flex-col items-start space-y-2">
          <div className={`p-3 rounded-lg w-full ${
            isCorrectAnswer ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            <div className="flex items-center mb-1">
              {isCorrectAnswer ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">{languageText.correct}</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">{languageText.incorrect}</span>
                </>
              )}
            </div>
            <p className="text-sm">
              {isCorrectAnswer ? languageText.correctFeedback : languageText.incorrectFeedback}
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
