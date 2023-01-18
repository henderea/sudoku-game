import type { Grid } from 'lib/sudoku/Grid';
import type { KeysOfType } from 'lib/util/general';
import type { SwipeDir } from 'lib/util/Swipe';

import { createSignal, createMemo, batch } from 'solid-js';
import { getAcrossFromNumber, getDownFromNumber, getRegionFromNumber, getRowColFromRegionSubIndex } from 'lib/sudoku/utils';
import { _times, timeout } from 'lib/util/general';
import { Swipe } from 'lib/util/Swipe';

export const ERROR_TIMEOUT: number = 500;

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
  error: GetAndSet<boolean>;
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
  const error = getAndSet(false);
  const filled = () => value.get() > 0;
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
        remainingValues[c.value.get()] = false;
      }
    }
  }
  return remainingValues;
}

function computeHints(autoHints: boolean[], removedHints: GetAndSet<boolean>[]): boolean[] {
  return _times(10, (i: number) => autoHints[i] && !removedHints[i].get());
}

function getAndSetProxyNumber<K extends KeysOfType<BasicCellData, GetAndSet<number>>>(i: number, key: K): GetAndSet<number> {
  const get = () => basicData[i][key].get();
  const set = (value: number) => basicData[i][key].set(value);
  return { get, set };
}

function getAndSetProxyBoolean<K extends KeysOfType<BasicCellData, GetAndSet<boolean>>>(i: number, key: K): GetAndSet<boolean> {
  const get = () => basicData[i][key].get();
  const set = (value: boolean) => basicData[i][key].set(value);
  return { get, set };
}

function matchesValue(value: number, currentValue: number, hints: boolean[]): boolean {
  return value > 0 && (value == currentValue || hints[value]);
}

function cellData(index: number): CellData {
  const realValue = getAndSetProxyNumber(index, 'realValue');
  const value = getAndSetProxyNumber(index, 'value');
  const filled = () => basicData[index].filled();
  const error = getAndSetProxyBoolean(index, 'error');
  const autoHints = memoGetter(() => computeAutoHints(index));
  const removedHints = _times(10, () => getAndSet(false));
  const hints = memoGetter(() => computeHints(autoHints.get(), removedHints));
  const matchesSelection = memoGetter(() => matchesValue(selection.get(), value.get(), hints.get()));
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

export function setCellToSelectionAndAutocomplete(cell: CellData): void {
  const value: number = selection.get();
  const accepted: boolean = setCellAndAutocomplete(cell, value);
  if(!accepted) {
    cell.error.set(true);
    timeout(ERROR_TIMEOUT).then(() => cell.error.set(false));
  }
}

function setCellAndAutocomplete(cell: CellData, value: number): boolean {
  if(value <= 0 || value > 9) { return true; }
  if(cell.filled()) {
    return true;
  }
  if(cell.realValue.get() != value) {
    return false;
  }
  return batch(() => {
    cell.value.set(value);
    doAutocomplete(cell.index);
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

function addToSelection(c: number): void {
  let sel: number = selection.get();
  sel += c;
  while(sel > 9) {
    sel -= 9;
  }
  while(sel <= 0) {
    sel += 9;
  }
  selection.set(sel);
}

function setSelectionHintRemoved(cell: CellData, value: boolean): void {
  const sel: number = selection.get();
  if(sel <= 0 || sel > 9) { return; }
  cell.removedHints[sel].set(value);
}

function handleSwipe(cell: CellData, dir: SwipeDir): void {
  if(dir == 'left') {
    addToSelection(-1);
  } else if(dir == 'right') {
    addToSelection(1);
  } else if(dir == 'up') {
    setSelectionHintRemoved(cell, false);
  } else if(dir == 'down') {
    setSelectionHintRemoved(cell, true);
  }
}

export const swipe: Swipe<CellData> = new Swipe(handleSwipe);
