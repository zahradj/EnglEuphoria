import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  /** Optional fixed destination. If omitted, falls back to history.back(). */
  to?: string;
  label?: string;
  className?: string;
}

/**
 * Universal "Go back" pill used across student/teacher/creator pages so every
 * sub-page has a clear way back to the dashboard it was opened from.
 */
export function BackButton({ to, label = 'Back to dashboard', className }: BackButtonProps) {
  const navigate = useNavigate();
  const onClick = () => {
    if (to) {
      navigate(to);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`gap-2 text-muted-foreground hover:text-foreground ${className ?? ''}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}

export default BackButton;
