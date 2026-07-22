
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function SessionStats() {
  return (
    <Card className="p-3 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/50 dark:via-pink-950/50 dark:to-blue-950/50 border-purple-200/50 dark:border-purple-700/50 shadow-md">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-sm flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent font-bold">
          <Clock size={14} className="text-purple-500" />
          📊 Session Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/30 rounded-lg shadow-sm border border-blue-200/50">
            <div className="text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">18m ⏱️</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Time Elapsed</div>
          </div>
          <div className="p-2 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/50 dark:to-green-800/30 rounded-lg shadow-sm border border-green-200/50">
            <div className="text-sm font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">4 ⭐</div>
            <div className="text-xs text-green-600 dark:text-green-400">Stars Awarded</div>
          </div>
          <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/50 dark:to-purple-800/30 rounded-lg shadow-sm border border-purple-200/50">
            <div className="text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">85% 🎯</div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Engagement</div>
          </div>
          <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/50 dark:to-orange-800/30 rounded-lg shadow-sm border border-orange-200/50">
            <div className="text-sm font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">2 ✅</div>
            <div className="text-xs text-orange-600 dark:text-orange-400">Activities Done</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
