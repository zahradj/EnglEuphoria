
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DiceConfig, DiceResult, DiceGameState } from "./types";
import { diceContentSets } from "./diceContentSets";
import { generateAIChallenge } from "./challengeGenerator";
import { audioService } from "@/services/audioService";

export function useDiceGame() {
  const { toast } = useToast();

  const diceConfigs: DiceConfig[] = [
    { id: 'vocabulary', name: 'Vocabulary', description: 'Word challenges', diceCount: 2, type: 'vocabulary' },
    { id: 'grammar', name: 'Grammar', description: 'Grammar exercises', diceCount: 2, type: 'grammar' },
    { id: 'story', name: 'Story Dice', description: 'Creative storytelling', diceCount: 3, type: 'story' },
    { id: 'conversation', name: 'Talk Time', description: 'Speaking prompts', diceCount: 1, type: 'conversation' }
  ];

  const [state, setState] = useState<DiceGameState>({
    diceConfig: diceConfigs[0],
    diceResults: [],
    isRolling: false,
    aiChallenge: '',
    score: 0,
    rollCount: 0
  });

  const setDiceConfig = (config: DiceConfig) => {
    setState(prev => ({ ...prev, diceConfig: config }));
  };

  const rollDice = () => {
    if (state.isRolling) return;

    audioService.playDiceSound();
    setState(prev => ({ ...prev, isRolling: true, aiChallenge: '' }));
    
    // Simulate rolling animation
    const rollInterval = setInterval(() => {
      const tempResults = Array(state.diceConfig.diceCount).fill(0).map((_, index) => {
        const value = Math.floor(Math.random() * 6) + 1;
        const contentSet = diceContentSets[state.diceConfig.type];
        const content = contentSet[index % contentSet.length]?.[value - 1] || 'Mystery';
        
        return {
          value,
          content,
          color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][index % 5]
        };
      });
      setState(prev => ({ ...prev, diceResults: tempResults }));
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);
      
      // Final results
      const finalResults = Array(state.diceConfig.diceCount).fill(0).map((_, index) => {
        const value = Math.floor(Math.random() * 6) + 1;
        const contentSet = diceContentSets[state.diceConfig.type];
        const content = contentSet[index % contentSet.length]?.[value - 1] || 'Mystery';
        
        return {
          value,
          content,
          color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][index % 5]
        };
      });
      
      const challenge = generateAIChallenge(finalResults, state.diceConfig);
      
      setState(prev => ({
        ...prev,
        diceResults: finalResults,
        isRolling: false,
        rollCount: prev.rollCount + 1,
        score: prev.score + finalResults.length * 2,
        aiChallenge: challenge
      }));
      
      toast({
        title: "Dice Rolled! 🎲",
        description: `You got: ${finalResults.map(r => r.content).join(', ')}`,
      });
    }, 2000);
  };

  const resetGame = () => {
    setState(prev => ({
      ...prev,
      diceResults: [],
      aiChallenge: '',
      score: 0,
      rollCount: 0
    }));
  };

  return {
    state,
    diceConfigs,
    setDiceConfig,
    rollDice,
    resetGame
  };
}
