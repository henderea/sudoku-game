import type { JSX } from 'solid-js';
import type { Observable } from '../utils';

import { createContext, onCleanup, useContext } from 'solid-js';

import { Stopwatch } from 'lib/util/Stopwatch';

import { obs } from '../utils';

export interface Timer {
  running(): boolean;
  get millis(): number;
  get currentTime(): string;
  display(): string;

  start(): void;
  stop(): void;
  toggle(): void;
  reset(): void;

  clearTimerInterval(): void;
  startTimerInterval(): void;
}

class TimerImpl implements Timer {
  private readonly _stopwatch: Stopwatch;
  private readonly _running: Observable<boolean>;
  private readonly _timeDisplay: Observable<string>;
  private _interval: number | undefined = undefined;

  constructor() {
    this._stopwatch = new Stopwatch();
    this._running = obs(false);
    this.stopwatch.on('all', (s: Stopwatch) => {
      this._running.set(s.running);
      this._timeDisplay.set(s.currentTime);
    });
    this._timeDisplay = obs('0:00');
    onCleanup(() => this.clearTimerInterval());
  }

  private get stopwatch(): Stopwatch { return this._stopwatch; }

  running(): boolean { return this._running(); }
  get millis(): number { return this.stopwatch.millis; }
  get currentTime(): string { return this.stopwatch.currentTime; }
  display(): string { return this._timeDisplay(); }

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
    this._interval = setInterval(() => this._timeDisplay.set(this.currentTime), 200);
  }
}

export interface TimerHolder {
  get timer(): Timer;
}

const TimerContext = createContext<TimerHolder>();

export function TimerProvider(props: { children: any }): JSX.Element {
  const timer: Timer = new TimerImpl();
  const context = { timer };
  return (
    <TimerContext.Provider value={context}>
      {props.children}
    </TimerContext.Provider>
  );
}

export function useTimer(): TimerHolder { return useContext(TimerContext) as TimerHolder; }

export default function TimerDisplay(): JSX.Element {
  const { timer } = useTimer();
  return (
    <span class="timer" classList={{ running: timer.running() }}>{timer.display()}</span>
  );
}
