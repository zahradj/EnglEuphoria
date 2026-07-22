import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Image,
  Video,
  Download,
  Plus,
  Search,
  Filter,
  BookOpen,
  GraduationCap,
  Clock,
  BarChart3,
  Star,
  Users,
  Target,
  Trophy,
  MapPin
} from "lucide-react";
import { ContentItem, AdventureLesson } from "./types";
// Placeholder for systematic lessons - would be imported from curriculum module
import { PlacementTestLibrary } from "./PlacementTestLibrary";
import { AdventuresLibrary } from "./AdventuresLibrary";
import { AdventureViewer } from "./AdventureViewer";

interface EnhancedContentLibraryProps {
  contentItems?: ContentItem[];
  selectedContent?: ContentItem | null;
  onSelectContent?: (content: ContentItem) => void;
  onDeleteFile?: (id: string) => void;
  onAddToWhiteboard?: (content: ContentItem) => void;
  onPreviewFile?: (content: ContentItem) => void;
  userRole?: 'student' | 'teacher' | 'admin';
}

interface ContentFilter {
  type: 'all' | 'pdf' | 'image' | 'video' | 'interactive';
  level: 'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  subject: 'all' | 'grammar' | 'vocabulary' | 'speaking' | 'listening' | 'reading' | 'writing';
}

export const EnhancedContentLibrary: React.FC<EnhancedContentLibraryProps> = ({
  contentItems = [],
  selectedContent,
  onSelectContent,
  onDeleteFile,
  onAddToWhiteboard,
  onPreviewFile,
  userRole = 'student'
}) => {
  const [activeTab, setActiveTab] = useState('systematic');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdventure, setSelectedAdventure] = useState<AdventureLesson | null>(null);
  const [filters, setFilters] = useState<ContentFilter>({
    type: 'all',
    level: 'all',
    subject: 'all'
  });

  // Combine all content types
  const getAllContent = () => {
    return contentItems.map(item => ({ ...item, contentType: 'upload' }));
  };

  // Filter content based on search and filters
  const getFilteredContent = () => {
    let filtered = getAllContent();

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.topic?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    // Level filter
    if (filters.level !== 'all') {
      filtered = filtered.filter(item => item.level === filters.level);
    }

    return filtered;
  };

  const handleDownloadContent = async (item: ContentItem) => {
    try {
      // Implementation would go here
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleAddToWhiteboard = (item: ContentItem) => {
    onAddToWhiteboard?.(item);
  };

  const getContentIcon = (item: ContentItem) => {
    switch (item.type) {
      case 'video': return Video;
      case 'image': return Image;
      case 'interactive': return Star;
      case 'adventure': return MapPin;
      default: return FileText;
    }
  };

  const getContentColor = (item: ContentItem) => {
    switch (item.type) {
      case 'video': return 'bg-red-100 text-red-700';
      case 'image': return 'bg-green-100 text-green-700';
      case 'interactive': return 'bg-purple-100 text-purple-700';
      case 'adventure': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getLevelColor = (level: string) => {
    const colors = {
      A1: 'bg-green-100 text-green-800',
      A2: 'bg-blue-100 text-blue-800',
      B1: 'bg-yellow-100 text-yellow-800',
      B2: 'bg-orange-100 text-orange-800',
      C1: 'bg-red-100 text-red-800',
      C2: 'bg-purple-100 text-purple-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredContent = getFilteredContent();

  // Content statistics
  const contentStats = {
    total: filteredContent.length,
    uploads: contentItems.length,
    byLevel: {
      A1: filteredContent.filter(item => item.level === 'A1').length,
      A2: filteredContent.filter(item => item.level === 'A2').length,
      B1: filteredContent.filter(item => item.level === 'B1').length,
      B2: filteredContent.filter(item => item.level === 'B2').length,
      C1: filteredContent.filter(item => item.level === 'C1').length,
      C2: filteredContent.filter(item => item.level === 'C2').length
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Library Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Enhanced Content Library
          </CardTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{contentStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{contentStats.uploads}</div>
              <div className="text-sm text-muted-foreground">Uploaded Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">42</div>
              <div className="text-sm text-muted-foreground">Adventures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-sm text-muted-foreground">Levels</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="systematic" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Systematic Lessons
          </TabsTrigger>
          <TabsTrigger value="adventures" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            A-Name's Adventures
          </TabsTrigger>
          <TabsTrigger value="placement" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Placement Test
          </TabsTrigger>
          <TabsTrigger value="uploaded" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Uploaded Files ({contentItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="systematic">
          <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Systematic lessons library coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="adventures">
          {selectedAdventure ? (
            <AdventureViewer
              adventure={selectedAdventure}
              onBack={() => setSelectedAdventure(null)}
              onStartLesson={() => {
                // Handle lesson start - could integrate with existing lesson system
              }}
            />
          ) : (
            <AdventuresLibrary
              onSelectAdventure={setSelectedAdventure}
              onAddToWhiteboard={(adventure) => {
                // Convert adventure to ContentItem format for whiteboard
                const adventureContent: ContentItem = {
                  id: adventure.id,
                  type: 'adventure',
                  title: adventure.title,
                  source: `/adventures/${adventure.id}`,
                  uploadedBy: 'A-Name\'s Adventures',
                  timestamp: new Date(),
                  level: adventure.cefr_level,
                  duration: parseInt(adventure.estimated_duration.split('-')[0]),
                  metadata: {
                    cefr_level: adventure.cefr_level,
                    phonics_focus: adventure.phonics_focus,
                    completion_status: adventure.completion_status,
                    unit_number: adventure.unit_number,
                    lesson_number: adventure.lesson_number,
                    learning_objectives: adventure.learning_objectives,
                  }
                };
                onAddToWhiteboard?.(adventureContent);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="placement">
          <PlacementTestLibrary />
        </TabsContent>

        <TabsContent value="uploaded" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Content Grid */}
          {filteredContent.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredContent.map((item) => {
                const IconComponent = getContentIcon(item);
                return (
                  <Card
                    key={item.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedContent?.id === item.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => onSelectContent?.(item)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${getContentColor(item)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        {item.level && (
                          <Badge className={getLevelColor(item.level)}>
                            {item.level}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-sm line-clamp-2">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{item.duration ? `${item.duration} min` : 'Duration not set'}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewFile?.(item);
                          }}
                        >
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToWhiteboard(item);
                          }}
                        >
                          Add to Board
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'No content found matching your search.' : 'No uploaded content yet.'}
                </p>
                {userRole === 'teacher' && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Content
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};