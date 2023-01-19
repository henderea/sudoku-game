import type { JSX } from 'solid-js';
import type { Difficulty } from 'lib/sudoku/difficulty';
import type { GetAndSet } from 'lib/app/utils';

import { getAndSetSignal } from 'lib/app/utils';
import { boards } from 'lib/app/game/Boards';
import { timer } from 'lib/app/game/TimerDisplay';

import MainMenu from 'lib/app/main-menu/MainMenu';
import DifficultySelect from 'lib/app/difficulty-select/DifficultySelect';
import Scores from 'lib/app/scores/Scores';
import Game from 'lib/app/game/Game';
import PostGame from 'lib/app/post-game/PostGame';

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
