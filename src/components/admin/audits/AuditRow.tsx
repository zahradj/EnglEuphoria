import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import type { AuditSession } from '@/hooks/admin/useClassroomAudits';
import { ResolutionActionBar } from './ResolutionActionBar';

const faultBadge = (fault: string | null) => {
  if (!fault) return <Badge variant="outline">unclassified</Badge>;
  const map: Record<string, string> = {
    teacher_absent: 'bg-destructive/15 text-destructive border-destructive/30',
    student_absent: 'bg-muted text-muted-foreground',
    teacher_tech_drop: 'bg-destructive/15 text-destructive border-destructive/30',
    student_tech_drop: 'bg-warning/15 text-warning-foreground',
    platform_crash: 'bg-primary/15 text-primary border-primary/30',
  };
  const cls = map[fault] ?? 'bg-muted';
  return (
    <Badge variant="outline" className={cls}>
      {fault.replace(/_/g, ' ')}
    </Badge>
  );
};

const durationAttended = (row: AuditSession) => {
  if (!row.teacher_joined_at && !row.student_joined_at) return '—';
  const start = row.teacher_joined_at ?? row.student_joined_at!;
  const end =
    row.teacher_left_at ??
    row.student_left_at ??
    row.ended_at ??
    new Date().toISOString();
  const mins = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60_000,
  );
  return `${mins}m`;
};

interface Props {
  row: AuditSession;
  teacherName?: string;
  studentName?: string;
}

export function AuditRow({ row, teacherName, studentName }: Props) {
  return (
    <TableRow className="font-mono text-xs">
      <TableCell>
        {row.created_at ? format(new Date(row.created_at), 'MMM d HH:mm') : '—'}
      </TableCell>
      <TableCell>{row.market_region ?? '—'}</TableCell>
      <TableCell className="max-w-[140px] truncate" title={teacherName ?? row.teacher_id}>
        {teacherName ?? row.teacher_id.slice(0, 8)}
      </TableCell>
      <TableCell className="max-w-[140px] truncate" title={studentName ?? row.student_id ?? ''}>
        {studentName ?? row.student_id?.slice(0, 8) ?? '—'}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{row.lesson_type}</Badge>
      </TableCell>
      <TableCell>{faultBadge(row.fault_type)}</TableCell>
      <TableCell className="max-w-[260px] truncate" title={row.ai_verdict ?? ''}>
        {row.ai_verdict ?? '—'}
      </TableCell>
      <TableCell>{durationAttended(row)}</TableCell>
      <TableCell>
        <ResolutionActionBar session={row} />
      </TableCell>
    </TableRow>
  );
}
