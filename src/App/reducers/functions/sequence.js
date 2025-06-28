import { logger } from 'utils/logger';

export const getNoteTally = pattern => {
  if (!Array.isArray(pattern)) {
    logger.error('getNoteTally -> pattern is not an array', pattern);
    return;
  }
  let noteTally = {
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

export const inc = (noteTally, sample) => {
  noteTally[sample].count++;
  noteTally[sample].empty = false;
  noteTally.total.count++;
  noteTally.total.empty = false;
};

export const dec = (noteTally, sample) => {
  noteTally[sample].count--;
  if (noteTally[sample].count === 0) noteTally[sample].empty = true;
  noteTally.total.count--;
  if (noteTally.total.count === 0) noteTally.total.empty = true;
};

export const initSampleStep = sample => {
  sample.noteOn = false;
  sample.notes.length = 0;
  sample.notes.push(INIT_NOTE());
};

export const INIT_NOTE = () => ({ pitch: 'C2', velocity: 1, length: 1 });

export const INIT_SAMPLE = () => ({
  noteOn: false,
  notes: [INIT_NOTE()],
});

export const INIT_PATTERN = () => {
  let pattern = [];
  let step = [];
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

export const getStrFromPattern = editedPattern => {
  const initialPattern = INIT_PATTERN();
  const edits = [];
  editedPattern.forEach((step, i) => {
    const stepEdits = [];
    let stepEdited = false;
    step.forEach((sample, s) => {
      const sampleEdits = [];
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
      if (sample.notes[0].velocity !== initialSample.notes[0].length) {
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

const getNoteStrFromObj = note => `p${note.pitch}v${note.velocity}l${note.length}`;

const getNoteObjFromStr = string => {
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

const getVals = string => {
  let sample = { noteOn: false, notes: [] };
  const slices = string.match(slicesRegexp);
  if (slices) {
    let note1, note2;
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

const getEntries = (string, regexp) => {
  const array = string.split(regexp);
  const entries = [];
  for (let i = 1, len = array.length; i < len; i += 2) {
    let key = array[i];
    let val = array[i + 1];
    let entry = [key, val];
    entries.push(entry);
  }
  return entries;
};

export const getPatternFromStr = editString => {
  const pattern = INIT_PATTERN();
  if (editString === 'init') return pattern;
  const stepEntries = getEntries(editString, stepRegexp);
  stepEntries.forEach(([step, sampleEditsString]) => {
    const sampleEntries = getEntries(sampleEditsString, sampleRegexp);
    sampleEntries.forEach(([sample, edits]) => {
      pattern[step][sample] = getVals(edits);
    });
  });
  return pattern;
};

const INIT_MAIN_MIXER = () => ({
  volume: 76,
  reverb: 0,
  filter: 100,
  warp: 50,
  crush: 0,
  distort: 0,
});

export const getStrFromMainMixer = editedMainMixer => {
  const initialMainMixer = INIT_MAIN_MIXER();
  const edits = [];
  for (let [key, val] of Object.entries(initialMainMixer)) {
    const newVal = editedMainMixer[key];
    if (val !== newVal) edits.push(key.substr(0, 1), newVal);
  }
  const string = edits.join('');
  return string || 'init';
};

const mainMixerPropertyLookup = {
  v: 'volume',
  r: 'reverb',
  f: 'filter',
  w: 'warp',
  c: 'crush',
  d: 'distort',
};

export const getMainMixerFromStr = string => {
  const mainMixer = INIT_MAIN_MIXER();
  if (string === 'init') return mainMixer;
  const edits = string.split(/([a-z]\d+)/g);
  for (let edit of edits) {
    if (!edit) continue;
    const [, letter, val] = edit.split(/([a-z])(\d+)/);
    const property = mainMixerPropertyLookup[letter];
    mainMixer[property] = parseInt(val);
  }
  return mainMixer;
};

const INIT_SAMPLE_MIXER = () => [
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

export const getStrFromSampleMixer = editedSampleMixer => {
  const initialSampleMixer = INIT_SAMPLE_MIXER();
  const edits = [];
  editedSampleMixer.forEach((sample, i) => {
    let sampleEdits = [];
    let sampleEdited = false;
    for (let [key, val] of Object.entries(sample)) {
      if (initialSampleMixer[i][key] !== val) {
        sampleEdits.push(key.substr(0, 1), val);
        sampleEdited = true;
      }
    }
    if (sampleEdited) edits.push('S', i, ...sampleEdits);
  });
  const string = edits.join('');
  return string || 'init';
};

const sampleMixerPropertyLookup = { v: 'vol', p: 'pan' };

export const getSampleMixerFromStr = string => {
  const sampleMixer = INIT_SAMPLE_MIXER();
  if (string === 'init') return sampleMixer;
  const edits = string.split(/S/g);
  for (let edit of edits) {
    if (!edit) continue;
    const [, sample, letter, val] = edit.split(/(\d)([v|p])(\d+)/);
    const property = sampleMixerPropertyLookup[letter];
    sampleMixer[sample][property] = parseInt(val);
  }
  return sampleMixer;
};
