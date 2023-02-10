import type { JSX } from 'solid-js';
import type { MenuMap } from './menu-state';

import { Dynamic } from 'solid-js/web';

import { MenuProvider, useMenu } from './menu-state';

import { GridManagementProvider } from './game/grid-management';
import { GridProvider } from './game/grid-state';
import { TimerProvider } from './game/TimerDisplay';

import MainMenu from './main-menu/MainMenu';
import DifficultySelect from './difficulty-select/DifficultySelect';
import Scores, { ScoreProvider } from './scores/Scores';
import Game from './game/Game';
import PostGame from './post-game/PostGame';
import Settings from './settings/Settings';

const menus: MenuMap<() => JSX.Element> = {
  main: MainMenu,
  difficultySelect: DifficultySelect,
  scores: Scores,
  game: Game,
  postGame: PostGame,
  settings: Settings
};

function AppInner(): JSX.Element {
  const { menuType } = useMenu();
  return (
    <ScoreProvider>
      <GridManagementProvider>
        <Dynamic component={menus[menuType()]}/>
      </GridManagementProvider>
    </ScoreProvider>
  );
}

export default function App(): JSX.Element {
  return (
    <>
      <GridProvider>
        <TimerProvider>
          <MenuProvider>
            <AppInner/>
          </MenuProvider>
        </TimerProvider>
      </GridProvider>
    </>
  );
}
