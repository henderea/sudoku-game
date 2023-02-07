import type { JSX } from 'solid-js';

import { loadMenu } from '../menu-state';

export default function MainMenu(): JSX.Element {
  return (
    <div class="mainMenu menu">
      <div class="menuButton" onClick={[loadMenu, 'difficultySelect']}>Start Game</div>
      <div class="menuButton" onClick={[loadMenu, 'scores']}>Scores</div>
    </div>
  );
}
