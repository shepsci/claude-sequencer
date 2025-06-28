import { ReactNode, RefObject, MouseEvent, TouchEvent } from 'react';

// Button component props
export interface ButtonProps {
  fwdRef?: RefObject<HTMLButtonElement>;
  id?: string;
  classes?: string;
  disabled?: boolean;
  startFunc?: (e: React.TouchEvent<Element> | React.MouseEvent<Element>) => void;
  onClick?: (e: React.MouseEvent<Element>) => void;
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

// Grid hook return type
export interface UseGridReturn {
  gridSize: number;
  moveFunc: (e: React.TouchEvent<Element> | React.MouseEvent<Element>) => void;
  endFunc: () => void;
  prevCellRef: RefObject<string | null>;
}

// Cell component props
export interface CellComponentProps {
  id: string;
  step: number;
  prevCellRef: RefObject<string | null>;
}

// SampleCells component props
export interface SampleCellsProps {
  id: string;
  step: number;
}

// SampleCell component props
export interface SampleCellProps {
  id: string;
  step: number;
  i: number;
}

// Knob component props
export interface KnobProps {
  value: number;
  touching?: boolean;
  label?: string;
  addClass?: string;
  [key: string]: any; // For additional attributes
}

// Error Boundary state
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo?: string | null;
}

// Error Handler props
export interface ErrorHandlerProps {
  error: Error | null;
}
