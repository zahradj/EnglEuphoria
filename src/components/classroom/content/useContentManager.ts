
import { useState } from "react";
import { ContentItem, MaterialType } from "./types";

export function useContentManager(initialContent: ContentItem[], userName: string, isTeacher: boolean) {
  const [contentItems, setContentItems] = useState<ContentItem[]>(initialContent);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    initialContent.length > 0 ? initialContent[0] : null
  );

  const handleUpload = (type: MaterialType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : '*/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const newItem: ContentItem = {
          id: Date.now().toString(),
          type,
          title: file.name,
          source: URL.createObjectURL(file),
          uploadedBy: isTeacher ? "Teacher" : userName,
          timestamp: new Date()
        };
        setContentItems(prev => [...prev, newItem]);
        setSelectedContent(newItem);
      }
    };
    
    input.click();
  };

  const handleEmbedVideo = () => {
    const url = prompt("Enter YouTube or video URL:");
    if (url) {
      const newItem: ContentItem = {
        id: Date.now().toString(),
        type: "video",
        title: "Embedded Video",
        source: url,
        uploadedBy: isTeacher ? "Teacher" : userName,
        timestamp: new Date()
      };
      setContentItems(prev => [...prev, newItem]);
      setSelectedContent(newItem);
    }
  };

  const handleAddGame = () => {
    const gameUrl = prompt("Enter game/interactive content URL:");
    if (gameUrl) {
      const newItem: ContentItem = {
        id: Date.now().toString(),
        type: "interactive",
        title: "Interactive Game",
        source: gameUrl,
        uploadedBy: isTeacher ? "Teacher" : userName,
        timestamp: new Date()
      };
      setContentItems(prev => [...prev, newItem]);
      setSelectedContent(newItem);
    }
  };

  return {
    contentItems,
    selectedContent,
    setSelectedContent,
    handleUpload,
    handleEmbedVideo,
    handleAddGame
  };
}
