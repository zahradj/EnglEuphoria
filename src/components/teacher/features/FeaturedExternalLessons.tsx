import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelloAdventuresIntegration } from './HelloAdventuresIntegration';
import { 
  Star, 
  ExternalLink, 
  Clock, 
  Users, 
  Music,
  Globe,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface FeaturedExternalLessonsProps {
  onImportLesson?: (lessonData: any) => void;
}

export function FeaturedExternalLessons({ onImportLesson }: FeaturedExternalLessonsProps) {
  const otherFeaturedLessons = [
    {
      id: 'colors-adventure',
      title: "🌈 Colors Adventure",
      description: "Learn colors through interactive games and songs",
      url: "https://example.com/colors-lesson",
      duration: "25 min",
      level: "A1",
      ageGroup: "3-7 years",
      topics: ["Colors", "Vocabulary", "Songs"],
      featured: true,
      comingSoon: true
    },
    {
      id: 'numbers-fun',
      title: "🔢 Numbers 1-10 Fun",
      description: "Count and play with numbers through interactive activities",
      url: "https://example.com/numbers-lesson",
      duration: "20 min", 
      level: "A1",
      ageGroup: "4-8 years",
      topics: ["Numbers", "Counting", "Games"],
      featured: true,
      comingSoon: true
    },
    {
      id: 'family-time',
      title: "👨‍👩‍👧‍👦 My Family",
      description: "Learn family member vocabulary and relationships",
      url: "https://example.com/family-lesson",
      duration: "30 min",
      level: "A1",
      ageGroup: "5-10 years", 
      topics: ["Family", "Relationships", "Vocabulary"],
      featured: true,
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Featured External Lessons
        </h2>
        <p className="text-text-muted max-w-2xl mx-auto">
          Ready-to-use interactive lessons from our partner educators. 
          Preview, import, and customize for your classroom.
        </p>
      </div>

      {/* Hello Adventures - Main Featured */}
      <div className="relative">
        <div className="absolute -top-4 left-4 z-10">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg animate-pulse">
            ⭐ Most Popular
          </Badge>
        </div>
        <HelloAdventuresIntegration />
      </div>

      {/* Coming Soon Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h3 className="text-xl font-semibold">Coming Soon</h3>
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            More Lessons
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherFeaturedLessons.map((lesson) => (
            <Card 
              key={lesson.id} 
              className="group hover:shadow-xl transition-all duration-300 relative overflow-hidden opacity-75"
            >
              {/* Coming Soon Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-muted/60 via-muted/40 to-muted/60 z-10 flex items-center justify-center">
                <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 shadow-lg">
                  Coming Soon
                </Badge>
              </div>

              <div className="absolute top-3 right-3">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="h-5 w-5 text-primary" />
                  <Badge variant="secondary" className="text-xs">
                    {lesson.level}
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {lesson.title}
                </CardTitle>
                <p className="text-sm text-text-muted line-clamp-2">
                  {lesson.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Quick Info */}
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{lesson.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{lesson.ageGroup}</span>
                  </div>
                </div>

                {/* Topics */}
                <div className="flex flex-wrap gap-1">
                  {lesson.topics.slice(0, 3).map((topic, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs border-primary/20"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 opacity-50 cursor-not-allowed" 
                    disabled
                  >
                    Get Notified
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Browse More */}
      <Card className="border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
        <CardContent className="py-8 text-center">
          <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Want to Add Your Own Lesson?</h3>
          <p className="text-text-muted mb-4 max-w-md mx-auto">
            Share your creative lessons with the community and get featured in our library
          </p>
          <Button variant="outline" className="border-primary/30 hover:bg-primary/5">
            Submit Your Lesson
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}