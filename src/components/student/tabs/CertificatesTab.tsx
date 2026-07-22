import { CertificatesList } from '@/components/certificates/CertificatesList';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const HUB_ACCENT: Record<string, string> = {
  playground: 'text-orange-600',
  academy: 'text-indigo-600',
  professional: 'text-emerald-600',
};

export function CertificatesTab() {
  const { studentLevel } = useStudentLevel();
  const hubId = studentLevel || 'playground';
  const accent = HUB_ACCENT[hubId] || HUB_ACCENT.playground;

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn('text-2xl font-bold flex items-center gap-2', accent)}>
          <Award className="w-6 h-6" />
          My Certificates
        </h2>
        <p className="text-muted-foreground">
          View and download your earned certificates
        </p>
      </div>
      <CertificatesList />
    </div>
  );
}
