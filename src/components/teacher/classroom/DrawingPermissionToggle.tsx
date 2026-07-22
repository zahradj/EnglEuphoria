import React from 'react';
import { Button } from '@/components/ui/button';
import { PenLine, PenOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawingPermissionToggleProps {
  studentCanDraw: boolean;
  onToggle: () => void;
  className?: string;
}

export const DrawingPermissionToggle: React.FC<DrawingPermissionToggleProps> = ({
  studentCanDraw,
  onToggle,
  className
}) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        'h-12 flex flex-col items-center justify-center gap-1 text-white transition-all duration-200',
        studentCanDraw 
          ? 'bg-green-500 hover:bg-green-600' 
          : 'bg-gray-600 hover:bg-gray-500',
        className
      )}
      onClick={onToggle}
      title={studentCanDraw ? 'Disable Student Drawing' : 'Allow Student Drawing'}
    >
      {studentCanDraw ? (
        <PenLine className="h-5 w-5" />
      ) : (
        <PenOff className="h-5 w-5" />
      )}
      <span className="text-[10px] font-medium">
        {studentCanDraw ? 'Drawing On' : 'Drawing Off'}
      </span>
    </Button>
  );
};
