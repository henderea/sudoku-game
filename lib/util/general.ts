export type KeysOfType<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never;
}[keyof O];

interface TimesFunc {
  (count: number): number[];
  <T>(count: number, mapper: (i: number) => T): T[];
}

export const _times: TimesFunc = (length: number, mapper?: (i: number) => any) => {
  const m = mapper || ((i) => i);
  return Array.from({ length }, (v, i) => m(i));
};

export function _cap<S extends string>(str: S): Capitalize<S> {
  return `${str.substring(0, 1).toUpperCase()}${str.substring(1)}` as Capitalize<S>;
}

export function _rand(min: number, max?: number): number {
  if(!max && max !== 0) {
    max = min;
    min = 0;
  }
  return Math.floor((max - min) * Math.random()) + min;
}

export function _shuffleCopy<T>(array: T[], start = 0, end: number = array.length) {
  const copy: T[] = Array.from(array);
  end = end || copy.length;
  if(start < 0) { start = 0; }
  if(end > copy.length) { end = copy.length; }
  if(start >= end) { return copy; }
  let i: number = end;
  let r: number;
  while(i > start) {
    r = _rand(start, i);
    i--;

    [copy[i], copy[r]] = [copy[r], copy[i]];
  }
  return copy;
}

export function zeroPad(n: number, length: number): string {
  let rv = `${n}`;
  while(rv.length < length) {
    rv = `0${rv}`;
  }
  return rv;
}

export function formatTime(d: number): string {
  const h: number = Math.floor(d / (60 * 60 * 1000));
  const m: number = Math.floor((d / (60 * 1000)) % 60);
  const s: number = Math.floor((d / 1000) % 60);
  const ms: number = d % 1000;
  return `${h}:${zeroPad(m, 2)}:${zeroPad(s, 2)}.${zeroPad(ms, 3)}`;
}

export function formatTimeAsMinutesSeconds(millis: number): string {
  const m: number = Math.floor(millis / (60 * 1000));
  const s: number = Math.floor((millis / 1000) % 60);
  return `${m}:${zeroPad(s, 2)}`;
}

export function timeout(millis: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), millis));
}

export const DEPLOYMENT_ID: string = process.env.VERCEL_URL ? process.env.VERCEL_URL.replace(/^.*?-([a-zA-Z0-9]+)(-[^-]+)?\.vercel\.app.*$/, '$1') : 'N/A';

export const BUILD_DATE: Date = new Date(parseInt(process.env.BUILD_TIME));

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'US/Eastern', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', month: 'short', weekday: 'short' }).format(date);
}
