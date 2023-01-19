import type { Square } from 'lib/sudoku/Square';

import { _shuffleCopy } from 'lib/util/general';

import { Grid } from 'lib/sudoku/Grid';
import { square } from 'lib/sudoku/Square';

const numberToGeneric: string[] = ['-','a','b','c','d','e','f','g','h','i'];

export function toGenericGrid(grid: Grid): string {
  return grid.values.map((v: number) => numberToGeneric[v]).join('');
}

export function exportGenericGrid(full: Grid, grid: Grid): { full: string, grid: string } {
  return {
    full: toGenericGrid(full),
    grid: toGenericGrid(grid)
  };
}

export function fromGenericGrid(grid: string, mappings: string[]) {
  const values: Square[] = Array.from(grid).map((c: string, i: number) => square(i, mappings.indexOf(c)));
  return new Grid(values, false);
}

export function importGenericGrid(grids: { full: string, grid: string }): { full: Grid, grid: Grid } {
  const mappings: string[] = _shuffleCopy(numberToGeneric, 1);
  return {
    full: fromGenericGrid(grids.full, mappings),
    grid: fromGenericGrid(grids.grid, mappings)
  };
}
