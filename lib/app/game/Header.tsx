import type { JSX } from 'solid-js';

import TimerDisplay, { timer } from './TimerDisplay';

function PlayPauseButton(): JSX.Element {
  return <div class={timer.running() ? 'pauseButton' : 'playButton'} onClick={timer.toggle}></div>;
}

export default function Header(): JSX.Element {
  return (
    <div class="header">
      <div class="timerContainer"><TimerDisplay/></div>
      <div class="playPauseContainer"><PlayPauseButton/></div>
    </div>
  );
}
