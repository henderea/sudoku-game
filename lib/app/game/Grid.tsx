import type { JSX } from 'solid-js';

import { Match, Switch } from 'solid-js';

import { _times } from 'lib/util/general';

import { useGrid } from './grid-state';
import { useTimer } from './TimerDisplay';

import Cell from './Cell';

import CheckIcon from 'resources/check.svg';
import PauseIcon from 'resources/pause.svg';

function PlayGrid(): JSX.Element {
  return (
    <table class="grid">
      {_times(9, (row: number) => (
        <tr>
          {_times(9, (column: number) => (
            <Cell index={row * 9 + column}/>
          ))}
        </tr>
      ))}
    </table>
  );
}

function PausedGrid(): JSX.Element {
  const { timer } = useTimer();
  return <div class="pausedGrid" onClick={() => timer.start()}><div class="pausedGridIcon" innerHTML={PauseIcon}></div></div>;
}

function DoneGrid(): JSX.Element {
  return <div class="doneGrid"><div class="doneGridIcon" innerHTML={CheckIcon}></div></div>;
}

export default function Grid(): JSX.Element {
  const { gameComplete } = useGrid();
  const { timer } = useTimer();
  return (
    <Switch fallback={<PausedGrid/>}>
      <Match when={gameComplete()}>
        <DoneGrid/>
      </Match>
      <Match when={timer.running()}>
        <PlayGrid/>
      </Match>
    </Switch>
  );
}
