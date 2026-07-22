
import React from "react";
import { Card } from "@/components/ui/card";
import { useUnifiedClassroomContext } from "./UnifiedClassroomProvider";

interface UnifiedClassroomErrorBoundaryProps {
  error?: string;
  onReload?: () => void;
}

export function UnifiedClassroomErrorBoundary({ 
  error, 
  onReload = () => window.location.reload() 
}: UnifiedClassroomErrorBoundaryProps) {
  const { currentUser, finalRoomId } = useUnifiedClassroomContext();

  if (!error) return null;

  return (
    <div className="h-dvh bg-red-50 p-4 flex items-center justify-center">
      <Card className="p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-800 mb-4">Enhanced Classroom Error</h1>
        <p className="text-red-600 mb-4">
          There was an error loading the enhanced classroom. Please check your camera and microphone permissions.
        </p>
        <div className="text-sm text-gray-600 mb-4">
          <p>Room: {finalRoomId}</p>
          <p>Role: {currentUser.role}</p>
        </div>
        <button 
          onClick={onReload} 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reload Enhanced Classroom
        </button>
      </Card>
    </div>
  );
}
