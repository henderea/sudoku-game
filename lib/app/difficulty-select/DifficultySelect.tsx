import type { JSX } from 'solid-js';
import type { Difficulty } from 'lib/sudoku/difficulty';

import { _cap } from 'lib/util/general';
import { difficulties } from 'lib/sudoku/difficulty';

import { loadGame, loadMenu } from '../menu-state';

export default function DifficultySelect(): JSX.Element {
  return (
    <div class="difficultySelect">
      {difficulties.map((d: Difficulty) => (
        <div class="menuButton" onClick={[loadGame, d]}>{_cap(d)}</div>
      ))}
      <div class="menuSpacer"></div>
      <div class="menuButton" onClick={[loadMenu, 'main']}>Back</div>
    </div>
  );
}
