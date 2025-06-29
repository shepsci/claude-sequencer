import { EDITOR_MODE_INFO, setInfo } from 'App/reducers/editorSlice';
import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'App/hooks/redux';
import { useShowAndHideClass } from 'hooks/useShowAndHide';
import { Analyzer } from './Analyzer';
import { useCurrentPath } from 'hooks/useGoTo';

interface InfoState {
  editing: boolean;
  transportStarted: boolean;
  analyzerOn: boolean;
  splitSamplePanel: boolean;
  countIn: string;
  infoText: string;
  flashInfo: boolean;
  mixing: boolean;
}

interface InfoClasses {
  container: string;
  countIn: string;
  infoText: string;
}

interface UseInfoStateReturn {
  state: InfoState;
  classes: InfoClasses;
}

export const VisualPanel: React.FC = () => {
  return (
    <div id="visualPanel" className="visualPanel">
      <Info />
      <Analyzer />
    </div>
  );
};

const Info: React.FC = () => {
  const { state, classes } = useInfoState();

  const memo = useMemo(() => {
    return (
      <div className={classes.container}>
        {state.countIn ? (
          <p className={classes.countIn}>{state.countIn}</p>
        ) : (
          <p className={classes.infoText}>{state.infoText}</p>
        )}
      </div>
    );
  }, [classes, state]);

  return memo;
};

const useInfoState = (): UseInfoStateReturn => {
  const editorMode = useAppSelector(state => state.editor.mode);

  const state: InfoState = {
    editing: useAppSelector(state => state.editor.selectedSample !== -1),
    transportStarted: useAppSelector(state => state.tone.transportState === 'started'),
    analyzerOn: useAppSelector(state => state.screen.analyzer.on),
    splitSamplePanel: useAppSelector(state => state.screen.splitSamplePanel),
    countIn: useAppSelector(state => state.tone.countIn),
    infoText: useAppSelector(state => state.editor.info),
    flashInfo: useAppSelector(state => state.app.flashInfo),
    mixing: false, // Will be set below
  };

  const { mixing } = useCurrentPath();
  state.mixing = mixing;

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setInfo(EDITOR_MODE_INFO[editorMode]));
  }, [dispatch, editorMode]);

  const classes = useInfoStyle(state);

  return { state, classes };
};

const useInfoStyle = (state: InfoState): InfoClasses => {
  const classes: InfoClasses = {
    container: '',
    countIn: useShowAndHideClass('countIn', 100, !!state.countIn),
    infoText: useShowAndHideClass('infoText', 3000, !!state.infoText, state.flashInfo),
  };

  let showInfo = !state.editing;
  if (state.transportStarted && state.analyzerOn) showInfo = false;
  if (!state.splitSamplePanel && state.mixing) showInfo = false;
  classes.container = showInfo ? 'info show' : 'info';

  return classes;
};
