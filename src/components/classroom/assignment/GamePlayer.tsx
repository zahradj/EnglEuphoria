
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Star } from "lucide-react";
import { FlashcardsGame } from "@/components/classroom/oneonone/games/FlashcardsGame";
import { SentenceBuilderGame } from "@/components/classroom/oneonone/games/SentenceBuilderGame";
import { WordMatchGame } from "@/components/classroom/oneonone/games/WordMatchGame";
import { QuizSpinnerGame } from "@/components/classroom/oneonone/games/QuizSpinnerGame";
import { EnhancedDragDropGame } from "@/components/classroom/oneonone/games/EnhancedDragDropGame";

interface GamePlayerProps {
  assignment: {
    id: string;
    title: string;
    gameType: string;
    assignedBy: string;
    difficulty: string;
    estimatedTime: string;
    points: number;
  };
  onBack: () => void;
  onComplete: (score: number) => void;
}

export function GamePlayer({ assignment, onBack, onComplete }: GamePlayerProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const renderGame = () => {
    switch (assignment.gameType) {
      case "flashcards":
        return <FlashcardsGame />;
      case "sentence-builder":
        return <SentenceBuilderGame />;
      case "word-match":
        return <WordMatchGame />;
      case "quiz-spinner":
        return <QuizSpinnerGame />;
      case "enhanced-drag-drop":
        return <EnhancedDragDropGame />;
      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Game type not implemented yet: {assignment.gameType}
          </div>
        );
    }
  };

  const handleGameComplete = () => {
    const score = Math.floor(Math.random() * 41) + 60; // Random score between 60-100
    setFinalScore(score);
    setGameCompleted(true);
  };

  const handleSubmitAssignment = () => {
    onComplete(finalScore);
  };

  if (gameCompleted) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Trophy size={32} className="text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Assignment Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-4xl font-bold text-purple-600">{finalScore}%</div>
              <p className="text-gray-600">Your Score</p>
            </div>
            
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={20} 
                  className={i < Math.floor(finalScore / 20) ? "text-yellow-500 fill-current" : "text-gray-300"} 
                />
              ))}
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                +{assignment.points} Points Earned!
              </div>
              <p className="text-sm text-gray-600">Great job on completing "{assignment.title}"</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack} className="flex-1">
                Back to Assignments
              </Button>
              <Button onClick={handleSubmitAssignment} className="flex-1 bg-green-600 hover:bg-green-700">
                Submit Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <p className="text-gray-600">Assigned by {assignment.assignedBy}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-purple-600">{assignment.difficulty}</div>
                  <div className="text-sm text-gray-600">Difficulty</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">{assignment.estimatedTime}</div>
                  <div className="text-sm text-gray-600">Estimated Time</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">{assignment.points}</div>
                  <div className="text-sm text-gray-600">Points Available</div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-medium mb-2">Ready to start?</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Complete this assignment to earn points and improve your skills!
                </p>
                <Button 
                  onClick={() => setGameStarted(true)}
                  className="bg-purple-600 hover:bg-purple-700 px-8"
                  size="lg"
                >
                  Start Assignment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <span className="font-medium">{assignment.title}</span>
        </div>
        <Button 
          onClick={handleGameComplete}
          variant="outline"
          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        >
          Complete Assignment
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto">
        {renderGame()}
      </div>
    </div>
  );
}
