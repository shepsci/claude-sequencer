import { MODES } from 'App/reducers/editorSlice';

export interface SampleEditModes {
  painting: boolean;
  erasing: boolean;
  slicing: boolean;
  copying: boolean;
  moddingPitch: boolean;
  moddingVelocity: boolean;
  moddingLength: boolean;
}

export const areWeTapPlaying = (editorMode: string): boolean => {
  return editorMode === MODES.TAP;
};

export const areWeTapRecording = (editorMode: string): boolean => {
  return editorMode === MODES.TAP_RECORD;
};

export const areWeTapping = (editorMode: string): boolean => {
  return areWeTapPlaying(editorMode) || areWeTapRecording(editorMode);
};

export const areCellsEditable = (editorMode: string): boolean => {
  return (
    editorMode === MODES.ERASE ||
    editorMode === MODES.SLICE ||
    editorMode === MODES.MOD_PITCH ||
    editorMode === MODES.MOD_VELOCITY ||
    editorMode === MODES.MOD_LENGTH
  );
};

export const getSampleEditModes = (editorMode: string): SampleEditModes => {
  const sampleEditModes: SampleEditModes = {
    painting: editorMode === MODES.PAINT,
    erasing: editorMode === MODES.ERASE,
    slicing: editorMode === MODES.SLICE,
    copying: editorMode === MODES.COPY,
    moddingPitch: editorMode === MODES.MOD_PITCH,
    moddingVelocity: editorMode === MODES.MOD_VELOCITY,
    moddingLength: editorMode === MODES.MOD_LENGTH,
  };

  return sampleEditModes;
};
