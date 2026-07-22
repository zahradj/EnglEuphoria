import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useClassroomAudits } from '@/hooks/admin/useClassroomAudits';
import { AuditRow } from '@/components/admin/audits/AuditRow';
import { ShieldAlert } from 'lucide-react';

/**
 * Super Admin "Classroom Dispute Resolution" view.
 * Lists every incomplete classroom session with its AI verdict and
 * exposes the 5-tier resolution action bar.
 */
export default function ClassroomAudits() {
  const { rows, loading } = useClassroomAudits();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!q) return rows;
    const lc = q.toLowerCase();
    return rows.filter((r) =>
      [r.fault_type, r.ai_verdict, r.teacher_id, r.student_id, r.lesson_title]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(lc)),
    );
  }, [rows, q]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              Classroom Dispute Resolution
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Incomplete sessions awaiting financial resolution. Each action
              writes the payroll adjustment and credit refund atomically.
            </p>
          </div>
          <Input
            placeholder="Filter by verdict, fault, ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs font-mono text-xs"
          />
        </header>

        <Card className="bg-card/70 backdrop-blur-xl border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase tracking-wider text-muted-foreground">
                <TableHead>Date</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Fault</TableHead>
                <TableHead>AI Verdict</TableHead>
                <TableHead>Attended</TableHead>
                <TableHead>Resolution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <td colSpan={9} className="text-center text-muted-foreground p-6">
                    Loading…
                  </td>
                </TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <td colSpan={9} className="text-center text-muted-foreground p-6">
                    No unresolved incidents. The classroom is healthy.
                  </td>
                </TableRow>
              )}
              {filtered.map((r) => (
                <AuditRow key={r.id} row={r} />
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
