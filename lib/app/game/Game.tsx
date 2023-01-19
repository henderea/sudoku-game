import type { JSX } from 'solid-js';

import { onMount } from 'solid-js';

import { timer } from './TimerDisplay';

import Header from './Header';
import Grid from './Grid';
import NumberBar from './NumberBar';

export default function Game(): JSX.Element {
  onMount(() => {
    timer.startTimerInterval();
  });
  return (
    <>
      <Header/>
      <Grid/>
      <NumberBar/>
    </>
  );
}
