import type { JSX } from 'solid-js';

import { onMount } from 'solid-js';

import { timer } from 'lib/app/game/TimerDisplay';

import Header from 'lib/app/game/Header';
import Grid from 'lib/app/game/Grid';
import NumberBar from 'lib/app/game/NumberBar';

export default function Game(): JSX.Element {
  onMount(() => {
    timer.startTimerInterval();
  });
  return (
    <div class="gameScreen">
      <Header/>
      <Grid/>
      <NumberBar/>
    </div>
  );
}
