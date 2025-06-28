import React, { useRef, useState } from 'react';
import { createId } from '@paralleldrive/cuid2';
import { useTouchAndMouse } from 'hooks/useTouchAndMouse';
import type { ButtonProps } from 'types/components';

export const Button: React.FC<ButtonProps> = ({
  fwdRef,
  id,
  classes = '',
  disabled = false,
  startFunc,
  onClick,
  type,
  ariaLabel = '',
  children,
}) => {
  const defaultRef = useRef<HTMLButtonElement>(null);
  const ref = fwdRef || defaultRef;

  const [pressed, setPressed] = useState('');

  const handleTouchStart = (e: React.TouchEvent<Element> | React.MouseEvent<Element>) => {
    if (startFunc) startFunc(e);
    setPressed(' pressed');
  };
  const handleTouchEnd = () => {
    setPressed('');
  };

  const { onTouchStart, onMouseDown } = useTouchAndMouse(handleTouchStart);

  return (
    <button
      ref={ref}
      type={type || 'button'}
      id={id || createId()}
      className={'btn ' + classes + pressed}
      disabled={disabled}
      aria-label={ariaLabel}
      onTouchStart={onTouchStart}
      onMouseDown={onMouseDown}
      onTouchEnd={handleTouchEnd}
      onMouseUp={handleTouchEnd}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
