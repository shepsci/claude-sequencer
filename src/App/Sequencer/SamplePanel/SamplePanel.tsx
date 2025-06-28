import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'App/hooks/redux';
import { setMode, MODES } from 'App/reducers/editorSlice';
import { Erase, Slice, Copy } from 'App/Sequencer/SamplePanel/Modes/EraseSliceCopy';
import { PitchVelocityLength } from 'App/Sequencer/SamplePanel/Modes/PitchVelocityLength';
import { SampleEditMenu } from './EditMenu/SampleEditMenu';
import { SampleBtns } from './SampleBtns/SampleBtns';
import { VisualPanel } from 'App/Sequencer/VisualPanel/VisualPanel';
import {
  areCellsEditable,
  getSampleEditModes,
} from 'App/reducers/abstractState/abstractEditorState';
import { hideEditable, showEditable } from 'utils/toggleClasses';

interface SampleEditModes {
  painting: boolean;
  erasing: boolean;
  slicing: boolean;
  copying: boolean;
  moddingPitch: boolean;
  moddingVelocity: boolean;
  moddingLength: boolean;
}

interface UseSamplePanelReturn {
  splitSamplePanel: boolean;
  sampleEditModes: SampleEditModes;
  onReturn: () => void;
}

export const SamplePanel: React.FC = () => {
  const { splitSamplePanel, sampleEditModes, onReturn } = useSamplePanel();

  const memo = useMemo(() => {
    const { painting, erasing, slicing, copying } = sampleEditModes;
    const { moddingPitch, moddingVelocity, moddingLength } = sampleEditModes;
    return (
      <>
        <div className={splitSamplePanel ? 'spTop' : 'noSplit'}>
          {splitSamplePanel && <VisualPanel />}
          {painting && <SampleEditMenu />}
          {erasing && <Erase onReturn={onReturn} />}
          {slicing && <Slice onReturn={onReturn} />}
          {copying && <Copy onReturn={onReturn} />}
          {(moddingPitch || moddingVelocity || moddingLength) && (
            <PitchVelocityLength onReturn={onReturn} moddingPitch={moddingPitch} />
          )}
        </div>
        <SampleBtns />
      </>
    );
  }, [sampleEditModes, splitSamplePanel, onReturn]);

  return memo;
};

const useSamplePanel = (): UseSamplePanelReturn => {
  const dispatch = useAppDispatch();
  const splitSamplePanel = useAppSelector(state => state.screen.splitSamplePanel);
  const editorMode = useAppSelector(state => state.editor.mode);
  const sampleEditModes = getSampleEditModes(editorMode);
  const { painting } = sampleEditModes;

  if (areCellsEditable(editorMode)) showEditable();
  if (painting) hideEditable();

  const onReturn = () => dispatch(setMode(MODES.PAINT));

  return { splitSamplePanel, sampleEditModes, onReturn };
};
