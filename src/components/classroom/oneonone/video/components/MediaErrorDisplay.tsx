
import React from "react";

interface Props {
  error?: string | null;
}
export function MediaErrorDisplay({ error }: Props) {
  if (!error) return null;
  return (
    <div className="mt-2 text-xs text-red-600 text-center bg-red-50 rounded p-2">
      {error}
      <br />
      Please check camera/microphone settings and allow access if prompted.
    </div>
  );
}
