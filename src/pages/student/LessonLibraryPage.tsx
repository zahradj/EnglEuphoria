import React from 'react';
import LessonLibraryHub from '@/components/lesson-player/LessonLibraryHub';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const LessonLibraryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <LessonLibraryHub />
      </div>
    </div>
  );
};

export default LessonLibraryPage;
