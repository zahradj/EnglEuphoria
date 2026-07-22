import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '@/hooks/useThemeMode';
import logoBlack from '@/assets/logo-black.png';
import logoWhite from '@/assets/logo-white.png';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'gradient' | 'white';
  onClick?: () => void;
  className?: string;
}

const SIZE_HEIGHTS: Record<NonNullable<LogoProps['size']>, string> = {
  small: 'h-7',
  medium: 'h-9',
  large: 'h-11',
  xlarge: 'h-14',
};

export const Logo: React.FC<LogoProps> = ({
  size = 'large',
  variant,
  onClick,
  className = '',
}) => {
  const navigate = useNavigate();
  const { resolvedTheme } = useThemeMode();

  // `variant="white"` forces the white wordmark (e.g. on dark hero overlays).
  // Otherwise we follow the active theme.
  const src =
    variant === 'white'
      ? logoWhite
      : resolvedTheme === 'dark'
        ? logoWhite
        : logoBlack;

  const handleClick = () => {
    if (onClick) onClick();
    else navigate('/');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="EnglEuphoria home"
      className={`inline-flex items-center cursor-pointer transition-transform hover:scale-105 ${className}`}
    >
      <img
        src={src}
        alt="EnglEuphoria"
        className={`${SIZE_HEIGHTS[size]} w-auto object-contain select-none`}
        draggable={false}
      />
    </button>
  );
};
