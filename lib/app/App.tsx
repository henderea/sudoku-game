import type { JSX } from 'solid-js';

import { Dynamic } from 'solid-js/web';

import { menus, menuType } from './menu-state';

export default function App(): JSX.Element {
  return (
    <>
      <Dynamic component={menus[menuType.get()].menu}/>
    </>
  );
}
