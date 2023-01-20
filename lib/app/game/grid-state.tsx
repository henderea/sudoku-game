import type { KeysOfType } from 'lib/util/general';
import type { Grid } from 'lib/sudoku/Grid';
import type { GetAndSet, Getter } from '../utils';

import { batch } from 'solid-js';

import { _times } from 'lib/util/general';
import { getAcrossFromNumber, getDownFromNumber, getRegionFromNumber, getRowColFromRegionSubIndex } from 'lib/sudoku/utils';

import { getAndSetProxy, getAndSetSignal, getter, getterProxy, memoGetter } from '../utils';

export const selection: GetAndSet<number> = getAndSetSignal(1);

export const gameComplete: GetAndSet<boolean> = getAndSetSignal(false);

export const newHighScore: GetAndSet<boolean> = getAndSetSignal(false);

export const finalTime: GetAndSet<string> = getAndSetSignal('0:00');

interface BasicCellData {
  realValue: GetAndSet<number>;
  value: GetAndSet<number>;
  error: GetAndSet<boolean>;
  filled: Getter<boolean>;
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

function basicCellData(index: number): BasicCellData {
  const realValue = getAndSetSignal(0);
  const value = getAndSetSignal(0);
  const error = getAndSetSignal(false);
  const filled = memoGetter(() => value() > 0);
  const across: number = getAcrossFromNumber(index);
  const down: number = getDownFromNumber(index);
  const region: number = getRegionFromNumber(index);
  const row: number = down == 9 ? 0 : down;
  const column: number = across == 9 ? 0 : across;
  return { realValue, value, filled, error, index, across, down, region, row, column };
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
        remainingValues[c.value()] = false;
      }
    }
  }
  return remainingValues;
}

function computeHints(autoHints: boolean[], removedHints: GetAndSet<boolean>[]): boolean[] {
  return _times(10, (i: number) => autoHints[i] && !removedHints[i]());
}

function getAndSetProxyNumber<K extends KeysOfType<BasicCellData, GetAndSet<number>>>(i: number, key: K): GetAndSet<number> {
  return getAndSetProxy(() => basicData[i][key]);
}

function getAndSetProxyBoolean<K extends KeysOfType<BasicCellData, GetAndSet<boolean>>>(i: number, key: K): GetAndSet<boolean> {
  return getAndSetProxy(() => basicData[i][key]);
}

function getterProxyBoolean<K extends KeysOfType<BasicCellData, Getter<boolean>>>(i: number, key: K): Getter<boolean> {
  return getterProxy(() => basicData[i][key]);
}

function matchesValue(value: number, currentValue: number, hints: boolean[]): boolean {
  return value > 0 && (value == currentValue || hints[value]);
}

function cellData(index: number): CellData {
  const realValue = getAndSetProxyNumber(index, 'realValue');
  const value = getAndSetProxyNumber(index, 'value');
  const filled = getterProxyBoolean(index, 'filled');
  const error = getAndSetProxyBoolean(index, 'error');
  const autoHints = memoGetter(() => computeAutoHints(index));
  const removedHints = _times(10, () => getAndSetSignal(false));
  const hints = memoGetter(() => computeHints(autoHints(), removedHints));
  const matchesSelection = memoGetter(() => matchesValue(selection(), value(), hints()));
  const { across, down, region, row, column } = basicData[index];
  return { realValue, value, filled, error, autoHints, removedHints, hints, matchesSelection, index, across, down, region, row, column };
}

const data: CellData[] = _times(81, (i: number) => cellData(i));

export function getData(): CellData[] { return data; }
export function getCell(n: number): CellData { return data[n]; }
export function getCellRC(r: number, c: number): CellData { return getCell(r * 9 + c); }
export function getCellRS(r: number, s: number): CellData {
  const [row, col] = getRowColFromRegionSubIndex(r, s);
  return getCellRC(row, col);
}

export function cellGetter(n: number): Getter<CellData> {
  return memoGetter(() => getCell(n));
}

function countNumber(num: number): number {
  return getData().filter((c: CellData) => c.value() == num).length;
}

export const completedNumbers: Getter<boolean>[] = _times(10, (i: number) => {
  if(i == 0) {
    return getter(() => false);
  }
  return memoGetter(() => countNumber(i) == 9);
});

export function resetBoard(full: Grid, grid: Grid) {
  batch(() => {
    gameComplete.set(false);
    selection.set(1);
    newHighScore.set(false);
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
