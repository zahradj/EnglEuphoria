
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, Upload, Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { assignmentService, Assignment, AssignmentTemplate } from "@/services/assignmentService";

interface CreateAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignmentCreated: (assignment: Assignment) => void;
  selectedStudents?: string[];
}

export function CreateAssignmentDialog({
  isOpen,
  onClose,
  onAssignmentCreated,
  selectedStudents = []
}: CreateAssignmentDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Assignment['type']>('essay');
  const [instructions, setInstructions] = useState("");
  const [points, setPoints] = useState(25);
  const [dueDate, setDueDate] = useState<Date>();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AssignmentTemplate | null>(null);
  const [templates, setTemplates] = useState<AssignmentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      const templateList = await assignmentService.getAssignmentTemplates();
      setTemplates(templateList);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleTemplateSelect = (template: AssignmentTemplate) => {
    setSelectedTemplate(template);
    setTitle(template.name);
    setDescription(template.description);
    setType(template.type);
    setInstructions(template.defaultInstructions);
    setPoints(template.defaultPoints);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const assignment = await assignmentService.createAssignment({
        title,
        description,
        type,
        dueDate: dueDate.toISOString(),
        points,
        instructions,
        createdBy: 'current-teacher-id' // Would get from auth context
      });

      onAssignmentCreated(assignment);
      
      toast({
        title: "Assignment Created",
        description: `"${title}" has been assigned to ${selectedStudents.length} student(s).`,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setInstructions("");
      setPoints(25);
      setDueDate(undefined);
      setAttachments([]);
      setSelectedTemplate(null);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Assignment Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div>
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {template.description}
                      </div>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {template.type}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Assignment title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the assignment"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={type} onValueChange={(value: Assignment['type']) => setType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="essay">Essay</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="speaking">Speaking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      value={points}
                      onChange={(e) => setPoints(parseInt(e.target.value))}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                <div>
                  <Label>Due Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : "Select due date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Detailed instructions for students"
                  rows={5}
                />
              </div>

              {/* File Attachments */}
              <div>
                <Label>Attachments</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="mb-2"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                  />
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Students */}
              {selectedStudents.length > 0 && (
                <div>
                  <Label>Assigned to ({selectedStudents.length} students)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedStudents.slice(0, 5).map((studentId, index) => (
                      <Badge key={index} variant="secondary">
                        Student {index + 1}
                      </Badge>
                    ))}
                    {selectedStudents.length > 5 && (
                      <Badge variant="outline">
                        +{selectedStudents.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Creating..." : "Create Assignment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
