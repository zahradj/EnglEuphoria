import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, CreditCard, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Payment {
  id: string;
  lesson_id: string;
  student_id: string;
  teacher_id: string;
  amount_charged: number;
  teacher_payout: number;
  platform_profit: number;
  created_at: string;
}

export const PaymentsPanel = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    teacherPayouts: 0,
    platformProfit: 0,
    transactionCount: 0,
  });

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setPayments(data || []);

      // Calculate stats
      const totalRevenue = data?.reduce((sum, payment) => sum + (payment.amount_charged || 0), 0) || 0;
      const teacherPayouts = data?.reduce((sum, payment) => sum + (payment.teacher_payout || 0), 0) || 0;
      const platformProfit = data?.reduce((sum, payment) => sum + (payment.platform_profit || 0), 0) || 0;

      setStats({
        totalRevenue,
        teacherPayouts,
        platformProfit,
        transactionCount: data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-muted-foreground">Loading payment data...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teacher Payouts</p>
                <p className="text-2xl font-bold">€{stats.teacherPayouts.toFixed(2)}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform Profit</p>
                <p className="text-2xl font-bold">€{stats.platformProfit.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{stats.transactionCount}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Amount Charged</TableHead>
                  <TableHead>Teacher Payout</TableHead>
                  <TableHead>Platform Profit</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>€{payment.amount_charged?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>€{payment.teacher_payout?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>€{payment.platform_profit?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Completed</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};