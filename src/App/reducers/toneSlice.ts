import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as Tone from 'tone';
import { addCursor, pauseFlashing, startFlashing } from 'App/reducers/functions/animations';
import * as toneThunks from './thunks/toneThunks';
import store from 'App/store';

export type TransportState = 'started' | 'stopped' | 'paused';

export interface LoadingError {
  error: boolean;
  count: number;
}

export interface ToneState {
  bufferedKit: string | null;
  buffersLoaded: boolean;
  loadingSamples: boolean;
  transportState: TransportState;
  restarting: boolean;
  step: number;
  audioContextReady: boolean;
  loadingError: LoadingError;
  countIn: string;
  cycle: number;
  stopAfterCycle: number | null;
}

const INITIAL_STATE: ToneState = {
  bufferedKit: null,
  buffersLoaded: false,
  loadingSamples: false,
  transportState: Tone.Transport.state as TransportState,
  restarting: false,
  step: 0,
  audioContextReady: false,
  loadingError: { error: false, count: 0 },
  countIn: '',
  cycle: 1,
  stopAfterCycle: null,
};

export const toneSlice = createSlice({
  name: 'tone',
  initialState: INITIAL_STATE,
  reducers: {
    setAudioContextReady: (state, { payload }: PayloadAction<boolean>) => {
      state.audioContextReady = payload;
    },
    setLoadingSamples: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingSamples = payload;
    },
    loadSamplesFinally: (
      state,
      {
        payload,
      }: PayloadAction<{
        loadingSamples: boolean;
        buffersLoaded: boolean;
        bufferedKit: string;
        loadingError: boolean;
      }>
    ) => {
      state.loadingSamples = payload.loadingSamples;
      state.buffersLoaded = payload.buffersLoaded;
      state.bufferedKit = payload.bufferedKit;
      state.loadingError.error = payload.loadingError;
      if (payload.loadingError) {
        state.loadingError.count++;
      } else {
        state.loadingError.count = 0;
      }
    },
    setStep: (state, { payload }: PayloadAction<number>) => {
      state.step = payload;
    },
    pauseSequence: state => {
      Tone.Transport.pause();
      pauseFlashing();
      addCursor(state.step);
      startFlashing();
      state.transportState = 'paused';
    },
    setTransportState: (state, { payload }: PayloadAction<TransportState>) => {
      state.transportState = payload;
    },
    setRestarting: (state, { payload }: PayloadAction<boolean>) => {
      state.restarting = payload;
    },
    startSequenceFinally: (state, { payload }: PayloadAction<number | undefined>) => {
      if (payload) state.stopAfterCycle = payload;
      state.restarting = false;
      state.transportState = 'started';
      Tone.Transport.start();
      (state as any).countingIn = false;
    },
    stopSequenceFinally: state => {
      state.step = 0;
      state.cycle = 1;
      state.stopAfterCycle = null;
      state.transportState = 'stopped';
    },
    setCountIn: (state, { payload }: PayloadAction<string>) => {
      state.countIn = payload;
    },
    setCycle: (state, { payload }: PayloadAction<number>) => {
      state.cycle = payload;
    },
  },
});

export const {
  setAudioContextReady,
  setLoadingSamples,
  loadSamplesFinally,
  setStep,
  pauseSequence,
  setTransportState,
  setRestarting,
  startSequenceFinally,
  stopSequenceFinally,
  setCountIn,
  setCycle,
} = toneSlice.actions;

export const { startTone, loadSamples, schedulePattern, startSequence, stopSequence } = toneThunks;

export default toneSlice.reducer;

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (!store.getState().tone.buffersLoaded) return;
  if ((e.target as HTMLElement)?.id === 'saveSequenceInput') return;

  if (e.code === 'Space') {
    if (Tone.Transport.state === 'started') store.dispatch(pauseSequence());
    else store.dispatch(startSequence());
  }
});
