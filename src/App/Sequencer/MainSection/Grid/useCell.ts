import { MODES, setTapCellById, setToggleOn } from 'App/reducers/editorSlice';
import { modCell } from 'App/reducers/sequenceSlice';
import { useCallback, useEffect, useMemo, RefObject } from 'react';
import { useAppDispatch, useAppSelector } from 'App/hooks/redux';

interface CellClasses {
  cell: string;
  bg: string;
  slice1: string;
  slice2: string;
}

interface CellStyles {
  bg: {
    transform: string;
    opacity?: number;
  };
}

interface CellValues {
  midiNote: string | null;
}

interface CellState {
  classes: CellClasses;
  styles: CellStyles;
  values: CellValues;
}

interface UseCellReturn {
  state: CellState;
  startFunc: (e: React.TouchEvent<Element> | React.MouseEvent<Element>) => void;
}

export const useCell = (
  id: string,
  step: number,
  prevCellRef: RefObject<string | null>
): UseCellReturn => {
  const dispatch = useAppDispatch();

  const selectedSample = useAppSelector(state => state.editor.selectedSample);
  const moddingPitch = useAppSelector(state => state.editor.mode === MODES.MOD_PITCH);
  const editing = selectedSample !== -1;

  const noteOn = useAppSelector(state =>
    editing ? state.sequence.present.pattern[step][selectedSample].noteOn : false
  );
  const slice = useAppSelector(state =>
    editing ? state.sequence.present.pattern[step][selectedSample].notes.length : 1
  );
  const pitch = useAppSelector(state =>
    editing ? state.sequence.present.pattern[step][selectedSample].notes[0].pitch : 'C2'
  );
  const length = useAppSelector(state =>
    editing ? state.sequence.present.pattern[step][selectedSample].notes[0].length : 1
  );
  const velocity = useAppSelector(state =>
    editing ? state.sequence.present.pattern[step][selectedSample].notes[0].velocity : 1
  );

  const tapCell = useCallback(() => {
    dispatch(modCell(step, noteOn));
  }, [dispatch, noteOn, step]);

  // dragging: tap flag sent from Grid onTouchMove/onMouseMove
  const tapThisCell = useAppSelector(state => state.editor.tapCellById[id]);
  useEffect(() => {
    if (!tapThisCell) return;
    tapCell();
    dispatch(setTapCellById({ id, val: false }));
  }, [dispatch, id, tapCell, tapThisCell]);

  const startFunc = useCallback(
    (e: React.TouchEvent<Element> | React.MouseEvent<Element>) => {
      dispatch(setToggleOn(!noteOn)); // set dragging effect
      if (prevCellRef.current !== undefined) {
        prevCellRef.current = id; // for Grid onTouchMove
      }
      tapCell();
    },
    [dispatch, id, noteOn, prevCellRef, tapCell]
  );

  const state = useMemo((): CellState => {
    const classes: CellClasses = {
      cell: '',
      bg: '',
      slice1: '',
      slice2: '',
    };
    const styles: CellStyles = {
      bg: {
        transform: '',
      },
    };
    const values: CellValues = {
      midiNote: null,
    };

    values.midiNote = noteOn && moddingPitch ? pitch : null;

    classes.cell = noteOn ? 'cell on' : 'cell';
    classes.bg = noteOn ? `bg bg${selectedSample}` : 'bg';
    classes.slice1 = moddingPitch
      ? 'slice'
      : noteOn && slice === 2
        ? 'slice slice-2'
        : noteOn && slice === 3
          ? 'slice slice-3'
          : 'slice';
    classes.slice2 = moddingPitch ? 'slice' : noteOn && slice > 2 ? 'slice slice-2' : 'slice';

    styles.bg = {
      transform: length >= 1 ? 'scaleX(1)' : `scaleX(${length * 3})`,
    };
    if (noteOn) styles.bg.opacity = velocity;

    return { classes, styles, values };
  }, [length, moddingPitch, noteOn, pitch, selectedSample, slice, velocity]);

  return { state, startFunc };
};
