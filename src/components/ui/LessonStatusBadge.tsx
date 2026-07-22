import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, RefreshCw, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

type LessonStatus = 'not_started' | 'in_progress' | 'completed' | 'redo_required' | 'locked';

interface LessonStatusBadgeProps {
  status: LessonStatus;
  className?: string;
}

export function LessonStatusBadge({ status, className = '' }: LessonStatusBadgeProps) {
  const config = {
    not_started: { 
      label: 'Not Started', 
      variant: 'secondary' as const, 
      icon: null,
      color: 'text-muted-foreground'
    },
    in_progress: { 
      label: 'In Progress', 
      variant: 'default' as const, 
      icon: Play,
      color: 'text-primary'
    },
    completed: { 
      label: 'Completed', 
      variant: 'default' as const, 
      icon: CheckCircle,
      color: 'text-success'
    },
    redo_required: { 
      label: 'Redo Required', 
      variant: 'destructive' as const, 
      icon: RefreshCw,
      color: 'text-warning'
    },
    locked: {
      label: 'Locked',
      variant: 'secondary' as const,
      icon: Lock,
      color: 'text-muted-foreground'
    }
  };
  
  const { label, variant, icon: Icon, color } = config[status];
  
  return (
    <Badge variant={variant} className={`flex items-center gap-1 ${className}`}>
      {Icon && <Icon className={`h-3 w-3 ${color}`} />}
      {label}
    </Badge>
  );
}

export function RedoBadge() {
  return (
    <motion.div
      className="absolute -top-2 -right-2 bg-warning text-warning-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      ♻️ REDO
    </motion.div>
  );
}

export function NewLessonBadge() {
  return (
    <motion.div
      className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10"
      animate={{ 
        scale: [1, 1.05, 1],
        rotate: [0, 2, -2, 0]
      }}
      transition={{ repeat: Infinity, duration: 3 }}
    >
      ✨ NEW
    </motion.div>
  );
}
