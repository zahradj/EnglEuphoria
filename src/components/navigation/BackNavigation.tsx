import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BackNavigationProps {
  to?: string;
  label?: string;
  onClick?: () => void;
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
}

export const BackNavigation: React.FC<BackNavigationProps> = ({
  to,
  label = 'Go Back',
  onClick,
  variant = 'ghost',
  className = ''
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      className={`flex items-center gap-2 mb-4 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
};