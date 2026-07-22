import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WhiteboardToolbar } from "./whiteboard/WhiteboardToolbar";
import { WhiteboardTabs } from "./whiteboard/WhiteboardTabs";
import { EmbedLinkDialog } from "./whiteboard/EmbedLinkDialog";
import { EmbeddedContent } from "./whiteboard/EmbeddedContent";
import { useWhiteboard } from "./whiteboard/useWhiteboard";

interface ESLWhiteboardProps {
  className?: string;
  isCollaborative?: boolean;
}

export function ESLWhiteboard({ className = "", isCollaborative = true }: ESLWhiteboardProps) {
  const { languageText } = useLanguage();
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false);
  const [embedClickPosition, setEmbedClickPosition] = useState<{ x: number; y: number } | undefined>();
  const [embeddedContent, setEmbeddedContent] = useState<Record<string, Array<{
    id: string;
    title: string;
    url: string;
    type: 'youtube' | 'vimeo' | 'webpage' | 'docs' | 'other';
    x: number;
    y: number;
    width?: number;
    height?: number;
  }>>>({});
  
  const {
    activeTab,
    setActiveTab,
    activeTool,
    setActiveTool,
    activeShape,
    setActiveShape,
    color,
    setColor,
    pageCount,
    canvasRefs,
    clearCanvas,
    downloadCanvas,
    addNewPage
  } = useWhiteboard(4); // Start with more pages by default

  const handleEmbedLink = () => {
    setIsEmbedDialogOpen(true);
  };

  const handleEmbedSubmit = (data: { url: string; title: string; type: string; x: number; y: number }) => {
    const newContent = {
      id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: data.title,
      url: data.url,
      type: data.type as 'youtube' | 'vimeo' | 'webpage' | 'docs' | 'other',
      x: data.x,
      y: data.y,
      width: data.type === 'youtube' || data.type === 'vimeo' ? 320 : 300,
      height: data.type === 'youtube' || data.type === 'vimeo' ? 180 : 200
    };

    setEmbeddedContent(prev => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] || []), newContent]
    }));
  };

  const handleRemoveContent = (contentId: string) => {
    setEmbeddedContent(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).filter(content => content.id !== contentId)
    }));
  };

  const handleMoveContent = (contentId: string, x: number, y: number) => {
    setEmbeddedContent(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map(content => 
        content.id === contentId ? { ...content, x, y } : content
      )
    }));
  };

  return (
    <div className={`flex flex-col gap-3 h-[calc(100vh-12rem)] ${className}`}>
      <div className="bg-white rounded-lg shadow-sm p-2 h-full flex flex-col">
        <WhiteboardToolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          activeShape={activeShape}
          color={color}
          setColor={setColor}
          clearCanvas={clearCanvas}
          downloadCanvas={downloadCanvas}
          onEmbedLink={handleEmbedLink}
        />
        
        <div className="relative flex-1">
          <WhiteboardTabs
            pageCount={pageCount}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            addNewPage={addNewPage}
            canvasRefs={canvasRefs}
            activeTool={activeTool}
            color={color}
            isCollaborative={isCollaborative}
          />
          
          {/* Embedded Content Overlay */}
          {embeddedContent[activeTab]?.map((content) => (
            <EmbeddedContent
              key={content.id}
              content={content}
              onRemove={handleRemoveContent}
              onMove={handleMoveContent}
            />
          ))}
        </div>
        
        {/* Embed Link Dialog */}
        <EmbedLinkDialog
          isOpen={isEmbedDialogOpen}
          onClose={() => setIsEmbedDialogOpen(false)}
          onEmbed={handleEmbedSubmit}
          clickPosition={embedClickPosition}
        />
      </div>
    </div>
  );
}