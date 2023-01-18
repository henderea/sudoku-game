import type { JSX } from 'solid-js';

import Header from './Header';
import Grid from './Grid';
import NumberBar from './NumberBar';

export default function App(): JSX.Element {
  return (
    <>
      <Header/>
      <Grid/>
      <NumberBar/>
    </>
  );
}
