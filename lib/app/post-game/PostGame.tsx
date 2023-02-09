import type { JSX } from 'solid-js';

import { Show } from 'solid-js';

import { _cap } from 'lib/util/general';

import { useMenu } from '../menu-state';
import { useGrid } from '../game/grid-state';

function ScoreInfo(): JSX.Element {
  const { finalTime } = useGrid();
  const { difficultyLevel } = useMenu();
  return (
    <div class="scoreInfo">
      <div class="difficulty">{_cap(difficultyLevel() || 'unknown')}</div>
      <div class="time">{finalTime()}</div>
    </div>
  );
}

export default function PostGame(): JSX.Element {
  const { newHighScore } = useGrid();
  const { loadGame, loadMenu } = useMenu();
  const loadNewGame = () => loadGame(null);
  return (
    <div class="postGame menu">
      <Show when={newHighScore()} fallback={<div class="noNewHighScore">&nbsp;</div>}>
        <div class="newHighScore">New High Score!</div>
      </Show>
      <ScoreInfo/>
      <div class="menuSpacer"></div>
      <div class="menuButton" onClick={loadNewGame}>New Game</div>
      <div class="menuButton backButton" onClick={[loadMenu, 'main']}>Back to Main Menu</div>
    </div>
  );
}
