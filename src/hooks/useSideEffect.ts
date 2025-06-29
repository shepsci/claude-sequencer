import { useEffect, useState } from 'react';

export const useSideEffect = (func: () => void): (() => void) => {
  const [bool, setBool] = useState(false);

  useEffect(() => {
    if (!bool) return;
    func();
    setBool(false);
  }, [bool, func]);

  return () => setBool(true);
};
