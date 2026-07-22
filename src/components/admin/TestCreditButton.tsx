import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const TestCreditButton: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAddCredits = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Check if a row exists
      const { data: existing } = await supabase
        .from('student_credits')
        .select('id, total_credits')
        .eq('student_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('student_credits')
          .update({ total_credits: (existing.total_credits || 0) + 100 })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('student_credits')
          .insert({ student_id: user.id, total_credits: 100 });
      }

      toast.success('Added 100 test credits to your account!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add credits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddCredits}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
    >
      <CreditCard className="h-4 w-4" />
      <Plus className="h-3 w-3" />
      Add 100 Test Credits
    </Button>
  );
};
