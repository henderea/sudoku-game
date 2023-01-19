import type { JSX } from 'solid-js';
import type { Difficulty, DifficultyMap } from 'lib/sudoku/difficulty';
import type { GetAndSet } from '../utils';

import { onMount } from 'solid-js';

import { _cap, formatTimeAsMinutesSeconds } from 'lib/util/general';
import { storage } from 'lib/util/Storage';
import { difficulties, makeDifficultyMap } from 'lib/sudoku/difficulty';

import { getAndSetSignal } from '../utils';
import { loadMenu } from '../menu-state';


export const times: DifficultyMap<GetAndSet<string | null>> = makeDifficultyMap(() => getAndSetSignal(null));
export const counts: DifficultyMap<GetAndSet<number>> = makeDifficultyMap(() => getAndSetSignal(0));

export function updateScoreInfo(d: Difficulty): void {
  const bestTime: number = storage.bestTimes[d];
  times[d].set(bestTime <= 0 ? null : formatTimeAsMinutesSeconds(bestTime));
  counts[d].set(storage.playCounts[d]);
}

export function updateScoreInfos(): void {
  difficulties.forEach(updateScoreInfo);
}

function ScoreEntry(props: { difficulty: Difficulty }): JSX.Element {
  return (
    <div class="scoreEntry" classList={{ notPlayed: times[props.difficulty]() === null }}>
      <div class="difficulty">{_cap(props.difficulty)}</div>
      <div class="bestTime">{times[props.difficulty]() || 'Not Played'}</div>
      <div class="count">{counts[props.difficulty]()}</div>
    </div>
  );
}

export default function Scores(): JSX.Element {
  onMount(() => updateScoreInfos());
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
