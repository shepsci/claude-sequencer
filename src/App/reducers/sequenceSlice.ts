import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import undoable, { excludeAction, groupByActionTypes } from 'redux-undo';
import { analog } from 'assets/sequences';
import { getSS } from 'utils/storage';
import {
  getNoteTally,
  inc,
  dec,
  initSampleStep,
  getPatternFromStr,
  getMainMixerFromStr,
  getSampleMixerFromStr,
} from 'App/reducers/functions/sequence';
import { INITIAL_MODS, MODES } from 'App/reducers/editorSlice';
import * as sequenceThunks from './thunks/sequenceThunks';

export interface Note {
  velocity: number;
  length: number;
  pitch: string;
}

export interface SampleStep {
  noteOn: boolean;
  notes: Note[];
}

export type Pattern = SampleStep[][];

export interface NoteTallyItem {
  count: number;
  empty: boolean;
}

export interface NoteTally {
  [key: string]: NoteTallyItem;
  total: NoteTallyItem;
}

export interface MixerProperty {
  min: number;
  max: number;
  initialValue: number;
  snapback?: boolean;
}

export interface MainMixerProperties {
  volume: MixerProperty;
  reverb: MixerProperty;
  filter: MixerProperty;
  warp: MixerProperty;
  crush: MixerProperty;
  distort: MixerProperty;
}

export interface SampleMixerProperties {
  vol: Omit<MixerProperty, 'snapback'>;
  pan: Omit<MixerProperty, 'snapback'>;
}

export interface MainMixer {
  volume: number;
  reverb: number;
  filter: number;
  warp: number;
  crush: number;
  distort: number;
}

export interface SampleMixerItem {
  vol: number;
  pan: number;
}

export type SampleMixer = SampleMixerItem[];

export interface Sequence {
  _id: string;
  name: string;
  kit: string;
  bpm: number;
  length: number;
  pattern: Pattern;
  mainMixer: MainMixer;
  sampleMixer: SampleMixer;
}

export interface SequenceState extends Sequence {
  noteTally: NoteTally;
  undoStatus: string;
  initialLoad: boolean;
}

const INITIAL_PATTERN: Pattern = getSS('sequencePattern') || getPatternFromStr(analog.patternStr);
const INITIAL_MAIN_MIXER: MainMixer =
  getSS('mainMixer') || getMainMixerFromStr(analog.mainMixerStr);
const INITIAL_SAMPLE_MIXER: SampleMixer =
  getSS('sampleMixer') || getSampleMixerFromStr(analog.sampleMixerStr);

export const MAIN_MIXER_PROPERTIES: MainMixerProperties = {
  volume: { min: 1, max: 100, initialValue: 76, snapback: false },
  reverb: { min: 0, max: 100, initialValue: 0, snapback: false },
  filter: { min: 1, max: 100, initialValue: 100, snapback: false },
  warp: { min: 0, max: 100, initialValue: 50, snapback: true },
  crush: { min: 0, max: 100, initialValue: 0, snapback: false },
  distort: { min: 0, max: 100, initialValue: 0, snapback: false },
};

export const SAMPLE_MIXER_PROPERTIES: SampleMixerProperties = {
  vol: { min: 1, max: 100, initialValue: 100 },
  pan: { min: 0, max: 100, initialValue: 50 },
};

export const INITIAL_SEQUENCE: Sequence = {
  _id: getSS('sequenceId') || analog._id,
  name: getSS('sequenceName') || analog.name,
  kit: getSS('sequenceKitName') || analog.kit,
  bpm: getSS('sequenceBpm') || analog.bpm,
  length: getSS('sequenceLength') || analog.length,
  pattern: INITIAL_PATTERN,
  mainMixer: INITIAL_MAIN_MIXER,
  sampleMixer: INITIAL_SAMPLE_MIXER,
};

export const INITIAL_STATE: SequenceState = {
  ...INITIAL_SEQUENCE,
  noteTally: getNoteTally(INITIAL_PATTERN),
  undoStatus: '',
  initialLoad: true,
};

