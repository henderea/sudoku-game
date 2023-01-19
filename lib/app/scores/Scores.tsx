import type { JSX } from 'solid-js';
import type { GetAndSet } from '../utils';
import type { Difficulty, DifficultyMap } from 'lib/sudoku/difficulty';

import { getAndSetSignal } from '../utils';
import { loadMenu } from '../menu-state';

import { difficulties, makeDifficultyMap } from 'lib/sudoku/difficulty';
import { _cap } from 'lib/util/general';

export const scores: DifficultyMap<GetAndSet<string | null>> = makeDifficultyMap(() => getAndSetSignal(null));

function ScoreEntry(props: { difficulty: Difficulty }): JSX.Element {
  return (
    <div class="score-entry" classList={{ notPlayed: scores[props.difficulty]() === null }}>
      <div class="difficulty">{_cap(props.difficulty)}</div>
      <div class="best-time">{scores[props.difficulty]() || 'Not Played'}</div>
    </div>
  );
}

export default function Scores(): JSX.Element {
  return (
    <div class="scores-screen">
      {difficulties.map((d: Difficulty) => (
        <ScoreEntry difficulty={d}/>
      ))}
      <div class="menu-spacer"></div>
      <div class="menu-button" onClick={[loadMenu, 'main']}>Back</div>
    </div>
  );
}
