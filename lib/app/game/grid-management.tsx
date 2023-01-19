import type { SwipeDir } from 'lib/util/Swipe';
import type { Difficulty } from 'lib/sudoku/difficulty';
import type { Grid } from 'lib/sudoku/Grid';
import type { CellData } from './grid-state';

import { batch } from 'solid-js';

import { timeout } from 'lib/util/general';
import { storage } from 'lib/util/Storage';
import { Swipe } from 'lib/util/Swipe';

import { difficultyLevel, loadMenu } from '../menu-state';
import { completedNumbers, gameComplete, getCell, getCellRC, getCellRS, getData, selection } from './grid-state';
import { updateScoreInfo } from '../scores/Scores';
import { timer } from './TimerDisplay';

export const ERROR_TIMEOUT: number = 500;
export const DONE_TIMEOUT: number = 500;

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

function boardFilled(): boolean { return getData().every((c: CellData) => c.filled()); }

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
