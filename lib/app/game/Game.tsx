import type { JSX } from 'solid-js';

import { onMount } from 'solid-js';

import { useTimer } from './TimerDisplay';

import Header from './Header';
import Grid from './Grid';
import NumberBar from './NumberBar';

export default function Game(): JSX.Element {
  const { timer } = useTimer();
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
