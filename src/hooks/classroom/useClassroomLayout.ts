import { useState, useCallback } from "react";

export type ClassroomView = "whiteboard" | "slides" | "chat" | "dictionary" | "rewards" | "embed";

export function useClassroomLayout() {
  const [activeView, setActiveView] = useState<ClassroomView>("whiteboard");
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const toggleLeftPanel = useCallback(() => {
    setShowLeftPanel(prev => !prev);
  }, []);

  const toggleRightSidebar = useCallback(() => {
    setShowRightSidebar(prev => !prev);
  }, []);

  const switchView = useCallback((view: ClassroomView) => {
    setActiveView(view);
    
    // Auto-show relevant panels
    if (view === "slides") {
      setShowLeftPanel(true);
    } else if (view === "chat" || view === "dictionary" || view === "rewards") {
      setShowRightSidebar(true);
    }
  }, []);

  const incrementUnreadChat = useCallback(() => {
    setUnreadChatCount(prev => prev + 1);
  }, []);

  const clearUnreadChat = useCallback(() => {
    setUnreadChatCount(0);
  }, []);

  return {
    activeView,
    showLeftPanel,
    showRightSidebar,
    unreadChatCount,
    setActiveView: switchView,
    toggleLeftPanel,
    toggleRightSidebar,
    incrementUnreadChat,
    clearUnreadChat
  };
}
