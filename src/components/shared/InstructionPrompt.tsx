import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

interface InstructionPromptProps {
  title: string;
  description: string;
  additionalInfo?: string;
  icon?: string;
  className?: string;
}

export const InstructionPrompt = ({ 
  title, 
  description, 
  additionalInfo, 
  icon = "📋", 
  className = "" 
}: InstructionPromptProps) => {
  return (
    <Card className={`bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="text-2xl flex-shrink-0 mt-1">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {title}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {description}
            </p>
            {additionalInfo && (
              <div className="flex items-start gap-2 p-3 bg-background/50 rounded-lg border border-border/50">
                <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  {additionalInfo}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};