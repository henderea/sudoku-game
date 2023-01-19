import type { JSX } from 'solid-js';

import { Switch, Match } from 'solid-js';
import Cell from './Cell';
import { timer } from './TimerDisplay';
import { _times } from 'lib/util/general';
import { gameComplete } from './grid-state';

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
  return <div class="pausedGrid"><div class="pausedGridIcon"></div></div>;
}

function DoneGrid(): JSX.Element {
  return <div class="doneGrid"><div class="doneGridIcon"></div></div>;
}

export default function Grid(): JSX.Element {
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
