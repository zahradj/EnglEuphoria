import React, { memo } from 'react';

interface PerformanceWrapperProps {
  children: React.ReactNode;
  shouldUpdate?: boolean;
}

export const PerformanceWrapper: React.FC<PerformanceWrapperProps> = memo(
  ({ children }) => {
    return <>{children}</>;
  },
  (prevProps, nextProps) => {
    if (prevProps.shouldUpdate !== undefined && nextProps.shouldUpdate !== undefined) {
      return !nextProps.shouldUpdate;
    }
    return false;
  }
);

PerformanceWrapper.displayName = 'PerformanceWrapper';

// Higher-order component for memo with custom comparison
export const withPerformance = <P extends object>(
  Component: React.ComponentType<P>,
  customCompare?: (prevProps: P, nextProps: P) => boolean
) => {
  const MemoizedComponent = memo(Component, customCompare);
  MemoizedComponent.displayName = `withPerformance(${Component.displayName || Component.name})`;
  return MemoizedComponent;
};