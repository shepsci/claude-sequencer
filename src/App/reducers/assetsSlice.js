import { createSlice } from '@reduxjs/toolkit';
import * as remoteKits from 'assets/kits/remote/remoteKits';
import * as localKits from 'assets/kits/local';
import { defaultSequences } from 'assets/sequences';
import { deepCopyKits } from './functions/assets';
import { logger } from 'utils/logger';

const INITIAL_KITS = {
  ...deepCopyKits(remoteKits),
  ...deepCopyKits(localKits),
};

const INITIAL_STATE = {
  kits: INITIAL_KITS,
  defaultSequences,
  userSequences: [],
};

export const assetsSlice = createSlice({
  name: 'assets',
  initialState: INITIAL_STATE,
  reducers: {
    setKits: (state, { payload }) => {
      state.kits = payload;
    },
    setAvailable: (state, { payload: { kit, available } }) => {
      state.kits[kit].available = available;
    },
    setSynched: (state, { payload: { _id, synched } }) => {
      const seqToUpdate = state.userSequences.find(seqId => seqId._id === _id);
      seqToUpdate.synched = synched;
    },
    setFetchingSamples: (state, { payload: { kit, fetching, available } }) => {
      state.kits[kit].fetching = fetching;
      if (available !== undefined) state.kits[kit].available = available;
    },
    setUserSequences: (state, { payload }) => {
      state.userSequences = payload;
    },
  },
});

export const checkCachedKits = () => async (dispatch, getState) => {
  try {
    const cacheKeys = await caches.keys();
    const kits = deepCopyKits(getState().assets.kits);
    cacheKeys.forEach(key => {
      if (kits[key]) kits[key].available = true;
    });
    dispatch(assetsSlice.actions.setKits(kits));
  } catch (e) {
    logger.debug('cache unavailable', e);
  }
};

export const { setAvailable, setSynched, setFetchingSamples, setUserSequences } =
  assetsSlice.actions;

export default assetsSlice.reducer;
