
import React from "react";
import { RealTimeChatPanel } from "@/components/classroom/chat/RealTimeChatPanel";
import { useUnifiedClassroomContext } from "../../UnifiedClassroomProvider";

export function ChatTabContent() {
  const { currentUser, finalRoomId } = useUnifiedClassroomContext();

  return (
    <div className="h-full">
      <RealTimeChatPanel
        roomId={finalRoomId}
        currentUser={currentUser}
      />
    </div>
  );
}
