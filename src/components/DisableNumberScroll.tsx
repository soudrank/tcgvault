'use client';

import { useEffect } from 'react';

export function DisableNumberScroll() {
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      const target = e.target as HTMLInputElement;
      if (target?.type === 'number') {
        target.blur();
      }
    };
    document.addEventListener('wheel', handler, { passive: true });
    return () => document.removeEventListener('wheel', handler);
  }, []);

  return null;
}
