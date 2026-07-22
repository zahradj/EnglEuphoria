import { useState } from "react";
import { speak } from "@/lib/lesson/speech";

/**
 * 🎈 GAME 1: BALLOON PHONICS POP (ALPHABET & SOUNDS GAME)
 * Drills pure synthetic letter-sounds and vocabulary recall via touch-targets.
 */
interface BalloonPopProps {
  targetSound: string;
  associatedWords: string[];
  balloonColor?: string;
  onSolved: () => void;
}

export function BalloonPhonicsPop({
  targetSound,
  associatedWords,
  balloonColor = "bg-pink-400",
  onSolved,
}: BalloonPopProps) {
  const [poppedCount, setPoppedCount] = useState<number>(0);
  const totalBalloons = associatedWords.length;

  const handlePop = (word: string) => {
    speak(`${targetSound}, ${targetSound}, — ${word}`, { rate: 0.8 });
    const currentCount = poppedCount + 1;
    setPoppedCount(currentCount);
    if (currentCount >= totalBalloons) onSolved();
  };

  return (
    <div className="flex flex-col items-center space-y-6 text-center animate-fadeIn">
      <div>
        <h3 className="text-2xl font-black text-gray-800">🎈 Phonics Balloon Pop!</h3>
        <p className="text-sm text-gray-500">
          Tap the pink balloons to hear the target sound:{" "}
          <span className="font-bold text-[#FE6A2F]">{targetSound}</span>
        </p>
      </div>

      <div className="text-sm font-bold text-gray-400 bg-gray-100 px-4 py-1.5 rounded-full">
        Popped: {poppedCount} / {totalBalloons}
      </div>

      <div className="flex justify-center items-center space-x-6 py-6">
        {associatedWords.map((word, idx) => {
          const isPopped = idx < poppedCount;
          return (
            <button
              key={idx}
              disabled={isPopped}
              onClick={() => handlePop(word)}
              className={`w-24 h-32 rounded-full transition-all transform active:scale-90 flex flex-col items-center justify-center shadow-lg relative min-h-[80px] ${
                isPopped
                  ? "bg-gray-100 border border-gray-200 opacity-20 scale-75 cursor-not-allowed shadow-none"
                  : `${balloonColor} hover:brightness-110 cursor-pointer`
              }`}
            >
              {!isPopped && (
                <>
                  <span className="text-white font-black text-2xl uppercase">
                    {targetSound.replace(/\//g, "")}
                  </span>
                  <div className="absolute -bottom-4 left-1/2 w-0.5 h-6 bg-gray-300 transform -translate-x-1/2" />
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 👨‍👩‍👧 GAME 2: FAMILY TREE BUILDER & COLORING CANVAS (BOARD GAME)
 */
interface FamilyMember {
  role: string;
  label: string;
}

interface FamilyTreeProps {
  members: FamilyMember[];
  themeColor: string;
  onSolved: () => void;
}

export function FamilyTreeBuilder({ members, themeColor, onSolved }: FamilyTreeProps) {
  const [placedMembers, setPlacedMembers] = useState<string[]>([]);
  const [activeColor, setActiveColor] = useState<string>("#FE6A2F");

  const handleMemberPlace = (role: string) => {
    if (!placedMembers.includes(role)) {
      speak(`This is my family: ${role}!`, { rate: 0.85 });
      const updated = [...placedMembers, role];
      setPlacedMembers(updated);
      if (updated.length >= members.length) onSolved();
    }
  };

  const slot = (role: string, label: string, size: "lg" | "md" = "md") => {
    const dims = size === "lg" ? "w-24 h-16" : "w-20 h-14";
    const placed = placedMembers.includes(role);
    return (
      <div
        className={`${dims} border rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
          placed ? "text-white shadow-md font-black" : "bg-white/40 text-gray-300"
        }`}
        style={{ backgroundColor: placed ? activeColor : "" }}
      >
        {placed ? label : `Slot (${label.split(" ")[0]})`}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn text-center">
      <div>
        <h3 className="text-2xl font-black text-gray-800">🏡 Family Tree Board</h3>
        <p className="text-sm text-gray-500">
          Tap a family label to color and map out your relationship branches safely.
        </p>
      </div>

      <div
        className="w-full max-w-md mx-auto border-4 border-dashed border-gray-200 rounded-3xl p-6 min-h-[220px] flex flex-col justify-between space-y-4 shadow-inner"
        style={{ backgroundColor: `${themeColor}20` }}
      >
        <div className="flex justify-center space-x-4">
          {slot("man", "👨 Man / Father", "lg")}
          {slot("woman", "👩 Woman / Mother", "lg")}
        </div>
        <div className="flex justify-center space-x-4">
          {slot("boy", "👦 Boy")}
          {slot("girl", "👧 Girl")}
        </div>
        <div className="flex justify-center">{slot("baby", "👶 Baby")}</div>
      </div>

      <div className="flex justify-center flex-wrap gap-2 max-w-md mx-auto pt-2">
        {members.map((member) => {
          const isPlaced = placedMembers.includes(member.role);
          return (
            <button
              key={member.role}
              disabled={isPlaced}
              onClick={() => handleMemberPlace(member.role)}
              className={`px-4 py-2.5 font-bold rounded-xl text-sm border shadow-sm transition-all transform active:scale-95 ${
                isPlaced
                  ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed shadow-none"
                  : "bg-white text-gray-700 hover:border-[#FE6A2F] min-h-[48px]"
              }`}
            >
              ➕ {member.label}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center items-center space-x-3 pt-4 border-t max-w-xs mx-auto">
        <span className="text-xs font-bold text-gray-400 uppercase">Board Theme:</span>
        {["#FE6A2F", "#9333EA", "#0EA5E9", "#EC4899"].map((color) => (
          <button
            key={color}
            onClick={() => setActiveColor(color)}
            className={`w-6 h-6 rounded-full border-2 transition transform active:scale-90 ${
              activeColor === color
                ? "border-gray-800 scale-110 shadow-sm"
                : "border-transparent"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
