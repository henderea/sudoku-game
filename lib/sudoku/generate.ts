import { _rand, _times } from '../util/general';
import { toGenericGrid } from './exportImport';

import { Square, square } from './Square';
import { Grid } from './Grid';
import { difficultySpaces, Difficulty } from './difficulty';

function getRandomSpacesForDifficulty(difficulty: Difficulty): number {
  const spaceRange: [number, number] = difficultySpaces[difficulty];
  return _rand(spaceRange[0], spaceRange[1]);
}

export type GenerateResult = {
    tries: number,
    success: boolean,
    duration: number,
    full: Grid,
    grid: Grid
};

export function generateDifficulty(difficulty: Difficulty): GenerateResult {
  return generate(getRandomSpacesForDifficulty(difficulty));
}

export function generate(cells = 81, maxTries = 10000): GenerateResult {
  const full: Grid = generateGrid();
  const grid: Grid = full.copy();
  const triedInds: number[] = [];
  let tries = 0;
  const startTime: number = Date.now();
  while(tries < maxTries) {
    tries++;
    while(grid.spotCount > cells && triedInds.length < 81) {
      let i: number = _rand(81);
      while(triedInds.includes(i) || grid.get(i).value == 0) {
        i = _rand(81);
      }
      triedInds.push(i);
      const cell: Square = grid.get(i);
      const oldValue: number = cell.value;
      cell.value = 0;
      if(grid.uniqueness != 'unique') {
        cell.value = oldValue;
      }
    }
    if(grid.spotCount == cells) {
      return { tries, success: true, duration: (Date.now() - startTime), full, grid };
    }
  }
  return { tries, success: false, duration: (Date.now() - startTime), full, grid: full.copy() };
}

export function generateGrid(): Grid {
  const squares: Square[] = _times(81, (i: number) => square(i, 0));
  const makeAvailable: () => number[] = () => [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const available: number[][] = _times(81, makeAvailable);
  let c = 0;
  while(c < 81) {
    if(available[c].length > 0) {
      const i: number = _rand(available[c].length);
      const z: number = available[c][i];
      const test: Square = square(c, z);
      if(hasConflict(squares, test)) {
        available[c].splice(i, 1);
      } else {
        squares[c].value = z;
        available[c].splice(i, 1);
        c++;
      }
    } else {
      available[c] = makeAvailable();
      squares[c - 1].value = 0;
      c--;
    }
  }
  return new Grid(squares, false);
}

function hasConflict(squares: Square[], test: Square): boolean {
  for(const square of squares) {
    if(test.aligns(square) && square.value == test.value) {
      return true;
    }
  }
  return false;
}

export function generateGenericGrid(difficulty: Difficulty, maxTries = 10): { tries: number, success: boolean, full: string, grid: string } {
  let s = false;
  let f = '';
  let g = '';
  let tries = 0;
  while(!s && tries < maxTries) {
    tries++;
    const { success, full, grid } = generateDifficulty(difficulty);
    s = success;
    if(s) {
      f = toGenericGrid(full);
      g = toGenericGrid(grid);
    } else {
      f = '';
      g = '';
    }
  }
  return {
    tries,
    success: s,
    full: f,
    grid: g
  };
}
