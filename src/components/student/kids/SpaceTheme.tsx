import React from 'react';

export const SpaceTheme: React.FC = () => {
  return (
    <svg 
      className="absolute inset-0 w-full h-full" 
      viewBox="0 0 1920 1080" 
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Space Gradient */}
        <linearGradient id="spaceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(240, 50%, 10%)" />
          <stop offset="50%" stopColor="hsl(270, 60%, 15%)" />
          <stop offset="100%" stopColor="hsl(200, 50%, 12%)" />
        </linearGradient>
        
        {/* Planet Gradients */}
        <radialGradient id="planet1" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="hsl(30, 80%, 60%)" />
          <stop offset="100%" stopColor="hsl(20, 70%, 40%)" />
        </radialGradient>
        
        <radialGradient id="planet2" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="hsl(200, 70%, 60%)" />
          <stop offset="100%" stopColor="hsl(220, 60%, 40%)" />
        </radialGradient>
        
        <radialGradient id="moonGradient" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="hsl(45, 30%, 85%)" />
          <stop offset="100%" stopColor="hsl(45, 20%, 60%)" />
        </radialGradient>
      </defs>
      
      {/* Space Background */}
      <rect width="100%" height="100%" fill="url(#spaceGradient)" />
      
      {/* Stars */}
      {Array.from({ length: 100 }).map((_, i) => (
        <circle 
          key={i}
          cx={Math.random() * 1920} 
          cy={Math.random() * 1080} 
          r={Math.random() * 2 + 0.5} 
          fill="white"
          opacity={Math.random() * 0.5 + 0.3}
        >
          <animate 
            attributeName="opacity" 
            values={`${Math.random() * 0.3 + 0.3};${Math.random() * 0.5 + 0.5};${Math.random() * 0.3 + 0.3}`}
            dur={`${Math.random() * 3 + 2}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      
      {/* Nebula clouds */}
      <ellipse cx="300" cy="200" rx="200" ry="100" fill="hsl(280, 60%, 40%)" opacity="0.15" />
      <ellipse cx="400" cy="180" rx="150" ry="80" fill="hsl(200, 70%, 50%)" opacity="0.1" />
      <ellipse cx="1500" cy="800" rx="250" ry="120" fill="hsl(330, 60%, 45%)" opacity="0.12" />
      <ellipse cx="1600" cy="850" rx="180" ry="90" fill="hsl(270, 50%, 40%)" opacity="0.1" />
      
      {/* Big Planet (Background) */}
      <g className="animate-float-gentle" style={{ animationDelay: '0s' }}>
        <circle cx="1650" cy="250" r="150" fill="url(#planet1)" opacity="0.6" />
        {/* Planet ring */}
        <ellipse cx="1650" cy="250" rx="220" ry="40" fill="none" stroke="hsl(30, 60%, 70%)" strokeWidth="8" opacity="0.4" />
      </g>
      
      {/* Small Blue Planet */}
      <g className="animate-float-gentle" style={{ animationDelay: '1s' }}>
        <circle cx="200" cy="700" r="80" fill="url(#planet2)" opacity="0.7" />
      </g>
      
      {/* Moon */}
      <g className="animate-float-gentle" style={{ animationDelay: '2s' }}>
        <circle cx="1100" cy="150" r="50" fill="url(#moonGradient)" opacity="0.9" />
        {/* Moon craters */}
        <circle cx="1090" cy="140" r="8" fill="hsl(45, 20%, 55%)" opacity="0.5" />
        <circle cx="1110" cy="160" r="5" fill="hsl(45, 20%, 55%)" opacity="0.5" />
        <circle cx="1080" cy="165" r="6" fill="hsl(45, 20%, 55%)" opacity="0.5" />
      </g>
      
      {/* Rocket */}
      <g className="animate-float-gentle" style={{ animationDelay: '0.5s' }}>
        <path d="M 100 500 L 120 450 L 140 500 L 130 500 L 130 530 L 110 530 L 110 500 Z" fill="hsl(0, 0%, 90%)" />
        <circle cx="120" cy="475" r="8" fill="hsl(200, 80%, 50%)" />
        <path d="M 100 500 L 95 520 L 110 505 Z" fill="hsl(0, 70%, 50%)" />
        <path d="M 140 500 L 145 520 L 130 505 Z" fill="hsl(0, 70%, 50%)" />
        {/* Flame */}
        <path d="M 110 530 Q 120 560 130 530" fill="hsl(30, 100%, 55%)" opacity="0.8">
          <animate attributeName="d" values="M 110 530 Q 120 560 130 530;M 110 530 Q 120 570 130 530;M 110 530 Q 120 560 130 530" dur="0.3s" repeatCount="indefinite" />
        </path>
      </g>
      
      {/* Flying Saucer */}
      <g className="animate-float-gentle" style={{ animationDelay: '1.5s' }}>
        <ellipse cx="1750" cy="600" rx="50" ry="15" fill="hsl(200, 60%, 50%)" />
        <ellipse cx="1750" cy="590" rx="25" ry="20" fill="hsl(200, 70%, 60%)" />
        <ellipse cx="1750" cy="595" rx="15" ry="10" fill="hsl(180, 100%, 80%)" opacity="0.6" />
        {/* Lights */}
        <circle cx="1720" cy="600" r="4" fill="hsl(120, 100%, 60%)">
          <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="1750" cy="605" r="4" fill="hsl(45, 100%, 60%)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="1780" cy="600" r="4" fill="hsl(0, 100%, 60%)">
          <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* Shooting Star */}
      <g opacity="0.8">
        <line x1="600" y1="100" x2="700" y2="150" stroke="white" strokeWidth="2">
          <animate attributeName="x1" values="600;1200;600" dur="8s" repeatCount="indefinite" />
          <animate attributeName="y1" values="100;300;100" dur="8s" repeatCount="indefinite" />
          <animate attributeName="x2" values="700;1300;700" dur="8s" repeatCount="indefinite" />
          <animate attributeName="y2" values="150;350;150" dur="8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" dur="8s" repeatCount="indefinite" />
        </line>
      </g>
    </svg>
  );
};
