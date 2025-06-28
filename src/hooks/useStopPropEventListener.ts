import { useRef } from 'react';

interface UseStopPropEventListenerReturn {
  eventListener: (elementId: string, event: string, func: () => void) => void;
  removeElRef: React.MutableRefObject<(() => void) | null>;
}

export const useStopPropEventListener = (): UseStopPropEventListenerReturn => {
  const removeElRef = useRef<(() => void) | null>(null);

  const eventListener = (elementId: string, event: string, func: () => void): void => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const callback = (e: Event) => {
      e.stopPropagation();
      func();
      if (removeElRef.current) {
        removeElRef.current();
      }
    };

    element.addEventListener(event, callback);
    removeElRef.current = () => element.removeEventListener(event, callback);
  };

  return { eventListener, removeElRef };
};
