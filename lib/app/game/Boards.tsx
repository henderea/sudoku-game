import type { Difficulty, DifficultyMap } from 'lib/sudoku/difficulty';
import type { Grid } from 'lib/sudoku/Grid';

import { flip } from 'lib/sudoku/flip';
import { importGenericGrid } from 'lib/sudoku/exportImport';
import { _rand } from 'lib/util/general';
import { resetBoard } from './grid-state';
import boardsData from 'resources/boards.json';

export interface Boards {
  loadDifficulty(difficulty: Difficulty): void;
}

class BoardsImpl implements Boards {
  private readonly _boards: DifficultyMap<Array<{ full: string, grid: string }>>;

  constructor(boards: DifficultyMap<Array<{ full: string, grid: string }>>) {
    this._boards = boards;
  }

  private get boards(): DifficultyMap<Array<{ full: string, grid: string }>> { return this._boards; }

  loadDifficulty(difficulty: Difficulty): void {
    const boards: Array<{ full: string, grid: string }> = this.boards[difficulty];
    const board: { full: Grid, grid: Grid } = importGenericGrid(boards[_rand(boards.length)]);
    const { full, grid } = flip(board, 'random');
    resetBoard(full, grid);
  }
}

export const boards: Boards = new BoardsImpl(boardsData);
