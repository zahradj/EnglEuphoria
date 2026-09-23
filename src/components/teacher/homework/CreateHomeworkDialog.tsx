import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { homeworkService } from "@/services/homeworkService";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherStudents } from "@/hooks/useTeacherStudents";

interface CreateHomeworkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateHomeworkDialog: React.FC<CreateHomeworkDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  // This dialog previously took studentIds as a prop with no UI anywhere to
  // populate it — the parent's state was declared but never set, so the
  // form's own "select at least one student" check always failed and
  // nothing could ever be assigned. Picking students is now owned here,
  // against the teacher's real roster, instead of depending on a value
  // nothing upstream ever provided.
  const { students, loading: studentsLoading } = useTeacherStudents();
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    points: 10,
    dueDate: ""
  });

  const toggleStudent = (id: string) => {
    setStudentIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

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
      setStudentIds([]);
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

          <div>
            <Label className="mb-2 flex items-center gap-1.5"><Users className="h-4 w-4" /> Students *</Label>
            {studentsLoading ? (
              <div className="flex items-center gap-2 rounded-lg border p-3 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading your students…
              </div>
            ) : students.length === 0 ? (
              <p className="rounded-lg border p-3 text-sm text-gray-500">
                No students found yet — a student needs at least one booked lesson with you before you can assign them homework.
              </p>
            ) : (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
                {students.map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
                    <Checkbox checked={studentIds.includes(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                    <span className="text-sm">{s.name}</span>
                    <span className="text-xs text-gray-400">{s.email}</span>
                  </label>
                ))}
              </div>
            )}
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
