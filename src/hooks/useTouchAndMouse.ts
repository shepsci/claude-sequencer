import { useRef, useState } from 'react';

// onTouchStart and onMouseDown are required on the target
// onMouseMove and onMouseUp are handled by document listener
// so out of bounds events are captured

export interface TouchAndMouseHandlers {
  onTouchStart: (e: React.TouchEvent<Element>) => void;
  onMouseDown: (e: React.MouseEvent<Element>) => void;
  onTouchMove: (e: React.TouchEvent<Element>) => void;
  onTouchEnd: (e: React.TouchEvent<Element>) => void;
}

type EventHandler = (e: React.TouchEvent<Element> | React.MouseEvent<Element>) => void;

export const useTouchAndMouse = (
  startFunc?: EventHandler | null,
  moveFunc?: EventHandler | null,
  endFunc?: EventHandler | null
): TouchAndMouseHandlers => {
  const [touching, setTouching] = useState(false);

  const onTouchStart = (e: React.TouchEvent<Element>) => {
    setTouching(true);
    if (startFunc) startFunc(e);
  };

  const mouseDownRef = useRef<boolean>(false);
  const onMouseDown = (e: React.MouseEvent<Element>) => {
    if (touching) return;
    if (startFunc) startFunc(e);
    mouseDownRef.current = true;
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
  };

  const onTouchMove = (e: React.TouchEvent<Element>) => {
    if (moveFunc) moveFunc(e);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (touching) return;
    if (moveFunc && mouseDownRef.current) {
      // Convert native MouseEvent to React MouseEvent-like object
      const reactEvent = e as unknown as React.MouseEvent<Element>;
      moveFunc(reactEvent);
    }
  };

  const onTouchEnd = (e: React.TouchEvent<Element>) => {
    if (endFunc) endFunc(e);
  };

  const onMouseUp = (e: MouseEvent) => {
    if (touching) return;
    if (endFunc) {
      // Convert native MouseEvent to React MouseEvent-like object
      const reactEvent = e as unknown as React.MouseEvent<Element>;
      endFunc(reactEvent);
    }
    mouseDownRef.current = false;
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('mousemove', onMouseMove);
  };

  return {
    onTouchStart,
    onMouseDown,
    onTouchMove,
    onTouchEnd,
  };
};
