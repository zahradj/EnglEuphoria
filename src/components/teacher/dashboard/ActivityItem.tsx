
interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  time: string;
}

export const ActivityItem = ({ icon, title, time }: ActivityItemProps) => (
  <div className="flex items-center justify-between pb-2 border-b">
    <div className="flex items-center gap-3">
      <div className="p-1 rounded-full">
        {icon}
      </div>
      <p className="font-medium">{title}</p>
    </div>
    <p className="text-sm text-muted-foreground">{time}</p>
  </div>
);
