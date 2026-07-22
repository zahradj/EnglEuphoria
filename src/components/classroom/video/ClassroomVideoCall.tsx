
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FunctionalVideoPanel } from './FunctionalVideoPanel';
import { Video, Users } from 'lucide-react';

interface ClassroomVideoCallProps {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  isTeacher: boolean;
  compact?: boolean;
}

export function ClassroomVideoCall({
  roomId,
  currentUserId,
  currentUserName,
  isTeacher,
  compact = false
}: ClassroomVideoCallProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (compact) {
    return (
      <div className="w-full h-48">
        <FunctionalVideoPanel
          roomId={roomId}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          isTeacher={isTeacher}
        />
      </div>
    );
  }

  return (
    <Card className="w-full h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video size={20} className="text-blue-600" />
          <h3 className="font-semibold">Live Video Conference</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {isMinimized ? 'Expand' : 'Minimize'}
        </Button>
      </div>
      
      {!isMinimized && (
        <div className="p-4 h-[calc(100%-80px)]">
          <FunctionalVideoPanel
            roomId={roomId}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            isTeacher={isTeacher}
          />
        </div>
      )}
      
      {isMinimized && (
        <div className="p-8 flex flex-col items-center justify-center text-gray-500">
          <Users size={32} className="mb-2" />
          <p>Video call minimized</p>
        </div>
      )}
    </Card>
  );
}
