import type { JSX } from 'solid-js';

import { _times } from 'lib/util/general';

import { completedNumbers, selection } from './grid-state';

function setSelection(value: number): void {
  if(value < 1 || value > 9 || completedNumbers[value]()) { return; }
  selection.set(value);
}

function NumberCell(props: { value: number }): JSX.Element {
  return <td class={(props.value % 2 == 0) ? 'even' : 'odd'} classList={{ selected: props.value == selection(), completed: completedNumbers[props.value]() }} onClick={[setSelection, props.value]}>{props.value}</td>;
}

export default function NumberBar(): JSX.Element {
  return (
    <table class="numberBar">
      <tr>
        {_times(9, (i: number) => (
          <NumberCell value={i + 1}/>
        ))}
      </tr>
    </table>
  );
}
