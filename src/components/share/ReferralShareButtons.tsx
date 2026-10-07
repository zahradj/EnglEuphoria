import React from 'react';
import { Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Props {
  link: string;
  /** Ready-to-send text (already contains the link). */
  message: string;
}

/**
 * Share buttons for a referral link: WhatsApp, Facebook, Instagram, LinkedIn.
 * Instagram has no web link for sharing a URL, so the phone's share sheet is used when there is one
 * (the person picks Instagram there); otherwise the message is copied and Instagram opens, ready to paste.
 */
export const ReferralShareButtons: React.FC<Props> = ({ link, message }) => {
  const { toast } = useToast();
  const open = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

  const shareInstagram = async () => {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title: 'Engleuphoria', text: message, url: link });
        return;
      }
    } catch (err) {
      // The person closed the share sheet: nothing more to do.
      if ((err as { name?: string })?.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(message);
      toast({ title: 'Message copied', description: 'Instagram is opening. Paste it in a story, post or message.' });
    } catch {
      toast({ title: 'Open Instagram and paste the link', description: link });
    }
    open('https://www.instagram.com/');
  };

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      <Button onClick={() => open(`https://wa.me/?text=${encodeURIComponent(message)}`)} className="bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2">
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Button>
      <Button
        onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(message)}`)}
        className="bg-[#1877F2] hover:bg-[#1466D0] text-white gap-2"
      >
        <Facebook className="h-4 w-4" />
        Facebook
      </Button>
      <Button
        onClick={shareInstagram}
        className="text-white gap-2 border-0 bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90"
      >
        <Instagram className="h-4 w-4" />
        Instagram
      </Button>
      <Button onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`)} className="bg-[#0A66C2] hover:bg-[#094EA0] text-white gap-2">
        <Linkedin className="h-4 w-4" />
        LinkedIn
      </Button>
    </div>
  );
};
