
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { WhiteboardCanvas } from "./WhiteboardCanvas";

interface WhiteboardTabsProps {
  pageCount: number;
  activeTab: string;
  setActiveTab: (value: string) => void;
  addNewPage: () => void;
  canvasRefs: React.MutableRefObject<Record<string, HTMLCanvasElement | null>>;
  activeTool: "pencil" | "eraser" | "text" | "highlighter" | "shape" | "embed";
  color: string;
  isCollaborative?: boolean;
}

export function WhiteboardTabs({
  pageCount,
  activeTab,
  setActiveTab,
  addNewPage,
  canvasRefs,
  activeTool,
  color,
  isCollaborative = true
}: WhiteboardTabsProps) {
  const { languageText } = useLanguage();
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between mb-2">
        <TabsList>
          {Array.from({ length: pageCount }, (_, i) => {
            const pageId = `page${i + 1}`;
            return (
              <TabsTrigger key={pageId} value={pageId} className="px-3 py-1">
                {i + 1}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <Button variant="ghost" size="sm" onClick={addNewPage}>
          + {languageText.addPage}
        </Button>
      </div>
      
      {Array.from({ length: pageCount }, (_, i) => {
        const pageId = `page${i + 1}`;
        return (
          <TabsContent key={pageId} value={pageId} className="m-0">
            <WhiteboardCanvas 
              pageId={pageId}
              activeTool={activeTool}
              color={color}
              isCollaborative={isCollaborative}
              canvasRef={(el) => (canvasRefs.current[pageId] = el)}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
