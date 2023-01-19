import type { KeysOfType } from 'lib/util/general';
import type { SwipeDir } from 'lib/util/Swipe';
import type { Difficulty } from 'lib/sudoku/difficulty';
import type { Grid } from 'lib/sudoku/Grid';
import type { GetAndSet, Getter } from '../utils';

import { batch } from 'solid-js';

import { _times, timeout } from 'lib/util/general';
import { storage } from 'lib/util/Storage';
import { Swipe } from 'lib/util/Swipe';
import { getAcrossFromNumber, getDownFromNumber, getRegionFromNumber, getRowColFromRegionSubIndex } from 'lib/sudoku/utils';

import { getAndSetProxy, getAndSetSignal, getter, getterProxy, memoGetter } from '../utils';
import { difficultyLevel, loadMenu } from '../menu-state';
import { updateScoreInfo } from '../scores/Scores';
import { timer } from './TimerDisplay';

export const ERROR_TIMEOUT: number = 500;
export const DONE_TIMEOUT: number = 500;

export const selection: GetAndSet<number> = getAndSetSignal(1);

export const gameComplete: GetAndSet<boolean> = getAndSetSignal(false);

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

export function resetBoard(full: Grid, grid: Grid) {
  batch(() => {
    gameComplete.set(false);
    selection.set(1);
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
  const value: number = selection();
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
  if(cell.realValue() != value) {
    return false;
  }
  cell.value.set(value);
  doAutocomplete(cell.index);
  updateSelection(true, true);
  handleGameCompletion();
  return true;
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
    cell.value.set(cell.realValue());
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

function countNumber(num: number): number {
  return data.filter((c: CellData) => c.value() == num).length;
}

function boardFilled(): boolean { return data.every((c: CellData) => c.filled()); }

function handleGameCompletion(): void {
  if(boardFilled()) {
    timer.stop();
    const difficulty: Difficulty | null = difficultyLevel();
    if(difficulty) {
      storage.incrementPlayCount(difficulty).updateBestTime(difficulty, timer.millis);
      updateScoreInfo(difficulty);
    }
    gameComplete.set(true);
    timeout(DONE_TIMEOUT).then(() => loadMenu('postGame'));
  }
}

export const completedNumbers: Getter<boolean>[] = _times(10, (i: number) => {
  if(i == 0) {
    return getter(() => false);
  }
  return memoGetter(() => countNumber(i) == 9);
});

function addToSelection(sel: number, up: boolean): number {
  sel += up ? 1 : -1;
  if(sel > 9 || sel < 1) {
    sel = up ? 1 : 9;
  }
  return sel;
}

function pickNewSelection(sel: number, up: boolean): number {
  let s: number = sel;
  for(let i = 0; i < 9; i++) {
    s = addToSelection(s, up);
    if(!completedNumbers[s]()) {
      return s;
    }
  }
  return sel;
}

function updateSelection(up: boolean, checkCompletion: boolean = false): void {
  const sel: number = selection();
  if(checkCompletion && !completedNumbers[sel]()) { return; }
  const newSel: number = pickNewSelection(sel, up);
  if(newSel != sel) {
    selection.set(newSel);
  }
}

function setSelectionHintRemoved(cell: CellData, value: boolean): void {
  const sel: number = selection();
  if(sel <= 0 || sel > 9) { return; }
  cell.removedHints[sel].set(value);
}

function handleSwipe(cell: CellData, dir: SwipeDir): void {
  if(dir == 'left') {
    updateSelection(false);
  } else if(dir == 'right') {
    updateSelection(true);
  } else if(dir == 'up') {
    setSelectionHintRemoved(cell, false);
  } else if(dir == 'down') {
    setSelectionHintRemoved(cell, true);
  }
}

export const swipe: Swipe<CellData> = new Swipe(handleSwipe);
