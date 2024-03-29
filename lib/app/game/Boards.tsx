import type { Difficulty, DifficultyMap } from 'lib/sudoku/difficulty';
import type { Grid } from 'lib/sudoku/Grid';

import { _rand } from 'lib/util/general';
import { importGenericGrid } from 'lib/sudoku/exportImport';
import { flip } from 'lib/sudoku/flip';

import boardsData from 'resources/boards.json';

export interface Boards {
  loadDifficulty(difficulty: Difficulty, resetBoard: (full: Grid, grid: Grid) => void): void;
}

class BoardsImpl implements Boards {
  private readonly _boards: DifficultyMap<Array<{ full: string, grid: string }>>;

  constructor(boards: DifficultyMap<Array<{ full: string, grid: string }>>) {
    this._boards = boards;
  }

  private get boards(): DifficultyMap<Array<{ full: string, grid: string }>> { return this._boards; }

  loadDifficulty(difficulty: Difficulty, resetBoard: (full: Grid, grid: Grid) => void): void {
    const boards: Array<{ full: string, grid: string }> = this.boards[difficulty];
    const board: { full: Grid, grid: Grid } = importGenericGrid(boards[_rand(boards.length)]);
    const { full, grid } = flip(board, 'random');
    resetBoard(full, grid);
  }
}

export const boards: Boards = new BoardsImpl(boardsData);
