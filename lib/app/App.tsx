import type { JSX } from 'solid-js';

import { Dynamic } from 'solid-js/web';
import { onMount } from 'solid-js';

import { timer } from './game/TimerDisplay';
import { menus, menuType } from './menu-state';

export default function App(): JSX.Element {
  onMount(() => {
    timer.startTimerInterval();
  });
  return (
    <>
      <Dynamic component={menus[menuType.get()].menu}/>
    </>
  );
}
