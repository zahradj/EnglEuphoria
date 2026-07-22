import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, MessageCircle, Pin, Send, Plus } from 'lucide-react';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { CreatePostData } from '@/types/community';
import { formatDistanceToNow } from 'date-fns';

interface CommunityPostsProps {
  communityId: string;
}

export function CommunityPosts({ communityId }: CommunityPostsProps) {
  const { posts, loading, createPost, likePost } = useCommunityPosts(communityId);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postType, setPostType] = useState<'discussion' | 'question' | 'announcement'>('discussion');
  const [submitting, setSubmitting] = useState(false);

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;

    setSubmitting(true);
    try {
      const postData: CreatePostData = {
        community_id: communityId,
        content: postContent,
        title: postTitle.trim() || undefined,
        post_type: postType
      };

      await createPost(postData);
      setPostContent('');
      setPostTitle('');
      setShowCreatePost(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'question':
        return 'bg-blue-100 text-blue-800';
      case 'announcement':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'question':
        return 'Question';
      case 'announcement':
        return 'Announcement';
      default:
        return 'Discussion';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded mb-2 w-1/4"></div>
                  <div className="h-3 bg-muted rounded mb-3 w-3/4"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create Post */}
      <Card>
        <CardContent className="p-4">
          {!showCreatePost ? (
            <Button 
              onClick={() => setShowCreatePost(true)} 
              variant="outline" 
              className="w-full justify-start gap-2"
            >
              <Plus className="w-4 h-4" />
              Start a discussion...
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Post title (optional)"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                />
                <Select value={postType} onValueChange={(value: any) => setPostType(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Textarea
                placeholder="What would you like to share with the community?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
              />
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePost} 
                  disabled={!postContent.trim() || submitting}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts List */}
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.author?.avatar_url} />
                <AvatarFallback>
                  {post.author?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">
                    {post.author?.full_name || 'Anonymous'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                  {post.is_pinned && <Pin className="w-4 h-4 text-yellow-600" />}
                  <Badge className={`text-xs ${getPostTypeColor(post.post_type)}`}>
                    {getPostTypeLabel(post.post_type)}
                  </Badge>
                </div>
                
                {post.title && (
                  <h3 className="font-semibold mb-2">{post.title}</h3>
                )}
                
                <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>
                
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likePost(post.id)}
                    className="gap-1 p-0 h-auto"
                  >
                    <Heart className="w-4 h-4" />
                    {post.likes_count}
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {post.replies_count}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Empty State */}
      {posts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to start a discussion in this community!
            </p>
            <Button onClick={() => setShowCreatePost(true)}>
              Create First Post
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}