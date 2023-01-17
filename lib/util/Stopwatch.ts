import { formatTimeAsMinutesSeconds } from 'lib/sudoku/utils';

export declare type StopwatchEvent = 'start' | 'stop' | 'reset' | 'all';
export declare type StopwatchListener = (stopwatch: Stopwatch, event: StopwatchEvent) => void;

declare type StopwatchListenerMap = { start: StopwatchListener[], stop: StopwatchListener[], reset: StopwatchListener[], all: StopwatchListener[] };

export class Stopwatch {
  private _time = 0;
  private _tStart = -1;
  private readonly _listeners: StopwatchListenerMap = { start: [], stop: [], reset: [], all: [] };

  private get time(): number { return this._time; }
  private set time(value: number) { this._time = value; }
  private get tStart(): number { return this._tStart; }
  private set tStart(value: number) { this._tStart = value; }
  private get accumulatedTime(): number { return this.running ? Date.now() - this.tStart : 0; }
  private get listeners(): StopwatchListenerMap { return this._listeners; }

  on(event: StopwatchEvent, listener: StopwatchListener): this {
    this.listeners[event].push(listener);
    return this;
  }

  private trigger(event: StopwatchEvent): this {
    this.listeners[event].forEach((l: StopwatchListener) => l(this, event));
    return this;
  }

  reset(): this {
    this.time = 0;
    this.tStart = -1;
    return this.trigger('reset').trigger('all');
  }

  start(): this {
    this.tStart = Date.now();
    return this.trigger('start').trigger('all');
  }

  stop(): this {
    this.time += this.accumulatedTime;
    this.tStart = -1;
    return this.trigger('stop').trigger('all');
  }

  toggle(): this { return this[this.running ? 'stop' : 'start'](); }

  get running(): boolean { return this.tStart > 0; }
  get millis(): number { return this.time + this.accumulatedTime; }
  get currentTime(): string { return formatTimeAsMinutesSeconds(this.millis); }
}
