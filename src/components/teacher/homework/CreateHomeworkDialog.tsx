import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { homeworkService } from "@/services/homeworkService";
import { useAuth } from "@/contexts/AuthContext";

interface CreateHomeworkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentIds: string[];
}

export const CreateHomeworkDialog: React.FC<CreateHomeworkDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  studentIds
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    points: 10,
    dueDate: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || studentIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one student",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const result = await homeworkService.createAssignment(
      user.id,
      formData.title,
      formData.description,
      formData.dueDate,
      studentIds,
      formData.instructions,
      formData.points
    );

    setLoading(false);

    if (result.success) {
      toast({
        title: "✅ Assignment Created",
        description: `Homework assigned to ${studentIds.length} student(s)`,
      });
      onSuccess();
      onClose();
      setFormData({
        title: "",
        description: "",
        instructions: "",
        points: 10,
        dueDate: ""
      });
    } else {
      toast({
        title: "❌ Creation Failed",
        description: result.error || "Failed to create assignment",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📝 Create Homework Assignment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Assignment Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Grammar Exercise - Present Perfect"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the assignment"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="instructions">Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Detailed instructions for students"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="points">Points *</Label>
              <Input
                id="points"
                type="number"
                min="1"
                max="100"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 10 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              📌 This assignment will be sent to <strong>{studentIds.length}</strong> student{studentIds.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "📤 Create Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
