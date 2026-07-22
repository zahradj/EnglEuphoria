import React from 'react';
import { motion } from 'framer-motion';

interface PathPoint {
  x: number;
  y: number;
}

interface WindingPathProps {
  points: PathPoint[];
  completedIndex: number;
  theme?: 'jungle' | 'space' | 'underwater';
}

export const WindingPath: React.FC<WindingPathProps> = ({
  points,
  completedIndex,
  theme = 'jungle',
}) => {
  const themeColors = {
    jungle: {
      path: 'hsl(30, 50%, 40%)',
      completed: 'hsl(45, 100%, 50%)',
      stroke: 8,
    },
    space: {
      path: 'hsl(270, 50%, 40%)',
      completed: 'hsl(180, 100%, 50%)',
      stroke: 6,
    },
    underwater: {
      path: 'hsl(210, 50%, 35%)',
      completed: 'hsl(180, 70%, 60%)',
      stroke: 8,
    },
  };

  const colors = themeColors[theme];

  // Generate a smooth curve through the points
  const generatePath = (pts: PathPoint[]): string => {
    if (pts.length < 2) return '';
    
    let path = `M ${pts[0].x} ${pts[0].y}`;
    
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      
      // Control points for smooth curve
      const cpX1 = prev.x + (curr.x - prev.x) * 0.5;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) * 0.5;
      const cpY2 = curr.y;
      
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
    
    return path;
  };

  // Scale points to SVG viewBox
  const scaledPoints = points.map(p => ({
    x: p.x * 10, // Scale percentage to viewBox units
    y: p.y * 10,
  }));

  const fullPath = generatePath(scaledPoints);
  
  // Generate completed portion of path
  const completedPoints = scaledPoints.slice(0, completedIndex + 1);
  const completedPath = completedPoints.length > 1 ? generatePath(completedPoints) : '';

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Glow filter */}
        <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Animated dash pattern */}
        <pattern id="dashPattern" patternUnits="userSpaceOnUse" width="20" height="20">
          <circle cx="10" cy="10" r="3" fill={colors.path} opacity="0.5" />
        </pattern>
      </defs>
      
      {/* Background path (full trail) */}
      <motion.path
        d={fullPath}
        fill="none"
        stroke={colors.path}
        strokeWidth={colors.stroke + 4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.3}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      
      {/* Dashed path overlay */}
      <motion.path
        d={fullPath}
        fill="none"
        stroke={colors.path}
        strokeWidth={colors.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="15 10"
        opacity={0.5}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      
      {/* Completed path (golden/highlighted) */}
      {completedPath && (
        <motion.path
          d={completedPath}
          fill="none"
          stroke={colors.completed}
          strokeWidth={colors.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#pathGlow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
        />
      )}
      
      {/* Sparkle decorations along completed path */}
      {completedPoints.slice(0, -1).map((point, index) => (
        <motion.circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="5"
          fill={colors.completed}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            delay: index * 0.2 
          }}
        />
      ))}
    </svg>
  );
};
