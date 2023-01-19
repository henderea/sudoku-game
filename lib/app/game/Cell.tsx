import type { JSX } from 'solid-js';
import type { CellData } from 'lib/app/game/grid-state';
import type { Getter } from 'lib/app/utils';

import { Show } from 'solid-js';

import { cellGetter, selection, setCellToSelectionAndAutocomplete, swipe } from 'lib/app/game/grid-state';

function HintCell(props: { cell: CellData, value: number }): JSX.Element {
  return (
    <td classList={{ active: props.cell.hints()[props.value] && selection() == props.value }}>
      {props.cell.hints()[props.value] ? props.value : ''}
    </td>
  );
}

export default function Cell(props: { index: number }): JSX.Element {
  const cell: Getter<CellData> = cellGetter(props.index);
  return (
    <td classList={{ filled: cell().filled(), matchesSelection: cell().matchesSelection(), error: cell().error() }} onClick={[setCellToSelectionAndAutocomplete, cell()]} onTouchStart={[swipe.touchStart, cell()]} onTouchMove={swipe.touchMove}>
      <Show when={!cell().filled()} fallback={cell().value()}>
        <table class="hintTable">
          <tr>
            <HintCell cell={cell()} value={1}/>
            <HintCell cell={cell()} value={2}/>
            <HintCell cell={cell()} value={3}/>
          </tr>
          <tr>
            <HintCell cell={cell()} value={4}/>
            <HintCell cell={cell()} value={5}/>
            <HintCell cell={cell()} value={6}/>
          </tr>
          <tr>
            <HintCell cell={cell()} value={7}/>
            <HintCell cell={cell()} value={8}/>
            <HintCell cell={cell()} value={9}/>
          </tr>
        </table>
      </Show>
    </td>
  );
}
