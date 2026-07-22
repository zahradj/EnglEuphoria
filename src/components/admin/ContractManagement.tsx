import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Plus, Send, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Contract {
  id: string;
  teacher_id: string;
  teacher_name: string | null;
  contract_type: string;
  base_rate_eur: number;
  start_date: string;
  end_date: string | null;
  bonus_structure: any;
  contract_status: string;
  signed_at: string | null;
  created_at: string;
}

export const ContractManagement: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    teacher_id: '',
    base_rate_eur: '15',
    start_date: new Date().toISOString().split('T')[0],
    contract_type: 'employment',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContracts();
    fetchTeachers();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('staff_contracts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setContracts(data);
    setLoading(false);
  };

  const fetchTeachers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, full_name, role')
      .eq('role', 'teacher');
    if (data) setTeachers(data.map(u => ({ id: u.id, name: u.full_name || 'Unknown' })));
  };

  const createContract = async () => {
    const teacher = teachers.find(t => t.id === form.teacher_id);
    const { error } = await supabase.from('staff_contracts').insert({
      teacher_id: form.teacher_id,
      teacher_name: teacher?.name || 'Unknown',
      base_rate_eur: parseFloat(form.base_rate_eur),
      start_date: form.start_date,
      contract_type: form.contract_type,
      contract_status: 'draft',
      bonus_structure: {
        mastery_bonus: '10% if student mastery >85%',
        retention_bonus: '€50/month if 0 cancellations',
      },
    });

    if (error) {
      toast({ title: 'Failed to create contract', variant: 'destructive' });
    } else {
      toast({ title: 'Contract created' });
      setIsOpen(false);
      fetchContracts();
    }
  };

  const sendContract = async (id: string) => {
    await supabase.from('staff_contracts').update({ contract_status: 'sent' }).eq('id', id);
    toast({ title: 'Contract sent to teacher for signing' });
    fetchContracts();
  };

  const signContract = async (id: string) => {
    await supabase.from('staff_contracts').update({
      contract_status: 'signed',
      signed_at: new Date().toISOString(),
    }).eq('id', id);
    toast({ title: 'Contract signed successfully' });
    fetchContracts();
  };

  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: <FileText className="h-3 w-3" /> },
    sent: { color: 'bg-blue-100 text-blue-700', icon: <Send className="h-3 w-3" /> },
    signed: { color: 'bg-[#2E7D32]/10 text-[#2E7D32]', icon: <CheckCircle className="h-3 w-3" /> },
    expired: { color: 'bg-red-100 text-red-700', icon: <Clock className="h-3 w-3" /> },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#6B21A8]">Digital Contracts</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[#6B21A8] hover:bg-[#6B21A8]/90">
              <Plus className="h-4 w-4" /> New Contract
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Employment Agreement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Teacher</Label>
                <Select value={form.teacher_id} onValueChange={v => setForm(f => ({ ...f, teacher_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Base Rate (€/hour)</Label>
                <Input type="number" value={form.base_rate_eur}
                  onChange={e => setForm(f => ({ ...f, base_rate_eur: e.target.value }))} />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <Label>Contract Type</Label>
                <Select value={form.contract_type} onValueChange={v => setForm(f => ({ ...f, contract_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employment">Full Employment</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="trial">Trial Period</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createContract} className="w-full bg-[#6B21A8] hover:bg-[#6B21A8]/90"
                disabled={!form.teacher_id}>
                Generate Contract
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading contracts...</p>
      ) : contracts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No contracts yet. Create one when a teacher is hired.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map(c => {
            const sc = statusConfig[c.contract_status] || statusConfig.draft;
            return (
              <Card key={c.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-[#6B21A8]/10 rounded-lg">
                        <FileText className="h-5 w-5 text-[#6B21A8]" />
                      </div>
                      <div>
                        <p className="font-medium">{c.teacher_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.contract_type} • €{c.base_rate_eur}/hr • Started {new Date(c.start_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${sc.color} gap-1`}>
                        {sc.icon} {c.contract_status}
                      </Badge>
                      {c.contract_status === 'draft' && (
                        <Button size="sm" variant="outline" onClick={() => sendContract(c.id)} className="gap-1">
                          <Send className="h-3 w-3" /> Send
                        </Button>
                      )}
                      {c.contract_status === 'sent' && (
                        <Button size="sm" variant="outline" onClick={() => signContract(c.id)} className="gap-1">
                          <CheckCircle className="h-3 w-3" /> Sign
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
