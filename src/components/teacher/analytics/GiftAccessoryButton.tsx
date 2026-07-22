import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gift, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface GiftAccessoryButtonProps {
  studentId: string;
  studentName: string;
}

export const GiftAccessoryButton: React.FC<GiftAccessoryButtonProps> = ({ studentId, studentName }) => {
  const [open, setOpen] = useState(false);
  const [selectedAccessoryId, setSelectedAccessoryId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Fetch available accessories
  const { data: accessories = [] } = useQuery({
    queryKey: ['all-accessories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('accessories')
        .select('id, name, type, hub_requirement, image_url')
        .order('name');
      return data || [];
    },
  });

  // Fetch student's existing inventory to avoid duplicates
  const { data: existingIds = [] } = useQuery({
    queryKey: ['student-owned-accessories', studentId],
    queryFn: async () => {
      const { data } = await supabase
        .from('student_inventory')
        .select('accessory_id')
        .eq('student_id', studentId);
      return (data || []).map((d: any) => d.accessory_id);
    },
    enabled: !!studentId,
  });

  const availableAccessories = accessories.filter((a: any) => !existingIds.includes(a.id));

  const handleGift = async () => {
    if (!selectedAccessoryId) return;
    setSending(true);
    try {
      const { error } = await supabase
        .from('student_inventory')
        .insert([{ student_id: studentId, accessory_id: selectedAccessoryId, is_equipped: false }] as any);

      if (error) throw error;

      const name = accessories.find((a: any) => a.id === selectedAccessoryId)?.name || 'Item';
      toast.success(`🎁 "${name}" sent to ${studentName}'s Vault!`);
      setOpen(false);
      setSelectedAccessoryId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to gift accessory');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Gift className="h-3.5 w-3.5" />
          Gift
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Gift Accessory to {studentName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {availableAccessories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              This student already owns all available accessories! 🎉
            </p>
          ) : (
            <>
              <Select value={selectedAccessoryId || ''} onValueChange={setSelectedAccessoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an accessory..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAccessories.map((acc: any) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type} · {acc.hub_requirement})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleGift}
                disabled={!selectedAccessoryId || sending}
                className="w-full gap-2"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                Send to Vault
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
