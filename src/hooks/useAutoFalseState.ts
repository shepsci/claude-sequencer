import { useEffect, useState } from 'react';

export const useAutoFalseState = (timeout: number): [boolean, (value: boolean) => void] => {
  const [bool, setBool] = useState<boolean>(false);
  useEffect(() => {
    if (bool) setTimeout(() => setBool(false), timeout);
  }, [bool, timeout]);
  return [bool, setBool];
};
