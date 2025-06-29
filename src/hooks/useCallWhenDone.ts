import { useCallback, useRef } from 'react';

export const useCallWhenDone = (): ((func: () => void, timeout: number) => void) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const callWhenDone = (func: () => void, timeout: number): void => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(func, timeout);
  };

  return useCallback(callWhenDone, []);
};
