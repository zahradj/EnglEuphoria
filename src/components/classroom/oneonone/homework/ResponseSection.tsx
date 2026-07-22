
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ResponseSectionProps {
  textResponse: string;
  onTextChange: (value: string) => void;
  onSubmitResponse: () => void;
}

export function ResponseSection({ textResponse, onTextChange, onSubmitResponse }: ResponseSectionProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Your Response:</label>
      <Textarea
        placeholder="Type your answer here..."
        value={textResponse}
        onChange={(e) => onTextChange(e.target.value)}
        rows={4}
      />
      <Button 
        size="sm" 
        className="mt-2"
        onClick={onSubmitResponse}
        disabled={!textResponse.trim()}
      >
        <Send size={14} className="mr-1" />
        Submit Response
      </Button>
    </div>
  );
}
