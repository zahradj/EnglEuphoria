import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Download, DollarSign, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  lesson_id: string;
  student_id: string;
  teacher_id: string;
  amount_charged: number;
  teacher_payout: number;
  platform_profit: number;
  created_at: string;
  student_name?: string;
  teacher_name?: string;
  lesson_title?: string;
  lesson_duration?: number;
}

export function TransactionLogs() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7');
  const { toast } = useToast();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Calculate date filter
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(dateFilter));

      const { data, error } = await supabase
        .from('lesson_payments')
        .select(`
          *,
          lessons!inner(
            id,
            title,
            duration,
            student_id,
            teacher_id
          ),
          student:users!lesson_payments_student_id_fkey(full_name),
          teacher:users!lesson_payments_teacher_id_fkey(full_name)
        `)
        .gte('created_at', dateFrom.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTransactions = data?.map((item: any) => ({
        id: item.id,
        lesson_id: item.lesson_id,
        student_id: item.student_id,
        teacher_id: item.teacher_id,
        amount_charged: item.amount_charged,
        teacher_payout: item.teacher_payout,
        platform_profit: item.platform_profit,
        created_at: item.created_at,
        student_name: item.student?.full_name,
        teacher_name: item.teacher?.full_name,
        lesson_title: item.lessons?.title,
        lesson_duration: item.lessons?.duration
      })) || [];

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transaction logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription for new transactions
  useEffect(() => {
    const channel = supabase
      .channel('admin-transaction-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_payments'
        },
        (payload) => {
          toast({
            title: "New Transaction",
            description: `€${payload.new.amount_charged} payment processed`,
            duration: 3000,
          });
          fetchTransactions(); // Refresh the list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  useEffect(() => {
    fetchTransactions();
  }, [dateFilter]);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      transaction.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.lesson_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount_charged, 0);
  const totalTeacherPayouts = filteredTransactions.reduce((sum, t) => sum + t.teacher_payout, 0);
  const totalPlatformProfit = filteredTransactions.reduce((sum, t) => sum + t.platform_profit, 0);

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Student', 'Teacher', 'Lesson', 'Duration', 'Amount', 'Teacher Payout', 'Platform Profit'],
      ...filteredTransactions.map(t => [
        format(new Date(t.created_at), 'yyyy-MM-dd HH:mm'),
        t.student_name || 'Unknown',
        t.teacher_name || 'Unknown',
        t.lesson_title || 'Unknown',
        `${t.lesson_duration || 0} min`,
        `€${t.amount_charged.toFixed(2)}`,
        `€${t.teacher_payout.toFixed(2)}`,
        `€${t.platform_profit.toFixed(2)}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {filteredTransactions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teacher Payouts</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalTeacherPayouts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalTeacherPayouts / totalAmount) * 100 || 0).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalPlatformProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalPlatformProfit / totalAmount) * 100 || 0).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Transaction Logs</CardTitle>
              <CardDescription>
                Real-time payment transaction history and audit trail
              </CardDescription>
            </div>
            <Button onClick={exportTransactions} variant="outline" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student, teacher, or lesson..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Teacher Payout</TableHead>
                  <TableHead>Platform Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-muted rounded animate-pulse"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.created_at), 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.student_name || 'Unknown'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.teacher_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {transaction.lesson_title || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.lesson_duration || 0} min
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        €{transaction.amount_charged.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-green-600">
                        €{transaction.teacher_payout.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-blue-600">
                        €{transaction.platform_profit.toFixed(2)}
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
}