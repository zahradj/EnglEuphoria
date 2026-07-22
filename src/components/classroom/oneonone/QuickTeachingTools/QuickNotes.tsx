
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export function QuickNotes() {
  return (
    <Card className="p-3 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/50 dark:via-pink-950/50 dark:to-blue-950/50 border-purple-200/50 dark:border-purple-700/50 shadow-md">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-sm flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent font-bold">
          <MessageCircle size={14} className="text-purple-500" />
          📝 Quick Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          <div className="text-xs bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 p-2 rounded border-l-2 border-yellow-400 shadow-sm">
            ⭐ Student excels at past tense verbs
          </div>
          <div className="text-xs bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 p-2 rounded border-l-2 border-blue-400 shadow-sm">
            🎯 Focus on pronunciation next lesson
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
