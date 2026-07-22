import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

const TypewriterText = ({ text, speed, onComplete }: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const charSpeed = speed ?? (text.length < 50 ? 50 : 30);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, charSpeed);

    return () => clearInterval(interval);
  }, [text, charSpeed]);

  return (
    <span>
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-white/80 ml-0.5 animate-pulse" />
      )}
    </span>
  );
};

export default TypewriterText;
