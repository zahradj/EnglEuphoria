
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, Wand2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AIActivityGenerator } from "./AIActivityGenerator";
import { ActivityForm } from "./ActivityForm";
import { ActivityList } from "./ActivityList";
import { EmptyState } from "./EmptyState";

interface CreatedActivity {
  id: string;
  title: string;
  type: string;
  description: string;
  content: any;
  createdAt: Date;
  isAIGenerated?: boolean;
}

export function CreateActivityGame() {
  const [createdActivities, setCreatedActivities] = useState<CreatedActivity[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("ai"); // Default to AI tab
  const { toast } = useToast();

  const handleAIActivityGenerated = (aiActivity: any) => {
    const newActivity: CreatedActivity = {
      id: Date.now().toString(),
      title: aiActivity.title,
      type: aiActivity.type,
      description: aiActivity.description,
      content: aiActivity.content,
      createdAt: new Date(),
      isAIGenerated: true
    };

    setCreatedActivities([newActivity, ...createdActivities]);
    setActiveTab("manual");
  };

  const handleActivityCreated = (activity: CreatedActivity) => {
    setCreatedActivities([activity, ...createdActivities]);
    setIsCreating(false);
    toast({
      title: "Activity Created!",
      description: `"${activity.title}" has been added to your activities.`,
    });
  };

  const deleteActivity = (id: string) => {
    setCreatedActivities(createdActivities.filter(activity => activity.id !== id));
    toast({
      title: "Activity Deleted",
      description: "The activity has been removed.",
    });
  };

  if (!isCreating && createdActivities.length === 0) {
    return (
      <div className="space-y-4">
        {/* Prominent AI Generator Header */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-emerald-50 border-purple-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Wand2 className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-purple-800">AI Activity Generator</h2>
              <Badge className="bg-red-500 text-white">NEW</Badge>
            </div>
            <p className="text-purple-700 mb-4">
              Create custom learning activities instantly with AI! Generate worksheets, games, and interactive content tailored to your students.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-purple-600">
              <span className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Instant Generation
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                AI Powered
              </span>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles size={16} className="text-purple-500" />
              AI Generator
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">Recommended</Badge>
            </TabsTrigger>
            <TabsTrigger value="manual">Manual Creation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai" className="mt-4">
            <AIActivityGenerator onActivityGenerated={handleAIActivityGenerated} />
          </TabsContent>

          <TabsContent value="manual" className="text-center py-8">
            <EmptyState onCreateActivity={() => setIsCreating(true)} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (isCreating) {
    return (
      <ActivityForm 
        onActivityCreated={handleActivityCreated}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Activities</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab("ai")}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
          >
            <Sparkles size={16} className="mr-2" />
            AI Generate
          </Button>
          <Button
            onClick={() => setIsCreating(true)}
            size="sm"
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <Plus size={16} className="mr-2" />
            Create Manual
          </Button>
        </div>
      </div>

      <ActivityList 
        activities={createdActivities}
        onDeleteActivity={deleteActivity}
      />

      {activeTab === "ai" && (
        <div className="mt-6">
          <AIActivityGenerator onActivityGenerated={handleAIActivityGenerated} />
        </div>
      )}
    </div>
  );
}
