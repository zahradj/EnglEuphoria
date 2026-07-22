import React from 'react';
import { ConstellationStar } from '@/types/constellation';

interface ConstellationLinesProps {
  stars: ConstellationStar[];
  width: number;
  height: number;
}

export const ConstellationLines = ({ stars, width, height }: ConstellationLinesProps) => {
  const activeStars = stars.filter(s => s.isActive && s.brightness > 30);
  
  const connections = [
    ['attendance', 'punctuality'],
    ['attendance', 'technical'],
    ['punctuality', 'satisfaction'],
    ['technical', 'consistency'],
    ['satisfaction', 'consistency'],
  ];

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      style={{ opacity: 0.3 }}
    >
      {connections.map(([startId, endId]) => {
        const start = stars.find(s => s.id === startId);
        const end = stars.find(s => s.id === endId);
        
        if (!start || !end || !start.isActive || !end.isActive) return null;

        const x1 = (start.position.x / 100) * width;
        const y1 = (start.position.y / 100) * height;
        const x2 = (end.position.x / 100) * width;
        const y2 = (end.position.y / 100) * height;

        const averageBrightness = (start.brightness + end.brightness) / 200;

        return (
          <line
            key={`${startId}-${endId}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
            style={{ opacity: averageBrightness }}
          />
        );
      })}
    </svg>
  );
};
