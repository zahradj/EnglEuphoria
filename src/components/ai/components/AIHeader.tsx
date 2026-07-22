
import React from "react";
import { Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const AIHeader = () => {
  return (
    <div className="flex items-center gap-3">
      <Brain className="h-6 w-6 text-purple-600" />
      <h2 className="text-2xl font-bold text-gray-800">Enhanced AI Assistant</h2>
      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Powered by AI</Badge>
    </div>
  );
};