export const sequenceSlice = createSlice({
  name: 'sequence',
  initialState: INITIAL_STATE,
  reducers: {
    paintCell: (
      state,
      { payload }: PayloadAction<{ step: number; selectedSample: number; noteOn: boolean }>
    ) => {
      state.pattern[payload.step][payload.selectedSample].noteOn = payload.noteOn;
      if (payload.noteOn) inc(state.noteTally, payload.selectedSample);
      else dec(state.noteTally, payload.selectedSample);
      state.undoStatus = `toggle cells | sample: ${payload.selectedSample}`;
    },
    sliceCell: (state, { payload }: PayloadAction<{ step: number; selectedSample: number }>) => {
      const notes = state.pattern[payload.step][payload.selectedSample].notes;
      const len = notes.length;
      const note = notes[0];
      if (len === 3) notes.length = 0;
      notes.push(note);
      state.undoStatus = `slice cells | sample: ${payload.selectedSample}`;
    },
    resetSlice: (state, { payload }: PayloadAction<number>) => {
      state.pattern.forEach(step => {
        const note = step[payload].notes[0];
        step[payload].notes.length = 0;
        step[payload].notes.push(note);
      });
    },
    paste: (state, { payload }: PayloadAction<{ sample: number; selectedSample: number }>) => {
      state.pattern.forEach(step => {
        step[payload.sample].noteOn = step[payload.selectedSample].noteOn;
        step[payload.sample].notes = step[payload.selectedSample].notes.map(note => ({
          ...note,
        }));
      });
      state.noteTally.total.count +=
        state.noteTally[payload.selectedSample].count - state.noteTally[payload.sample].count;
      state.noteTally[payload.sample] = { ...state.noteTally[payload.selectedSample] };
      state.undoStatus = `copy cells from: ${payload.selectedSample} to: ${payload.sample}`;
    },
    eraseCell: (state, { payload }: PayloadAction<{ step: number; selectedSample: number }>) => {
      initSampleStep(state.pattern[payload.step][payload.selectedSample]);
      dec(state.noteTally, payload.selectedSample);
      state.undoStatus = `erase cells | sample: ${payload.selectedSample}`;
    },
    eraseSample: (state, { payload }: PayloadAction<{ selectedSample: number }>) => {
      state.pattern.forEach(step => {
        initSampleStep(step[payload.selectedSample]);
      });
      state.noteTally.total.count -= state.noteTally[payload.selectedSample].count;
      state.noteTally[payload.selectedSample].count = 0;
      state.noteTally[payload.selectedSample].empty = true;
      state.undoStatus = `erase all cells | sample: ${payload.selectedSample}`;
    },
    eraseAll: state => {
      state.pattern.forEach(step => {
        step.forEach(sample => {
          initSampleStep(sample);
        });
      });
      Object.keys(state.noteTally).forEach(tally => {
        state.noteTally[tally].count = 0;
        state.noteTally[tally].empty = true;
      });
      state.noteTally.total.count = 0;
      state.noteTally.total.empty = true;
      state.mainMixer = getMainMixerFromStr('init');
      state.sampleMixer = getSampleMixerFromStr('init');
      state.undoStatus = `erase sequence`;
    },
    recordSampleFinally: (state, { payload }: PayloadAction<{ sample: number; step: number }>) => {
      state.pattern[payload.step][payload.sample].noteOn = true;
      inc(state.noteTally, payload.sample);
      state.undoStatus = `record`;
    },
    modCellFinally: (
      state,
      {
        payload,
      }: PayloadAction<{
        selectedSample: number;
        type: string;
        value: number | string;
        step: number;
      }>
    ) => {
      let { value } = payload;
      if (payload.type === MODES.MOD_LENGTH && typeof value === 'number' && value < 1)
        value *= 0.25;
      state.pattern[payload.step][payload.selectedSample].notes.forEach(note => {
        (note as any)[payload.type] = value;
      });
      state.undoStatus = `modify cells | sample: ${payload.selectedSample}`;
    },
    modAll: (
      state,
      { payload }: PayloadAction<{ selectedSample: number; type: string; value: number | string }>
    ) => {
      let { value } = payload;
      if (payload.type === MODES.MOD_LENGTH && typeof value === 'number' && value < 1)
        value *= 0.25;
      state.pattern.forEach(step => {
        if (step[payload.selectedSample].noteOn) {
          step[payload.selectedSample].notes.forEach(note => {
            (note as any)[payload.type] = value;
          });
        }
      });
      state.undoStatus = `modify all cells | sample: ${payload.selectedSample}`;
    },
    resetMods: (state, { payload }: PayloadAction<{ selectedSample: number; type: string }>) => {
      state.pattern.forEach(step => {
        step[payload.selectedSample].notes.forEach(note => {
          (note as any)[payload.type] = INITIAL_MODS[payload.type];
        });
      });
      state.undoStatus = `reset cell mods | sample: ${payload.selectedSample}`;
    },
    loadSequence: (state, { payload }: PayloadAction<Sequence>) => {
      state._id = payload._id;
      state.name = payload.name;
      state.kit = payload.kit;
      state.bpm = payload.bpm;
      state.length = payload.length;
      state.mainMixer = payload.mainMixer;
      state.sampleMixer = payload.sampleMixer;
      state.pattern = payload.pattern;
      state.noteTally = getNoteTally(state.pattern);
      state.undoStatus = `load sequence: `;
      state.initialLoad = false;
    },
    changeKit: (state, { payload }: PayloadAction<string>) => {
      state.kit = payload;
      state.undoStatus = `load kit: `;
    },
    changeBpm: (state, { payload }: PayloadAction<number>) => {
      state.bpm = payload;
      state.undoStatus = `change bpm: `;
    },
    adjustMainMixer: (
      state,
      { payload }: PayloadAction<{ property: keyof MainMixer; amount: number }>
    ) => {
      const { min, max } = MAIN_MIXER_PROPERTIES[payload.property];
      let newVal = state.mainMixer[payload.property] + payload.amount;
      if (newVal < min) newVal = min;
      if (newVal > max) newVal = max;
      state.mainMixer[payload.property] = newVal;
      state.undoStatus = `main mixer | adjust ${payload.property}`;
    },
    adjustMainMixerWarp: (state, { payload }: PayloadAction<number>) => {
      const { min, max } = MAIN_MIXER_PROPERTIES.warp;
      let newVal = state.mainMixer.warp + payload;
      if (newVal < min) newVal = min;
      if (newVal > max) newVal = max;
      state.mainMixer.warp = newVal;
    },
    resetMainMixerProperty: (state, { payload }: PayloadAction<keyof MainMixer>) => {
      state.mainMixer[payload] = MAIN_MIXER_PROPERTIES[payload].initialValue;
      state.undoStatus = `main mixer | reset ${payload}`;
    },
    resetMainMixerWarp: state => {
      state.mainMixer.warp = MAIN_MIXER_PROPERTIES.warp.initialValue;
    },
    adjustSampleMixer: (
      state,
      {
        payload,
      }: PayloadAction<{ sample: number; property: keyof SampleMixerItem; amount: number }>
    ) => {
      const { min, max } = SAMPLE_MIXER_PROPERTIES[payload.property];
      let newVal = state.sampleMixer[payload.sample][payload.property] + payload.amount;
      if (newVal < min) newVal = min;
      if (newVal > max) newVal = max;
      state.sampleMixer[payload.sample][payload.property] = newVal;
      state.undoStatus = `sample mixer | sample: ${payload.sample} ${payload.property}`;
    },
    resetSampleMixerProperty: (
      state,
      { payload }: PayloadAction<{ sample: number; property: keyof SampleMixerItem }>
    ) => {
      state.sampleMixer[payload.sample][payload.property] =
        SAMPLE_MIXER_PROPERTIES[payload.property].initialValue;
      state.undoStatus = `sample mixer | reset ${payload.property}`;
    },
  },
});

export const {
  paintCell,
  sliceCell,
  resetSlice,
  paste,
  eraseCell,
  eraseSample,
  eraseAll,
  recordSampleFinally,
  modCellFinally,
  modAll,
  resetMods,
  loadSequence,
  changeKit,
  changeBpm,
  adjustMainMixer,
  adjustMainMixerWarp,
  resetMainMixerProperty,
  resetMainMixerWarp,
  adjustSampleMixer,
  resetSampleMixerProperty,
} = sequenceSlice.actions;

export const { loadInitialSequence, modCell, recordSample } = sequenceThunks;

const reducer = undoable(sequenceSlice.reducer, {
  groupBy: groupByActionTypes([
    'sequence/paintCell',
    'sequence/eraseCell',
    'sequence/sliceCell',
    'sequence/modCell',
    'sequence/recordSampleFinally',
    'sequence/adjustMainMixer',
    'sequence/adjustSampleMixer',
  ]),
  filter: excludeAction(['sequence/adjustMainMixerWarp', 'sequence/resetMainMixerWarp']),
  limit: 100,
});

export default reducer;
