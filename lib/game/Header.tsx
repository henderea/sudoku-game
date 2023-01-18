import type { JSX } from 'solid-js';

import TimerDisplay, { timer } from './TimerDisplay';

function PlayPauseButton(): JSX.Element {
  return <div class={timer.running() ? 'pause-button' : 'play-button'} onClick={timer.toggle}></div>;
}

export default function Header(): JSX.Element {
  return (
    <div class="header">
      <div class="timer-container"><TimerDisplay/></div>
      <div class="play-pause-container"><PlayPauseButton/></div>
    </div>
  );
}
