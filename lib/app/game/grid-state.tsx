import type { JSX } from 'solid-js';
import type { KeysOfType } from 'lib/util/general';
import type { Grid } from 'lib/sudoku/Grid';
import type { Observable, Computed } from '../utils';

import { batch, createContext, useContext } from 'solid-js';

import { _times } from 'lib/util/general';
import { getAcrossFromNumber, getDownFromNumber, getRegionFromNumber, getRowColFromRegionSubIndex } from 'lib/sudoku/utils';

import { obs, comp } from '../utils';

interface BasicCellData {
  realValue: Observable<number>;
  value: Observable<number>;
  error: Observable<boolean>;
  filled: Computed<boolean>;
  justFilled: Observable<boolean>;
  index: number;
  across: number;
  down: number;
  region: number;
  row: number;
  column: number;
}

export interface CellData extends BasicCellData {
  autoHints: Computed<boolean[]>;
  removedHints: Observable<boolean>[];
  hints: Computed<boolean[]>;
  hintCount: Computed<number>;
  matchesSelection: Computed<boolean>;
}

export interface GridState {
  get selection(): Observable<number>;
  get gameComplete(): Observable<boolean>
  get newHighScore(): Observable<boolean>;
  get finalTime(): Observable<string>;
  get completedNumbers(): Computed<boolean>[];
  getData(): CellData[];
  getCell(n: number): CellData;
  getCellRC(r: number, c: number): CellData;
  getCellRS(r: number, s: number): CellData;
  cellGetter(n: number): Computed<CellData>;
  resetBoard(full: Grid, grid: Grid): void;
}

const GridContext = createContext<GridState>();

export function GridProvider(props: { children: any }): JSX.Element {
  function basicCellData(index: number): BasicCellData {
    const realValue: Observable<number> = obs(0);
    const value: Observable<number> = obs(0);
    const error: Observable<boolean> = obs(false);
    const filled: Computed<boolean> = comp(() => value() > 0);
    const justFilled: Observable<boolean> = obs(false);
    const across: number = getAcrossFromNumber(index + 1);
    const down: number = getDownFromNumber(index + 1);
    const region: number = getRegionFromNumber(index + 1);
    const row: number = down - 1;
    const column: number = across - 1;
    return { realValue, value, filled, justFilled, error, index, across, down, region, row, column };
  }
  const selection: Observable<number> = obs(1);
  const gameComplete: Observable<boolean> = obs(false);
  const newHighScore: Observable<boolean> = obs(false);
  const finalTime: Observable<string> = obs('0:00');
  const basicData: BasicCellData[] = _times(81, (i: number) => basicCellData(i));
  function computeAutoHints(n: number): boolean[] {
    const cell: BasicCellData = basicData[n];
    const { across, down, region } = cell;
    const remainingValues: boolean[] = [false, true, true, true, true, true, true, true, true, true];
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

  function computeHints(filled: boolean, autoHints: boolean[], removedHints: Observable<boolean>[]): boolean[] {
    return _times(10, (i: number) => i > 0 && !filled && autoHints[i] && !removedHints[i]());
  }

  function obsProxyNumber<K extends KeysOfType<BasicCellData, Observable<number>>>(i: number, key: K): Observable<number> {
    return obs.proxy(() => basicData[i][key]);
  }

  function obsProxyBoolean<K extends KeysOfType<BasicCellData, Observable<boolean>>>(i: number, key: K): Observable<boolean> {
    return obs.proxy(() => basicData[i][key]);
  }

  function compProxyBoolean<K extends KeysOfType<BasicCellData, Computed<boolean>>>(i: number, key: K): Computed<boolean> {
    return comp.proxy(() => basicData[i][key]);
  }

  function matchesValue(value: number, currentValue: number, hints: boolean[]): boolean {
    return value > 0 && (value == currentValue || hints[value]);
  }

  function cellData(index: number): CellData {
    const realValue: Observable<number> = obsProxyNumber(index, 'realValue');
    const value: Observable<number> = obsProxyNumber(index, 'value');
    const filled: Computed<boolean> = compProxyBoolean(index, 'filled');
    const justFilled: Observable<boolean> = obsProxyBoolean(index, 'justFilled');
    const error: Observable<boolean> = obsProxyBoolean(index, 'error');
    const autoHints: Computed<boolean[]> = comp(() => computeAutoHints(index));
    const removedHints: Observable<boolean>[] = _times(10, () => obs(false));
    const hints: Computed<boolean[]> = comp(() => computeHints(filled(), autoHints(), removedHints));
    const hintCount: Computed<number> = comp(() => hints().filter((h) => h).length);
    const matchesSelection: Computed<boolean> = comp(() => matchesValue(selection(), value(), hints()));
    const { across, down, region, row, column } = basicData[index];
    return { realValue, value, filled, justFilled, error, autoHints, removedHints, hints, hintCount, matchesSelection, index, across, down, region, row, column };
  }

  const data: CellData[] = _times(81, (i: number) => cellData(i));

  function getData(): CellData[] { return data; }
  function getCell(n: number): CellData { return data[n]; }
  function getCellRC(r: number, c: number): CellData { return getCell(r * 9 + c); }
  function getCellRS(r: number, s: number): CellData {
    const [row, col] = getRowColFromRegionSubIndex(r, s);
    return getCellRC(row - 1, col - 1);
  }

  function cellGetter(n: number): Computed<CellData> {
    return comp(() => getCell(n));
  }

  function countNumber(num: number): number {
    return getData().filter((c: CellData) => c.value() == num).length;
  }

  const completedNumbers: Computed<boolean>[] = _times(10, (i: number) => {
    if(i == 0) {
      return () => false;
    }
    return comp(() => countNumber(i) == 9);
  });

  function resetBoard(full: Grid, grid: Grid) {
    batch(() => {
      gameComplete.set(false);
      selection.set(1);
      newHighScore.set(false);
      finalTime.set('0:00');
      for(let i = 0; i < 81; i++) {
        const cell: CellData = getCell(i);
        cell.realValue.set(full.get(i).value);
        cell.value.set(grid.get(i).value);
        cell.error.set(false);
        cell.justFilled.set(false);
        for(let j = 0; j <= 9; j++) {
          cell.removedHints[j].set(false);
        }
      }
    });
  }

  const context: GridState = { selection, gameComplete, newHighScore, finalTime, getData, getCell, getCellRC, getCellRS, cellGetter, completedNumbers, resetBoard };

  return (
    <GridContext.Provider value={context}>
      {props.children}
    </GridContext.Provider>
  );
}

export function useGrid(): GridState { return useContext(GridContext) as GridState; }
