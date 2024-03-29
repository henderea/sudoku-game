import type { JSX } from 'solid-js';
import type { Difficulty } from 'lib/sudoku/difficulty';
import type { Observable } from './utils';

// import { createContext, onMount, useContext } from 'solid-js';
import { createContext, useContext } from 'solid-js';

import { obs } from './utils';
import { boards } from './game/Boards';
import { useGrid } from './game/grid-state';
import { useTimer } from './game/TimerDisplay';

function menuMetaItem(preserveDifficulty: boolean): { preserveDifficulty: boolean } {
  return { preserveDifficulty };
}

export const menuMeta = {
  main: menuMetaItem(false),
  difficultySelect: menuMetaItem(false),
  scores: menuMetaItem(false),
  game: menuMetaItem(true),
  postGame: menuMetaItem(true),
  settings: menuMetaItem(false),
} as const;

export type MenuType = keyof typeof menuMeta;

export type MenuMap<T> = Record<MenuType, T>;

export const menus: MenuType[] = Object.keys(menuMeta) as MenuType[];

export interface MenuState {
  get menuType(): Observable<MenuType>;
  get difficultyLevel(): Observable<Difficulty | null>;
  loadMenu(menu: MenuType): void;
  loadGame(difficulty?: Difficulty | null): void;
}

const MenuContext = createContext<MenuState>();

export function MenuProvider(props: { children: any }): JSX.Element {
  const { timer } = useTimer();
  // const { resetBoard, finalTime, newHighScore } = useGrid();
  const { resetBoard } = useGrid();
  const menuType: Observable<MenuType> = obs('main');
  const difficultyLevel: Observable<Difficulty | null> = obs(null);
  function loadMenu(menu: MenuType): void {
    if(!menuMeta[menu].preserveDifficulty) {
      difficultyLevel.set(null);
    }
    menuType.set(menu);
  }

  function loadGame(difficulty: Difficulty | null = null): void {
    if(!difficulty) { difficulty = difficultyLevel() || 'easy'; }
    difficultyLevel.set(difficulty);
    loadMenu('game');
    boards.loadDifficulty(difficulty, resetBoard);
    timer.reset();
    timer.start();
  }
  const context: MenuState = { menuType, difficultyLevel, loadMenu, loadGame };

  // onMount(() => {
  //   // newHighScore.set(true);
  //   // difficultyLevel.set('easy');
  //   // finalTime.set('1:01');
  //   // loadMenu('postGame');
  //   // loadGame('easy');
  // });

  return (
    <MenuContext.Provider value={context}>
      {props.children}
    </MenuContext.Provider>
  );
}

export function useMenu(): MenuState { return useContext(MenuContext) as MenuState; }
