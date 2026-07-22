
import React from "react";
import { WheelSegment } from "./types";

interface SpinningWheelVisualProps {
  segments: WheelSegment[];
  rotation: number;
  isSpinning: boolean;
  wheelRef: React.RefObject<HTMLDivElement>;
}

export function SpinningWheelVisual({ segments, rotation, isSpinning, wheelRef }: SpinningWheelVisualProps) {
  const segmentAngle = 360 / segments.length;

  return (
    <div className="relative">
      {/* Wheel */}
      <div 
        ref={wheelRef}
        className="relative w-80 h-80 rounded-full border-4 border-gray-800 overflow-hidden"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
        }}
      >
        {segments.map((segment, index) => (
          <div
            key={segment.id}
            className="absolute w-full h-full flex items-center justify-center text-white font-bold text-sm"
            style={{
              backgroundColor: segment.color,
              transform: `rotate(${index * segmentAngle}deg)`,
              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(Math.PI * segmentAngle / 180)}% ${50 - 50 * Math.sin(Math.PI * segmentAngle / 180)}%)`
            }}
          >
            <div 
              className="absolute text-center px-2"
              style={{ 
                transform: `rotate(-${index * segmentAngle}deg) translateY(-120px)`,
                width: '150px',
                marginLeft: '-75px'
              }}
            >
              {segment.content}
            </div>
          </div>
        ))}
        
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-gray-800 flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
        </div>
      </div>
      
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
        <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-red-600"></div>
      </div>
    </div>
  );
}
