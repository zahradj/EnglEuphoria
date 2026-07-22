import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Download, RefreshCw, DollarSign, Users, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayrollRecord {
  id: string;
  teacher_id: string;
  teacher_name: string | null;
  month: number;
  year: number;
  total_lessons: number;
  total_hours: number;
  hourly_rate: number;
  base_pay: number;
  bonus_amount: number;
  total_earned: number;
  payment_status: string;
  payment_method: string | null;
  processed_at: string | null;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const PayrollLedger: React.FC = () => {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayroll();
  }, [selectedMonth, selectedYear]);

  const fetchPayroll = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payroll_records')
      .select('*')
      .eq('month', selectedMonth)
      .eq('year', selectedYear)
      .order('teacher_name');

    if (!error && data) setRecords(data);
    setLoading(false);
  };

  const syncFromLessons = async () => {
    setSyncing(true);
    try {
      // Get all teachers with completed lessons this month
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString();
      const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59).toISOString();

      const { data: lessons } = await supabase
        .from('lessons')
        .select('teacher_id, duration, status')
        .eq('status', 'completed')
        .gte('scheduled_at', startDate)
        .lte('scheduled_at', endDate);

      if (!lessons || lessons.length === 0) {
        toast({ title: 'No completed lessons found for this period' });
        setSyncing(false);
        return;
      }

      // Group by teacher
      const teacherMap: Record<string, { lessons: number; hours: number }> = {};
      for (const l of lessons) {
        if (!teacherMap[l.teacher_id]) teacherMap[l.teacher_id] = { lessons: 0, hours: 0 };
        teacherMap[l.teacher_id].lessons++;
        teacherMap[l.teacher_id].hours += (l.duration || 30) / 60;
      }

      // Get teacher names and rates
      const teacherIds = Object.keys(teacherMap);
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', teacherIds);

      const { data: profiles } = await supabase
        .from('teacher_profiles')
        .select('user_id, hourly_rate_eur')
        .in('user_id', teacherIds);

      const nameMap: Record<string, string> = {};
      const rateMap: Record<string, number> = {};
      users?.forEach(u => { nameMap[u.id] = u.full_name || 'Unknown'; });
      profiles?.forEach(p => { rateMap[p.user_id] = p.hourly_rate_eur || 15; });

      // Upsert payroll records
      for (const [teacherId, stats] of Object.entries(teacherMap)) {
        const rate = rateMap[teacherId] || 15;
        const basePay = stats.hours * rate;

        await supabase.from('payroll_records').upsert({
          teacher_id: teacherId,
          teacher_name: nameMap[teacherId] || 'Unknown',
          month: selectedMonth,
          year: selectedYear,
          total_lessons: stats.lessons,
          total_hours: parseFloat(stats.hours.toFixed(2)),
          hourly_rate: rate,
          base_pay: parseFloat(basePay.toFixed(2)),
          total_earned: parseFloat(basePay.toFixed(2)),
        }, { onConflict: 'teacher_id,month,year' });
      }

      toast({ title: 'Payroll synced successfully' });
      fetchPayroll();
    } catch (err) {
      console.error(err);
      toast({ title: 'Sync failed', variant: 'destructive' });
    }
    setSyncing(false);
  };

  const exportCSV = () => {
    const header = 'Teacher Name,Hours This Month,Hourly Rate (EUR),Base Pay (EUR),Bonus (EUR),Total Earned (EUR),Payment Status\n';
    const rows = records.map(r =>
      `"${r.teacher_name}",${r.total_hours},${r.hourly_rate},${r.base_pay},${r.bonus_amount},${r.total_earned},${r.payment_status}`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exported — compatible with Wise/PayPal bulk payments' });
  };

  const markAsPaid = async (id: string) => {
    await supabase.from('payroll_records').update({
      payment_status: 'paid',
      processed_at: new Date().toISOString(),
    }).eq('id', id);
    fetchPayroll();
    toast({ title: 'Marked as paid' });
  };

  const totals = records.reduce((acc, r) => ({
    hours: acc.hours + r.total_hours,
    earned: acc.earned + r.total_earned,
    pending: acc.pending + (r.payment_status === 'pending' ? r.total_earned : 0),
  }), { hours: 0, earned: 0, pending: 0 });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#6B21A8]/10 rounded-lg">
                <Users className="h-5 w-5 text-[#6B21A8]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Teachers</p>
                <p className="text-xl font-bold text-[#6B21A8]">{records.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2E7D32]/10 rounded-lg">
                <Clock className="h-5 w-5 text-[#2E7D32]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Hours</p>
                <p className="text-xl font-bold text-[#2E7D32]">{totals.hours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Payroll</p>
                <p className="text-xl font-bold text-amber-600">€{totals.earned.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-red-500">€{totals.pending.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={String(selectedMonth)} onValueChange={v => setSelectedMonth(Number(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2025, 2026, 2027].map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={syncFromLessons} disabled={syncing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          Sync from Lessons
        </Button>
        <Button variant="outline" onClick={exportCSV} disabled={records.length === 0} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV (Wise/PayPal)
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Payroll — {MONTHS[selectedMonth - 1]} {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No payroll records. Click "Sync from Lessons" to generate.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Teacher</th>
                    <th className="pb-3 font-medium">Hours</th>
                    <th className="pb-3 font-medium">Rate</th>
                    <th className="pb-3 font-medium">Base Pay</th>
                    <th className="pb-3 font-medium">Bonus</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{r.teacher_name || 'Unknown'}</td>
                      <td className="py-3">{r.total_hours}h</td>
                      <td className="py-3">€{r.hourly_rate}</td>
                      <td className="py-3">€{r.base_pay}</td>
                      <td className="py-3 text-[#2E7D32]">€{r.bonus_amount}</td>
                      <td className="py-3 font-semibold">€{r.total_earned}</td>
                      <td className="py-3">
                        <Badge variant={r.payment_status === 'paid' ? 'default' : 'secondary'}
                          className={r.payment_status === 'paid' ? 'bg-[#2E7D32]' : ''}>
                          {r.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {r.payment_status !== 'paid' && (
                          <Button size="sm" variant="outline" onClick={() => markAsPaid(r.id)} className="gap-1">
                            <CheckCircle className="h-3 w-3" /> Pay
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
