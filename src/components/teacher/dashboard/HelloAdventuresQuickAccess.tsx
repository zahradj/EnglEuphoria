import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Music, 
  ExternalLink, 
  Calendar,
  Download,
  Clock,
  Users,
  Star
} from 'lucide-react';

export function HelloAdventuresQuickAccess() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePreview = () => {
    window.open('/media-test?roomId=hello-adventures-preview&role=teacher&lesson=hello-adventures', '_blank');
  };

  const handleUseNow = () => {
    const classroomUrl = `/media-test?roomId=hello-adventures&role=teacher&lesson=hello-adventures`;
    window.open(classroomUrl, '_blank');
    toast({
      title: "Launching Hello Adventures",
      description: "Starting interactive lesson in classroom mode"
    });
  };

  const handleSchedule = () => {
    navigate('/teacher?tab=calendar');
    toast({
      title: "Schedule Lesson",
      description: "Opening calendar to schedule Hello Adventures"
    });
  };

  const handleViewInLibrary = () => {
    navigate('/teacher?tab=resources&subtab=featured');
    toast({
      title: "Opening Resource Library",
      description: "Viewing Hello Adventures in featured lessons"
    });
  };

  return (
    <Card className="relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
      <div className="absolute top-3 right-3">
        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
          ⭐ Featured
        </Badge>
      </div>
      
      <CardHeader className="relative z-10 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg shadow-lg">
            <Music className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">
              🎵 Hello Adventures
            </div>
            <div className="text-sm text-text-muted font-normal">
              Interactive ESL lesson ready to use
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        {/* Quick Info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm rounded-md px-2 py-1">
            <Clock className="h-3 w-3 text-primary" />
            <span>30 min</span>
          </div>
          <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm rounded-md px-2 py-1">
            <Users className="h-3 w-3 text-primary" />
            <span>4-8 years</span>
          </div>
          <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm text-xs">
            A1 Level
          </Badge>
        </div>

        {/* Features */}
        <div className="text-xs text-text-muted">
          ✨ Songs & Greetings • 🔤 Phonics (Letter A) • 👋 Introductions
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleUseNow}
            size="sm"
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg"
          >
            <Play className="h-3 w-3 mr-1" />
            Use Now
          </Button>
          <Button 
            onClick={handlePreview}
            size="sm"
            variant="outline"
            className="border-primary/20 hover:bg-primary/5"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Preview
          </Button>
          <Button 
            onClick={handleSchedule}
            size="sm"
            variant="outline"
            className="border-accent/20 hover:bg-accent/5"
          >
            <Calendar className="h-3 w-3" />
          </Button>
        </div>

        {/* Link to full view */}
        <button 
          onClick={handleViewInLibrary}
          className="text-xs text-primary hover:text-primary/80 transition-colors w-full text-center"
        >
          View full details in Resource Library →
        </button>
      </CardContent>
    </Card>
  );
}