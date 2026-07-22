
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export interface StoryChoice {
  id: string;
  text: string;
  nextSceneId: string;
  vocabularyWords?: string[];
}

export interface StoryScene {
  id: string;
  title: string;
  content: string;
  image?: string;
  choices: StoryChoice[];
  isEnding?: boolean;
  vocabularyWords?: {word: string, translation: string, example: string}[];
}

interface InteractiveStoryProps {
  title: string;
  scenes: StoryScene[];
  initialSceneId: string;
  onComplete: () => void;
  onVocabLearned: (words: string[]) => void;
  className?: string;
}

export function InteractiveStory({
  title,
  scenes,
  initialSceneId,
  onComplete,
  onVocabLearned,
  className = "",
}: InteractiveStoryProps) {
  const [currentSceneId, setCurrentSceneId] = useState(initialSceneId);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [showVocab, setShowVocab] = useState(false);
  const { languageText } = useLanguage();
  
  const currentScene = scenes.find(scene => scene.id === currentSceneId);
  
  if (!currentScene) {
    return <div>Story scene not found</div>;
  }
  
  const handleChoiceSelection = (choice: StoryChoice) => {
    // Track vocabulary words from this choice
    if (choice.vocabularyWords && choice.vocabularyWords.length > 0) {
      const newWords = choice.vocabularyWords.filter(word => !learnedWords.includes(word));
      if (newWords.length > 0) {
        setLearnedWords(prev => [...prev, ...newWords]);
        onVocabLearned(newWords);
      }
    }
    
    setCurrentSceneId(choice.nextSceneId);
  };
  
  const handleComplete = () => {
    onComplete();
  };
  
  const toggleVocab = () => {
    setShowVocab(!showVocab);
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="story-scene">
          {currentScene.image && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img 
                src={currentScene.image} 
                alt={currentScene.title} 
                className="w-full object-cover h-48"
              />
            </div>
          )}
          
          <h3 className="text-xl font-bold mb-2">{currentScene.title}</h3>
          <p className="mb-4">{currentScene.content}</p>
          
          {currentScene.vocabularyWords && currentScene.vocabularyWords.length > 0 && (
            <div className="mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleVocab}
                className="mb-2"
              >
                {showVocab ? languageText.hideVocabulary : languageText.showVocabulary}
              </Button>
              
              {showVocab && (
                <div className="bg-muted p-3 rounded-md space-y-2">
                  <h4 className="font-medium text-sm">
                    {languageText.newVocabulary}:
                  </h4>
                  <ul className="space-y-2">
                    {currentScene.vocabularyWords.map((vocab) => (
                      <li key={vocab.word} className="text-sm">
                        <span className="font-bold">{vocab.word}</span>: {vocab.translation}
                        <p className="text-muted-foreground italic text-xs mt-0.5">
                          "{vocab.example}"
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-3 mt-6">
            {currentScene.choices.map((choice) => (
              <Button
                key={choice.id}
                variant="outline"
                className="w-full text-left justify-start h-auto py-3"
                onClick={() => handleChoiceSelection(choice)}
              >
                {choice.text}
              </Button>
            ))}
            
            {currentScene.isEnding && (
              <Button 
                className="w-full mt-4"
                onClick={handleComplete}
              >
                {languageText.finishStory}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
