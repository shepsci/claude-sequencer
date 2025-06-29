import React, { useMemo, ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'assets/icons';
import { Button } from 'App/shared/Button';
import { useScrollable } from './useScrollable';

interface ScrollableProps {
  id?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}

interface ScrollBarProps {
  style?: React.CSSProperties;
  tapToScroll: (direction: 'left' | 'right') => void;
  disabled: {
    left: boolean;
    right: boolean;
  };
}

interface ScrollButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const Scrollable: React.FC<ScrollableProps> = ({ id, style, children }) => {
  const { containerRef, onScroll, tapToScroll, disabled } = useScrollable();

  const memo = useMemo(() => {
    return (
      <div
        ref={containerRef}
        id={id}
        className="scrollable"
        style={style}
        onScroll={() => onScroll()}
      >
        {children}
        <ScrollBar style={style} tapToScroll={tapToScroll} disabled={disabled} />
      </div>
    );
  }, [containerRef, id, style, onScroll, children, tapToScroll, disabled]);
  return memo;
};

const ScrollBar: React.FC<ScrollBarProps> = ({ style, tapToScroll, disabled }) => {
  const memo = useMemo(() => {
    return (
      <div className="scrollbar" style={style}>
        <ScrollLeft disabled={disabled.left} onClick={() => tapToScroll('left')} />
        <ScrollRight disabled={disabled.right} onClick={() => tapToScroll('right')} />
      </div>
    );
  }, [disabled.left, disabled.right, tapToScroll, style]);
  return memo;
};

const ScrollLeft: React.FC<ScrollButtonProps> = ({ onClick, disabled }) => {
  return (
    <Button classes="scrollLeft" disabled={disabled} onClick={onClick}>
      <div className="">
        <ChevronLeftIcon />
      </div>
    </Button>
  );
};

const ScrollRight: React.FC<ScrollButtonProps> = ({ onClick, disabled }) => {
  return (
    <Button classes="scrollRight" disabled={disabled} onClick={onClick}>
      <div className="">
        <ChevronRightIcon />
      </div>
    </Button>
  );
};
