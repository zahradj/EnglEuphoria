import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Minimize2, Maximize2, GripHorizontal } from 'lucide-react';
import { WebRTCVideoConference } from '@/components/classroom/video/WebRTCVideoConference';

interface Props {
  roomId: string;
  userId: string;
  userName: string;
  isTeacher: boolean;
  hub?: 'playground' | 'academy' | 'success';
}

/**
 * Draggable, collapsible video overlay. Sits above lesson (z-30), below
 * teacher controls (z-40). pointer-events isolated so it never blocks
 * interactive game mechanics underneath when collapsed.
 */
export function FloatingVideoDock({ roomId, userId, userName, isTeacher, hub = 'academy' }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const accent =
    hub === 'playground'
      ? 'border-[hsl(var(--playground-primary,24_99%_59%))]'
      : hub === 'success'
        ? 'border-[hsl(var(--success-primary,160_84%_30%))]'
        : 'border-[hsl(var(--academy-primary,271_67%_40%))]';

  return (
    <div
      ref={constraintsRef}
      className="pointer-events-none fixed inset-0 z-30"
      aria-label="Video overlay layer"
    >
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        initial={{ x: 16, y: 16 }}
        className={`pointer-events-auto absolute right-4 bottom-4 ${
          collapsed ? 'w-44 h-12' : 'w-[520px] h-[260px]'
        } rounded-2xl border-2 ${accent} bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col`}
      >
        <div className="flex items-center justify-between px-2 py-1 cursor-grab active:cursor-grabbing bg-muted/60">
          <GripHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Live Video
          </span>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1 rounded hover:bg-background/60 text-muted-foreground"
            aria-label={collapsed ? 'Expand video' : 'Collapse video'}
          >
            {collapsed ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </button>
        </div>

        {!collapsed && (
          <div className="h-[calc(100%-28px)] overflow-hidden bg-background">
            <WebRTCVideoConference
              roomId={roomId}
              currentUserId={userId}
              currentUserName={userName}
              isTeacher={isTeacher}
              autoConnect
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
