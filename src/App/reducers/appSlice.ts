import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import store from 'App/store';
import { getLS } from 'utils/storage';
import * as appThunks from './thunks/appThunks';

export const THEMES = {
  MARIO: 'Mario',
  JOKER: 'Joker',
  TMNT: 'TMNT',
  LIGHT: 'Light',
} as const;

export type ThemeType = (typeof THEMES)[keyof typeof THEMES];

export interface User {
  _id: string;
  username: string;
  loggedIn: boolean;
}

export const INITIAL_USER: User = {
  _id: '',
  username: '',
  loggedIn: false,
};

export interface AppState {
  authToken: string | null;
  user: User;
  fetching: boolean;
  status: {
    count: number;
    message: string;
  };
  flashInfo: boolean;
  confirmation: string;
  error: string;
  online: boolean;
  serviceWorkerActive: boolean;
  theme: ThemeType;
  log: {
    count: number;
    message: string;
  };
  preparingDownload: boolean;
}

const INITIAL_STATE: AppState = {
  authToken: getLS('authToken') || null,
  user: { ...INITIAL_USER },
  fetching: false,
  status: { count: 0, message: 'loading' },
  flashInfo: false,
  confirmation: '',
  error: '',
  online: window.navigator.onLine,
  serviceWorkerActive: false,
  theme: (getLS('theme') as ThemeType) || THEMES.MARIO,
  log: { count: 0, message: '' },
  preparingDownload: false,
};

export const appSlice = createSlice({
  name: 'app',
  initialState: INITIAL_STATE,
  reducers: {
    setAuthToken: (state, { payload }: PayloadAction<string | null>) => {
      state.authToken = payload;
    },
    logout: state => {
      state.authToken = null;
      state.user = { ...INITIAL_USER };
      state.status.count++;
      state.status.message = 'Successfully logged out';
    },
    setUser: (state, { payload }: PayloadAction<{ user: User; message: string }>) => {
      state.user = payload.user;
      state.status.count++;
      state.status.message = payload.message;
    },
    setStatus: (state, { payload }: PayloadAction<string>) => {
      state.status.count++;
      state.status.message = `${state.status.count}#${payload}`;
    },
    setFlashInfo: (state, { payload }: PayloadAction<boolean>) => {
      state.flashInfo = payload;
    },
    setFetching: (state, { payload }: PayloadAction<boolean>) => {
      state.fetching = payload;
    },
    setConfirmation: (state, { payload }: PayloadAction<string>) => {
      state.confirmation = payload;
    },
    setError: (state, { payload }: PayloadAction<string>) => {
      state.error = payload;
    },
    setOnline: (state, { payload }: PayloadAction<boolean>) => {
      state.online = payload;
    },
    setServiceWorkerActive: (state, { payload }: PayloadAction<boolean>) => {
      state.serviceWorkerActive = payload;
    },
    setTheme: (state, { payload }: PayloadAction<ThemeType>) => {
      state.theme = payload;
    },
    setLog: (state, { payload }: PayloadAction<string>) => {
      state.log.count++;
      state.log.message = payload;
    },
    updateSequencesFinally: (
      state,
      { payload }: PayloadAction<{ message: string; error?: string; confirmation?: string }>
    ) => {
      state.status.count++;
      state.status.message = payload.message;
      if (payload.confirmation) state.confirmation = payload.confirmation;
      if (payload.error) state.error = payload.error;
      state.fetching = false;
    },
    getUserFinally: (
      state,
      {
        payload,
      }: PayloadAction<{ loggedIn: boolean; _id: string; username: string; message: string }>
    ) => {
      state.user.loggedIn = payload.loggedIn;
      state.user._id = payload._id;
      state.user.username = payload.username;
      state.status.count++;
      state.status.message = payload.message;
      state.fetching = false;
    },
    setPreparingDownload: (state, { payload }: PayloadAction<boolean>) => {
      state.preparingDownload = payload;
      const portal = document.getElementById('preparingPortalTop');
      if (payload && portal) portal.style.display = 'initial';
      if (!payload && portal) portal.style.display = 'none';
    },
  },
});

export const {
  setAuthToken,
  logout,
  setUser,
  setStatus,
  setFlashInfo,
  setFetching,
  setConfirmation,
  setError,
  setOnline,
  setServiceWorkerActive,
  setTheme,
  setLog,
  updateSequencesFinally,
  getUserFinally,
  setPreparingDownload,
} = appSlice.actions;

export const { saveSequence, deleteSequence, getUser } = appThunks;

export default appSlice.reducer;

window.addEventListener('online', () => store.dispatch(setOnline(true)));
window.addEventListener('offline', () => store.dispatch(setOnline(false)));
