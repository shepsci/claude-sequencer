export interface User {
  _id: string;
  username: string;
  loggedIn: boolean;
}

export interface StatusMessage {
  count: number;
  message: string;
}

export interface LogMessage {
  count: number;
  message: string;
}

export interface AppState {
  authToken: string | null;
  user: User;
  fetching: boolean;
  status: StatusMessage;
  flashInfo: boolean;
  confirmation: string;
  error: string;
  online: boolean;
  serviceWorkerActive: boolean;
  theme: string;
  log: LogMessage;
  preparingDownload: boolean;
}

export const THEMES = {
  MARIO: 'Mario',
  JOKER: 'Joker',
  TMNT: 'TMNT',
  LIGHT: 'Light',
} as const;

export type ThemeType = (typeof THEMES)[keyof typeof THEMES];
