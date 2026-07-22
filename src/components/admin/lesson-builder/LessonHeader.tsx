import React from 'react';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

interface LessonHeaderProps {
  title: string;
  level: string;
  ageGroup: string;
  onTitleChange: (title: string) => void;
  onLevelChange: (level: string) => void;
  onAgeGroupChange: (ageGroup: string) => void;
  onSave: () => void;
  onPreview: () => void;
  isSaving: boolean;
}

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const ageGroups = ['3-5', '6-8', '9-12', '13-17', '18+'];

export const LessonHeader: React.FC<LessonHeaderProps> = ({
  title,
  level,
  ageGroup,
  onTitleChange,
  onLevelChange,
  onAgeGroupChange,
  onSave,
  onPreview,
  isSaving,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Lesson Title..."
          className="flex-1 text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-0"
        />

        <div className="flex items-center gap-2 shrink-0">
          <Select value={level} onValueChange={onLevelChange}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={ageGroup} onValueChange={onAgeGroupChange}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Age" />
            </SelectTrigger>
            <SelectContent>
              {ageGroups.map((ag) => (
                <SelectItem key={ag} value={ag}>
                  {ag} years
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          <Button onClick={onSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Lesson'}
          </Button>
        </div>
      </div>
    </div>
  );
};
