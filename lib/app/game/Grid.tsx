import type { JSX } from 'solid-js';

import { Show } from 'solid-js';
import Cell from './Cell';
import { timer } from './TimerDisplay';
import { _times } from 'lib/util/general';

export default function Grid(): JSX.Element {
  return (
    <Show when={timer.running()} fallback={<div class="paused-grid"><div class="paused-grid-icon"></div></div>}>
      <table class="grid">
        {_times(9, (row: number) => (
          <tr>
            {_times(9, (column: number) => (
              <Cell index={row * 9 + column}/>
            ))}
          </tr>
        ))}
      </table>
    </Show>
  );
}
