import { useRef, useEffect, useState, ReactNode } from 'react';
import { calculateVisibleRange } from '@/utils/performanceMonitoring';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  containerClassName?: string;
  overscan?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  containerClassName = '',
  overscan = 3,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setContainerHeight(container.clientHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const { start, end } = calculateVisibleRange(
    scrollTop,
    containerHeight,
    itemHeight,
    items.length,
    overscan
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = start * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${containerClassName}`}
      onScroll={handleScroll}
      style={{ height: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {items.slice(start, end).map((item, index) => (
            <div key={start + index} style={{ height: itemHeight }}>
              {renderItem(item, start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
