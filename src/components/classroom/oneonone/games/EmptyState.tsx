
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  onCreateActivity: () => void;
}

export function EmptyState({ onCreateActivity }: EmptyStateProps) {
  return (
    <div className="mb-4">
      <Plus size={48} className="mx-auto text-gray-300 mb-3" />
      <h3 className="text-lg font-semibold mb-2">Create Custom Activities</h3>
      <p className="text-gray-600 mb-4">Design your own interactive learning activities</p>
      <Button onClick={onCreateActivity} className="bg-purple-500 hover:bg-purple-600">
        <Plus size={16} className="mr-2" />
        Create New Activity
      </Button>
    </div>
  );
}
