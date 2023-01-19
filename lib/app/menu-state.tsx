import type { Difficulty } from 'lib/sudoku/difficulty';
import type { GetAndSet } from './utils';

import { getAndSetSignal } from './utils';
import { boards } from './game/Boards';
import { timer } from './game/TimerDisplay';

function menuMetaItem(preserveDifficulty: boolean): { preserveDifficulty: boolean } {
  return { preserveDifficulty };
}

export const menuMeta = {
  main: menuMetaItem(false),
  difficultySelect: menuMetaItem(false),
  scores: menuMetaItem(false),
  game: menuMetaItem(true),
  postGame: menuMetaItem(true)
} as const;

export type MenuType = keyof typeof menuMeta;

export type MenuMap<T> = Record<MenuType, T>;

export const menus: MenuType[] = Object.keys(menuMeta) as MenuType[];

export const menuType: GetAndSet<MenuType> = getAndSetSignal('main');

export const difficultyLevel: GetAndSet<Difficulty | null> = getAndSetSignal(null);

export function loadMenu(menu: MenuType) {
  if(!menuMeta[menu].preserveDifficulty) {
    difficultyLevel.set(null);
  }
  menuType.set(menu);
}

export function loadGame(difficulty: Difficulty | null = null): void {
  if(!difficulty) { difficulty = difficultyLevel() || 'easy'; }
  difficultyLevel.set(difficulty);
  loadMenu('game');
  boards.loadDifficulty(difficulty);
  timer.start();
}
