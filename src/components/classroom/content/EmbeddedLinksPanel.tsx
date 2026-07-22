
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, ExternalLink, Plus, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmbeddedLink {
  id: string;
  title: string;
  url: string;
  description?: string;
}

interface EmbeddedLinksPanelProps {
  isTeacher: boolean;
}

export function EmbeddedLinksPanel({ isTeacher }: EmbeddedLinksPanelProps) {
  const [links, setLinks] = useState<EmbeddedLink[]>([
    {
      id: '1',
      title: 'English Grammar Guide',
      url: 'https://example.com/grammar',
      description: 'Interactive grammar exercises'
    },
    {
      id: '2',
      title: 'Vocabulary Builder',
      url: 'https://example.com/vocab',
      description: 'Daily vocabulary practice'
    }
  ]);
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '' });
  const [selectedLink, setSelectedLink] = useState<EmbeddedLink | null>(null);
  const { toast } = useToast();

  const addLink = () => {
    if (!newLink.title || !newLink.url) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and URL",
        variant: "destructive"
      });
      return;
    }

    const link: EmbeddedLink = {
      id: Date.now().toString(),
      title: newLink.title,
      url: newLink.url,
      description: newLink.description
    };

    setLinks([...links, link]);
    setNewLink({ title: '', url: '', description: '' });
    toast({
      title: "Link Added",
      description: `${newLink.title} has been added to the classroom`
    });
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
    if (selectedLink?.id === id) {
      setSelectedLink(null);
    }
    toast({
      title: "Link Removed",
      description: "Link has been removed from the classroom"
    });
  };

  const openLink = (link: EmbeddedLink) => {
    setSelectedLink(link);
    window.open(link.url, '_blank');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Add new link form (only for teachers) */}
      {isTeacher && (
        <Card className="p-4 mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Plus size={16} />
            Add New Link
          </h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="link-title">Title</Label>
              <Input
                id="link-title"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                placeholder="Enter link title"
              />
            </div>
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="link-description">Description (optional)</Label>
              <Input
                id="link-description"
                value={newLink.description}
                onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                placeholder="Brief description of the link"
              />
            </div>
            <Button onClick={addLink} className="w-full">
              <Link size={16} className="mr-2" />
              Add Link
            </Button>
          </div>
        </Card>
      )}

      {/* Links list */}
      <Card className="flex-1 p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <ExternalLink size={16} />
          Classroom Links
        </h3>
        
        {links.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Link size={32} className="mx-auto mb-2 opacity-50" />
            <p>No links added yet</p>
            {isTeacher && <p className="text-sm">Add your first link above</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedLink?.id === link.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => openLink(link)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-600 hover:text-blue-800">
                      {link.title}
                    </h4>
                    {link.description && (
                      <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 truncate">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLink(link);
                      }}
                    >
                      <ExternalLink size={14} />
                    </Button>
                    {isTeacher && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLink(link.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Selected link preview */}
      {selectedLink && (
        <Card className="mt-4 p-4">
          <h4 className="font-medium mb-2">Currently Viewing:</h4>
          <p className="text-sm text-blue-600">{selectedLink.title}</p>
          <p className="text-xs text-gray-500">{selectedLink.url}</p>
        </Card>
      )}
    </div>
  );
}
