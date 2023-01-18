import type { JSX } from 'solid-js';
import type { CellData, Getter } from './grid-state';
import { Show } from 'solid-js';
import { cellGetter, selection } from './grid-state';

function HintCell(props: { cell: CellData, value: number }): JSX.Element {
  return (
    <td classList={{ active: props.cell.hints.get()[props.value] && selection.get() == props.value }}>
      {props.cell.hints.get()[props.value] ? props.value : ''}
    </td>
  );
}

export default function Cell(props: { index: number }): JSX.Element {
  const cell: Getter<CellData> = cellGetter(props.index);
  return (
    <td classList={{ filled: cell.get().filled(), matchesSelection: cell.get().matchesSelection.get() }}>
      <Show when={!cell.get().filled()} fallback={cell.get().value.get()}>
        <table class="hint-table">
          <tr>
            <HintCell cell={cell.get()} value={1}/>
            <HintCell cell={cell.get()} value={2}/>
            <HintCell cell={cell.get()} value={3}/>
          </tr>
          <tr>
            <HintCell cell={cell.get()} value={4}/>
            <HintCell cell={cell.get()} value={5}/>
            <HintCell cell={cell.get()} value={6}/>
          </tr>
          <tr>
            <HintCell cell={cell.get()} value={7}/>
            <HintCell cell={cell.get()} value={8}/>
            <HintCell cell={cell.get()} value={9}/>
          </tr>
        </table>
      </Show>
    </td>
  );
}
