
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Sparkles } from "lucide-react";

interface CreatedActivity {
  id: string;
  title: string;
  type: string;
  description: string;
  content: any;
  createdAt: Date;
  isAIGenerated?: boolean;
}

interface ActivityListProps {
  activities: CreatedActivity[];
  onDeleteActivity: (id: string) => void;
}

export function ActivityList({ activities, onDeleteActivity }: ActivityListProps) {
  const activityTypes = [
    { value: "quiz", label: "Quiz Questions" },
    { value: "word-match", label: "Word Matching" },
    { value: "fill-blank", label: "Fill in the Blanks" },
    { value: "story", label: "Story Builder" },
    { value: "conversation", label: "Conversation Practice" }
  ];

  return (
    <div className="grid gap-3">
      {activities.map((activity) => (
        <Card key={activity.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">{activity.title}</h4>
                <Badge variant="secondary" className="text-xs">
                  {activityTypes.find(t => t.value === activity.type)?.label}
                </Badge>
                {activity.isAIGenerated && (
                  <Badge className="text-xs bg-purple-100 text-purple-700">
                    <Sparkles size={10} className="mr-1" />
                    AI Generated
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
              <div className="text-xs text-gray-500">
                Created {activity.createdAt.toLocaleDateString()}
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm">
                <Edit size={14} />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDeleteActivity(activity.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
