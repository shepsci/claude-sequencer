import React, { useMemo } from 'react';
import { useAppSelector } from 'App/hooks/redux';
import { SliceIcon } from 'assets/icons';
import { useCell } from './useCell';
import { useTouchAndMouse } from 'hooks/useTouchAndMouse';
import { getGrid } from 'utils/getGrid';
import type { CellComponentProps, SampleCellsProps, SampleCellProps } from 'types/components';

export const Cell: React.FC<CellComponentProps> = ({ id, step, prevCellRef }) => {
  const { state, startFunc } = useCell(id, step, prevCellRef);
  const { classes, styles, values } = state;

  const { onTouchStart, onMouseDown } = useTouchAndMouse(startFunc);

  const cellMemo = useMemo(() => {
    return (
      <div className="cellWrapper">
        <div id={id} className={classes.cell} onTouchStart={onTouchStart} onMouseDown={onMouseDown}>
          <SliceIcon addClass={classes.slice1} />
          <SliceIcon addClass={classes.slice2} />
          <div style={styles.bg} className={classes.bg} />
          <div className="border" />
          <div className="pitch">{values.midiNote}</div>
          <SampleCells id={id} step={step} />
        </div>
      </div>
    );
  }, [
    id,
    classes.cell,
    classes.slice1,
    classes.slice2,
    classes.bg,
    onTouchStart,
    onMouseDown,
    styles.bg,
    values.midiNote,
    step,
  ]);
  return cellMemo;
};

const SampleCells: React.FC<SampleCellsProps> = ({ id, step }) => {
  const kit = useAppSelector(state => state.sequence.present.kit);
  const gridSize = useAppSelector(state => state.assets.kits[kit]?.samples?.length || 0);

  const grid = useMemo(() => getGrid(gridSize), [gridSize]);
  const sampleCellsMemo = useMemo(() => {
    return (
      <div className="sample-cells">
        {grid.map(i => {
          const scId = `${id}-sample-${i}`;
          return <SampleCell key={scId} id={scId} step={step} i={i} />;
        })}
      </div>
    );
  }, [grid, id, step]);
  return sampleCellsMemo;
};

const SampleCell: React.FC<SampleCellProps> = ({ id, step, i }) => {
  const noteOn = useAppSelector(state => state.sequence.present.pattern[step][i].noteOn);
  const velocity = useAppSelector(
    state => state.sequence.present.pattern[step][i].notes[0].velocity
  );
  const scMemo = useMemo(() => {
    const classes = `sample-cell bg${i}`;
    return <div id={id} className={classes} style={{ opacity: noteOn ? velocity : 0 }} />;
  }, [i, id, noteOn, velocity]);
  return scMemo;
};
