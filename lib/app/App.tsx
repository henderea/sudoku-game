import type { JSX } from 'solid-js';
import type { MenuMap } from './menu-state';

import { Dynamic } from 'solid-js/web';

import { menuType } from './menu-state';

import MainMenu from './main-menu/MainMenu';
import DifficultySelect from './difficulty-select/DifficultySelect';
import Scores from './scores/Scores';
import Game from './game/Game';
import PostGame from './post-game/PostGame';

const menus: MenuMap<() => JSX.Element> = {
  main: MainMenu,
  difficultySelect: DifficultySelect,
  scores: Scores,
  game: Game,
  postGame: PostGame
};

export default function App(): JSX.Element {
  return (
    <>
      <Dynamic component={menus[menuType()]}/>
    </>
  );
}
