import { _times } from 'lib/util/general';
import type { JSX } from 'solid-js';

import { selection } from './grid-state';

function NumberCell(props: { value: number }): JSX.Element {
  return <td class={(props.value % 2 == 0) ? 'even' : 'odd'} classList={{ selected: props.value == selection.get() }} onClick={[selection.set, props.value]}>{props.value}</td>;
}

export default function NumberBar(): JSX.Element {
  return (
    <table class="number-bar">
      <tr>
        {_times(9, (i: number) => (
          <NumberCell value={i + 1}/>
        ))}
      </tr>
    </table>
  );
}
