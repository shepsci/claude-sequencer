import React, { useCallback, useMemo, useRef } from 'react';
import { Cell } from './Cell';
import { getGrid } from 'utils/getGrid';
import { useAppDispatch, useAppSelector } from 'App/hooks/redux';
import { setTapCellById } from 'App/reducers/editorSlice';
import { useTouchAndMouse } from 'hooks/useTouchAndMouse';
import type { UseGridReturn } from 'types/components';

export const Grid: React.FC = () => {
  const { gridSize, moveFunc, endFunc, prevCellRef } = useGrid();
  const touchAndMouse = useTouchAndMouse(null, moveFunc, endFunc);

  const gridMemo = useMemo(() => {
    const grid = getGrid(gridSize);
    return (
      <div id="grid" className="grid" {...touchAndMouse}>
        {grid.map(step => {
          const id = `cell-${step}`;
          return <Cell key={id} id={id} step={step} prevCellRef={prevCellRef} />;
        })}
      </div>
    );
  }, [gridSize, prevCellRef, touchAndMouse]);
  return gridMemo;
};

const useGrid = (): UseGridReturn => {
  const dispatch = useAppDispatch();
  const gridSize = useAppSelector(state => state.sequence.present.length);
  const editing = useAppSelector(state => state.editor.selectedSample !== -1);

  const prevCellRef = useRef<string | null>(null);

  const onTouchMove = useCallback(
    (e: React.TouchEvent<Element> | React.MouseEvent<Element>) => {
      if (!editing) return;
      if (!prevCellRef.current) return;
      const cell = getTouchedCell(e);
      const id = getIdOfCellToTap(cell, prevCellRef.current);
      if (!id) return;
      dispatch(setTapCellById({ id, val: true }));
      prevCellRef.current = id;
    },
    [dispatch, editing]
  );
  const moveFunc = (e: React.TouchEvent<Element> | React.MouseEvent<Element>) => onTouchMove(e);
  const endFunc = () => {
    prevCellRef.current = null;
  };

  return { gridSize, moveFunc, endFunc, prevCellRef };
};

const getTouchedCell = (
  e: React.TouchEvent<Element> | React.MouseEvent<Element>
): Element | null => {
  let cell: Element | null;
  if ('touches' in e && e.touches) {
    const touch = e.touches[0];
    cell = document.elementFromPoint(touch.clientX, touch.clientY);
  } else {
    cell = e.target as Element;
  }
  return cell;
};

const getIdOfCellToTap = (cell: Element | null, prevId: string): string | null => {
  if (!cell) return null;
  const id = cell.id;
  if (!id.match(/cell/)) return null;
  if (prevId !== id) return id;
  return null;
};
