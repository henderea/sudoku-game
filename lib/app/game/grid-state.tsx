import type { JSX } from 'solid-js';
import type { KeysOfType } from 'lib/util/general';
import type { Grid } from 'lib/sudoku/Grid';
import type { GetAndSet, Getter } from '../utils';

import { batch, createContext, useContext } from 'solid-js';

import { _times } from 'lib/util/general';
import { getAcrossFromNumber, getDownFromNumber, getRegionFromNumber, getRowColFromRegionSubIndex } from 'lib/sudoku/utils';

import { getAndSetProxy, getAndSetSignal, getter, getterProxy, memoGetter } from '../utils';

interface BasicCellData {
  realValue: GetAndSet<number>;
  value: GetAndSet<number>;
  error: GetAndSet<boolean>;
  filled: Getter<boolean>;
  justFilled: GetAndSet<boolean>;
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
  hintCount: Getter<number>;
  matchesSelection: Getter<boolean>;
}

export interface GridState {
  get selection(): GetAndSet<number>;
  get gameComplete(): GetAndSet<boolean>
  get newHighScore(): GetAndSet<boolean>;
  get finalTime(): GetAndSet<string>;
  get completedNumbers(): Getter<boolean>[];
  getData(): CellData[];
  getCell(n: number): CellData;
  getCellRC(r: number, c: number): CellData;
  getCellRS(r: number, s: number): CellData;
  cellGetter(n: number): Getter<CellData>;
  resetBoard(full: Grid, grid: Grid): void;
}

const GridContext = createContext<GridState>();

export function GridProvider(props: { children: any }): JSX.Element {
  function basicCellData(index: number): BasicCellData {
    const realValue = getAndSetSignal(0);
    const value = getAndSetSignal(0);
    const error = getAndSetSignal(false);
    const filled = memoGetter(() => value() > 0);
    const justFilled = getAndSetSignal(false);
    const across: number = getAcrossFromNumber(index + 1);
    const down: number = getDownFromNumber(index + 1);
    const region: number = getRegionFromNumber(index + 1);
    const row: number = down - 1;
    const column: number = across - 1;
    return { realValue, value, filled, justFilled, error, index, across, down, region, row, column };
  }
  const selection: GetAndSet<number> = getAndSetSignal(1);
  const gameComplete: GetAndSet<boolean> = getAndSetSignal(false);
  const newHighScore: GetAndSet<boolean> = getAndSetSignal(false);
  const finalTime: GetAndSet<string> = getAndSetSignal('0:00');
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

  function computeHints(filled: boolean, autoHints: boolean[], removedHints: GetAndSet<boolean>[]): boolean[] {
    return _times(10, (i: number) => i > 0 && !filled && autoHints[i] && !removedHints[i]());
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
    const justFilled = getAndSetProxyBoolean(index, 'justFilled');
    const error = getAndSetProxyBoolean(index, 'error');
    const autoHints = memoGetter(() => computeAutoHints(index));
    const removedHints = _times(10, () => getAndSetSignal(false));
    const hints = memoGetter(() => computeHints(filled(), autoHints(), removedHints));
    const hintCount = memoGetter(() => hints().filter((h) => h).length);
    const matchesSelection = memoGetter(() => matchesValue(selection(), value(), hints()));
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

  function cellGetter(n: number): Getter<CellData> {
    return memoGetter(() => getCell(n));
  }

  function countNumber(num: number): number {
    return getData().filter((c: CellData) => c.value() == num).length;
  }

  const completedNumbers: Getter<boolean>[] = _times(10, (i: number) => {
    if(i == 0) {
      return getter(() => false);
    }
    return memoGetter(() => countNumber(i) == 9);
  });

  function resetBoard(full: Grid, grid: Grid) {
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

  const context: GridState = { selection, gameComplete, newHighScore, finalTime, getData, getCell, getCellRC, getCellRS, cellGetter, completedNumbers, resetBoard };

  return (
    <GridContext.Provider value={context}>
      {props.children}
    </GridContext.Provider>
  );
}

export function useGrid(): GridState { return useContext(GridContext) as GridState; }
