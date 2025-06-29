import {
  flagDeleted,
  addCloudUserToPayload,
  addIDBUserToPayload,
  idbDelSeq,
  idbSaveSeqs,
  mergeSequences,
} from 'App/reducers/functions/user';
import { apiDeleteSequence, apiSaveSequence } from 'api';
import { getUserFinally, setFetching, setStatus, updateSequencesFinally } from '../appSlice';
import { setUserSequences } from '../assetsSlice';
import type { AppThunk } from 'App/store';
import type { Sequence } from '../sequenceSlice';

interface SaveSequencePayload {
  message: string;
  confirmation: string;
  error: string;
  newSequences: any[];
}

interface DeleteSequencePayload {
  message: string;
  error: string;
  newSequences: any[];
}

interface GetUserPayload {
  loggedIn: boolean;
  _id: string;
  username: string;
  message: string;
  userSequences: any[];
  promises: Promise<any>[];
}

export const saveSequence =
  (sequence: Sequence): AppThunk =>
  async (dispatch, getState) => {
    dispatch(setFetching(true));
    const payload: SaveSequencePayload = {
      message: '',
      confirmation: '',
      error: '',
      newSequences: [...getState().assets.userSequences],
    };
    try {
      await idbSaveSeqs(sequence, payload.newSequences);
      payload.message = 'success!';
      payload.confirmation = `succesfully saved ${sequence.name} to device`;
      await apiSaveSequence(sequence);
      payload.confirmation += ' and cloud';
      (sequence as any).synched = true;
    } catch (e) {
      if (!payload.message) {
        payload.message = 'unsuccessful :(';
        payload.error = 'Error: Please try again later';
      } else {
        payload.message = 'updated local database';
      }
    } finally {
      dispatch(setUserSequences(payload.newSequences));
      dispatch(updateSequencesFinally(payload));
    }
  };

export const deleteSequence =
  (_id: string): AppThunk =>
  async (dispatch, getState) => {
    dispatch(setFetching(true));
    const payload: DeleteSequencePayload = {
      message: '',
      error: '',
      newSequences: [...getState().assets.userSequences],
    };
    try {
      await idbDelSeq(_id, payload.newSequences);
      payload.message = 'success!';
      await apiDeleteSequence(_id);
    } catch (e) {
      if (!payload.message) {
        payload.message = 'unsuccessful :(';
        payload.error = 'Error: Please try again later';
      } else {
        payload.message = 'updated local database';
        flagDeleted(_id);
      }
    } finally {
      dispatch(setUserSequences(payload.newSequences));
      dispatch(updateSequencesFinally(payload));
    }
  };

export const getUser = (): AppThunk => async (dispatch, getState) => {
  dispatch(setFetching(true));
  const payload: GetUserPayload = {
    loggedIn: false,
    _id: '',
    username: '',
    message: '',
    userSequences: [],
    promises: [],
  };
  try {
    await addCloudUserToPayload(payload);
    await addIDBUserToPayload(payload);
    await mergeSequences(payload);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('getUser ->\n', e);
    payload.message = 'No user data';
  } finally {
    dispatch(setUserSequences(payload.userSequences));
    dispatch(getUserFinally(payload));
    const online = getState().app.online;
    if (online && payload.loggedIn && payload.promises.length > 0) {
      try {
        await Promise.all(payload.promises);
        dispatch(setStatus('user data refreshed'));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('getUser | promises ->:\n', e);
      }
    }
  }
};
