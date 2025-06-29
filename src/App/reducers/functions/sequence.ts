import { logger } from 'utils/logger';
import type {
  Pattern,
  NoteTally,
  Note,
  SampleStep,
  MainMixer,
  SampleMixer,
} from '../sequenceSlice';

/**
 * Calculates note tally statistics for a given pattern
 */
export const getNoteTally = (pattern: Pattern): NoteTally => {
  if (!Array.isArray(pattern)) {
    logger.error('getNoteTally -> pattern is not an array', pattern);
    return {
      '-1': { count: 0, empty: true },
      total: { count: 0, empty: true },
    };
  }

  const noteTally: NoteTally = {
    '-1': { count: 0, empty: true },
    total: { count: 0, empty: true },
  };

  pattern[0].forEach((_, i) => {
    noteTally[i] = { count: 0, empty: true };
  });

  pattern.forEach(step => {
    step.forEach((sample, i) => {
      if (sample.noteOn) {
        noteTally[i].count++;
        noteTally.total.count++;
      }
    });
  });

  for (let i = 0; i < pattern[0].length; i++) {
    if (noteTally[i].count) {
      noteTally[i].empty = false;
      noteTally.total.empty = false;
    }
  }

  return noteTally;
};

export const inc = (noteTally: NoteTally, sample: number): void => {
  noteTally[sample].count++;
  noteTally[sample].empty = false;
  noteTally.total.count++;
  noteTally.total.empty = false;
};

export const dec = (noteTally: NoteTally, sample: number): void => {
  noteTally[sample].count--;
  if (noteTally[sample].count === 0) noteTally[sample].empty = true;
  noteTally.total.count--;
  if (noteTally.total.count === 0) noteTally.total.empty = true;
};

export const initSampleStep = (sample: SampleStep): void => {
  sample.noteOn = false;
  sample.notes.length = 0;
  sample.notes.push(INIT_NOTE());
};

export const INIT_NOTE = (): Note => ({ pitch: 'C2', velocity: 1, length: 1 });

export const INIT_SAMPLE = (): SampleStep => ({
  noteOn: false,
  notes: [INIT_NOTE()],
});

export const INIT_PATTERN = (): Pattern => {
  const pattern: Pattern = [];
  const step: SampleStep[] = [];
  for (let i = 0; i < 9; i++) {
    step.push(INIT_SAMPLE());
  }
  for (let i = 0; i < 64; i++) {
    // Object.assign req'd to not mutate previous edits in loop
    pattern.push(Object.assign([], step));
  }
  return pattern;
};

const stepRegexp = /S(\d+)/g;
const sampleRegexp = /s(\d+)/g;
const valsRegexp = /p\w#?\d|v\d+(?:\.\d+)?|l\d+(?:\.\d+)?/g;
const slicesRegexp = /(n1.*)(n2.*)|n1.*$|n2.*$/;

/**
 * Converts a pattern object into a compressed string representation
 */
export const getStrFromPattern = (editedPattern: Pattern): string => {
  const initialPattern = INIT_PATTERN();
  const edits: string[] = [];
  editedPattern.forEach((step, i) => {
    const stepEdits: string[] = [];
    let stepEdited = false;
    step.forEach((sample, s) => {
      const sampleEdits: string[] = [];
      const initialSample = initialPattern[i][s];
      if (sample.noteOn !== initialSample.noteOn) {
        sampleEdits.push(sample.noteOn ? 't' : 'f');
      }
      if (sample.notes[0].pitch !== initialSample.notes[0].pitch) {
        sampleEdits.push('p' + sample.notes[0].pitch);
      }
      if (sample.notes[0].velocity !== initialSample.notes[0].velocity) {
        sampleEdits.push('v' + sample.notes[0].velocity);
      }
      if (sample.notes[0].length !== initialSample.notes[0].length) {
        sampleEdits.push('l' + sample.notes[0].length);
      }
      if (sample.notes[1]) {
        sampleEdits.push('n1' + getNoteStrFromObj(sample.notes[1]));
      }
      if (sample.notes[2]) {
        sampleEdits.push('n2' + getNoteStrFromObj(sample.notes[2]));
      }
      if (sampleEdits.length > 0) {
        stepEdited = true;
        stepEdits.push(`s${s}${sampleEdits.join('')}`);
      }
    });
    if (stepEdited) {
      edits.push(`S${i}${stepEdits.join('')}`);
    }
  });
  const string = edits.join('');
  return string || 'init';
};

const getNoteStrFromObj = (note: Note): string => `p${note.pitch}v${note.velocity}l${note.length}`;

const getNoteObjFromStr = (string: string): Note => {
  const noteVals = INIT_NOTE();
  const edits = string.match(valsRegexp);
  if (edits) {
    edits.forEach(edit => {
      switch (edit[0]) {
        case 'p':
          noteVals.pitch = edit.substr(1);
          break;
        case 'v':
          noteVals.velocity = Number(edit.substr(1));
          break;
        case 'l':
          noteVals.length = Number(edit.substr(1));
          break;
        default:
          break;
      }
    });
  }
  return noteVals;
};

