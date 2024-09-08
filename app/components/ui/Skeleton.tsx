// docs/exalted-docs/app/components/ui/Skeleton.tsx
import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded ${className}`}
    />
  );
};

export default Skeleton;