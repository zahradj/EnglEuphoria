
import { useState } from "react";
import { Card } from "@/components/ui/card";

interface Avatar {
  id: number;
  name: string;
  src: string;
}

interface AvatarSelectionProps {
  onSelect: (avatar: Avatar) => void;
  selectedAvatarId?: number;
}

const avatars: Avatar[] = [
  { id: 1, name: "Penguin", src: "/avatars/penguin.svg" },
  { id: 2, name: "Fox", src: "/avatars/fox.svg" },
  { id: 3, name: "Lion", src: "/avatars/lion.svg" },
  { id: 4, name: "Rabbit", src: "/avatars/rabbit.svg" },
  { id: 5, name: "Bear", src: "/avatars/bear.svg" },
  { id: 6, name: "Unicorn", src: "/avatars/unicorn.svg" },
];

export function AvatarSelection({ onSelect, selectedAvatarId }: AvatarSelectionProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-3 gap-4">
      {avatars.map((avatar) => (
        <Card
          key={avatar.id}
          className={`relative overflow-hidden cursor-pointer transition-all duration-300 p-2 ${
            selectedAvatarId === avatar.id
              ? "ring-4 ring-yellow-dark scale-105"
              : "hover:ring-2 hover:ring-purple hover:scale-105"
          }`}
          onMouseEnter={() => setHoveredId(avatar.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onSelect(avatar)}
        >
          <div className="aspect-square rounded-lg bg-muted flex items-center justify-center p-2">
            <div className={`transition-transform duration-300 ${
              hoveredId === avatar.id ? "scale-110" : ""
            }`}>
              {/* We'll placeholder the images with color blocks for now */}
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `hsl(${(avatar.id * 60) % 360}, 80%, 85%)` }}
              >
                <span className="text-2xl font-bold">{avatar.name.charAt(0)}</span>
              </div>
            </div>
          </div>
          <p className="text-center mt-2 font-medium">{avatar.name}</p>
        </Card>
      ))}
    </div>
  );
}
