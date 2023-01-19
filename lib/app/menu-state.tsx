import type { GetAndSet } from './utils';
import type { Difficulty } from 'lib/sudoku/difficulty';

import { getAndSet } from './utils';
import { boards } from './game/Boards';
import { timer } from './game/TimerDisplay';

export declare type MenuType = 'main' | 'difficulty-select' | 'scores' | 'game' | 'post-game';

export const menuType: GetAndSet<MenuType> = getAndSet('main');

export const difficultyLevel: GetAndSet<Difficulty | null> = getAndSet(null);

export function loadMenu(menu: MenuType) {
  if(menu != 'game' && menu != 'post-game') {
    difficultyLevel.set(null);
  }
  menuType.set(menu);
}

export function loadGame(difficulty: Difficulty | null = null): void {
  if(!difficulty) { difficulty = difficultyLevel.get() || 'easy'; }
  difficultyLevel.set(difficulty);
  loadMenu('game');
  boards.loadDifficulty(difficulty);
  timer.start();
}
