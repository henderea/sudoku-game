import type { JSX } from 'solid-js';

import { useMenu } from '../menu-state';

export default function MainMenu(): JSX.Element {
  const { loadMenu } = useMenu();
  return (
    <div class="mainMenu menu">
      <div class="menuButton" onClick={[loadMenu, 'difficultySelect']}>Start Game</div>
      <div class="menuButton" onClick={[loadMenu, 'scores']}>Scores</div>
      <div class="menuButton" onClick={[loadMenu, 'settings']}>Settings</div>
    </div>
  );
}
