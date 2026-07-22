
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Mic } from "lucide-react";

interface Material {
  id: string;
  title: string;
  type: string;
  url: string;
}

interface MaterialCardProps {
  material: Material;
}

export function MaterialCard({ material }: MaterialCardProps) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <div className="bg-purple-100 p-2 rounded">
          {material.type === "Audio" ? (
            <Mic size={16} className="text-purple-600" />
          ) : (
            <FileText size={16} className="text-purple-600" />
          )}
        </div>
        <div className="flex-1">
          <h5 className="font-medium text-sm">{material.title}</h5>
          <Badge variant="outline" className="text-xs mt-1">
            {material.type}
          </Badge>
        </div>
        <Button size="sm" variant="outline">
          Open
        </Button>
      </div>
    </Card>
  );
}
