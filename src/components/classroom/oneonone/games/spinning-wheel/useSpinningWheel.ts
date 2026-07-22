
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { WheelConfig, WheelSegment, SpinningWheelState } from "./types";
import { generateWheelContent } from "./wheelContentGenerator";

export function useSpinningWheel() {
  const wheelRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const initialWheelConfigs: WheelConfig[] = [
    { id: 'vocabulary', name: 'Vocabulary', segments: 6, description: 'Practice new words' },
    { id: 'grammar', name: 'Grammar', segments: 8, description: 'Practice grammar rules' },
    { id: 'conversation', name: 'Talk Time', segments: 4, description: 'Speaking practice' },
    { id: 'story', name: 'Story Time', segments: 5, description: 'Creative storytelling' }
  ];

  const [wheelConfigs, setWheelConfigs] = useState<WheelConfig[]>(initialWheelConfigs);
  const [state, setState] = useState<SpinningWheelState>({
    isSpinning: false,
    rotation: 0,
    selectedSegment: null,
    wheelConfig: wheelConfigs[0],
    segments: generateWheelContent(wheelConfigs[0]),
    score: 0,
  });

  const setWheelConfig = (config: WheelConfig) => {
    setState(prevState => ({
      ...prevState,
      wheelConfig: config,
      segments: generateWheelContent(config)
    }));
  };

  const spinWheel = () => {
    if (state.isSpinning) return;

    const segmentCount = state.segments.length;
    const spinDuration = 3; // seconds
    const fullRotation = 360 * 5; // 5 full rotations
    const segmentAngle = 360 / segmentCount;
    const winningSegment = Math.floor(Math.random() * segmentCount);
    const randomOffset = Math.random() * (segmentAngle - 10) + 5; // Random offset within the segment
    const finalRotation = fullRotation + (360 - winningSegment * segmentAngle) - randomOffset;

    setState(prevState => ({ ...prevState, isSpinning: true, selectedSegment: null }));

    if (wheelRef.current) {
      wheelRef.current.style.transition = `transform ${spinDuration}s cubic-bezier(0.23, 1, 0.32, 1)`;
      wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;

      setTimeout(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transition = 'none';
          wheelRef.current.style.transform = `rotate(${finalRotation % 360}deg)`;
        }

        setState(prevState => ({
          ...prevState,
          isSpinning: false,
          rotation: finalRotation % 360,
          selectedSegment: state.segments[winningSegment],
          score: prevState.score + 5
        }));

        toast({
          title: "Landed on a challenge!",
          description: `You landed on: ${state.segments[winningSegment].content}. +5 points!`,
        });
      }, spinDuration * 1000);
    }
  };

  const resetWheel = () => {
    setState(prevState => ({
      ...prevState,
      rotation: 0,
      selectedSegment: null,
      score: 0
    }));

    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = 'rotate(0deg)';
    }
  };

  const generateNewContent = () => {
    setState(prevState => ({
      ...prevState,
      segments: generateWheelContent(prevState.wheelConfig)
    }));

    toast({
      title: "New Content Generated!",
      description: "The wheel has been updated with fresh challenges.",
    });
  };

  return {
    state,
    wheelRef,
    wheelConfigs,
    setWheelConfig,
    spinWheel,
    resetWheel,
    generateNewContent
  };
}
