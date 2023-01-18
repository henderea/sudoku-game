import type { Grid } from 'lib/sudoku/Grid';
import type { KeysOfType } from 'lib/util/general';

import { createSignal, createMemo, batch } from 'solid-js';
import { getAcrossFromNumber, getDownFromNumber, getRegionFromNumber, getRowColFromRegionSubIndex } from 'lib/sudoku/utils';
import { _times } from 'lib/util/general';

export interface GetAndSet<T> {
  get(): T;
  set(value: T): void;
}

export interface Getter<T> {
  get(): T;
}

export const selection = getAndSet(0);

interface BasicCellData {
  realValue: GetAndSet<number>;
  value: GetAndSet<number>;
  filled: () => boolean;
  index: number;
  across: number;
  down: number;
  region: number;
  row: number;
  column: number;
}

export interface CellData extends BasicCellData {
  autoHints: Getter<boolean[]>;
  removedHints: GetAndSet<boolean>[];
  hints: Getter<boolean[]>;
  matchesSelection: Getter<boolean>;
}

function getAndSet<T>(initialValue: T): GetAndSet<T> {
  const [get, set] = createSignal(initialValue);
  return { get, set };
}

function memoGetter<T>(func: () => T): Getter<T> {
  const get = createMemo(func);
  return { get };
}

function basicCellData(index: number): BasicCellData {
  const realValue = getAndSet(0);
  const value = getAndSet(0);
  const filled = () => value.get() > 0;
  const across: number = getAcrossFromNumber(index);
  const down: number = getDownFromNumber(index);
  const region: number = getRegionFromNumber(index);
  const row: number = down == 9 ? 0 : down;
  const column: number = across == 9 ? 0 : across;
  return { realValue, value, filled, index, across, down, region, row, column };
}

const basicData: BasicCellData[] = Array.from({ length: 81 }, (i: number) => basicCellData(i));

function computeAutoHints(n: number): boolean[] {
  const cell: BasicCellData = basicData[n];
  const { across, down, region } = cell;
  const remainingValues: boolean[] = [false, false, false, false, false, false, false, false, false, false];
  for(let i = 0; i < 81; i++) {
    if(i != n) {
      const c: BasicCellData = basicData[i];
      if(c.across == across || c.down == down || c.region == region) {
        remainingValues[c.value.get()] = false;
      }
    }
  }
  return remainingValues;
}

function computeHints(autoHints: boolean[], removedHints: GetAndSet<boolean>[]): boolean[] {
  return _times(10, (i: number) => autoHints[i] && !removedHints[i].get());
}

function getAndSetProxy<K extends KeysOfType<BasicCellData, GetAndSet<number>>>(i: number, key: K): GetAndSet<number> {
  const get = () => basicData[i][key].get();
  const set = (value: number) => basicData[i][key].set(value);
  return { get, set };
}

function matchesValue(value: number, currentValue: number, hints: boolean[]): boolean {
  return value > 0 && (value == currentValue || hints[value]);
}

function cellData(index: number): CellData {
  const realValue = getAndSetProxy(index, 'realValue');
  const value = getAndSetProxy(index, 'value');
  const filled = () => basicData[index].filled();
  const autoHints = memoGetter(() => computeAutoHints(index));
  const removedHints = _times(10, () => getAndSet(false));
  const hints = memoGetter(() => computeHints(autoHints.get(), removedHints));
  const matchesSelection = memoGetter(() => matchesValue(selection.get(), value.get(), hints.get()));
  const { across, down, region, row, column } = basicData[index];
  return { realValue, value, filled, autoHints, removedHints, hints, matchesSelection, index, across, down, region, row, column };
}

const data: CellData[] = _times(81, (i: number) => cellData(i));

export function getData(): CellData[] { return data; }
export function getCell(n: number): CellData { return data[n]; }
export function getCellRC(r: number, c: number): CellData { return getCell(r * 9 + c); }
export function getCellRS(r: number, s: number): CellData {
  const [row, col] = getRowColFromRegionSubIndex(r, s);
  return getCellRC(row, col);
}
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

export function setCellAndAutocomplete(n: number, value: number): boolean {
  if(value <= 0 || value > 9) { return true; }
  return batch(() => {
    const cell: CellData = getCell(n);
    if(cell.filled()) {
      return true;
    }
    if(cell.realValue.get() != value) {
      return false;
    }
    cell.value.set(value);
    doAutocomplete(n);
    return true;
  });
}

function getEmptyRow(row: number): CellData[] {
  const rv: CellData[] = [];
  for(let i = 0; i < 9; i++) {
    const cell: CellData = getCellRC(row, i);
    if(!cell.filled()) {
      rv.push(cell);
    }
  }
  return rv;
}

function getEmptyCol(col: number): CellData[] {
  const rv: CellData[] = [];
  for(let i = 0; i < 9; i++) {
    const cell: CellData = getCellRC(i, col);
    if(!cell.filled()) {
      rv.push(cell);
    }
  }
  return rv;
}

function getEmptyRegion(region: number): CellData[] {
  const rv: CellData[] = [];
  for(let i = 1; i <= 9; i++) {
    const cell: CellData = getCellRS(region, i);
    if(!cell.filled()) {
      rv.push(cell);
    }
  }
  return rv;
}

function fillSingleRemaining(emptyCells: CellData[], updatedIndexes: number[]): void {
  if(emptyCells.length == 1) {
    const cell: CellData = emptyCells[0];
    cell.value.set(cell.realValue.get());
    updatedIndexes.push(cell.index);
  }
}

function doAutocomplete(n: number) {
  const updatedIndexes: number[] = [];
  const cell: CellData = getCell(n);
  fillSingleRemaining(getEmptyRow(cell.row), updatedIndexes);
  fillSingleRemaining(getEmptyCol(cell.column), updatedIndexes);
  fillSingleRemaining(getEmptyRegion(cell.region), updatedIndexes);
  if(updatedIndexes.length > 0) {
    for(const updatedIndex of updatedIndexes) {
      doAutocomplete(updatedIndex);
    }
  }
}

export function cellGetter(n: number): Getter<CellData> {
  return memoGetter(() => getCell(n));
}
