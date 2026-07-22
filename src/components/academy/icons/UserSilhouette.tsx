import React from 'react';

export function UserSilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <circle cx="20" cy="14" r="6" />
      <path d="M8 34c0-6.6 5.4-12 12-12s12 5.4 12 12v2H8v-2z" />
    </svg>
  );
}
