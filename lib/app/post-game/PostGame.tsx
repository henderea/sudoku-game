import type { JSX } from 'solid-js';

import { Show } from 'solid-js';

import { _cap } from 'lib/util/general';

import { difficultyLevel, loadGame, loadMenu } from '../menu-state';
import { finalTime, newHighScore } from '../game/grid-state';

const loadNewGame = () => loadGame(null);

function ScoreInfo(): JSX.Element {
  return (
    <div class="scoreInfo">
      <div class="difficulty">{_cap(difficultyLevel() || 'unknown')}</div>
      <div class="time">{finalTime()}</div>
    </div>
  );
}

export default function PostGame(): JSX.Element {
  return (
    <div class="postGame">
      <Show when={newHighScore()}>
        <div class="newHighScore">New High Score!</div>
      </Show>
      <ScoreInfo/>
      <div class="menuSpacer"></div>
      <div class="menuButton" onClick={loadNewGame}>New Game</div>
      <div class="menuButton" onClick={[loadMenu, 'main']}>Back to Main Menu</div>
    </div>
  );
}
