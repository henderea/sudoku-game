export type SwipeDir = 'left' | 'right' | 'up' | 'down';

export class Swipe<T> {
  private _key: T | undefined;
  private _xStart: number = -1;
  private _yStart: number = -1;
  private readonly _onSwipe: (key: T, dir: SwipeDir) => void;

  constructor(onSwipe: (key: T, dir: SwipeDir) => void) {
    this._onSwipe = onSwipe;
  }

  private get key(): T | undefined { return this._key; }
  private set key(value: T | undefined) { this._key = value; }
  private get xStart(): number { return this._xStart; }
  private set xStart(value: number) { this._xStart = value; }
  private get yStart(): number { return this._yStart; }
  private set yStart(value: number) { this._yStart = value; }

  private onSwipe(dir: SwipeDir): void {
    this._onSwipe(this.key as T, dir);
    this.key = undefined;
    this.xStart = -1;
    this.yStart = -1;
  }

  touchStart(key: T | null, event: TouchEvent): void {
    if(key) {
      this.key = key;
    }
    const firstTouch: Touch = event.touches[0];
    this.xStart = firstTouch.clientX;
    this.yStart = firstTouch.clientY;
  }

  touchEnd(event: TouchEvent): void {
    if(this.xStart < 0 || this.yStart < 0 || this.key === undefined) { return; }
    const firstTouch: Touch = event.touches[0];
    const xEnd: number = firstTouch.clientX;
    const yEnd: number = firstTouch.clientY;
    const xDiff: number = xEnd - this.xStart;
    const yDiff: number = yEnd - this.yStart;
    if(Math.abs(xDiff) > Math.abs(yDiff)) {
      this.onSwipe(xDiff > 0 ? 'right' : 'left');
    } else {
      this.onSwipe(yDiff > 0 ? 'down' : 'up');
    }
  }
}
