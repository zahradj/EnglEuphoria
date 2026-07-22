import React from 'react';

export const JungleTheme: React.FC = () => {
  return (
    <svg 
      className="absolute inset-0 w-full h-full" 
      viewBox="0 0 1920 1080" 
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Sky Gradient */}
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(200, 80%, 70%)" />
          <stop offset="60%" stopColor="hsl(180, 70%, 80%)" />
          <stop offset="100%" stopColor="hsl(120, 40%, 75%)" />
        </linearGradient>
        
        {/* Ground Gradient */}
        <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(120, 50%, 45%)" />
          <stop offset="100%" stopColor="hsl(120, 40%, 35%)" />
        </linearGradient>
        
        {/* Sun Gradient */}
        <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(50, 100%, 85%)" />
          <stop offset="50%" stopColor="hsl(45, 100%, 70%)" />
          <stop offset="100%" stopColor="hsl(40, 100%, 55%)" />
        </radialGradient>
        
        {/* Sun Glow */}
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(45, 100%, 70%)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(45, 100%, 70%)" stopOpacity="0" />
        </radialGradient>
        
        {/* Tree Trunk Gradients */}
        <linearGradient id="trunkGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(25, 50%, 25%)" />
          <stop offset="30%" stopColor="hsl(25, 45%, 35%)" />
          <stop offset="70%" stopColor="hsl(25, 45%, 35%)" />
          <stop offset="100%" stopColor="hsl(25, 50%, 22%)" />
        </linearGradient>
        
        <linearGradient id="trunkGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(20, 45%, 22%)" />
          <stop offset="40%" stopColor="hsl(20, 40%, 32%)" />
          <stop offset="60%" stopColor="hsl(20, 40%, 32%)" />
          <stop offset="100%" stopColor="hsl(20, 45%, 20%)" />
        </linearGradient>
        
        {/* Foliage Gradients */}
        <radialGradient id="foliageGradient1" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="hsl(115, 55%, 50%)" />
          <stop offset="60%" stopColor="hsl(120, 50%, 40%)" />
          <stop offset="100%" stopColor="hsl(125, 45%, 30%)" />
        </radialGradient>
        
        <radialGradient id="foliageGradient2" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="hsl(110, 60%, 55%)" />
          <stop offset="50%" stopColor="hsl(115, 55%, 45%)" />
          <stop offset="100%" stopColor="hsl(120, 50%, 35%)" />
        </radialGradient>
        
        <radialGradient id="foliageGradient3" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="hsl(105, 65%, 60%)" />
          <stop offset="60%" stopColor="hsl(115, 55%, 45%)" />
          <stop offset="100%" stopColor="hsl(125, 45%, 32%)" />
        </radialGradient>
        
        <radialGradient id="foliageDark" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(130, 45%, 28%)" />
          <stop offset="100%" stopColor="hsl(130, 40%, 20%)" />
        </radialGradient>
        
        {/* Cloud Gradients */}
        <radialGradient id="cloudGradient1" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="hsl(0, 0%, 100%)" />
          <stop offset="70%" stopColor="hsl(210, 20%, 95%)" />
          <stop offset="100%" stopColor="hsl(210, 25%, 88%)" />
        </radialGradient>
        
        <radialGradient id="cloudGradient2" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="hsl(0, 0%, 100%)" />
          <stop offset="60%" stopColor="hsl(200, 15%, 96%)" />
          <stop offset="100%" stopColor="hsl(200, 20%, 90%)" />
        </radialGradient>
        
        <linearGradient id="cloudShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(210, 30%, 85%)" stopOpacity="0" />
          <stop offset="100%" stopColor="hsl(210, 30%, 75%)" stopOpacity="0.4" />
        </linearGradient>
        
        {/* Fruit Gradients */}
        <radialGradient id="appleGradient" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="hsl(0, 85%, 60%)" />
          <stop offset="100%" stopColor="hsl(0, 80%, 45%)" />
        </radialGradient>
        
        <radialGradient id="orangeGradient" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="hsl(35, 100%, 60%)" />
          <stop offset="100%" stopColor="hsl(25, 100%, 50%)" />
        </radialGradient>
        
        {/* Sparkle Gradient */}
        <radialGradient id="sparkleGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(50, 100%, 90%)" />
          <stop offset="50%" stopColor="hsl(45, 100%, 75%)" />
          <stop offset="100%" stopColor="hsl(45, 100%, 70%)" stopOpacity="0" />
        </radialGradient>
        
        {/* Vine Gradient */}
        <linearGradient id="vineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(130, 50%, 35%)" />
          <stop offset="100%" stopColor="hsl(120, 45%, 28%)" />
        </linearGradient>
      </defs>
      
      {/* Sky */}
      <rect width="100%" height="100%" fill="url(#skyGradient)" />
      
      {/* Sun with Glow */}
      <circle cx="1700" cy="150" r="180" fill="url(#sunGlow)">
        <animate attributeName="r" values="180;200;180" dur="6s" repeatCount="indefinite" />
      </circle>
      <circle cx="1700" cy="150" r="100" fill="url(#sunGradient)">
        <animate attributeName="r" values="100;105;100" dur="4s" repeatCount="indefinite" />
      </circle>
      
      {/* Sun Rays */}
      <g opacity="0.3">
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="1700"
            y1="150"
            x2={1700 + Math.cos((i * 30 * Math.PI) / 180) * 250}
            y2={150 + Math.sin((i * 30 * Math.PI) / 180) * 250}
            stroke="hsl(45, 100%, 70%)"
            strokeWidth="3"
            opacity="0.5"
          >
            <animate 
              attributeName="opacity" 
              values="0.3;0.6;0.3" 
              dur={`${3 + i * 0.2}s`} 
              repeatCount="indefinite" 
            />
          </line>
        ))}
      </g>
      
      {/* Enhanced Fluffy Clouds */}
      {/* Cloud 1 - Large fluffy cloud */}
      <g className="animate-float-gentle">
        {/* Shadow layer */}
        <ellipse cx="320" cy="145" rx="100" ry="35" fill="url(#cloudShadow)" />
        {/* Main cloud body */}
        <ellipse cx="280" cy="130" rx="60" ry="45" fill="url(#cloudGradient1)" />
        <ellipse cx="330" cy="110" rx="75" ry="55" fill="url(#cloudGradient2)" />
        <ellipse cx="390" cy="125" rx="55" ry="40" fill="url(#cloudGradient1)" />
        <ellipse cx="300" cy="105" rx="50" ry="40" fill="white" />
        <ellipse cx="360" cy="95" rx="60" ry="45" fill="white" />
        <ellipse cx="340" cy="115" rx="40" ry="30" fill="white" />
        {/* Highlight puffs */}
        <ellipse cx="315" cy="90" rx="25" ry="20" fill="white" opacity="0.9" />
        <ellipse cx="375" cy="85" rx="30" ry="22" fill="white" opacity="0.9" />
      </g>
      
      {/* Cloud 2 - Medium cloud */}
      <g className="animate-float-gentle" style={{ animationDelay: '1.5s' }}>
        <ellipse cx="920" cy="95" rx="80" ry="28" fill="url(#cloudShadow)" />
        <ellipse cx="880" cy="75" rx="50" ry="38" fill="url(#cloudGradient2)" />
        <ellipse cx="930" cy="60" rx="65" ry="45" fill="url(#cloudGradient1)" />
        <ellipse cx="980" cy="75" rx="45" ry="35" fill="url(#cloudGradient2)" />
        <ellipse cx="910" cy="55" rx="40" ry="32" fill="white" />
        <ellipse cx="950" cy="50" rx="45" ry="35" fill="white" />
        <ellipse cx="895" cy="45" rx="22" ry="18" fill="white" opacity="0.9" />
      </g>
      
      {/* Cloud 3 - Small wispy cloud */}
      <g className="animate-float-gentle" style={{ animationDelay: '3s' }}>
        <ellipse cx="1420" cy="165" rx="65" ry="22" fill="url(#cloudShadow)" />
        <ellipse cx="1390" cy="150" rx="45" ry="32" fill="url(#cloudGradient1)" />
        <ellipse cx="1440" cy="140" rx="55" ry="38" fill="url(#cloudGradient2)" />
        <ellipse cx="1480" cy="152" rx="35" ry="28" fill="url(#cloudGradient1)" />
        <ellipse cx="1420" cy="135" rx="35" ry="28" fill="white" />
        <ellipse cx="1455" cy="130" rx="30" ry="24" fill="white" />
      </g>
      
      {/* Cloud 4 - Tiny accent cloud */}
      <g className="animate-float-gentle" style={{ animationDelay: '2s' }}>
        <ellipse cx="600" cy="180" rx="40" ry="15" fill="url(#cloudShadow)" />
        <ellipse cx="580" cy="168" rx="30" ry="22" fill="url(#cloudGradient1)" />
        <ellipse cx="615" cy="160" rx="35" ry="25" fill="white" />
        <ellipse cx="640" cy="170" rx="25" ry="18" fill="url(#cloudGradient2)" />
      </g>
      
      {/* Cloud 5 - Far background cloud */}
      <g className="animate-float-gentle" style={{ animationDelay: '4s' }} opacity="0.7">
        <ellipse cx="1150" cy="200" rx="55" ry="18" fill="url(#cloudShadow)" />
        <ellipse cx="1120" cy="188" rx="40" ry="28" fill="url(#cloudGradient2)" />
        <ellipse cx="1160" cy="180" rx="50" ry="32" fill="white" />
        <ellipse cx="1195" cy="190" rx="32" ry="22" fill="url(#cloudGradient1)" />
      </g>
      
      {/* Background Trees (Far) */}
      <g opacity="0.5">
        {/* Far tree 1 */}
        <rect x="50" y="450" width="25" height="150" fill="hsl(25, 35%, 25%)" rx="3" />
        <ellipse cx="62" cy="420" rx="50" ry="65" fill="hsl(130, 40%, 28%)" />
        <ellipse cx="55" cy="400" rx="40" ry="50" fill="hsl(125, 45%, 32%)" />
        <ellipse cx="70" cy="410" rx="35" ry="45" fill="hsl(120, 40%, 30%)" />
        
        {/* Far tree 2 */}
        <rect x="180" y="420" width="30" height="180" fill="hsl(20, 35%, 23%)" rx="4" />
        <ellipse cx="195" cy="380" rx="60" ry="80" fill="hsl(130, 38%, 26%)" />
        <ellipse cx="185" cy="360" rx="50" ry="65" fill="hsl(125, 42%, 30%)" />
        <ellipse cx="205" cy="370" rx="45" ry="55" fill="hsl(120, 38%, 28%)" />
      </g>
      
      {/* Enhanced Trees with Multi-layered Foliage */}
      {/* Tree 1 - Left side large tree */}
      <g>
        {/* Trunk with texture */}
        <path 
          d="M 85 600 L 95 380 Q 100 370 110 370 Q 120 370 125 380 L 135 600 Q 110 610 85 600" 
          fill="url(#trunkGradient1)" 
        />
        {/* Bark texture lines */}
        <path d="M 100 580 Q 105 520 102 450" stroke="hsl(25, 40%, 22%)" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M 115 590 Q 112 530 118 460" stroke="hsl(25, 40%, 22%)" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M 108 500 Q 115 480 105 455" stroke="hsl(25, 35%, 20%)" strokeWidth="1.5" fill="none" opacity="0.4" />
        
        {/* Tree knot */}
        <ellipse cx="108" cy="520" rx="8" ry="12" fill="hsl(25, 45%, 20%)" />
        <ellipse cx="108" cy="520" rx="5" ry="8" fill="hsl(25, 40%, 15%)" />
        
        {/* Roots */}
        <path d="M 85 600 Q 70 610 60 620" stroke="url(#trunkGradient1)" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M 135 600 Q 150 615 165 625" stroke="url(#trunkGradient1)" strokeWidth="10" fill="none" strokeLinecap="round" />
        
        {/* Multi-layered foliage */}
        <ellipse cx="110" cy="350" rx="100" ry="120" fill="url(#foliageDark)" />
        <ellipse cx="80" cy="320" rx="70" ry="85" fill="url(#foliageGradient1)" />
        <ellipse cx="140" cy="330" rx="75" ry="90" fill="url(#foliageGradient2)" />
        <ellipse cx="100" cy="290" rx="65" ry="75" fill="url(#foliageGradient3)" />
        <ellipse cx="130" cy="280" rx="55" ry="65" fill="url(#foliageGradient1)" />
        <ellipse cx="90" cy="260" rx="45" ry="55" fill="url(#foliageGradient3)" />
        
        {/* Highlight leaves */}
        <ellipse cx="70" cy="280" rx="25" ry="30" fill="hsl(110, 60%, 55%)" opacity="0.7" />
        <ellipse cx="145" cy="290" rx="20" ry="25" fill="hsl(105, 65%, 58%)" opacity="0.6" />
        
        {/* Fruits */}
        <circle cx="65" cy="340" r="10" fill="url(#appleGradient)" />
        <circle cx="62" cy="336" r="3" fill="hsl(0, 80%, 75%)" opacity="0.6" />
        <circle cx="150" cy="360" r="9" fill="url(#appleGradient)" />
        <circle cx="147" cy="356" r="2.5" fill="hsl(0, 80%, 75%)" opacity="0.6" />
        <circle cx="95" cy="380" r="8" fill="url(#orangeGradient)" />
        
        {/* Hanging vine */}
        <path 
          d="M 55 320 Q 45 380 55 420 Q 65 460 50 500" 
          stroke="url(#vineGradient)" 
          strokeWidth="4" 
          fill="none"
          strokeLinecap="round"
        >
          <animate attributeName="d" 
            values="M 55 320 Q 45 380 55 420 Q 65 460 50 500;M 55 320 Q 50 380 60 420 Q 60 460 55 500;M 55 320 Q 45 380 55 420 Q 65 460 50 500" 
            dur="4s" 
            repeatCount="indefinite" 
          />
        </path>
        {/* Vine leaves */}
        <ellipse cx="48" cy="400" rx="8" ry="5" fill="hsl(125, 50%, 40%)" transform="rotate(-20 48 400)" />
        <ellipse cx="58" cy="450" rx="7" ry="4" fill="hsl(120, 50%, 38%)" transform="rotate(15 58 450)" />
      </g>
      
      {/* Tree 2 - Left-center large tree */}
      <g>
        {/* Trunk */}
        <path 
          d="M 280 600 L 295 320 Q 305 305 320 305 Q 335 305 345 320 L 360 600 Q 320 615 280 600" 
          fill="url(#trunkGradient2)" 
        />
        {/* Bark texture */}
        <path d="M 305 580 Q 310 480 305 380" stroke="hsl(20, 35%, 18%)" strokeWidth="2.5" fill="none" opacity="0.5" />
        <path d="M 330 590 Q 325 500 335 400" stroke="hsl(20, 35%, 18%)" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M 318 450 Q 325 420 315 380" stroke="hsl(20, 30%, 16%)" strokeWidth="1.5" fill="none" opacity="0.4" />
        
        {/* Knots */}
        <ellipse cx="315" cy="480" rx="10" ry="14" fill="hsl(20, 40%, 18%)" />
        <ellipse cx="315" cy="480" rx="6" ry="9" fill="hsl(20, 35%, 12%)" />
        <ellipse cx="335" cy="550" rx="7" ry="10" fill="hsl(20, 40%, 18%)" />
        
        {/* Roots */}
        <path d="M 280 600 Q 255 620 235 640" stroke="url(#trunkGradient2)" strokeWidth="15" fill="none" strokeLinecap="round" />
        <path d="M 360 600 Q 385 625 410 645" stroke="url(#trunkGradient2)" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M 295 605 Q 280 630 270 660" stroke="url(#trunkGradient2)" strokeWidth="8" fill="none" strokeLinecap="round" />
        
        {/* Multi-layered foliage - bigger tree */}
        <ellipse cx="320" cy="280" rx="130" ry="150" fill="url(#foliageDark)" />
        <ellipse cx="270" cy="250" rx="90" ry="110" fill="url(#foliageGradient1)" />
        <ellipse cx="370" cy="260" rx="95" ry="115" fill="url(#foliageGradient2)" />
        <ellipse cx="310" cy="210" rx="85" ry="100" fill="url(#foliageGradient3)" />
        <ellipse cx="350" cy="200" rx="70" ry="85" fill="url(#foliageGradient1)" />
        <ellipse cx="280" cy="180" rx="60" ry="70" fill="url(#foliageGradient3)" />
        <ellipse cx="330" cy="170" rx="50" ry="60" fill="url(#foliageGradient2)" />
        
        {/* Highlight clusters */}
        <ellipse cx="250" cy="220" rx="30" ry="35" fill="hsl(110, 58%, 52%)" opacity="0.7" />
        <ellipse cx="390" cy="230" rx="25" ry="30" fill="hsl(105, 62%, 55%)" opacity="0.6" />
        <ellipse cx="320" cy="150" rx="22" ry="28" fill="hsl(108, 60%, 58%)" opacity="0.65" />
        
        {/* Fruits scattered */}
        <circle cx="240" cy="280" r="11" fill="url(#appleGradient)" />
        <circle cx="237" cy="276" r="3" fill="hsl(0, 80%, 75%)" opacity="0.6" />
        <circle cx="400" cy="300" r="10" fill="url(#orangeGradient)" />
        <circle cx="310" cy="320" r="9" fill="url(#appleGradient)" />
        <circle cx="360" cy="280" r="8" fill="url(#orangeGradient)" />
        
        {/* Branch peeking out */}
        <path d="M 380 260 Q 420 250 450 270" stroke="hsl(25, 45%, 30%)" strokeWidth="8" fill="none" strokeLinecap="round" />
        <ellipse cx="455" cy="268" rx="25" ry="20" fill="url(#foliageGradient2)" />
        <ellipse cx="460" cy="262" rx="18" ry="15" fill="url(#foliageGradient3)" />
        
        {/* Vines */}
        <path 
          d="M 230 270 Q 210 340 225 400 Q 240 450 220 520" 
          stroke="url(#vineGradient)" 
          strokeWidth="5" 
          fill="none"
          strokeLinecap="round"
        >
          <animate attributeName="d" 
            values="M 230 270 Q 210 340 225 400 Q 240 450 220 520;M 230 270 Q 220 340 230 400 Q 235 450 225 520;M 230 270 Q 210 340 225 400 Q 240 450 220 520" 
            dur="5s" 
            repeatCount="indefinite" 
          />
        </path>
        <ellipse cx="218" cy="360" rx="10" ry="6" fill="hsl(125, 50%, 40%)" transform="rotate(-25 218 360)" />
        <ellipse cx="230" cy="420" rx="9" ry="5" fill="hsl(120, 50%, 38%)" transform="rotate(10 230 420)" />
        <ellipse cx="222" cy="480" rx="8" ry="5" fill="hsl(125, 48%, 42%)" transform="rotate(-15 222 480)" />
      </g>
      
      {/* Tree 3 - Right side tree */}
      <g>
        {/* Trunk */}
        <path 
          d="M 1580 600 L 1595 360 Q 1605 345 1620 345 Q 1635 345 1645 360 L 1660 600 Q 1620 615 1580 600" 
          fill="url(#trunkGradient1)" 
        />
        {/* Bark texture */}
        <path d="M 1605 580 Q 1610 500 1605 420" stroke="hsl(25, 40%, 22%)" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M 1630 590 Q 1625 510 1632 430" stroke="hsl(25, 40%, 22%)" strokeWidth="2" fill="none" opacity="0.5" />
        
        {/* Knot */}
        <ellipse cx="1618" cy="500" rx="9" ry="13" fill="hsl(25, 45%, 20%)" />
        <ellipse cx="1618" cy="500" rx="5" ry="8" fill="hsl(25, 40%, 15%)" />
        
        {/* Roots */}
        <path d="M 1580 600 Q 1555 620 1535 640" stroke="url(#trunkGradient1)" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M 1660 600 Q 1685 618 1710 635" stroke="url(#trunkGradient1)" strokeWidth="10" fill="none" strokeLinecap="round" />
        
        {/* Multi-layered foliage */}
        <ellipse cx="1620" cy="320" rx="115" ry="135" fill="url(#foliageDark)" />
        <ellipse cx="1570" cy="290" rx="80" ry="100" fill="url(#foliageGradient1)" />
        <ellipse cx="1670" cy="300" rx="85" ry="105" fill="url(#foliageGradient2)" />
        <ellipse cx="1610" cy="250" rx="75" ry="90" fill="url(#foliageGradient3)" />
        <ellipse cx="1660" cy="240" rx="65" ry="80" fill="url(#foliageGradient1)" />
        <ellipse cx="1590" cy="220" rx="55" ry="65" fill="url(#foliageGradient3)" />
        
        {/* Highlights */}
        <ellipse cx="1540" cy="270" rx="28" ry="32" fill="hsl(110, 58%, 52%)" opacity="0.7" />
        <ellipse cx="1690" cy="280" rx="24" ry="28" fill="hsl(105, 62%, 55%)" opacity="0.6" />
        
        {/* Fruits */}
        <circle cx="1550" cy="310" r="10" fill="url(#appleGradient)" />
        <circle cx="1680" cy="340" r="9" fill="url(#orangeGradient)" />
        <circle cx="1620" cy="360" r="8" fill="url(#appleGradient)" />
        
        {/* Vine */}
        <path 
          d="M 1700 290 Q 1720 350 1705 420 Q 1690 480 1710 540" 
          stroke="url(#vineGradient)" 
          strokeWidth="4" 
          fill="none"
          strokeLinecap="round"
        >
          <animate attributeName="d" 
            values="M 1700 290 Q 1720 350 1705 420 Q 1690 480 1710 540;M 1700 290 Q 1715 350 1710 420 Q 1695 480 1705 540;M 1700 290 Q 1720 350 1705 420 Q 1690 480 1710 540" 
            dur="4.5s" 
            repeatCount="indefinite" 
          />
        </path>
        <ellipse cx="1712" cy="380" rx="8" ry="5" fill="hsl(125, 50%, 40%)" transform="rotate(20 1712 380)" />
        <ellipse cx="1700" cy="450" rx="7" ry="4" fill="hsl(120, 50%, 38%)" transform="rotate(-10 1700 450)" />
      </g>
      
      {/* Tree 4 - Far right smaller tree */}
      <g>
        {/* Trunk */}
        <path 
          d="M 1750 600 L 1760 420 Q 1768 410 1778 410 Q 1788 410 1796 420 L 1806 600 Q 1778 612 1750 600" 
          fill="url(#trunkGradient2)" 
        />
        {/* Bark */}
        <path d="M 1770 580 Q 1773 520 1770 460" stroke="hsl(20, 35%, 18%)" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M 1785 585 Q 1782 530 1786 470" stroke="hsl(20, 35%, 18%)" strokeWidth="1.5" fill="none" opacity="0.5" />
        
        {/* Roots */}
        <path d="M 1750 600 Q 1735 615 1720 630" stroke="url(#trunkGradient2)" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M 1806 600 Q 1825 612 1845 625" stroke="url(#trunkGradient2)" strokeWidth="7" fill="none" strokeLinecap="round" />
        
        {/* Foliage */}
        <ellipse cx="1778" cy="385" rx="80" ry="100" fill="url(#foliageDark)" />
        <ellipse cx="1748" cy="360" rx="55" ry="70" fill="url(#foliageGradient1)" />
        <ellipse cx="1808" cy="370" rx="60" ry="75" fill="url(#foliageGradient2)" />
        <ellipse cx="1770" cy="330" rx="50" ry="60" fill="url(#foliageGradient3)" />
        <ellipse cx="1800" cy="320" rx="42" ry="52" fill="url(#foliageGradient1)" />
        
        {/* Highlights */}
        <ellipse cx="1730" cy="340" rx="18" ry="22" fill="hsl(110, 58%, 52%)" opacity="0.7" />
        
        {/* Fruits */}
        <circle cx="1820" cy="380" r="7" fill="url(#orangeGradient)" />
        <circle cx="1755" cy="400" r="6" fill="url(#appleGradient)" />
      </g>
      
      {/* Ground */}
      <path 
        d="M 0 650 Q 200 600 400 650 T 800 630 T 1200 660 T 1600 640 T 1920 660 L 1920 1080 L 0 1080 Z" 
        fill="url(#groundGradient)" 
      />
      
      {/* Enhanced Grass details */}
      <g fill="none" stroke="hsl(120, 55%, 40%)" strokeWidth="3" strokeLinecap="round">
        <path d="M 50 660 Q 55 635 60 660" />
        <path d="M 60 658 Q 68 630 75 658" />
        <path d="M 150 655 Q 155 625 160 655" />
        <path d="M 162 653 Q 172 622 180 653" />
        <path d="M 250 665 Q 255 640 260 665" />
        <path d="M 268 662 Q 278 635 286 662" />
        <path d="M 450 640 Q 455 610 460 640" />
        <path d="M 468 638 Q 478 608 486 638" />
        <path d="M 550 655 Q 555 625 560 655" />
        <path d="M 650 660 Q 655 630 660 660" />
        <path d="M 668 657 Q 678 627 686 657" />
        <path d="M 750 650 Q 755 620 760 650" />
        <path d="M 850 645 Q 855 615 860 645" />
        <path d="M 868 643 Q 878 613 886 643" />
        <path d="M 950 660 Q 955 630 960 660" />
        <path d="M 1050 665 Q 1055 635 1060 665" />
        <path d="M 1068 663 Q 1078 633 1086 663" />
        <path d="M 1150 655 Q 1155 625 1160 655" />
        <path d="M 1250 655 Q 1255 625 1260 655" />
        <path d="M 1268 653 Q 1278 623 1286 653" />
        <path d="M 1350 665 Q 1355 635 1360 665" />
        <path d="M 1450 670 Q 1455 640 1460 670" />
        <path d="M 1468 668 Q 1478 638 1486 668" />
        <path d="M 1550 655 Q 1555 625 1560 655" />
        <path d="M 1650 650 Q 1655 620 1660 650" />
        <path d="M 1668 648 Q 1678 618 1686 648" />
        <path d="M 1750 660 Q 1755 630 1760 660" />
        <path d="M 1850 665 Q 1855 635 1860 665" />
        <path d="M 1868 663 Q 1878 633 1886 663" />
      </g>
      
      {/* Enhanced Decorative flowers */}
      <g>
        {/* Flower 1 - Pink */}
        <circle cx="180" cy="680" r="10" fill="hsl(330, 80%, 65%)" />
        <circle cx="173" cy="673" r="6" fill="hsl(330, 85%, 75%)" opacity="0.7" />
        <circle cx="180" cy="680" r="5" fill="hsl(45, 100%, 55%)" />
        <path d="M 180 690 L 180 720" stroke="hsl(120, 50%, 35%)" strokeWidth="3" />
        <ellipse cx="188" cy="705" rx="8" ry="4" fill="hsl(120, 50%, 40%)" transform="rotate(30 188 705)" />
        
        {/* Flower 2 - Yellow */}
        <circle cx="520" cy="665" r="11" fill="hsl(45, 100%, 55%)" />
        <circle cx="513" cy="658" r="6" fill="hsl(45, 100%, 75%)" opacity="0.7" />
        <circle cx="520" cy="665" r="5" fill="hsl(30, 100%, 50%)" />
        <path d="M 520 676 L 520 708" stroke="hsl(120, 50%, 35%)" strokeWidth="3" />
        <ellipse cx="512" cy="692" rx="7" ry="4" fill="hsl(120, 50%, 40%)" transform="rotate(-25 512 692)" />
        
        {/* Flower 3 - Purple */}
        <circle cx="780" cy="655" r="9" fill="hsl(280, 70%, 60%)" />
        <circle cx="774" cy="649" r="5" fill="hsl(280, 75%, 75%)" opacity="0.7" />
        <circle cx="780" cy="655" r="4" fill="hsl(45, 100%, 55%)" />
        <path d="M 780 664 L 780 695" stroke="hsl(120, 50%, 35%)" strokeWidth="2.5" />
        
        {/* Flower 4 - Red */}
        <circle cx="980" cy="675" r="10" fill="hsl(0, 80%, 60%)" />
        <circle cx="973" cy="668" r="6" fill="hsl(0, 85%, 75%)" opacity="0.7" />
        <circle cx="980" cy="675" r="5" fill="hsl(45, 100%, 55%)" />
        <path d="M 980 685 L 980 718" stroke="hsl(120, 50%, 35%)" strokeWidth="3" />
        <ellipse cx="988" cy="702" rx="8" ry="4" fill="hsl(120, 50%, 40%)" transform="rotate(20 988 702)" />
        
        {/* Flower 5 - Orange */}
        <circle cx="1180" cy="665" r="9" fill="hsl(25, 100%, 55%)" />
        <circle cx="1174" cy="659" r="5" fill="hsl(25, 100%, 75%)" opacity="0.7" />
        <circle cx="1180" cy="665" r="4" fill="hsl(45, 100%, 60%)" />
        <path d="M 1180 674 L 1180 705" stroke="hsl(120, 50%, 35%)" strokeWidth="2.5" />
        
        {/* Flower 6 - Blue */}
        <circle cx="1380" cy="685" r="10" fill="hsl(200, 80%, 60%)" />
        <circle cx="1373" cy="678" r="6" fill="hsl(200, 85%, 75%)" opacity="0.7" />
        <circle cx="1380" cy="685" r="5" fill="hsl(45, 100%, 55%)" />
        <path d="M 1380 695 L 1380 728" stroke="hsl(120, 50%, 35%)" strokeWidth="3" />
        <ellipse cx="1372" cy="712" rx="7" ry="4" fill="hsl(120, 50%, 40%)" transform="rotate(-30 1372 712)" />
        
        {/* Flower 7 - Light Purple */}
        <circle cx="1520" cy="670" r="8" fill="hsl(270, 70%, 65%)" />
        <circle cx="1514" cy="664" r="4.5" fill="hsl(270, 75%, 80%)" opacity="0.7" />
        <circle cx="1520" cy="670" r="4" fill="hsl(50, 100%, 55%)" />
        <path d="M 1520 678 L 1520 705" stroke="hsl(120, 50%, 35%)" strokeWidth="2.5" />
        
        {/* Flower 8 - Pink */}
        <circle cx="1720" cy="670" r="9" fill="hsl(340, 80%, 65%)" />
        <circle cx="1714" cy="664" r="5" fill="hsl(340, 85%, 78%)" opacity="0.7" />
        <circle cx="1720" cy="670" r="4" fill="hsl(45, 100%, 55%)" />
        <path d="M 1720 679 L 1720 710" stroke="hsl(120, 50%, 35%)" strokeWidth="2.5" />
      </g>
      
      {/* Magical Sparkles */}
      <g>
        {/* Sparkle 1 */}
        <circle cx="130" cy="320" r="6" fill="url(#sparkleGradient)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
          <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
        </circle>
        
        {/* Sparkle 2 */}
        <circle cx="380" cy="200" r="5" fill="url(#sparkleGradient)">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
          <animate attributeName="r" values="3;6;3" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        
        {/* Sparkle 3 */}
        <circle cx="280" cy="150" r="4" fill="url(#sparkleGradient)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" begin="1s" />
          <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" begin="1s" />
        </circle>
        
        {/* Sparkle 4 */}
        <circle cx="1650" cy="280" r="5" fill="url(#sparkleGradient)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.2s" repeatCount="indefinite" begin="0.3s" />
          <animate attributeName="r" values="3;6;3" dur="2.2s" repeatCount="indefinite" begin="0.3s" />
        </circle>
        
        {/* Sparkle 5 */}
        <circle cx="1800" cy="350" r="4" fill="url(#sparkleGradient)">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.8s" repeatCount="indefinite" begin="0.8s" />
          <animate attributeName="r" values="2;5;2" dur="2.8s" repeatCount="indefinite" begin="0.8s" />
        </circle>
        
        {/* Sparkle 6 */}
        <circle cx="460" cy="280" r="4" fill="url(#sparkleGradient)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.3s" repeatCount="indefinite" begin="1.2s" />
          <animate attributeName="r" values="2;5;2" dur="2.3s" repeatCount="indefinite" begin="1.2s" />
        </circle>
        
        {/* Sparkle 7 */}
        <circle cx="1580" cy="220" r="5" fill="url(#sparkleGradient)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.6s" repeatCount="indefinite" begin="0.6s" />
          <animate attributeName="r" values="3;6;3" dur="2.6s" repeatCount="indefinite" begin="0.6s" />
        </circle>
      </g>
      
      {/* Enhanced Butterflies */}
      <g className="animate-float-gentle">
        <g transform="translate(200, 400)">
          {/* Wing shadow */}
          <ellipse cx="10" cy="8" rx="18" ry="5" fill="hsl(0, 0%, 0%)" opacity="0.1" />
          {/* Left wing */}
          <path d="M 0 0 Q 10 -20 25 0 Q 10 20 0 0" fill="hsl(280, 70%, 60%)" opacity="0.9" />
          <path d="M 2 0 Q 10 -15 22 0 Q 10 15 2 0" fill="hsl(280, 80%, 70%)" opacity="0.7" />
          {/* Right wing */}
          <path d="M 25 0 Q 35 -20 50 0 Q 35 20 25 0" fill="hsl(330, 80%, 65%)" opacity="0.9" />
          <path d="M 28 0 Q 35 -15 47 0 Q 35 15 28 0" fill="hsl(330, 85%, 75%)" opacity="0.7" />
          {/* Body */}
          <ellipse cx="25" cy="0" rx="4" ry="10" fill="hsl(30, 40%, 25%)" />
          {/* Antennae */}
          <path d="M 23 -8 Q 18 -18 15 -22" stroke="hsl(30, 40%, 25%)" strokeWidth="1.5" fill="none" />
          <path d="M 27 -8 Q 32 -18 35 -22" stroke="hsl(30, 40%, 25%)" strokeWidth="1.5" fill="none" />
          <circle cx="15" cy="-22" r="2" fill="hsl(30, 40%, 25%)" />
          <circle cx="35" cy="-22" r="2" fill="hsl(30, 40%, 25%)" />
        </g>
      </g>
      
      <g className="animate-float-gentle" style={{ animationDelay: '1.5s' }}>
        <g transform="translate(1500, 300)">
          {/* Wing shadow */}
          <ellipse cx="10" cy="8" rx="15" ry="4" fill="hsl(0, 0%, 0%)" opacity="0.1" />
          {/* Left wing */}
          <path d="M 0 0 Q 8 -18 22 0 Q 8 18 0 0" fill="hsl(45, 100%, 55%)" opacity="0.9" />
          <path d="M 2 0 Q 8 -13 19 0 Q 8 13 2 0" fill="hsl(45, 100%, 70%)" opacity="0.7" />
          {/* Right wing */}
          <path d="M 22 0 Q 32 -18 44 0 Q 32 18 22 0" fill="hsl(30, 100%, 55%)" opacity="0.9" />
          <path d="M 25 0 Q 32 -13 41 0 Q 32 13 25 0" fill="hsl(30, 100%, 70%)" opacity="0.7" />
          {/* Body */}
          <ellipse cx="22" cy="0" rx="3.5" ry="9" fill="hsl(30, 45%, 22%)" />
          {/* Antennae */}
          <path d="M 20 -7 Q 16 -16 13 -19" stroke="hsl(30, 45%, 22%)" strokeWidth="1.2" fill="none" />
          <path d="M 24 -7 Q 28 -16 31 -19" stroke="hsl(30, 45%, 22%)" strokeWidth="1.2" fill="none" />
          <circle cx="13" cy="-19" r="1.8" fill="hsl(30, 45%, 22%)" />
          <circle cx="31" cy="-19" r="1.8" fill="hsl(30, 45%, 22%)" />
        </g>
      </g>
      
      {/* Third butterfly */}
      <g className="animate-float-gentle" style={{ animationDelay: '2.5s' }}>
        <g transform="translate(700, 350)">
          <ellipse cx="8" cy="6" rx="12" ry="3" fill="hsl(0, 0%, 0%)" opacity="0.1" />
          <path d="M 0 0 Q 6 -14 18 0 Q 6 14 0 0" fill="hsl(180, 70%, 50%)" opacity="0.9" />
          <path d="M 2 0 Q 6 -10 15 0 Q 6 10 2 0" fill="hsl(180, 80%, 65%)" opacity="0.7" />
          <path d="M 18 0 Q 26 -14 36 0 Q 26 14 18 0" fill="hsl(200, 80%, 55%)" opacity="0.9" />
          <path d="M 21 0 Q 26 -10 33 0 Q 26 10 21 0" fill="hsl(200, 85%, 70%)" opacity="0.7" />
          <ellipse cx="18" cy="0" rx="3" ry="7" fill="hsl(200, 40%, 20%)" />
          <path d="M 16 -6 Q 13 -13 11 -16" stroke="hsl(200, 40%, 20%)" strokeWidth="1" fill="none" />
          <path d="M 20 -6 Q 23 -13 25 -16" stroke="hsl(200, 40%, 20%)" strokeWidth="1" fill="none" />
          <circle cx="11" cy="-16" r="1.5" fill="hsl(200, 40%, 20%)" />
          <circle cx="25" cy="-16" r="1.5" fill="hsl(200, 40%, 20%)" />
        </g>
      </g>
      
      {/* Small bird silhouette */}
      <g className="animate-float-gentle" style={{ animationDelay: '3s' }}>
        <path 
          d="M 1300 180 Q 1310 175 1320 180 L 1325 183 Q 1335 178 1345 183 L 1340 188 Q 1330 193 1320 188 L 1315 185 Q 1305 190 1300 185 Z" 
          fill="hsl(30, 40%, 25%)" 
          opacity="0.6"
        />
      </g>
      
      <g className="animate-float-gentle" style={{ animationDelay: '3.5s' }}>
        <path 
          d="M 600 120 Q 608 116 616 120 L 620 122 Q 628 118 636 122 L 632 126 Q 624 130 616 126 L 612 124 Q 604 128 600 124 Z" 
          fill="hsl(30, 40%, 25%)" 
          opacity="0.5"
        />
      </g>
    </svg>
  );
};
