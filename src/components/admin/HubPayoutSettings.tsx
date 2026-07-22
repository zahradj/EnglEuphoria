import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HubRow {
  id: string;
  hub: string;
  payout_amount_eur: number;
}

const HUB_LABELS: Record<string, { label: string; emoji: string; tone: string }> = {
  playground: { label: 'Playground', emoji: '🎪', tone: 'text-orange-600' },
  academy: { label: 'Academy', emoji: '🎓', tone: 'text-indigo-600' },
  professional: { label: 'Success', emoji: '💼', tone: 'text-emerald-600' },
};

export const HubPayoutSettings: React.FC = () => {
  const [rows, setRows] = useState<HubRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingHub, setSavingHub] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hub_payout_settings')
      .select('id, hub, payout_amount_eur')
      .order('hub');
    if (error) {
      toast.error('Failed to load payout settings');
      setLoading(false);
      return;
    }
    setRows(data || []);
    const d: Record<string, string> = {};
    (data || []).forEach(r => { d[r.hub] = String(r.payout_amount_eur); });
    setDrafts(d);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (row: HubRow) => {
    const value = Number(drafts[row.hub]);
    if (Number.isNaN(value) || value < 0) {
      toast.error('Enter a valid non-negative number');
      return;
    }
    setSavingHub(row.hub);
    const { error } = await supabase
      .from('hub_payout_settings')
      .update({ payout_amount_eur: value })
      .eq('id', row.id);
    setSavingHub(null);
    if (error) {
      toast.error('Failed to update: ' + error.message);
      return;
    }
    toast.success(`${HUB_LABELS[row.hub]?.label || row.hub} payout updated to €${value.toFixed(2)}`);
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Hub Payout Rates
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set the per-lesson payout teachers receive when they teach in each hub. Applied automatically to new bookings.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rows.map((row) => {
              const meta = HUB_LABELS[row.hub] || { label: row.hub, emoji: '•', tone: 'text-foreground' };
              return (
                <div key={row.id} className="p-4 border rounded-lg space-y-3 bg-card">
                  <div className={`font-semibold flex items-center gap-2 ${meta.tone}`}>
                    <span className="text-lg">{meta.emoji}</span>
                    {meta.label}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`payout-${row.hub}`} className="text-xs text-muted-foreground">
                      Payout per lesson (EUR)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`payout-${row.hub}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={drafts[row.hub] ?? ''}
                        onChange={(e) => setDrafts({ ...drafts, [row.hub]: e.target.value })}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSave(row)}
                        disabled={savingHub === row.hub || drafts[row.hub] === String(row.payout_amount_eur)}
                      >
                        {savingHub === row.hub ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current: €{Number(row.payout_amount_eur).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
