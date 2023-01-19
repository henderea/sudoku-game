import type { JSX } from 'solid-js';
import type { Difficulty } from 'lib/sudoku/difficulty';
import type { GetAndSet } from './utils';

import { getAndSetSignal } from './utils';
import { boards } from './game/Boards';
import { timer } from './game/TimerDisplay';

import MainMenu from './main-menu/MainMenu';
import DifficultySelect from './difficulty-select/DifficultySelect';
import Scores from './scores/Scores';
import Game from './game/Game';
import PostGame from './post-game/PostGame';

function menuItem(menu: () => JSX.Element, preserveDifficulty: boolean): { menu: () => JSX.Element, preserveDifficulty: boolean } {
  return { menu, preserveDifficulty };
}

export const menus = {
  main: menuItem(MainMenu, false),
  difficultySelect: menuItem(DifficultySelect, false),
  scores: menuItem(Scores, false),
  game: menuItem(Game, true),
  postGame: menuItem(PostGame, true)
} as const;

export type MenuType = keyof typeof menus;

export const menuType: GetAndSet<MenuType> = getAndSetSignal('main');

export const difficultyLevel: GetAndSet<Difficulty | null> = getAndSetSignal(null);

export function loadMenu(menu: MenuType) {
  if(!menus[menu].preserveDifficulty) {
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
