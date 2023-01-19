import type { JSX } from 'solid-js';
import type { Difficulty } from 'lib/sudoku/difficulty';

import { loadMenu, loadGame } from '../menu-state';
import { difficulties } from 'lib/sudoku/difficulty';
import { _cap } from 'lib/util/general';

export default function DifficultySelect(): JSX.Element {
  return (
    <div class="difficulty-select">
      {difficulties.map((d: Difficulty) => (
        <div class="menu-button" onClick={[loadGame, d]}>{_cap(d)}</div>
      ))}
      <div class="menu-spacer"></div>
      <div class="menu-button" onClick={[loadMenu, 'main']}>Back</div>
    </div>
  );
}
