
import React from "react";
import { WheelConfigSelector } from "./spinning-wheel/WheelConfigSelector";
import { WheelControls } from "./spinning-wheel/WheelControls";
import { SpinningWheelVisual } from "./spinning-wheel/SpinningWheelVisual";
import { SpinButton } from "./spinning-wheel/SpinButton";
import { WheelResultDisplay } from "./spinning-wheel/WheelResultDisplay";
import { useSpinningWheel } from "./spinning-wheel/useSpinningWheel";

export function SpinningWheelGame() {
  const {
    state,
    wheelRef,
    wheelConfigs,
    setWheelConfig,
    spinWheel,
    resetWheel,
    generateNewContent
  } = useSpinningWheel();

  return (
    <div className="space-y-4">
      <WheelConfigSelector
        wheelConfigs={wheelConfigs}
        currentConfig={state.wheelConfig}
        onConfigChange={setWheelConfig}
      />

      <WheelControls
        score={state.score}
        onReset={resetWheel}
        onGenerateNewContent={generateNewContent}
      />

      <div className="flex flex-col items-center space-y-6">
        <SpinningWheelVisual
          segments={state.segments}
          rotation={state.rotation}
          isSpinning={state.isSpinning}
          wheelRef={wheelRef}
        />

        <SpinButton
          isSpinning={state.isSpinning}
          onSpin={spinWheel}
        />

        <WheelResultDisplay
          selectedSegment={state.selectedSegment}
          isSpinning={state.isSpinning}
        />
      </div>
    </div>
  );
}
