import { ReactNode, RefObject, MouseEvent, TouchEvent } from 'react';

// Button component props
export interface ButtonProps {
  fwdRef?: RefObject<HTMLButtonElement>;
  id?: string;
  classes?: string;
  disabled?: boolean;
  startFunc?: (e: TouchEvent | MouseEvent) => void;
  onClick?: (e: MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  children?: ReactNode;
}

// Common props for interactive components
export interface InteractiveProps {
  className?: string;
  disabled?: boolean;
  onClick?: (e: MouseEvent) => void;
  children?: ReactNode;
}

// Grid component props
export interface GridProps {
  className?: string;
  children?: ReactNode;
}

// Cell component props
export interface CellProps {
  row: number;
  col: number;
  sample: any; // Will be typed more specifically later
  className?: string;
  onClick?: () => void;
}

// Portal component props
export interface PortalProps {
  targetId: string;
  children: ReactNode;
}
