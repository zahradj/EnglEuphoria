import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, CreditCard, Package, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Purchase {
  id: string;
  student_id: string;
  credits_purchased: number;
  amount_paid: number;
  payment_method: string | null;
  purchased_at: string;
  expires_at: string;
  pack_name?: string;
  student_name?: string;
}

export const SalesPanel: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCreditsIssued: 0,
    totalCreditsUsed: 0,
    deferredRevenue: 0,
    activePacks: 0,
  });

  const fetchSales = async () => {
    setLoading(true);
    try {
      // Fetch purchases with pack info
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('credit_purchases')
        .select(`
          id,
          student_id,
          credits_purchased,
          amount_paid,
          payment_method,
          purchased_at,
          expires_at,
          credit_packs!inner(name)
        `)
        .order('purchased_at', { ascending: false })
        .limit(50);

      if (purchaseError) throw purchaseError;

      // Fetch student names
      const studentIds = [...new Set((purchaseData || []).map((p: any) => p.student_id))];
      const { data: students } = studentIds.length > 0
        ? await supabase.from('users').select('id, full_name').in('id', studentIds)
        : { data: [] };

      const studentMap: Record<string, string> = {};
      students?.forEach((s: any) => { studentMap[s.id] = s.full_name || 'Unknown'; });

      const mapped: Purchase[] = (purchaseData || []).map((p: any) => ({
        id: p.id,
        student_id: p.student_id,
        credits_purchased: p.credits_purchased,
        amount_paid: Number(p.amount_paid),
        payment_method: p.payment_method,
        purchased_at: p.purchased_at,
        expires_at: p.expires_at,
        pack_name: p.credit_packs?.name || 'Unknown',
        student_name: studentMap[p.student_id] || 'Unknown',
      }));

      setPurchases(mapped);

      // Calculate stats
      const totalRevenue = mapped.reduce((sum, p) => sum + p.amount_paid, 0);
      const totalCreditsIssued = mapped.reduce((sum, p) => sum + p.credits_purchased, 0);
      const activePacks = mapped.filter(p => new Date(p.expires_at) > new Date()).length;

      // Get total used credits
      const { data: creditData } = await supabase
        .from('student_credits')
        .select('used_credits');
      const totalUsed = (creditData || []).reduce((sum: number, c: any) => sum + (c.used_credits || 0), 0);

      // Deferred revenue = (issued - used) * avg price per credit
      const avgPricePerCredit = totalCreditsIssued > 0 ? totalRevenue / totalCreditsIssued : 0;
      const deferredRevenue = (totalCreditsIssued - totalUsed) * avgPricePerCredit;

      setStats({
        totalRevenue,
        totalCreditsIssued,
        totalCreditsUsed: totalUsed,
        deferredRevenue: Math.max(deferredRevenue, 0),
        activePacks,
      });
    } catch (err) {
      console.error('Error fetching sales:', err);
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, []);

  if (loading) {
    return <div className="text-center text-muted-foreground py-8">Loading sales data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Revenue', value: `€${stats.totalRevenue.toFixed(2)}`, icon: <DollarSign className="h-6 w-6 text-emerald-500" />, color: 'text-emerald-600' },
          { label: 'Credits Issued', value: stats.totalCreditsIssued.toString(), icon: <CreditCard className="h-6 w-6 text-blue-500" />, color: 'text-blue-600' },
          { label: 'Credits Used', value: stats.totalCreditsUsed.toString(), icon: <Package className="h-6 w-6 text-purple-500" />, color: 'text-purple-600' },
          { label: 'Deferred Revenue', value: `€${stats.deferredRevenue.toFixed(2)}`, icon: <TrendingUp className="h-6 w-6 text-amber-500" />, color: 'text-amber-600' },
          { label: 'Active Packs', value: stats.activePacks.toString(), icon: <Clock className="h-6 w-6 text-cyan-500" />, color: 'text-cyan-600' },
        ].map(({ label, value, icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">{icon}</div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deferred Revenue Explanation */}
      {stats.deferredRevenue > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-400">Deferred Revenue: €{stats.deferredRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This is money collected for sessions not yet taught. It represents {stats.totalCreditsIssued - stats.totalCreditsUsed} unused credits.
            </p>
          </div>
        </div>
      )}

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Pack Purchases
          </CardTitle>
          <CardDescription>All credit pack sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Pack</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No purchases yet
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases.map((p) => {
                    const isExpired = new Date(p.expires_at) < new Date();
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.student_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {p.pack_name}
                          </Badge>
                        </TableCell>
                        <TableCell>{p.credits_purchased}</TableCell>
                        <TableCell className="font-semibold">€{p.amount_paid.toFixed(2)}</TableCell>
                        <TableCell className="capitalize text-xs text-muted-foreground">
                          {p.payment_method || 'manual'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(p.purchased_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={isExpired ? 'destructive' : 'outline'} className="text-xs">
                            {isExpired ? 'Expired' : new Date(p.expires_at).toLocaleDateString()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
