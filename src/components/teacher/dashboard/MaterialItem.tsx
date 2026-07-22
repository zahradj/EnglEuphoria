
import { Button } from "@/components/ui/button";
import { FileText, Eye, PlusCircle } from "lucide-react";

interface MaterialItemProps {
  title: string;
  type: string;
  size: string;
  onView: () => void;
  onUse: () => void;
}

export const MaterialItem = ({ title, type, size, onView, onUse }: MaterialItemProps) => (
  <div className="flex items-center justify-between py-3 border-b">
    <div className="flex items-center gap-3">
      <div className="bg-blue-100 p-2 rounded">
        <FileText className="h-4 w-4 text-blue-700" />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{type} • {size}</p>
      </div>
    </div>
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" onClick={onView}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onUse}>
        <PlusCircle className="h-4 w-4" />
      </Button>
    </div>
  </div>
);
