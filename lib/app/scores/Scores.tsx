import type { JSX } from 'solid-js';
import type { Difficulty, DifficultyMap } from 'lib/sudoku/difficulty';
import type { GetAndSet } from '../utils';

import { createContext, onMount, useContext } from 'solid-js';

import { _cap, formatTimeAsMinutesSeconds } from 'lib/util/general';
import { storage } from 'lib/util/Storage';
import { difficulties, makeDifficultyMap } from 'lib/sudoku/difficulty';

import { getAndSetSignal } from '../utils';
import { useMenu } from '../menu-state';

export interface ScoreHolder {
  get times(): DifficultyMap<GetAndSet<string | null>>;
  get counts(): DifficultyMap<GetAndSet<number>>;
  updateScoreInfo(d: Difficulty): void;
  updateScoreInfos(): void;
  resetScores(): void;
}

const ScoreContext = createContext<ScoreHolder>();

export function ScoreProvider(props: { children: any }): JSX.Element {
  const times: DifficultyMap<GetAndSet<string | null>> = makeDifficultyMap(() => getAndSetSignal(null));
  const counts: DifficultyMap<GetAndSet<number>> = makeDifficultyMap(() => getAndSetSignal(0));

  function updateScoreInfo(d: Difficulty): void {
    const bestTime: number = storage.bestTimes[d];
    times[d].set(bestTime <= 0 ? null : formatTimeAsMinutesSeconds(bestTime));
    counts[d].set(storage.playCounts[d]);
  }

  function updateScoreInfos(): void {
    difficulties.forEach(updateScoreInfo);
  }

  function resetScores(): void {
    storage.resetTimes().resetPlayCounts();
    updateScoreInfos();
  }

  const context: ScoreHolder = { times, counts, updateScoreInfo, updateScoreInfos, resetScores };

  return (
    <ScoreContext.Provider value={context}>
      {props.children}
    </ScoreContext.Provider>
  );
}

export function useScores(): ScoreHolder { return useContext(ScoreContext) as ScoreHolder; }

function ScoreEntry(props: { difficulty: Difficulty }): JSX.Element {
  const { times, counts } = useScores();
  return (
    <div class={`scoreEntry ${props.difficulty}`} classList={{ notPlayed: times[props.difficulty]() === null }}>
      <div class="difficulty">{_cap(props.difficulty)}</div>
      <div class="bestTime">{times[props.difficulty]() || 'Not Played'}</div>
      <div class="count">{counts[props.difficulty]()}</div>
    </div>
  );
}

export default function Scores(): JSX.Element {
  const { loadMenu } = useMenu();
  const { updateScoreInfos, resetScores } = useScores();
  onMount(() => updateScoreInfos());
  return (
    <div class="scoresScreen menu">
      {difficulties.map((d: Difficulty) => (
        <ScoreEntry difficulty={d}/>
      ))}
      <div class="menuButton" onClick={resetScores}>Reset</div>
      <div class="menuSpacer"></div>
      <div class="menuButton backButton" onClick={[loadMenu, 'main']}>Back</div>
    </div>
  );
}
