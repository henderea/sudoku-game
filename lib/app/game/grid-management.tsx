import type { JSX } from 'solid-js';
import type { SwipeDir } from 'lib/util/Swipe';
import type { Difficulty } from 'lib/sudoku/difficulty';
import type { CellData } from './grid-state';

import { createContext, useContext } from 'solid-js';

import { formatTimeAsMinutesSeconds, timeout } from 'lib/util/general';
import { storage } from 'lib/util/Storage';
import { Swipe } from 'lib/util/Swipe';

import { useMenu } from '../menu-state';
import { useScores } from '../scores/Scores';
import { useGrid } from './grid-state';
import { useTimer } from './TimerDisplay';

export const ERROR_TIMEOUT: number = 1000;
export const DONE_TIMEOUT: number = 1000;
export const JUST_FILLED_TIMEOUT: number = 1000;

export interface GridManagement {
  get swipe(): Swipe<CellData>;
  setCellToSelectionAndAutocomplete(cell: CellData): void;
  handleKeyPress(cell: CellData, event: KeyboardEvent): void;
}

const GridManagementContext = createContext<GridManagement>();

export function GridManagementProvider(props: { children: any }): JSX.Element {
  const { completedNumbers, finalTime, gameComplete, getCell, getCellRC, getCellRS, getData, newHighScore, selection } = useGrid();
  const { timer } = useTimer();
  const { difficultyLevel, loadMenu } = useMenu();
  const { updateScoreInfo } = useScores();

  function setCellToSelectionAndAutocomplete(cell: CellData): void {
    const value: number = selection();
    const accepted: boolean = setCellAndAutocomplete(cell, value);
    if(!accepted) {
      cell.error.set(true);
      timeout(ERROR_TIMEOUT).then(() => cell.error.set(false));
    }
  }

  function setCellAnimated(cell: CellData, value: number): void {
    cell.value.set(value);
    cell.justFilled.set(true);
    timeout(JUST_FILLED_TIMEOUT).then(() => cell.justFilled.set(false));
  }

  function setCellAndAutocomplete(cell: CellData, value: number): boolean {
    if(value <= 0 || value > 9) { return true; }
    if(cell.filled()) {
      return true;
    }
    if(cell.realValue() != value) {
      return false;
    }
    setCellAnimated(cell, value);
    doAutocomplete(cell.index);
    updateSelection(true, true);
    handleGameCompletion();
    return true;
  }

  function getEmptyRow(row: number): CellData[] {
    const rv: CellData[] = [];
    console.log(row);
    for(let i = 0; i < 9; i++) {
      const cell: CellData = getCellRC(row, i);
      if(!cell.filled()) {
        rv.push(cell);
        console.log(cell.value());
      }
    }
    console.log(rv);
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
      setCellAnimated(cell, cell.realValue());
      updatedIndexes.push(cell.index);
    }
  }

  function doAutocomplete(n: number) {
    const updatedIndexes: number[] = [];
    const cell: CellData = getCell(n);
    console.log(cell);
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
        storage.incrementPlayCount(difficulty).updateBestTime(difficulty, timer.millis, newHighScore);
        updateScoreInfo(difficulty);
      }
      gameComplete.set(true);
      finalTime.set(formatTimeAsMinutesSeconds(timer.millis));
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
    console.log(sel, value);
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

  function handleKeyPress(cell: CellData, event: KeyboardEvent): void {
    event.preventDefault();
    if(event.key == ' ') {
      timer.stop();
    }
    if(/[1-9]/.test(event.key)) {
      selection.set(parseInt(event.key));
    } else if(event.key == 'ArrowLeft') {
      handleSwipe(cell, 'left');
    } else if(event.key == 'ArrowRight') {
      handleSwipe(cell, 'right');
    } else if(event.key == 'ArrowUp') {
      handleSwipe(cell, 'up');
    } else if(event.key == 'ArrowDown') {
      handleSwipe(cell, 'down');
    }
  }

  const swipe: Swipe<CellData> = new Swipe(handleSwipe);

  const context: GridManagement = { setCellToSelectionAndAutocomplete, swipe, handleKeyPress };

  return (
    <GridManagementContext.Provider value={context}>
      {props.children}
    </GridManagementContext.Provider>
  );
}

export function useGridManagement(): GridManagement { return useContext(GridManagementContext) as GridManagement; }
