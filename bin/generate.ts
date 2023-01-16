import fs from 'fs';
import path from 'path';
import { formatTime } from '../lib/sudoku/utils';
import { generateGenericGrid, Difficulty, DifficultyMap } from '../lib/sudoku/generate';


function generateGenericGrids(difficulty: Difficulty, count: number, print = false): { duration: number, grids: Array<{ full: string, grid: string }> } {
  const grids: Array<{ full: string, grid: string }> = [];
  const startTime: number = Date.now();
  for(let i = 0; i < count; i++) {
    const { success, full, grid } = generateGenericGrid(difficulty);
    if(success) {
      grids.push({ full, grid });
    }
    if(print) { process.stdout.write(`\r\x1b[K${difficulty} - ${i + 1} of ${count} (${formatTime(Date.now() - startTime)})`); }
  }
  return { duration: (Date.now() - startTime), grids };
}

function generateAllGenericGrids(counts: DifficultyMap<number>, print = false): DifficultyMap<{ duration: number, grids: Array<{ full: string, grid: string }> }> {
  const easy = generateGenericGrids('easy', counts.easy, print);
  if(print) { process.stdout.write(`\r\x1b[Keasy - ${counts.easy} of ${counts.easy} (${formatTime(easy.duration)})\n`); }
  const medium = generateGenericGrids('medium', counts.medium, print);
  if(print) { process.stdout.write(`\r\x1b[Kmedium - ${counts.medium} of ${counts.medium} (${formatTime(medium.duration)})\n`); }
  const hard = generateGenericGrids('hard', counts.hard, print);
  if(print) { process.stdout.write(`\r\x1b[Khard - ${counts.hard} of ${counts.hard} (${formatTime(hard.duration)})\n`); }
  return { easy, medium, hard };
}

const dirname: string = __dirname;

const outPath: string = path.join(dirname, '../resources/boards.json');

const generatedGrids = generateAllGenericGrids({ easy: 500, medium: 500, hard: 500 }, true);

const logDifficultyStats = (difficulty: Difficulty) => {
  console.log(`${difficulty}: ${generatedGrids[difficulty].grids.length} (${formatTime(generatedGrids[difficulty].duration)})`);
};

console.log('\n');

logDifficultyStats('easy');
logDifficultyStats('medium');
logDifficultyStats('hard');

const grids = {
  easy: generatedGrids.easy.grids,
  medium: generatedGrids.medium.grids,
  hard: generatedGrids.hard.grids
};

const output = JSON.stringify(grids);

fs.writeFileSync(outPath, output);

console.log('\n');
