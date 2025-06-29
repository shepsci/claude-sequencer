import * as Tone from 'tone';
import { edit } from 'App/reducers/editorSlice';
import { Kit } from 'App/Tone';
import { useAppDispatch, useAppSelector } from 'App/hooks/redux';
import { recordSample } from 'App/reducers/sequenceSlice';
import { areWeTapRecording, areWeTapping } from 'App/reducers/abstractState/abstractEditorState';
import { useAutoFalseState } from 'hooks/useAutoFalseState';
import { useEffect } from 'react';
import { useCurrentPath, useGoTo } from 'hooks/useGoTo';
import { vanillaShowAndHideClass } from 'hooks/useShowAndHide';

interface KitSample {
  name: string;
  icon: string;
  color: string;
  sampler: any;
  code: string;
  altCode: string;
}

interface KitData {
  samples: KitSample[];
}

interface UseSampleBtnContainerReturn {
  kit: KitData | undefined;
  selectedSample: number;
  selectSample: (i: number) => void;
}

interface UseSampleBtnReturn {
  containerClass: string;
  startFunc: (keydown?: boolean) => void;
  onClick: () => void;
}

export const useSampleBtnContainer = (): UseSampleBtnContainerReturn => {
  const dispatch = useAppDispatch();
  const goTo = useGoTo();
  const { atBase } = useCurrentPath();
  const selectedSample = useAppSelector(state => state.editor.selectedSample);
  const sequenceKitName = useAppSelector(state => state.sequence.present.kit);
  const kit = useAppSelector(state => state.assets.kits[sequenceKitName]);

  const selectSample = (i: number) => {
    dispatch(edit({ sample: i }));
    if (!atBase) goTo.base();
  };

  return { kit, selectedSample, selectSample };
};

export const useSampleBtn = (
  selectSample: (i: number) => void,
  selected: boolean,
  i: number
): UseSampleBtnReturn => {
  const dispatch = useAppDispatch();
  const editorMode = useAppSelector(state => state.editor.mode);
  const recording = areWeTapRecording(editorMode);
  const tapping = areWeTapping(editorMode);
  const { mixingSamples } = useCurrentPath();

  const [flash, setFlash] = useAutoFalseState(100);

  // flash mix panel
  useEffect(() => {
    if (!flash || !mixingSamples) return;
    vanillaShowAndHideClass(`mixItem${i}`, 'flash', 100);
  }, [flash, i, mixingSamples]);

  const startFunc = (keydown?: boolean) => {
    if (recording) dispatch(recordSample(i));
    if (tapping || keydown) {
      Kit.samples[i].sampler.triggerAttack('C2', Tone.immediate(), 1);
      setFlash(true);
    }
  };

  useEffect(() => {
    function mpcStyle(e: KeyboardEvent) {
      if ((e.target as HTMLElement)?.id === 'saveSequenceInput') return;
      if (e.code === Kit.samples[i].code || e.code === Kit.samples[i].altCode) {
        startFunc(true);
      }
    }
    document.addEventListener('keydown', mpcStyle);
    return () => document.removeEventListener('keydown', mpcStyle);
  });

  const onClick = () => {
    if (!tapping) selectSample(i);
  };

  let containerClass = 'sampleBtn';
  if (selected) containerClass += ' selected';
  if (flash) containerClass += ' flash';

  return { containerClass, startFunc, onClick };
};
