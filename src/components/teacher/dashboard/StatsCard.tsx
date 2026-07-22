
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export const StatsCard = ({ title, value, icon }: StatsCardProps) => (
  <Card className="bg-gradient-to-br from-primary-bg via-accent-bg to-surface-2 border-border shadow-card hover:shadow-soft transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-primary font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1 bg-gradient-to-r from-primary via-accent to-primary-light bg-clip-text text-transparent">{value}</p>
        </div>
        <div className="bg-gradient-to-r from-primary-bg to-accent-bg p-3 rounded-full shadow-sm">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);
