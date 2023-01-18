import type { JSX } from 'solid-js';

// import { Switch, Match } from 'solid-js';

import Game from './Game';
// import { menuType } from './menu-state';

export default function App(): JSX.Element {
  return (
    <>
      {/* <Switch fallback={<MainMenu />}>
        <Match when={menuType.get() == 'difficulty-select'}><DifficultySelect/></Match>
        <Match when={menuType.get() == 'scores'}><Scores/></Match>
        <Match when={menuType.get() == 'game'}> */}<Game/>{/* </Match>
        <Match when={menuType.get() == 'post-game'}><PostGame/></Match>
      </Switch> */}
    </>
  );
}
