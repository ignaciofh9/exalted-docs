// docs/exalted-docs/app/hooks/useVersion.ts
'use client';

import { useState, useCallback } from 'react';
import { AffinityType } from '@/app/types';

export function useVersion(initialVersion: AffinityType) {
  const [version, setVersion] = useState<AffinityType>(initialVersion);

  const handleVersionChange = useCallback((newVersion: string) => {
    if (Object.values(AffinityType).includes(newVersion as AffinityType)) {
      setVersion(newVersion as AffinityType);
    }
  }, []);

  return { version, handleVersionChange };
}