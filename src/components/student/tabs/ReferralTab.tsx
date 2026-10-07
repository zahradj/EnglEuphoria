import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Copy, Check, Share2, Users, Award } from 'lucide-react';
import { ReferralShareButtons } from '@/components/share/ReferralShareButtons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReferralTabProps {
  /** Where the friend lands: students share the student sign-up, families the parent sign-up. */
  signupPath?: '/student-signup' | '/parent-signup';
  /** Wording for a parent inviting another family. */
  family?: boolean;
}

export const ReferralTab: React.FC<ReferralTabProps> = ({ signupPath = '/student-signup', family = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ totalInvited: 0, completed: 0, creditsEarned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchReferralData = async () => {
      setLoading(true);
      try {
        // Fetch referral code
        const { data: userData } = await supabase
          .from('users')
          .select('referral_code')
          .eq('id', user.id)
          .single();

        if (userData?.referral_code) {
          setReferralCode(userData.referral_code);
        }

        // Fetch referral stats
        const { data: referrals } = await supabase
          .from('referrals')
          .select('status, reward_given')
          .eq('referrer_id', user.id);

        if (referrals) {
          setStats({
            totalInvited: referrals.length,
            completed: referrals.filter(r => r.status === 'completed').length,
            creditsEarned: referrals.filter(r => r.reward_given).length,
          });
        }
      } catch (err) {
        console.error('Error fetching referral data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [user?.id]);

  const referralLink = `${window.location.origin}${signupPath}?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({ title: 'Link Copied!', description: 'Share it with your friends.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy the link manually.', variant: 'destructive' });
    }
  };

  const shareMessage = family
    ? `Join me on Engleuphoria — live English lessons for the whole family! Sign up with my link and when you buy your first lesson pack we BOTH get a free 25-minute lesson 🎁 ${referralLink}`
    : `Join me on Engleuphoria — the AI-powered English learning platform! Sign up with my link and when you buy your first lesson pack we BOTH get a free 25-minute lesson 🎁 ${referralLink}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Hero Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Give a Lesson, Get a Lesson! 🎁</CardTitle>
              <CardDescription className="text-base mt-1">
                {family
                  ? 'Invite another family to Engleuphoria. When they buy their first package, you BOTH get a free 25-minute lesson for a child.'
                  : 'Invite a friend to Engleuphoria. When they buy their first package, you BOTH get a free 25-minute lesson.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Referral Link & Share */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Link Display */}
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 bg-muted rounded-lg font-mono text-sm truncate border">
              {referralLink}
            </div>
            <Button onClick={handleCopy} variant="outline" size="icon" className="shrink-0">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {/* Referral Code Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Your code:</span>
            <Badge variant="secondary" className="font-mono text-base px-3 py-1">
              {referralCode}
            </Badge>
          </div>

          {/* Share Buttons */}
          <ReferralShareButtons link={referralLink} message={shareMessage} />
        </CardContent>
      </Card>

      {/* Stats Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Friends Invited
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-muted/50 border">
              <div className="text-3xl font-bold text-primary">{stats.totalInvited}</div>
              <div className="text-sm text-muted-foreground mt-1">Friends Joined</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50 border">
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground mt-1">Completed</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50 border">
              <div className="text-3xl font-bold text-amber-600">{stats.creditsEarned}</div>
              <div className="text-sm text-muted-foreground mt-1">
                <Award className="h-4 w-4 inline mr-1" />
                Credits Earned
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Share your link', desc: 'Send your unique referral link via WhatsApp, Facebook, Instagram, LinkedIn or any channel.' },
              { step: '2', title: 'Friend signs up', desc: 'Your friend creates an account using your link.' },
              { step: '3', title: 'Friend buys a package', desc: 'When they purchase their first credit pack, the magic happens!' },
              { step: '4', title: 'You both win! 🎉', desc: 'You get +1 free session credit. Your friend gets +1 bonus session too.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
