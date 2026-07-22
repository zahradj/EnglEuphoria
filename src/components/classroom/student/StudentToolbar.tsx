import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Languages, 
  Hand, 
  MessageCircle, 
  NotebookPen,
  HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StudentDictionary } from "./StudentDictionary";
import { StudentNotes } from "./StudentNotes";

interface StudentToolbarProps {
  permissions: {
    canAccessDictionary: boolean;
    canAccessTranslation: boolean;
    canTakeNotes: boolean;
    canRaiseHand: boolean;
    canAccessChat: boolean;
  };
  isHandRaised: boolean;
  onRaiseHand: () => void;
  onAskForHelp: () => void;
}

export function StudentToolbar({
  permissions,
  isHandRaised,
  onRaiseHand,
  onAskForHelp
}: StudentToolbarProps) {
  const [showDictionary, setShowDictionary] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const { toast } = useToast();

  const handleToolClick = (tool: string, action: () => void) => {
    action();
    toast({
      title: `${tool} opened`,
      description: "Tool is now available for your use",
    });
  };

  return (
    <>
      <div className="flex items-center gap-2 p-3 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50">
        {/* Dictionary Tool */}
        {permissions.canAccessDictionary && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToolClick("Dictionary", () => setShowDictionary(true))}
            className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
          >
            <BookOpen size={16} />
            <span className="hidden sm:inline">Dictionary</span>
          </Button>
        )}

        {/* Translation Tool */}
        {permissions.canAccessTranslation && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToolClick("Translator", () => {})}
            className="flex items-center gap-2 hover:bg-green-50 hover:border-green-200"
          >
            <Languages size={16} />
            <span className="hidden sm:inline">Translate</span>
          </Button>
        )}

        {/* Notes Tool */}
        {permissions.canTakeNotes && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToolClick("Notes", () => setShowNotes(true))}
            className="flex items-center gap-2 hover:bg-purple-50 hover:border-purple-200"
          >
            <NotebookPen size={16} />
            <span className="hidden sm:inline">Notes</span>
          </Button>
        )}

        {/* Raise Hand */}
        {permissions.canRaiseHand && (
          <Button
            variant={isHandRaised ? "default" : "outline"}
            size="sm"
            onClick={onRaiseHand}
            className={`flex items-center gap-2 ${
              isHandRaised 
                ? "bg-orange-500 hover:bg-orange-600 text-white" 
                : "hover:bg-orange-50 hover:border-orange-200"
            }`}
          >
            <Hand size={16} />
            <span className="hidden sm:inline">
              {isHandRaised ? "Lower Hand" : "Raise Hand"}
            </span>
            {isHandRaised && (
              <Badge variant="secondary" className="ml-1 text-xs">
                Active
              </Badge>
            )}
          </Button>
        )}

        {/* Ask for Help */}
        <Button
          variant="outline"
          size="sm"
          onClick={onAskForHelp}
          className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200"
        >
          <HelpCircle size={16} />
          <span className="hidden sm:inline">Help</span>
        </Button>
      </div>

      {/* Dictionary Modal/Popup */}
      <StudentDictionary 
        isOpen={showDictionary}
        onClose={() => setShowDictionary(false)}
      />

      {/* Notes Modal/Popup */}
      <StudentNotes 
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
      />
    </>
  );
}