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
  // `drawingEnabled` is the teacher's "Let Student Interact" permission — it
  // gates the STUDENT only. The teacher can always annotate with a pen tool;
  // tying the teacher's own pen to that flag meant the teacher could never
  // draw for a watching (locked) student, and picking up a pen had to unlock
  // the student as a side effect.
  const canDrawHere = activeTool !== 'pointer' && (role === 'teacher' || drawingEnabled);
  const passThrough = !canDrawHere || studentBypassForIframe;

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
        canDraw={canDrawHere}
        activeTool={activeTool === 'pointer' ? 'pen' : activeTool}
        activeColor={activeColor}
        strokes={strokes}
        onAddStroke={onAddStroke}
      />
    </div>
  );
};
