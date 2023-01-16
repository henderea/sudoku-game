import type { Grid } from 'lib/sudoku/Grid';

import { createSignal, createMemo, batch } from 'solid-js';
import { getAcrossFromNumber, getDownFromNumber, getRegionFromNumber, _times } from 'lib/sudoku/utils';

export interface GetAndSet<T> {
  get(): T;
  set(value: T): void;
}

export interface Getter<T> {
  get(): T;
}

interface BasicCellData {
  realValue: GetAndSet<number>;
  value: GetAndSet<number>;
}

export interface CellData extends BasicCellData {
  autoHints: Getter<boolean[]>;
  removedHints: GetAndSet<boolean>[];
  hints: Getter<boolean[]>;
}

function getAndSet<T>(initialValue: T): GetAndSet<T> {
  const [get, set] = createSignal(initialValue);
  return { get, set };
}

function memoGetter<T>(func: () => T): Getter<T> {
  const get = createMemo(func);
  return { get };
}

function basicCellData(): BasicCellData {
  const realValue = getAndSet(0);
  const value = getAndSet(0);
  return { realValue, value };
}

const basicData: BasicCellData[] = Array.from({ length: 81 }, () => basicCellData());

function computeAutoHints(n: number): boolean[] {
  const across: number = getAcrossFromNumber(n);
  const down: number = getDownFromNumber(n);
  const region: number = getRegionFromNumber(n);
  const remainingValues: boolean[] = [false, false, false, false, false, false, false, false, false, false];
  for(let i = 0; i < 81; i++) {
    if(i != n) {
      const a: number = getAcrossFromNumber(i);
      const d: number = getDownFromNumber(i);
      const r: number = getRegionFromNumber(i);
      if(a == across || d == down || r == region) {
        remainingValues[basicData[i].value.get()] = false;
      }
    }
  }
  return remainingValues;
}

function computeHints(autoHints: boolean[], removedHints: GetAndSet<boolean>[]): boolean[] {
  return _times(10, (i: number) => autoHints[i] && !removedHints[i].get());
}

function getAndSetProxy<K extends keyof BasicCellData>(i: number, key: K): GetAndSet<number> {
  const get = () => basicData[i][key].get();
  const set = (value: number) => basicData[i][key].set(value);
  return { get, set };
}

function cellData(n: number): CellData {
  const realValue = getAndSetProxy(n, 'realValue');
  const value = getAndSetProxy(n, 'value');
  const autoHints = memoGetter(() => computeAutoHints(n));
  const removedHints = _times(10, () => getAndSet(false));
  const hints = memoGetter(() => computeHints(autoHints.get(), removedHints));
  return { realValue, value, autoHints, removedHints, hints };
}

const data: CellData[] = _times(81, (i: number) => cellData(i));

export function getData(): CellData[] { return data; }
export function getCell(n: number): CellData { return data[n]; }
export function getCellRC(r: number, c: number): CellData { return getCell(r * 9 + c); }
// const rows: CellData[][] = _times(9, (i: number) => _times(9, (j: number) => getCellRC(i, j)));
// export function getRows(): CellData[][] { return rows; }

export function resetBoard(full: Grid, grid: Grid) {
  batch(() => {
    for(let i = 0; i < 81; i++) {
      const cell: CellData = getCell(i);
      cell.realValue.set(full.get(i).value);
      cell.value.set(grid.get(i).value);
      for(let j = 0; j <= 9; j++) {
        cell.removedHints[j].set(false);
      }
    }
  });
}

export function cellGetter(n: number): Getter<CellData> {
  return memoGetter(() => getCell(n));
}

export const selection = getAndSet(0);
