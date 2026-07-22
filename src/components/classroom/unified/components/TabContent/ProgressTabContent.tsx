
import React from "react";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Clock } from "lucide-react";

export function ProgressTabContent() {
  return (
    <div className="h-full flex flex-col">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <TrendingUp size={16} />
        Learning Progress
      </h4>
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Speaking Skills</span>
            <span className="text-xs text-gray-600">85%</span>
          </div>
          <Progress value={85} className="h-2" />
        </div>

        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Vocabulary</span>
            <span className="text-xs text-gray-600">92%</span>
          </div>
          <Progress value={92} className="h-2" />
        </div>

        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Grammar</span>
            <span className="text-xs text-gray-600">78%</span>
          </div>
          <Progress value={78} className="h-2" />
        </div>

        <div className="p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Reading</span>
            <span className="text-xs text-gray-600">88%</span>
          </div>
          <Progress value={88} className="h-2" />
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-gray-600" />
            <span className="text-sm font-medium">Study Time</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">4h 32m</div>
          <div className="text-xs text-gray-600">This week</div>
        </div>
      </div>
    </div>
  );
}
