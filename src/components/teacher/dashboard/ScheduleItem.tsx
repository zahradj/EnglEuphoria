
interface ScheduleItemProps {
  time: string;
  title: string;
}

export const ScheduleItem = ({ time, title }: ScheduleItemProps) => (
  <div className="text-xs p-1.5 bg-primary/10 rounded">
    <p className="font-medium">{time}</p>
    <p className="truncate">{title}</p>
  </div>
);
