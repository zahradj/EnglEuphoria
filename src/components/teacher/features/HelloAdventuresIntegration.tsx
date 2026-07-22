import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  ExternalLink, 
  Play, 
  Music, 
  Users, 
  Clock, 
  Download,
  Bookmark,
  Calendar,
  Sparkles
} from 'lucide-react';

export function HelloAdventuresIntegration() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const lessonDetails = {
    title: "🎵 Hello Adventures - Welcome to English",
    description: "Interactive lesson featuring songs, greetings, phonics, and fun activities perfect for young ESL learners",
    url: "/media-test?roomId=hello-adventures&role=teacher&lesson=hello-adventures",
    duration: "30 minutes",
    slides: 34,
    level: "A1 (Beginner)",
    ageGroup: "4-8 years",
    topics: ["Greetings", "Introductions", "Phonics (Letter A)", "Songs & Music"],
    activities: [
      "🎵 Hello Song with actions",
      "👋 Greeting practice",
      "🏷️ Name introductions",
      "🔤 Letter A phonics",
      "✏️ Drawing activity",
      "🎉 Celebration wrap-up"
    ],
    learningObjectives: [
      "Say basic greetings (Hello, Hi, Bye)",
      "Ask and answer names: 'What's your name? My name is ___'",
      "Recognize and pronounce the sound of letter Aa",
      "Follow simple classroom instructions"
    ]
  };

  const handlePreview = () => {
    window.open(lessonDetails.url, '_blank');
  };

  const handleImportToLibrary = () => {
    navigate('/teacher?tab=curriculum');
    toast({
      title: "Redirecting to Curriculum",
      description: "You can import Hello Adventures from the curriculum library"
    });
  };

  const handleScheduleLesson = () => {
    navigate('/teacher?tab=calendar');
    toast({
      title: "Schedule Lesson",
      description: "Opening calendar to schedule Hello Adventures lesson"
    });
  };

  const handleUseInClassroom = () => {
    // Simulate launching the lesson in classroom
    const classroomUrl = `/media-test?roomId=hello-adventures&role=teacher&lesson=hello-adventures`;
    window.open(classroomUrl, '_blank');
    toast({
      title: "Launching Classroom",
      description: "Starting Hello Adventures lesson in classroom mode"
    });
  };

  return (
    <div className="space-y-6">
      {/* Featured Hero Card */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="absolute top-4 right-4">
          <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 shadow-lg">
            ⭐ Featured Lesson
          </Badge>
        </div>
        
        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
              <Music className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {lessonDetails.title}
              </CardTitle>
              <p className="text-text-muted leading-relaxed">
                {lessonDetails.description}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6">
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-lg px-3 py-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{lessonDetails.duration}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-lg px-3 py-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{lessonDetails.ageGroup}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-lg px-3 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{lessonDetails.slides} Interactive Slides</span>
            </div>
            <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm">
              {lessonDetails.level}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handlePreview}
              variant="outline"
              className="flex-1 min-w-[150px] border-primary/20 hover:bg-primary/5"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview Lesson
            </Button>
            <Button 
              onClick={handleUseInClassroom}
              className="flex-1 min-w-[150px] bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Play className="h-4 w-4 mr-2" />
              Use in Classroom
            </Button>
            <Button 
              onClick={handleImportToLibrary}
              variant="outline"
              className="border-accent/20 hover:bg-accent/5"
            >
              <Download className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button 
              onClick={handleScheduleLesson}
              variant="outline"
              className="border-accent/20 hover:bg-accent/5"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Objectives */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Learning Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lessonDetails.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full mt-2 flex-shrink-0" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Activities Overview */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-accent" />
              Lesson Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {lessonDetails.activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="text-sm">{activity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topics Covered */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            Topics Covered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {lessonDetails.topics.map((topic, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-gradient-to-r from-primary/10 to-accent/10 text-foreground border-primary/20"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teacher Tips */}
      <Card className="border-accent/20 bg-accent/5 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            💡 Teacher Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-text-muted space-y-2">
            <p><strong>Preparation:</strong> Have musical instruments or simple rhythm makers ready for the Hello Song</p>
            <p><strong>Interaction:</strong> Encourage students to wave, clap, and move during songs</p>
            <p><strong>Extension:</strong> Ask students to practice greetings with family members as homework</p>
            <p><strong>Assessment:</strong> Listen for correct pronunciation of "Hello" and letter "A" sound</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}