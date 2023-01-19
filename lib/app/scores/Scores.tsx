import type { JSX } from 'solid-js';
import type { Difficulty, DifficultyMap } from 'lib/sudoku/difficulty';
import type { GetAndSet } from 'lib/app/utils';

import { _cap } from 'lib/util/general';
import { difficulties, makeDifficultyMap } from 'lib/sudoku/difficulty';

import { getAndSetSignal } from 'lib/app/utils';
import { loadMenu } from 'lib/app/menu-state';


export const scores: DifficultyMap<GetAndSet<string | null>> = makeDifficultyMap(() => getAndSetSignal(null));

function ScoreEntry(props: { difficulty: Difficulty }): JSX.Element {
  return (
    <div class="scoreEntry" classList={{ notPlayed: scores[props.difficulty]() === null }}>
      <div class="difficulty">{_cap(props.difficulty)}</div>
      <div class="bestTime">{scores[props.difficulty]() || 'Not Played'}</div>
    </div>
  );
}

export default function Scores(): JSX.Element {
  return (
    <div class="scoresScreen">
      {difficulties.map((d: Difficulty) => (
        <ScoreEntry difficulty={d}/>
      ))}
      <div class="menuSpacer"></div>
      <div class="menuButton" onClick={[loadMenu, 'main']}>Back</div>
    </div>
  );
}
