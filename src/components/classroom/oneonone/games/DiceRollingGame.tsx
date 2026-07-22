
import React from "react";
import { DiceConfigSelector } from "./dice-rolling/DiceConfigSelector";
import { GameControls } from "./dice-rolling/GameControls";
import { DiceDisplay } from "./dice-rolling/DiceDisplay";
import { RollButton } from "./dice-rolling/RollButton";
import { ChallengeDisplay } from "./dice-rolling/ChallengeDisplay";
import { GameInstructions } from "./dice-rolling/GameInstructions";
import { useDiceGame } from "./dice-rolling/useDiceGame";

export function DiceRollingGame() {
  const {
    state,
    diceConfigs,
    setDiceConfig,
    rollDice,
    resetGame
  } = useDiceGame();

  return (
    <div className="space-y-4">
      <DiceConfigSelector
        configs={diceConfigs}
        currentConfig={state.diceConfig}
        onConfigChange={setDiceConfig}
      />

      <GameControls
        score={state.score}
        rollCount={state.rollCount}
        onReset={resetGame}
      />

      <div className="flex flex-col items-center space-y-6">
        <DiceDisplay
          diceCount={state.diceConfig.diceCount}
          diceResults={state.diceResults}
          isRolling={state.isRolling}
        />

        <RollButton
          isRolling={state.isRolling}
          onRoll={rollDice}
        />

        <ChallengeDisplay
          aiChallenge={state.aiChallenge}
          isRolling={state.isRolling}
          diceResults={state.diceResults}
        />

        <GameInstructions diceConfig={state.diceConfig} />
      </div>
    </div>
  );
}
