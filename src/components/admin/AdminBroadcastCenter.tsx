import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Send, Users, GraduationCap, Bell, Mail, 
  Loader2, CheckCircle2, Clock, AlertCircle,
  Hash, User
} from 'lucide-react';

type TargetAudience = 'students' | 'teachers' | 'all';

interface BroadcastHistory {
  id: string;
  title: string;
  message: string;
  target_audience: string;
  delivery_method: string[];
  recipients_count: number;
  status: string;
  created_at: string;
}

export const AdminBroadcastCenter = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('students');
  const [deliveryMethods, setDeliveryMethods] = useState<string[]>(['in_app']);
  const [isSending, setIsSending] = useState(false);

  const { data: history, refetch: refetchHistory } = useQuery({
    queryKey: ['broadcast-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('broadcasts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as BroadcastHistory[];
    },
  });

  const { data: audienceCounts } = useQuery({
    queryKey: ['audience-counts'],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role');
      if (error) throw error;
      const students = roles?.filter(r => r.role === 'student').length || 0;
      const teachers = roles?.filter(r => r.role === 'teacher').length || 0;
      return { students, teachers, all: students + teachers };
    },
  });

  const insertVariableTag = (tag: string) => {
    setMessage(prev => prev + `{{${tag}}}`);
  };

  const toggleDeliveryMethod = (method: string) => {
    setDeliveryMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleSendBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }
    if (deliveryMethods.length === 0) {
      toast.error('Select at least one delivery method');
      return;
    }
    if (!user?.id) return;

    setIsSending(true);
    try {
      // 1. Determine target roles
      const targetRoles: string[] =
        targetAudience === 'students' ? ['student'] :
        targetAudience === 'teachers' ? ['teacher'] :
        ['student', 'teacher'];

      // 2. Fetch target user IDs
      const { data: targetUsers, error: fetchError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', targetRoles);

      if (fetchError) throw fetchError;

      const uniqueUserIds = [...new Set(targetUsers?.map(u => u.user_id) || [])];

      if (uniqueUserIds.length === 0) {
        toast.warning('No users found for the selected audience');
        setIsSending(false);
        return;
      }

      // 3. If in-app, insert notifications for each user
      if (deliveryMethods.includes('in_app')) {
        const notifications = uniqueUserIds.map(userId => ({
          user_id: userId,
          title: title,
          content: message,
          type: 'broadcast' as const,
          is_read: false,
        }));

        // Insert in batches of 100
        for (let i = 0; i < notifications.length; i += 100) {
          const batch = notifications.slice(i, i + 100);
          const { error: insertError } = await supabase
            .from('notifications')
            .insert(batch);
          if (insertError) throw insertError;
        }
      }

      // 4. Record the broadcast
      const { error: broadcastError } = await supabase
        .from('broadcasts')
        .insert({
          admin_id: user.id,
          title,
          message,
          target_audience: targetAudience,
          delivery_method: deliveryMethods,
          recipients_count: uniqueUserIds.length,
          status: 'sent',
        });
      if (broadcastError) throw broadcastError;

      toast.success(`Broadcast sent to ${uniqueUserIds.length} users!`);
      setTitle('');
      setMessage('');
      refetchHistory();
    } catch (err: any) {
      console.error('Broadcast error:', err);
      toast.error('Failed to send broadcast: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSending(false);
    }
  };

  const audienceOptions: { value: TargetAudience; label: string; icon: React.ReactNode; count: number }[] = [
    { value: 'students', label: 'Students', icon: <Users className="h-4 w-4" />, count: audienceCounts?.students || 0 },
    { value: 'teachers', label: 'Teachers', icon: <GraduationCap className="h-4 w-4" />, count: audienceCounts?.teachers || 0 },
    { value: 'all', label: 'Everyone', icon: <Users className="h-4 w-4" />, count: audienceCounts?.all || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">📡 Broadcast Center</h2>
        <p className="text-muted-foreground">Send system announcements and notifications to your users</p>
      </div>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="history">History ({history?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          {/* Target Audience */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Target Audience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {audienceOptions.map(opt => (
                  <Button
                    key={opt.value}
                    variant={targetAudience === opt.value ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setTargetAudience(opt.value)}
                  >
                    {opt.icon}
                    <span className="ml-2">{opt.label}</span>
                    <Badge variant="secondary" className="ml-2">{opt.count}</Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                Delivery Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={deliveryMethods.includes('in_app')}
                    onCheckedChange={() => toggleDeliveryMethod('in_app')}
                  />
                  <Bell className="h-4 w-4 text-primary" />
                  <span>In-Platform Notification</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer opacity-50">
                  <Checkbox
                    checked={deliveryMethods.includes('email')}
                    onCheckedChange={() => toggleDeliveryMethod('email')}
                    disabled
                  />
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                  <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Composer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                Message Composer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
                <Input
                  placeholder="e.g. New Feature: Accessory Drop! 🎉"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                <Textarea
                  placeholder="Write your announcement here..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  maxLength={2000}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => insertVariableTag('name')}>
                      <User className="h-3 w-3 mr-1" /> {'{{name}}'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => insertVariableTag('hub_name')}>
                      {'{{hub_name}}'}
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">{message.length}/2000</span>
                </div>
              </div>

              {/* Preview */}
              {(title || message) && (
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-2">Preview</p>
                  <p className="font-semibold text-foreground">{title || 'Untitled'}</p>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                    {message.replace(/\{\{name\}\}/g, 'Jane Doe').replace(/\{\{hub_name\}\}/g, 'Playground')}
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleSendBroadcast}
                disabled={isSending || !title.trim() || !message.trim()}
              >
                {isSending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Send Broadcast to {audienceCounts?.[targetAudience] || 0} users</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              {!history?.length ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No broadcasts sent yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {history.map(b => (
                    <div key={b.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{b.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{b.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {b.target_audience}
                            </Badge>
                            {b.delivery_method?.map(m => (
                              <Badge key={m} variant="outline" className="text-xs">
                                {m === 'in_app' ? '🔔 In-App' : '✉️ Email'}
                              </Badge>
                            ))}
                            <span className="text-xs text-muted-foreground">
                              {b.recipients_count} recipients
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {b.status === 'sent' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : b.status === 'sending' ? (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(b.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
