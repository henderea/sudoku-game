export class Stopwatch {
  private _time = 0;
  private _tStart = -1;

  private get time(): number { return this._time; }
  private set time(value: number) { this._time = value; }
  private get tStart(): number { return this._tStart; }
  private set tStart(value: number) { this._tStart = value; }
  private get accumulatedTime(): number { return this.running ? Date.now() - this.tStart : 0; }

  reset(): this {
    this.time = 0;
    this.tStart = -1;
    return this;
  }

  start(): this {
    this.tStart = Date.now();
    return this;
  }

  stop(): this {
    this.time += this.accumulatedTime;
    this.tStart = -1;
    return this;
  }

  toggle(): this { return this[this.running ? 'stop' : 'start'](); }

  get running(): boolean { return this.tStart > 0; }
  get millis(): number { return this.time + this.accumulatedTime; }
}
