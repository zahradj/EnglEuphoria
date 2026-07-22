import React from 'react';
import { CollaborativeCanvas } from '@/components/classroom/shared/CollaborativeCanvas';
import { WhiteboardStroke, StageMode } from '@/services/whiteboardService';

interface TransparentCanvasProps {
  roomId: string;
  userId: string;
  userName: string;
  role: 'teacher' | 'student';
  /** When true, the overlay captures pointer events for drawing. When false,
   *  clicks pass through to the underlying slide / iframe. */
  drawingEnabled: boolean;
  activeTool: 'pen' | 'highlighter' | 'eraser' | 'pointer' | 'text' | 'rect' | 'circle' | 'arrow' | 'line';
  activeColor: string;
  strokes: WhiteboardStroke[];
  onAddStroke: (stroke: Omit<WhiteboardStroke, 'id' | 'roomId' | 'timestamp'>) => void;
  /** Current stage mode — when 'web' + iframeUnlocked, students bypass the overlay. */
  mode?: StageMode;
  iframeUnlocked?: boolean;
}

/**
 * Universal annotation overlay. Mounted ONCE on top of the entire Main Stage,
 * regardless of mode (slide / web / blank). Both teacher and student see and
 * draw on the same surface — strokes broadcast through whiteboardService.
 */
export const TransparentCanvas: React.FC<TransparentCanvasProps> = ({
  roomId,
  userId,
  userName,
  role,
  drawingEnabled,
  activeTool,
  activeColor,
  strokes,
  onAddStroke,
  mode,
  iframeUnlocked,
}) => {
  // When drawing is OFF, the overlay must be fully click-through so the user
  // can interact with iframe links / slide elements underneath.
  // Additionally: when the teacher hands the iframe to the student
  // (mode === 'web' && iframeUnlocked), the student's overlay must step aside
  // even if drawing was on, so clicks land on the page.
  const studentBypassForIframe = role === 'student' && mode === 'web' && !!iframeUnlocked;
  const passThrough = !drawingEnabled || activeTool === 'pointer' || studentBypassForIframe;

  return (
    <div
      className="absolute inset-0 z-50"
      style={{ pointerEvents: passThrough ? 'none' : 'auto' }}
    >
      <CollaborativeCanvas
        roomId={roomId}
        userId={userId}
        userName={userName}
        role={role}
        canDraw={drawingEnabled && activeTool !== 'pointer'}
        activeTool={activeTool === 'pointer' ? 'pen' : activeTool}
        activeColor={activeColor}
        strokes={strokes}
        onAddStroke={onAddStroke}
      />
    </div>
  );
};
