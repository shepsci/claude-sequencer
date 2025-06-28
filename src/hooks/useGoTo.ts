import { useHistory, useLocation } from 'react-router';

export const PATHS = {
  BASE: '/sequencer/session',
  INFO: '/sequencer/session/info',
  LOAD: '/sequencer/session/load',
  SAVE: '/sequencer/session/save',
  LOGIN: '/sequencer/session/login',
  CHANGE_KIT: '/sequencer/session/kits',
  GLOBAL_MIXER: '/sequencer/session/mixer/main',
  SAMPLE_MIXER: '/sequencer/session/mixer/samples',
} as const;

export type PathKey = keyof typeof PATHS;
export type PathValue = (typeof PATHS)[PathKey];

export interface GoToFunctions {
  base: (cb?: () => void) => void;
  info: (cb?: () => void) => void;
  load: (cb?: () => void) => void;
  save: (cb?: () => void) => void;
  login: (cb?: () => void) => void;
  changeKit: (cb?: () => void) => void;
  mainMixer: (cb?: () => void) => void;
  sampleMixer: (cb?: () => void) => void;
}

export interface CurrentPath {
  selectingKit: boolean;
  mixingMain: boolean;
  mixingSamples: boolean;
  mixing: boolean;
  atBase: boolean;
  showingInfo: boolean;
}

export const useGoTo = (): GoToFunctions => {
  const history = useHistory();
  const goToFunc = (path: string, cb?: () => void): void => {
    history.push(path);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.scrollTop = 0;
    }
    if (!cb || typeof cb !== 'function') return;
    cb();
  };

  const goTo: GoToFunctions = {
    base: (cb?: () => void) => goToFunc(PATHS.BASE, cb),
    info: (cb?: () => void) => goToFunc(PATHS.INFO, cb),
    load: (cb?: () => void) => goToFunc(PATHS.LOAD, cb),
    save: (cb?: () => void) => goToFunc(PATHS.SAVE, cb),
    login: (cb?: () => void) => goToFunc(PATHS.LOGIN, cb),
    changeKit: (cb?: () => void) => goToFunc(PATHS.CHANGE_KIT, cb),
    mainMixer: (cb?: () => void) => goToFunc(PATHS.GLOBAL_MIXER, cb),
    sampleMixer: (cb?: () => void) => goToFunc(PATHS.SAMPLE_MIXER, cb),
  };

  return goTo;
};

export const useCurrentPath = (): CurrentPath => {
  const pathname = useLocation().pathname;

  const path: CurrentPath = {
    selectingKit: pathname === PATHS.CHANGE_KIT,
    mixingMain: pathname === PATHS.GLOBAL_MIXER,
    mixingSamples: pathname === PATHS.SAMPLE_MIXER,
    mixing: false, // Will be set below
    atBase: pathname === PATHS.BASE,
    showingInfo: pathname === PATHS.INFO,
  };

  path.mixing = path.mixingMain || path.mixingSamples;

  return path;
};
