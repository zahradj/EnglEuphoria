
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  RotateCcw, 
  Shuffle, 
  Play,
  CheckCircle,
  Star,
  Gamepad2,
  Plus,
  Grid3x3,
  CirclePlay,
  Dice1,
  Sparkles,
  Wand2
} from "lucide-react";
import { FlashcardsGame } from "./games/FlashcardsGame";
import { SentenceBuilderGame } from "./games/SentenceBuilderGame";
import { WordMatchGame } from "./games/WordMatchGame";
import { QuizSpinnerGame } from "./games/QuizSpinnerGame";
import { CreateActivityGame } from "./games/CreateActivityGame";
import { EnhancedDragDropGame } from "./games/EnhancedDragDropGame";
import { SpinningWheelGame } from "./games/SpinningWheelGame";
import { DiceRollingGame } from "./games/DiceRollingGame";
import { GameTimer } from "./games/GameTimer";

export function OneOnOneGames() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const aiGames = [
    {
      id: "create-activity",
      title: "AI Activity Generator",
      description: "Create custom activities with AI - worksheets, games & more!",
      icon: Wand2,
      color: "bg-gradient-to-br from-purple-100 to-blue-100 text-purple-700",
      isNew: true,
      isFeatured: true
    },
    {
      id: "enhanced-drag-drop",
      title: "Grab & Drag Match",
      description: "AI-powered drag and drop matching games",
      icon: Grid3x3,
      color: "bg-emerald-100 text-emerald-700",
      isNew: true
    },
    {
      id: "spinning-wheel",
      title: "AI Spinning Wheel",
      description: "Interactive wheel with AI-generated content",
      icon: CirclePlay,
      color: "bg-purple-100 text-purple-700",
      isNew: true
    },
    {
      id: "dice-rolling",
      title: "Roll the Dice",
      description: "Story dice and vocabulary challenges",
      icon: Dice1,
      color: "bg-blue-100 text-blue-700",
      isNew: true
    }
  ];

  const classicGames = [
    {
      id: "flashcards",
      title: "Vocabulary Flashcards",
      description: "Practice new words with interactive cards",
      icon: RotateCcw,
      color: "bg-blue-100 text-blue-700"
    },
    {
      id: "sentence-builder",
      title: "Sentence Builder",
      description: "Drag words to create proper sentences",
      icon: Shuffle,
      color: "bg-green-100 text-green-700"
    },
    {
      id: "word-match",
      title: "Word Matching (Classic)",
      description: "Match words with their meanings",
      icon: CheckCircle,
      color: "bg-purple-100 text-purple-700"
    },
    {
      id: "quiz-spinner",
      title: "Quiz Spinner (Classic)",
      description: "Spin the wheel for random questions",
      icon: Play,
      color: "bg-orange-100 text-orange-700"
    }
  ];

  if (activeGame) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setActiveGame(null)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Games
          </button>
          {activeGame !== "create-activity" && (
            <div className="flex items-center gap-3">
              <GameTimer />
              <Badge variant="secondary">Score: {score}</Badge>
            </div>
          )}
        </div>
        
        <Card className="flex-1 p-4">
          {activeGame === "enhanced-drag-drop" && <EnhancedDragDropGame />}
          {activeGame === "spinning-wheel" && <SpinningWheelGame />}
          {activeGame === "dice-rolling" && <DiceRollingGame />}
          {activeGame === "flashcards" && <FlashcardsGame />}
          {activeGame === "sentence-builder" && <SentenceBuilderGame />}
          {activeGame === "word-match" && <WordMatchGame />}
          {activeGame === "quiz-spinner" && <QuizSpinnerGame />}
          {activeGame === "create-activity" && <CreateActivityGame />}
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Gamepad2 size={18} className="text-purple-600" />
          AI Gaming Activities
        </h3>
        <Badge variant="outline" className="text-xs">
          {aiGames.length} AI Games!
        </Badge>
      </div>

      {/* Featured AI Games Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-purple-600" />
          <h4 className="font-medium text-purple-800">✨ Featured AI Games</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {aiGames.map((game) => (
            <Card 
              key={game.id}
              className={`p-4 cursor-pointer hover:shadow-md transition-all relative group ${
                game.isFeatured ? 'ring-2 ring-purple-200 bg-gradient-to-br from-purple-50 to-blue-50' : ''
              }`}
              onClick={() => setActiveGame(game.id)}
            >
              {game.isNew && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1"
                >
                  NEW
                </Badge>
              )}
              
              <div className={`w-12 h-12 rounded-lg ${game.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <game.icon size={24} />
              </div>
              <h4 className="font-medium text-sm mb-1">{game.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{game.description}</p>
              
              <div className="mt-2 flex items-center gap-1">
                <Star size={12} className="text-yellow-500" />
                <span className="text-xs text-yellow-600 font-medium">AI Powered</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Classic Games Section */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Classic Games</h4>
        <div className="grid grid-cols-2 gap-3">
          {classicGames.map((game) => (
            <Card 
              key={game.id}
              className="p-4 cursor-pointer hover:shadow-md transition-all relative group"
              onClick={() => setActiveGame(game.id)}
            >
              <div className={`w-12 h-12 rounded-lg ${game.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <game.icon size={24} />
              </div>
              <h4 className="font-medium text-sm mb-1">{game.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{game.description}</p>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 via-blue-50 to-emerald-50 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <Star size={16} className="text-purple-600" />
          <span className="font-medium text-purple-800">New AI Features!</span>
        </div>
        <p className="text-sm text-purple-700 leading-relaxed">
          Try our new <strong>AI Activity Generator</strong> to create custom worksheets and games instantly! 
          Plus enjoy our enhanced <strong>Grab & Drag Match</strong>, <strong>AI Spinning Wheel</strong>, and <strong>Roll the Dice</strong> games!
        </p>
      </div>
    </div>
  );
}
