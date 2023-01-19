import type { JSX } from 'solid-js';

import { loadMenu } from '../menu-state';

export default function MainMenu(): JSX.Element {
  return (
    <div class="main-menu">
      <div class="menu-button" onClick={[loadMenu, 'difficultySelect']}>Start Game</div>
      <div class="menu-button" onClick={[loadMenu, 'scores']}>Scores</div>
    </div>
  );
}
