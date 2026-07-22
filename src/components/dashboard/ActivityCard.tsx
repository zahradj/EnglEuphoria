
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface ActivityCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  colorClass: string;
  onStart: () => void;
}

export function ActivityCard({ icon, title, description, colorClass, onStart }: ActivityCardProps) {
  const { languageText } = useLanguage();
  
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center p-4">
        <div className={`p-2 rounded-full ${colorClass} mr-3`}>
          {icon}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <Button 
          className="w-full" 
          onClick={onStart}
        >
          {languageText.start}
        </Button>
      </div>
    </Card>
  );
}
