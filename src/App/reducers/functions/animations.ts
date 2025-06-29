import { fft } from 'App/Tone';
import * as Tone from 'tone';
import type { SampleStep } from '../sequenceSlice';

export const startFlashing = (): void => {
  const flashingCells = document.querySelectorAll('.flashing');
  flashingCells.forEach(cell => cell.classList.remove('pause'));
};

export const pauseFlashing = (): void => {
  const flashingCells = document.querySelectorAll('.flashing');
  flashingCells.forEach(cell => cell.classList.add('pause'));
};

export const addCursor = (step: number): void => {
  const cell = document.getElementById(`cell-${step}`);
  if (cell) cell.dataset.cursor = 'true';
};

export const removeCursor = (length: number, step: number): void => {
  const prevStep = step - 1 > 0 ? step - 1 : length - 1;
  const nextStep = (step + 1) % length;
  const cell = document.getElementById(`cell-${step}`);
  const prevCell = document.getElementById(`cell-${prevStep}`);
  const nextCell = document.getElementById(`cell-${nextStep}`);
  if (cell) cell.dataset.cursor = 'false';
  if (prevCell) prevCell.dataset.cursor = 'false';
  if (nextCell) nextCell.dataset.cursor = 'false';
};

export const animateCell = (time: number, cell: HTMLElement): void => {
  Tone.Draw.schedule(() => {
    if (cell.classList.contains('on')) {
      cell.classList.add('pulse');
      setTimeout(() => cell.classList.remove('pulse'), 0);
    } else {
      cell.classList.add('flash');
      setTimeout(() => cell.classList.remove('flash'), 0);
    }
  }, time);
};

export const animateSample = (time: number, step: SampleStep[]): void => {
  const sampleBtns = document.querySelectorAll('.sampleBtn');
  const mixItems = document.querySelectorAll('.mixItem');
  Tone.Draw.schedule(() => {
    step.forEach((sample, i) => {
      if (sample.noteOn) {
        sampleBtns && sampleBtns[i]?.classList.add('pulse');
        mixItems && mixItems[i]?.classList.add('pulse');
        setTimeout(() => {
          sampleBtns && sampleBtns[i]?.classList.remove('pulse');
          mixItems && mixItems[i]?.classList.remove('pulse');
        }, 0);
      }
    });
  }, time);
};

let freqs: NodeListOf<Element>;
let spectrum: number[];
let average: number;
let i: number;
let db: number;
let prevDb: number;
let newDb: number;
const prevDbs = new Array(36);
let drawAnalyzer: boolean;

export const startAnalyzer = (): void => {
  if (drawAnalyzer) return;
  freqs = document.querySelectorAll('.freq');
  drawAnalyzer = true;
  requestAnimationFrame(animateAnalyzer);
};

export const stopAnalyzer = (): void => {
  drawAnalyzer = false;
  setTimeout(() => {
    freqs = document.querySelectorAll('.freq');
    freqs.forEach((freq: Element) => {
      const freqElement = freq as HTMLElement;
      freqElement.style.removeProperty('transform');
      freqElement.style.removeProperty('filter');
      freqElement.style.removeProperty('opacity');
    });
  }, 20);
};

let fps = 60;
let interval = 1000 / fps;
let then = Date.now();
let now: number;
let elapsed: number;

function animateAnalyzer(): void {
  now = Date.now();
  elapsed = now - then;
  if (elapsed > interval) {
    then = now;
    spectrum = Array.from(fft.getValue() as Float32Array);
    average = spectrum.reduce((acc, curr) => acc + curr) / spectrum.length;
    freqs.forEach((freq, index) => {
      i = index + 2; // first two freqs of fft are hyped
      db = Math.abs(spectrum[i] + average) * 100;
      prevDb = prevDbs[i] + 0.15;
      newDb = db < prevDb ? 0 : db > 1 ? 1 : db;
      prevDbs[i] = db;
      if (newDb !== prevDb) {
        const freqElement = freq as HTMLElement;
        freqElement.style.transitionDuration = newDb ? '60ms' : '1s';
        let scaleX: string | number = freqElement.dataset.scalex || '1';
        if (scaleX !== '1') scaleX = newDb * 0.25;
        let scaleY: string | number = freqElement.dataset.scaley || '1';
        if (scaleY !== '1') scaleY = newDb;
        const transform = `scale(${scaleX}, ${scaleY})`;
        freqElement.style.transform = transform;
        // let blur = freq.dataset.blur - newDb * 100;
        // if (blur < 0) blur = 0;
        // freq.style.filter = `blur(${blur}px)`;
        freqElement.style.opacity = String(newDb + 0.5);
      }
    });
  }
  if (drawAnalyzer) requestAnimationFrame(animateAnalyzer);
}
