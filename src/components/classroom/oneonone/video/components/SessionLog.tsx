
import React from "react";

interface Props {
  logMessages: string[];
}

export function SessionLog({ logMessages }: Props) {
  if (logMessages.length === 0) return null;
  return (
    <div className="mt-4 bg-white/70 rounded-lg shadow p-2 max-h-32 overflow-y-auto text-xs text-gray-500">
      <div className="font-bold mb-1 text-gray-700">Session Log</div>
      {logMessages.map((msg, idx) => (
        <div key={idx}>{msg}</div>
      ))}
    </div>
  );
}
