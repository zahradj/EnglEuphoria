import React from 'react';

export const UnderwaterTheme: React.FC = () => {
  return (
    <svg 
      className="absolute inset-0 w-full h-full" 
      viewBox="0 0 1920 1080" 
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Ocean Gradient */}
        <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(195, 80%, 50%)" />
          <stop offset="50%" stopColor="hsl(210, 70%, 35%)" />
          <stop offset="100%" stopColor="hsl(220, 60%, 20%)" />
        </linearGradient>
        
        {/* Sunlight rays */}
        <linearGradient id="lightRay" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(50, 100%, 90%)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(50, 100%, 90%)" stopOpacity="0" />
        </linearGradient>
        
        {/* Coral colors */}
        <linearGradient id="coral1" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="hsl(350, 80%, 50%)" />
          <stop offset="100%" stopColor="hsl(340, 70%, 65%)" />
        </linearGradient>
        
        <linearGradient id="coral2" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="hsl(30, 90%, 50%)" />
          <stop offset="100%" stopColor="hsl(40, 80%, 60%)" />
        </linearGradient>
        
        <linearGradient id="coral3" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="hsl(280, 60%, 50%)" />
          <stop offset="100%" stopColor="hsl(290, 50%, 65%)" />
        </linearGradient>
      </defs>
      
      {/* Ocean Background */}
      <rect width="100%" height="100%" fill="url(#oceanGradient)" />
      
      {/* Light rays from surface */}
      <polygon points="400,0 600,0 800,1080 200,1080" fill="url(#lightRay)" />
      <polygon points="1000,0 1200,0 1500,1080 700,1080" fill="url(#lightRay)" opacity="0.6" />
      <polygon points="1500,0 1650,0 1800,1080 1350,1080" fill="url(#lightRay)" opacity="0.4" />
      
      {/* Bubbles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <circle 
          key={i}
          cx={Math.random() * 1920} 
          cy={Math.random() * 1080} 
          r={Math.random() * 15 + 5} 
          fill="none"
          stroke="hsl(195, 80%, 80%)"
          strokeWidth="2"
          opacity={Math.random() * 0.3 + 0.2}
        >
          <animate 
            attributeName="cy" 
            values={`${800 + Math.random() * 280};${-50}`}
            dur={`${Math.random() * 8 + 6}s`}
            repeatCount="indefinite"
          />
          <animate 
            attributeName="cx" 
            values={`${Math.random() * 1920};${Math.random() * 1920 + (Math.random() > 0.5 ? 50 : -50)}`}
            dur={`${Math.random() * 8 + 6}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      
      {/* Seaweed */}
      <g>
        <path d="M 100 1080 Q 90 950 110 850 Q 130 750 100 650" stroke="hsl(120, 60%, 35%)" strokeWidth="12" fill="none" strokeLinecap="round">
          <animate attributeName="d" values="M 100 1080 Q 90 950 110 850 Q 130 750 100 650;M 100 1080 Q 110 950 90 850 Q 70 750 100 650;M 100 1080 Q 90 950 110 850 Q 130 750 100 650" dur="4s" repeatCount="indefinite" />
        </path>
        <path d="M 150 1080 Q 160 980 140 900 Q 120 820 150 750" stroke="hsl(130, 55%, 40%)" strokeWidth="10" fill="none" strokeLinecap="round">
          <animate attributeName="d" values="M 150 1080 Q 160 980 140 900 Q 120 820 150 750;M 150 1080 Q 140 980 160 900 Q 180 820 150 750;M 150 1080 Q 160 980 140 900 Q 120 820 150 750" dur="3.5s" repeatCount="indefinite" />
        </path>
        
        <path d="M 1750 1080 Q 1760 950 1740 850 Q 1720 750 1750 650" stroke="hsl(120, 60%, 35%)" strokeWidth="12" fill="none" strokeLinecap="round">
          <animate attributeName="d" values="M 1750 1080 Q 1760 950 1740 850 Q 1720 750 1750 650;M 1750 1080 Q 1740 950 1760 850 Q 1780 750 1750 650;M 1750 1080 Q 1760 950 1740 850 Q 1720 750 1750 650" dur="4.5s" repeatCount="indefinite" />
        </path>
        <path d="M 1820 1080 Q 1810 980 1830 900 Q 1850 820 1820 750" stroke="hsl(130, 55%, 40%)" strokeWidth="10" fill="none" strokeLinecap="round">
          <animate attributeName="d" values="M 1820 1080 Q 1810 980 1830 900 Q 1850 820 1820 750;M 1820 1080 Q 1830 980 1810 900 Q 1790 820 1820 750;M 1820 1080 Q 1810 980 1830 900 Q 1850 820 1820 750" dur="3.8s" repeatCount="indefinite" />
        </path>
      </g>
      
      {/* Sandy ocean floor */}
      <path 
        d="M 0 950 Q 300 920 600 950 T 1200 940 T 1800 960 T 1920 950 L 1920 1080 L 0 1080 Z" 
        fill="hsl(40, 50%, 55%)" 
      />
      <path 
        d="M 0 970 Q 300 950 600 970 T 1200 960 T 1800 980 T 1920 970 L 1920 1080 L 0 1080 Z" 
        fill="hsl(40, 45%, 45%)" 
      />
      
      {/* Coral Reef */}
      <g>
        {/* Coral 1 - Brain coral */}
        <ellipse cx="300" cy="950" rx="60" ry="40" fill="url(#coral1)" />
        <ellipse cx="280" cy="940" rx="15" ry="10" fill="hsl(350, 70%, 45%)" />
        <ellipse cx="310" cy="955" rx="12" ry="8" fill="hsl(350, 70%, 45%)" />
        <ellipse cx="330" cy="940" rx="10" ry="7" fill="hsl(350, 70%, 45%)" />
        
        {/* Coral 2 - Branching coral */}
        <path d="M 600 1000 Q 580 950 590 900 M 600 1000 Q 600 950 610 890 M 600 1000 Q 620 960 640 920" stroke="url(#coral2)" strokeWidth="15" fill="none" strokeLinecap="round" />
        
        {/* Coral 3 - Fan coral */}
        <ellipse cx="1300" cy="970" rx="80" ry="60" fill="url(#coral3)" opacity="0.8" />
        <path d="M 1260 970 Q 1300 920 1340 970" stroke="hsl(290, 50%, 55%)" strokeWidth="3" fill="none" />
        <path d="M 1250 985 Q 1300 945 1350 985" stroke="hsl(290, 50%, 55%)" strokeWidth="3" fill="none" />
        <path d="M 1245 1000 Q 1300 970 1355 1000" stroke="hsl(290, 50%, 55%)" strokeWidth="3" fill="none" />
        
        {/* Coral 4 */}
        <ellipse cx="1600" cy="960" rx="50" ry="35" fill="url(#coral1)" />
      </g>
      
      {/* Fish */}
      <g className="animate-float-gentle">
        {/* Clownfish */}
        <ellipse cx="500" cy="400" rx="40" ry="25" fill="hsl(25, 100%, 55%)" />
        <ellipse cx="500" cy="400" rx="30" ry="18" fill="white" opacity="0.3" />
        <path d="M 540 400 L 570 385 L 570 415 Z" fill="hsl(25, 100%, 55%)" />
        <circle cx="475" cy="395" r="5" fill="white" />
        <circle cx="477" cy="395" r="3" fill="black" />
        <line x1="485" y1="390" x2="485" y2="410" stroke="white" strokeWidth="4" />
        <line x1="510" y1="388" x2="510" y2="412" stroke="white" strokeWidth="4" />
      </g>
      
      <g className="animate-float-gentle" style={{ animationDelay: '1s' }}>
        {/* Blue tang */}
        <ellipse cx="1400" cy="300" rx="45" ry="30" fill="hsl(210, 90%, 50%)" />
        <path d="M 1445 300 L 1480 280 L 1480 320 Z" fill="hsl(210, 90%, 50%)" />
        <ellipse cx="1380" cy="295" rx="8" ry="5" fill="hsl(50, 100%, 60%)" />
        <circle cx="1370" cy="295" r="5" fill="white" />
        <circle cx="1372" cy="295" r="3" fill="black" />
      </g>
      
      <g className="animate-float-gentle" style={{ animationDelay: '2s' }}>
        {/* Yellow tang */}
        <ellipse cx="800" cy="600" rx="35" ry="25" fill="hsl(50, 100%, 55%)" />
        <path d="M 835 600 L 865 585 L 865 615 Z" fill="hsl(50, 100%, 55%)" />
        <circle cx="775" cy="595" r="4" fill="white" />
        <circle cx="777" cy="595" r="2" fill="black" />
      </g>
      
      {/* Jellyfish */}
      <g className="animate-float-gentle" style={{ animationDelay: '1.5s' }}>
        <ellipse cx="1700" cy="450" rx="40" ry="30" fill="hsl(300, 60%, 70%)" opacity="0.6" />
        <path d="M 1665 475 Q 1660 520 1670 560" stroke="hsl(300, 50%, 65%)" strokeWidth="3" fill="none" opacity="0.5">
          <animate attributeName="d" values="M 1665 475 Q 1660 520 1670 560;M 1665 475 Q 1655 520 1660 560;M 1665 475 Q 1660 520 1670 560" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M 1690 478 Q 1695 530 1685 570" stroke="hsl(300, 50%, 65%)" strokeWidth="3" fill="none" opacity="0.5">
          <animate attributeName="d" values="M 1690 478 Q 1695 530 1685 570;M 1690 478 Q 1700 530 1695 570;M 1690 478 Q 1695 530 1685 570" dur="2.2s" repeatCount="indefinite" />
        </path>
        <path d="M 1715 475 Q 1720 525 1710 565" stroke="hsl(300, 50%, 65%)" strokeWidth="3" fill="none" opacity="0.5">
          <animate attributeName="d" values="M 1715 475 Q 1720 525 1710 565;M 1715 475 Q 1725 525 1720 565;M 1715 475 Q 1720 525 1710 565" dur="1.8s" repeatCount="indefinite" />
        </path>
        <path d="M 1735 475 Q 1740 515 1730 555" stroke="hsl(300, 50%, 65%)" strokeWidth="3" fill="none" opacity="0.5">
          <animate attributeName="d" values="M 1735 475 Q 1740 515 1730 555;M 1735 475 Q 1745 515 1740 555;M 1735 475 Q 1740 515 1730 555" dur="2.1s" repeatCount="indefinite" />
        </path>
      </g>
      
      {/* Starfish */}
      <g transform="translate(700, 980) rotate(-15)">
        <path d="M 0 -25 L 7 -8 L 25 -8 L 12 5 L 15 22 L 0 12 L -15 22 L -12 5 L -25 -8 L -7 -8 Z" fill="hsl(15, 80%, 55%)" />
      </g>
      
      <g transform="translate(1100, 1000) rotate(10)">
        <path d="M 0 -20 L 5 -6 L 20 -6 L 10 4 L 12 18 L 0 10 L -12 18 L -10 4 L -20 -6 L -5 -6 Z" fill="hsl(330, 70%, 60%)" />
      </g>
      
      {/* Treasure Chest hint */}
      <g opacity="0.6">
        <rect x="1000" y="990" width="50" height="35" rx="5" fill="hsl(30, 60%, 35%)" />
        <rect x="1005" y="995" width="40" height="5" fill="hsl(45, 80%, 50%)" />
        <circle cx="1025" cy="1010" r="5" fill="hsl(45, 80%, 50%)" />
      </g>
    </svg>
  );
};
