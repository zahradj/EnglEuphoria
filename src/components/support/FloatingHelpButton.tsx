import React, { useState } from 'react';
import { HelpCircle, Send, Mic, Calendar, Monitor, Video, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { QuickFixItem } from './QuickFixItem';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const QUICK_FIXES = [
  {
    value: 'mic',
    icon: Mic,
    question: "My mic isn't working",
    answer: "Go to your browser settings → Site Settings → Microphone and ensure it's allowed. Try unplugging and re-plugging your mic. If using Bluetooth, reconnect the device. Restart the browser if needed.",
  },
  {
    value: 'booking',
    icon: Calendar,
    question: 'How to book a class',
    answer: "Go to your Student Dashboard → Find Teachers → Choose an available time slot → Confirm booking. You'll need credits or an active subscription to book.",
  },
  {
    value: 'slides',
    icon: Monitor,
    question: "I can't see the teacher's slides",
    answer: "Try refreshing the page (Ctrl+Shift+R). Ensure your browser is up to date. If the issue persists, toggle Zen Mode off and back on.",
  },
  {
    value: 'video',
    icon: Video,
    question: 'My video is laggy',
    answer: "Turn off your camera temporarily to prioritize audio. Close other browser tabs and applications. Switch to a wired connection if possible. Lower your video quality in settings.",
  },
  {
    value: 'cancel',
    icon: XCircle,
    question: 'How to cancel a class',
    answer: "Go to your Dashboard → My Schedule → Click the lesson → Cancel. Note: Cancellations within 24 hours of the class may not be refunded.",
  },
];

export const FloatingHelpButton: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        user_email: user.email || '',
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        category,
        message: message.trim(),
        priority: 'high',
      });

      if (error) throw error;
      toast.success('Support ticket submitted! We will get back to you soon.');
      setMessage('');
      setOpen(false);
    } catch {
      toast.error('Failed to send support request. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-transform hover:scale-110"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Help Center
          </DialogTitle>
        </DialogHeader>

        {/* Quick Fixes */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">⚡ Quick Fixes</h3>
          <Accordion type="single" collapsible className="w-full">
            {QUICK_FIXES.map(fix => (
              <QuickFixItem key={fix.value} {...fix} />
            ))}
          </Accordion>
        </div>

        <Separator />

        {/* Live Support Form */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">📩 Contact Support</h3>

          <Input
            value={user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''}
            disabled
            placeholder="Your name"
            className="text-sm"
          />

          <Input
            value={user?.email || ''}
            disabled
            placeholder="Your email"
            className="text-sm"
          />

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">🔧 Technical</SelectItem>
              <SelectItem value="billing">💳 Billing</SelectItem>
              <SelectItem value="general">💬 General</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Describe your issue..."
            className="text-sm min-h-[80px]"
            maxLength={1000}
          />

          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || sending}
            className="w-full gap-2"
          >
            <Send className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send Support Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
