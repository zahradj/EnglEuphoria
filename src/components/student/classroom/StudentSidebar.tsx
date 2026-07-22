import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hand, BookOpen, StickyNote, Palette, PenLine } from 'lucide-react';

interface StudentSidebarProps {
  studentName: string;
  studentCanDraw: boolean;
  activeColor: string;
  onColorChange: (color: string) => void;
  onRaiseHand: () => void;
}

const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#95E1D3', // Mint
  '#F38181', // Coral
  '#AA96DA', // Purple
  '#FCBAD3', // Pink
  '#2D4059'  // Dark Blue
];

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  studentName,
  studentCanDraw,
  activeColor,
  onColorChange,
  onRaiseHand
}) => {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-3 gap-3">
      {/* Teacher Video Placeholder */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          <div className="aspect-[4/3] bg-gradient-to-br from-gray-700 to-gray-800 rounded-t-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">👩‍🏫</span>
              </div>
              <p className="text-sm text-gray-400">Teacher</p>
            </div>
          </div>
          <div className="p-2 text-center">
            <span className="text-xs text-gray-500">Teacher Video</span>
          </div>
        </CardContent>
      </Card>

      {/* Student Camera */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          <div className="aspect-[4/3] bg-gradient-to-br from-blue-900/50 to-gray-800 rounded-t-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-1">
                <span className="text-lg">👋</span>
              </div>
              <p className="text-xs text-gray-400">{studentName}</p>
            </div>
          </div>
          <div className="p-2 text-center">
            <span className="text-xs text-gray-500">My Camera</span>
          </div>
        </CardContent>
      </Card>

      {/* Drawing Permission Badge */}
      {studentCanDraw && (
        <Badge className="bg-green-600 text-white flex items-center justify-center gap-1 py-2 animate-pulse">
          <PenLine className="h-4 w-4" />
          You can draw!
        </Badge>
      )}

      {/* Color Picker (shown when drawing is enabled) */}
      {studentCanDraw && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-400">Pick a color</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    activeColor === color 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110' 
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Tools */}
      <div className="flex-1 flex flex-col gap-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-gray-300 hover:bg-gray-800 hover:text-white"
          onClick={onRaiseHand}
        >
          <Hand className="h-4 w-4 text-yellow-500" />
          Raise Hand
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <BookOpen className="h-4 w-4 text-blue-500" />
          Dictionary
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <StickyNote className="h-4 w-4 text-green-500" />
          My Notes
        </Button>
      </div>
    </div>
  );
};
