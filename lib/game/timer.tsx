import type { JSX } from 'solid-js';
import { createSignal, onCleanup } from 'solid-js';

import { Stopwatch } from 'lib/util/Stopwatch';

const stopwatch: Stopwatch = new Stopwatch();

const [running, setRunning] = createSignal(false);

export function timerRunning(): boolean { return running(); }
export function startTimer(): void { stopwatch.start(); setRunning(stopwatch.running); }
export function stopTimer(): void { stopwatch.stop(); setRunning(stopwatch.running); }
export function toggleTimer(): void { stopwatch.toggle(); setRunning(stopwatch.running); }
export function resetTimer(): void { stopwatch.reset(); setRunning(stopwatch.running); }
export function getMillis(): number { return stopwatch.millis; }
export function getTime(): string {
  const millis: number = getMillis();
  const seconds: number = Math.floor(millis / 1000);
  const mins: string = `${Math.floor(seconds / 60)}`;
  const secs: string = `${seconds % 60}`;
  return `${mins}:${secs.padStart(2, '0')}`;
}

const [getTimer, setTimer] = createSignal('0:00');

let interval: number | undefined = undefined;

export function clearTimerInterval(): void {
  if(interval !== undefined) {
    clearInterval(interval);
    interval = undefined;
  }
}
export function startTimerInterval(): void {
  clearTimerInterval();
  interval = setInterval(() => setTimer(getTime()), 200);
}

onCleanup(() => clearTimerInterval());

export default function Timer(): JSX.Element {
  return (
    <span class="timer" classList={{ running: running() }}>{getTimer()}</span>
  );
}
