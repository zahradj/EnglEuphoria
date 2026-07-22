
import { Star } from "lucide-react";

interface PointsBadgeProps {
  points: number;
  className?: string;
}

export function PointsBadge({ points, className = "" }: PointsBadgeProps) {
  return (
    <div className={`flex items-center gap-1 bg-primary-100 px-3 py-1 rounded-full ${className}`}>
      <Star size={16} className="fill-primary text-primary-700" />
      <span className="font-bold text-primary-700">{points} points</span>
    </div>
  );
}
