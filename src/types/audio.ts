// Type definitions for audio-related functionality

export interface SampleData {
  noteOn: boolean;
  notes: Note[];
  sampler?: any; // Tone.js Sampler
  channel?: any; // Tone.js Channel
}

export interface Note {
  pitch: string;
  velocity: number;
  length: number;
}

export interface MixerSettings {
  volume: number;
  reverb: number;
  filter: number;
  warp: number;
  crush: number;
  distort: number;
}

export interface SampleMixerSettings {
  vol: number;
  pan: number;
}

export interface KitAsset {
  name: string;
  url: string;
  available?: boolean;
  fetching?: boolean;
}

export interface KitData {
  [key: string]: KitAsset;
}

export interface AudioPattern extends Array<SampleData[]> {}

export interface SequenceData {
  _id?: string;
  name: string;
  pattern: AudioPattern;
  mainMixer: MixerSettings;
  sampleMixer: SampleMixerSettings[];
  bpm: number;
  kit: string;
  synched?: boolean;
}
