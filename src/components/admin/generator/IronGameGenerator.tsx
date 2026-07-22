import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GameResult } from "@/types/ironLMS";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Loader2, Gamepad2, Save, Trash2, ChevronDown, Sparkles, Code } from "lucide-react";
import { TargetGroupSelector } from "./TargetGroupSelector";
import { GameModeSelector } from "./GameModeSelector";
import { IronLMSGamePlayer } from "@/components/games/IronLMSGamePlayer";
import { useIronLMSGenerator } from "@/hooks/useIronLMSGenerator";
import { useIronGameSave } from "@/hooks/useIronGameSave";
import type { TargetGroup, GameMode, IronLMSGame } from "@/types/ironLMS";

interface IronGameGeneratorProps {
  onNavigate?: (tab: string) => void;
}

export const IronGameGenerator = ({ onNavigate }: IronGameGeneratorProps) => {
  // Form state
  const [targetGroup, setTargetGroup] = useState<TargetGroup>("academy");
  const [topic, setTopic] = useState("");
  const [gameMode, setGameMode] = useState<GameMode>("mechanic");
  const [cefrLevel, setCefrLevel] = useState("A2");
  const [questionCount, setQuestionCount] = useState(5);
  const [showJson, setShowJson] = useState(false);

  // Generated game state
  const [generatedGame, setGeneratedGame] = useState<IronLMSGame | null>(null);

  // Hooks
  const { generateGame, isGenerating, error: generateError } = useIronLMSGenerator();
  const { saveGame, isSaving } = useIronGameSave();

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    const game = await generateGame({
      targetGroup,
      topic: topic.trim(),
      gameMode,
      cefrLevel,
      questionCount: gameMode === "mechanic" ? questionCount : undefined,
    });

    if (game) {
      setGeneratedGame(game);
    }
  };

  const handleSave = async () => {
    if (!generatedGame) return;

    await saveGame({
      game: generatedGame,
      topic: topic.trim(),
      targetGroup,
      cefrLevel,
    });
  };

  const handleDiscard = () => {
    setGeneratedGame(null);
  };

  const handleGameComplete = (result: GameResult) => {
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            Game Configuration
          </CardTitle>
          <CardDescription>
            Configure and generate interactive mini-games
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TargetGroupSelector value={targetGroup} onChange={setTargetGroup} />

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., Present Simple, Modal Verbs, Restaurant Ordering"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <GameModeSelector value={gameMode} onChange={setGameMode} />

          <div className="space-y-2">
            <Label htmlFor="cefr">CEFR Level</Label>
            <Select value={cefrLevel} onValueChange={setCefrLevel}>
              <SelectTrigger id="cefr">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A1">A1 - Beginner</SelectItem>
                <SelectItem value="A2">A2 - Elementary</SelectItem>
                <SelectItem value="B1">B1 - Intermediate</SelectItem>
                <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                <SelectItem value="C1">C1 - Advanced</SelectItem>
                <SelectItem value="C2">C2 - Proficient</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {gameMode === "mechanic" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Number of Questions</Label>
                <span className="text-sm font-medium text-primary">{questionCount}</span>
              </div>
              <Slider
                value={[questionCount]}
                onValueChange={(v) => setQuestionCount(v[0])}
                min={3}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Game
              </>
            )}
          </Button>

          {generateError && (
            <p className="text-sm text-destructive">{generateError}</p>
          )}
        </CardContent>
      </Card>

      {/* Preview Panel */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>
            Play and test the generated game before saving
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Generating your game...</p>
            </div>
          ) : generatedGame ? (
            <div className="flex flex-col h-full">
              {/* Game Preview */}
              <div className="flex-1 overflow-y-auto max-h-[400px] mb-4 border rounded-lg p-4 bg-muted/30">
                <IronLMSGamePlayer
                  game={generatedGame}
                  targetGroup={targetGroup}
                  onComplete={handleGameComplete}
                />
              </div>

              {/* JSON Preview (Collapsible) */}
              <Collapsible open={showJson} onOpenChange={setShowJson}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full mb-2">
                    <Code className="h-4 w-4 mr-2" />
                    {showJson ? "Hide" : "Show"} JSON
                    <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showJson ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48 mb-4">
                    {JSON.stringify(generatedGame, null, 2)}
                  </pre>
                </CollapsibleContent>
              </Collapsible>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleDiscard}
                  disabled={isSaving}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Discard
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Game
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Gamepad2 className="h-12 w-12 mb-4 opacity-20" />
              <p>Generated game will appear here</p>
              <p className="text-sm">Configure options and click Generate</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
