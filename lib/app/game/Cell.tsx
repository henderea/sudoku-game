import type { JSX } from 'solid-js';
import type { CellData } from './grid-state';
import type { Computed } from '../utils';

import { Show } from 'solid-js';

import { useGridManagement } from './grid-management';
import { useGrid } from './grid-state';

function HintCell(props: { cell: CellData, value: number }): JSX.Element {
  const { selection } = useGrid();
  return (
    <td classList={{ matchesSelection: props.cell.hints()[props.value] && selection() == props.value }}>
      {props.cell.hints()[props.value] ? props.value : '\u00A0'}
    </td>
  );
}

export default function Cell(props: { index: number }): JSX.Element {
  const { cellGetter } = useGrid();
  const { setCellToSelectionAndAutocomplete, swipe, handleKeyPress } = useGridManagement();
  const cell: Computed<CellData> = cellGetter(props.index);
  return (
    <td classList={{ filled: cell().filled(), justFilled: cell().justFilled(), matchesSelection: cell().matchesSelection(), error: cell().error(), singleHint: cell().hintCount() == 1 }} onClick={[setCellToSelectionAndAutocomplete, cell()]} onTouchStart={[swipe.touchStart.bind(swipe), cell()]} onTouchEnd={swipe.touchEnd.bind(swipe)} onKeyDown={[handleKeyPress, cell()]} tabIndex={0} data-row={cell().row} data-col={cell().column}>
      <Show when={!cell().filled()} fallback={cell().value()}>
        <table class="hintTable">
          <tbody>
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
          </tbody>
        </table>
      </Show>
    </td>
  );
}
