import type { JSX } from 'solid-js';
import { createSignal, onCleanup } from 'solid-js';

import { Stopwatch } from 'lib/util/Stopwatch';

export const stopwatch: Stopwatch = new Stopwatch();

export interface Timer {
  get running(): boolean;
  get millis(): number;
  get currentTime(): string;
  get display(): string;

  start(): void;
  stop(): void;
  toggle(): void;
  reset(): void;

  clearTimerInterval(): void;
  startTimerInterval(): void;
}

class TimerImpl implements Timer {
  private readonly _stopwatch: Stopwatch;
  private readonly _running: () => boolean;
  private readonly _timeDisplay: () => string;
  private readonly _setTimeDisplay: (value: string) => void;
  private _interval: number | undefined = undefined;

  constructor() {
    this._stopwatch = new Stopwatch();
    const [running, setRunning] = createSignal(false);
    this._running = running;
    this.stopwatch.on('all', (s: Stopwatch) => setRunning(s.running));
    const [timeDisplay, setTimeDisplay] = createSignal('0:00');
    this._timeDisplay = timeDisplay;
    this._setTimeDisplay = setTimeDisplay;
    onCleanup(() => this.clearTimerInterval());
  }

  private get stopwatch(): Stopwatch { return this._stopwatch; }

  get running(): boolean { return this._running(); }
  get millis(): number { return this.stopwatch.millis; }
  get currentTime(): string { return this.stopwatch.currentTime; }
  get display(): string { return this._timeDisplay(); }

  start(): void { this.stopwatch.start(); }
  stop(): void { this.stopwatch.stop(); }
  toggle(): void { this.stopwatch.toggle(); }
  reset(): void { this.stopwatch.reset(); }

  clearTimerInterval(): void {
    if(this._interval) {
      clearInterval(this._interval);
      this._interval = undefined;
    }
  }
  startTimerInterval(): void {
    this.clearTimerInterval();
    this._interval = setInterval(() => this._setTimeDisplay(this.currentTime), 200);
  }
}

export const timer: Timer = new TimerImpl();

export default function TimerDisplay(): JSX.Element {
  return (
    <span class="timer" classList={{ running: timer.running }}>{timer.display}</span>
  );
}
