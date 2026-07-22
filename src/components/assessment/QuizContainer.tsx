
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { QuizQuestion, QuizQuestionProps } from "./QuizQuestion";

interface QuizContainerProps {
  title: string;
  description: string;
  questions: Omit<QuizQuestionProps, "onAnswer">[];
  onComplete: (score: number, total: number) => void;
  className?: string;
}

export function QuizContainer({
  title,
  description,
  questions,
  onComplete,
  className = "",
}: QuizContainerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { languageText } = useLanguage();
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  const handleAnswer = (questionId: string, isCorrect: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: isCorrect }));
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setQuizCompleted(true);
      onComplete(score + (answers[currentQuestion.id] ? 1 : 0), questions.length);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };
  
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers({});
    setQuizCompleted(false);
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-muted-foreground">{description}</p>
        {!quizCompleted && (
          <div className="text-sm text-muted-foreground mt-2">
            {languageText.question} {currentQuestionIndex + 1} {languageText.of} {questions.length}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {quizCompleted ? (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-2">
              {languageText.quizCompleted}
            </h3>
            <p className="mb-6 text-lg">
              {languageText.yourScore}: {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
            </p>
            <Button onClick={handleRestartQuiz}>
              {languageText.retakeQuiz}
            </Button>
          </div>
        ) : (
          <QuizQuestion
            {...currentQuestion}
            onAnswer={handleAnswer}
          />
        )}
      </CardContent>
      
      {!quizCompleted && answers[currentQuestion.id] !== undefined && (
        <CardFooter>
          <Button 
            onClick={handleNextQuestion} 
            className="w-full"
          >
            {isLastQuestion ? languageText.finish : languageText.nextQuestion}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
