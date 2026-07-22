import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useCommunities } from '@/hooks/useCommunities';
import { CreateCommunityData, COMMUNITY_CATEGORIES, CEFR_LEVELS } from '@/types/community';

interface CreateCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCommunityDialog({ open, onOpenChange }: CreateCommunityDialogProps) {
  const { createCommunity } = useCommunities();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCommunityData>({
    name: '',
    description: '',
    category: 'conversation_practice',
    privacy_level: 'public',
    cefr_level: 'B1',
    max_members: 50,
    tags: [],
    community_rules: '',
    requires_approval: false,
    weekly_goal_hours: 2
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createCommunity(formData);
      onOpenChange(false);
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'conversation_practice',
        privacy_level: 'public',
        cefr_level: 'B1',
        max_members: 50,
        tags: [],
        community_rules: '',
        requires_approval: false,
        weekly_goal_hours: 2
      });
      setNewTag('');
    } catch (error) {
      console.error('Failed to create community:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Learning Community</DialogTitle>
          <DialogDescription>
            Create a space for learners to connect, practice, and grow together.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Community Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter community name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what your community is about..."
                rows={3}
              />
            </div>
          </div>

          {/* Category and Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMUNITY_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div>
                        <div className="font-medium">{category.label}</div>
                        <div className="text-xs text-muted-foreground">{category.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target Level</Label>
              <Select
                value={formData.cefr_level}
                onValueChange={(value) => setFormData(prev => ({ ...prev, cefr_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CEFR_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Privacy and Settings */}
          <div className="space-y-4">
            <div>
              <Label>Privacy Level</Label>
              <Select
                value={formData.privacy_level}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, privacy_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div>
                      <div className="font-medium">Public</div>
                      <div className="text-xs text-muted-foreground">Anyone can join</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div>
                      <div className="font-medium">Private</div>
                      <div className="text-xs text-muted-foreground">Invite only</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="invite_only">
                    <div>
                      <div className="font-medium">Invite Only</div>
                      <div className="text-xs text-muted-foreground">By invitation only</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxMembers">Max Members</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="5"
                  max="1000"
                  value={formData.max_members}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_members: parseInt(e.target.value) }))}
                />
              </div>

              <div>
                <Label htmlFor="weeklyGoal">Weekly Goal (hours)</Label>
                <Input
                  id="weeklyGoal"
                  type="number"
                  min="1"
                  max="40"
                  value={formData.weekly_goal_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, weekly_goal_hours: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requiresApproval"
                checked={formData.requires_approval}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_approval: checked }))}
              />
              <Label htmlFor="requiresApproval">Require approval to join</Label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Community Rules */}
          <div>
            <Label htmlFor="rules">Community Rules (Optional)</Label>
            <Textarea
              id="rules"
              value={formData.community_rules}
              onChange={(e) => setFormData(prev => ({ ...prev, community_rules: e.target.value }))}
              placeholder="Set some ground rules for your community..."
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Creating...' : 'Create Community'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}