const getVals = (string: string): SampleStep => {
  const sample: SampleStep = { noteOn: false, notes: [] };
  const slices = string.match(slicesRegexp);
  if (slices) {
    let note1: Note, note2: Note | undefined;
    if (slices[1]) {
      note1 = getNoteObjFromStr(slices[1]);
    } else {
      note1 = getNoteObjFromStr(slices[0]);
    }
    if (slices[2]) {
      note2 = getNoteObjFromStr(slices[2]);
    }
    const n = string.indexOf('n');
    const note0String = string.substr(0, n);
    const note0 = getNoteObjFromStr(note0String);
    sample.notes.push(note0, note1);
    if (note2) sample.notes.push(note2);
  } else {
    const note0 = getNoteObjFromStr(string);
    sample.notes.push(note0);
  }
  if (string[0] === 't') sample.noteOn = true;
  if (string[0] === 'f') sample.noteOn = false;
  return sample;
};

type RegexpEntry = [string, string];

const getEntries = (string: string, regexp: RegExp): RegexpEntry[] => {
  const array = string.split(regexp);
  const entries: RegexpEntry[] = [];
  for (let i = 1, len = array.length; i < len; i += 2) {
    const key = array[i];
    const val = array[i + 1];
    const entry: RegexpEntry = [key, val];
    entries.push(entry);
  }
  return entries;
};

export const getPatternFromStr = (editString: string): Pattern => {
  const pattern = INIT_PATTERN();
  if (editString === 'init') return pattern;
  const stepEntries = getEntries(editString, stepRegexp);
  stepEntries.forEach(([step, sampleEditsString]) => {
    const sampleEntries = getEntries(sampleEditsString, sampleRegexp);
    sampleEntries.forEach(([sample, edits]) => {
      pattern[Number(step)][Number(sample)] = getVals(edits);
    });
  });
  return pattern;
};

const INIT_MAIN_MIXER = (): MainMixer => ({
  volume: 76,
  reverb: 0,
  filter: 100,
  warp: 50,
  crush: 0,
  distort: 0,
});

export const getStrFromMainMixer = (editedMainMixer: MainMixer): string => {
  const initialMainMixer = INIT_MAIN_MIXER();
  const edits: (string | number)[] = [];
  for (const [key, val] of Object.entries(initialMainMixer)) {
    const newVal = editedMainMixer[key as keyof MainMixer];
    if (val !== newVal) edits.push(key.substr(0, 1), newVal);
  }
  const string = edits.join('');
  return string || 'init';
};

const mainMixerPropertyLookup: Record<string, keyof MainMixer> = {
  v: 'volume',
  r: 'reverb',
  f: 'filter',
  w: 'warp',
  c: 'crush',
  d: 'distort',
};

export const getMainMixerFromStr = (string: string): MainMixer => {
  const mainMixer = INIT_MAIN_MIXER();
  if (string === 'init') return mainMixer;
  const edits = string.split(/([a-z]\d+)/g);
  for (const edit of edits) {
    if (!edit) continue;
    const [, letter, val] = edit.split(/([a-z])(\d+)/);
    const property = mainMixerPropertyLookup[letter];
    if (property) {
      mainMixer[property] = parseInt(val);
    }
  }
  return mainMixer;
};

const INIT_SAMPLE_MIXER = (): SampleMixer => [
  { vol: 100, pan: 50 },
  { vol: 100, pan: 50 },
  { vol: 100, pan: 50 },
  { vol: 100, pan: 50 },
  { vol: 100, pan: 50 },
  { vol: 100, pan: 50 },
  { vol: 100, pan: 50 },
  { vol: 100, pan: 50 },
  { vol: 100, pan: 50 },
];

export const getStrFromSampleMixer = (editedSampleMixer: SampleMixer): string => {
  const initialSampleMixer = INIT_SAMPLE_MIXER();
  const edits: (string | number)[] = [];
  editedSampleMixer.forEach((sample, i) => {
    const sampleEdits: (string | number)[] = [];
    let sampleEdited = false;
    for (const [key, val] of Object.entries(sample)) {
      if (initialSampleMixer[i][key as keyof typeof sample] !== val) {
        sampleEdits.push(key.substr(0, 1), val);
        sampleEdited = true;
      }
    }
    if (sampleEdited) edits.push('S', i, ...sampleEdits);
  });
  const string = edits.join('');
  return string || 'init';
};

const sampleMixerPropertyLookup: Record<string, 'vol' | 'pan'> = { v: 'vol', p: 'pan' };

export const getSampleMixerFromStr = (string: string): SampleMixer => {
  const sampleMixer = INIT_SAMPLE_MIXER();
  if (string === 'init') return sampleMixer;
  const edits = string.split(/S/g);
  for (const edit of edits) {
    if (!edit) continue;
    const [, sample, letter, val] = edit.split(/(\d)([v|p])(\d+)/);
    const property = sampleMixerPropertyLookup[letter];
    if (property && sample !== undefined && val !== undefined) {
      sampleMixer[Number(sample)][property] = parseInt(val);
    }
  }
  return sampleMixer;
};
