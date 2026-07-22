import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, FileText, Image, Video, Music, File, Trash2, Eye, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Asset {
  id: string;
  title: string;
  type: string;
  file_url: string;
  file_type: string;
  cefr_level: string;
  skill_focus: string[];
  visibility: string;
  tags: string[];
  created_at: string;
}

export const AssetGrid = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemFilter, setSystemFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('curriculum_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const { error } = await supabase
        .from('curriculum_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAssets(prev => prev.filter(a => a.id !== id));
      toast.success('Asset deleted');
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset');
    }
  };

  const getTypeIcon = (type: string) => {
    if (type?.includes('image')) return <Image className="h-5 w-5 text-green-500" />;
    if (type?.includes('video')) return <Video className="h-5 w-5 text-purple-500" />;
    if (type?.includes('audio')) return <Music className="h-5 w-5 text-orange-500" />;
    if (type?.includes('pdf') || type?.includes('document')) return <FileText className="h-5 w-5 text-blue-500" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const getSystemBadge = (tags: string[]) => {
    if (!tags) return null;
    return tags.map(tag => {
      switch (tag) {
        case 'kids':
          return <Badge key={tag} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">🎪 Playground</Badge>;
        case 'teen':
          return <Badge key={tag} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">🏛️ Academy</Badge>;
        case 'adult':
          return <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">🏢 Hub</Badge>;
        default:
          return null;
      }
    });
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'teacher_only':
        return <Badge variant="secondary">🔒 Teacher Only</Badge>;
      case 'student_accessible':
        return <Badge variant="secondary">👁️ Student</Badge>;
      case 'both':
        return <Badge variant="secondary">👥 Both</Badge>;
      default:
        return null;
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSystem = systemFilter === 'all' || asset.tags?.includes(systemFilter);
    const matchesVisibility = visibilityFilter === 'all' || asset.visibility === visibilityFilter;
    return matchesSearch && matchesSystem && matchesVisibility;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={systemFilter} onValueChange={setSystemFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="System" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Systems</SelectItem>
            <SelectItem value="kids">🎪 Playground</SelectItem>
            <SelectItem value="teen">🏛️ Academy</SelectItem>
            <SelectItem value="adult">🏢 Hub</SelectItem>
          </SelectContent>
        </Select>
        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="teacher_only">Teacher Only</SelectItem>
            <SelectItem value="student_accessible">Student</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Asset Grid */}
      {filteredAssets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No assets found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map(asset => (
            <Card key={asset.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    {getTypeIcon(asset.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{asset.title}</h3>
                    <p className="text-sm text-muted-foreground">{asset.cefr_level}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {getSystemBadge(asset.tags)}
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {asset.skill_focus?.map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {getVisibilityBadge(asset.visibility)}
                  <div className="flex gap-1">
                    {asset.file_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(asset.file_url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(asset.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
