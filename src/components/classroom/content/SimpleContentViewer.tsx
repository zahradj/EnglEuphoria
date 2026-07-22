
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhiteboardCanvas } from "@/components/classroom/whiteboard/WhiteboardCanvas";
import { WhiteboardToolbar } from "@/components/classroom/whiteboard/WhiteboardToolbar";

interface SimpleContentViewerProps {
  mode: string;
  isTeacher: boolean;
  studentName: string;
}

export function SimpleContentViewer({ mode, isTeacher, studentName }: SimpleContentViewerProps) {
  const [activeTab, setActiveTab] = useState("whiteboard");
  const [activeTool, setActiveTool] = useState<"pencil" | "eraser" | "text" | "highlighter" | "shape" | "embed">("pencil");
  const [color, setColor] = useState("#9B87F5");

  const clearCanvas = () => {
  };

  const downloadCanvas = () => {
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">
          {mode === "oneOnOne" ? "One-on-One Session" : "Group Class"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {mode === "oneOnOne" 
            ? "Personal learning session with your teacher" 
            : "Interactive group learning session"
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
          <TabsTrigger value="lesson">Lesson Material</TabsTrigger>
        </TabsList>

        <TabsContent value="whiteboard" className="flex-1 flex flex-col mt-4 px-4">
          <WhiteboardToolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            activeShape="rectangle"
            color={color}
            setColor={setColor}
            clearCanvas={clearCanvas}
            downloadCanvas={downloadCanvas}
          />
          <div className="flex-1 mt-4 mb-4">
            <WhiteboardCanvas
              pageId="simple-board"
              activeTool={activeTool}
              color={color}
              isCollaborative={true}
              canvasRef={() => {}}
            />
          </div>
        </TabsContent>

        <TabsContent value="lesson" className="flex-1 mt-4 px-4">
          <div className="h-full bg-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Lesson Materials</h3>
              <p className="text-muted-foreground">
                {mode === "oneOnOne" 
                  ? "Your personalized lesson content will appear here"
                  : "Group lesson materials and activities will be shown here"
                }
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
