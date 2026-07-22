import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useStudentHubTheme } from '@/hooks/useStudentHubTheme';
import { cn } from '@/lib/utils';

interface HubBackButtonProps {
  /** Where to go if there is no history. Defaults to the student's hub dashboard. */
  fallback?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Hub-themed back button used on library / sub-pages inside the
 * student dashboard. Tries `history.back()` and falls back to the
 * student hub dashboard.
 */
export function HubBackButton({ fallback, label = 'Back', className, onClick }: HubBackButtonProps) {
  const navigate = useNavigate();
  const theme = useStudentHubTheme();

  const fallbackRoute =
    fallback ??
    (theme.hubKey === 'playground'
      ? '/playground'
      : theme.hubKey === 'academy'
        ? '/academy'
        : '/dashboard/hub');

  const handleClick = () => {
    onClick?.();
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackRoute);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        'gap-2 rounded-full border',
        theme.panelBorder,
        theme.accentText,
        'hover:' + theme.accentSoftBg,
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="font-medium">{label}</span>
    </Button>
  );
}

export default HubBackButton;
