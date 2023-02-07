import type { JSX } from 'solid-js';

import TimerDisplay, { useTimer } from './TimerDisplay';

import PauseIcon from 'resources/pause.svg';
import PlayIcon from 'resources/play.svg';

function PlayPauseButton(): JSX.Element {
  const { timer } = useTimer();
  return <div class={timer.running() ? 'pauseButton' : 'playButton'} onClick={() => timer.toggle()} innerHTML={timer.running() ? PauseIcon : PlayIcon}></div>;
}

export default function Header(): JSX.Element {
  return (
    <div class="header">
      <div class="timerContainer"><TimerDisplay/></div>
      <div class="playPauseContainer"><PlayPauseButton/></div>
    </div>
  );
}
