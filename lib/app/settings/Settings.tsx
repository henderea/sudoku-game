import type { JSX } from 'solid-js';

import { BUILD_DATE, DEPLOYMENT_ID, formatDate } from 'lib/util/general';

import { useMenu } from '../menu-state';

function refreshPage(): void {
  window.location.reload();
}

function InfoPanel(): JSX.Element {
  return (
    <div class="infoPanel">
      <table class="infoTable">
        <tbody>
          <tr class="buildId"><th>Deployment ID:</th></tr>
          <tr class="buildId"><td>{DEPLOYMENT_ID}</td></tr>
          <tr class="buildDate"><th>Build Date:</th></tr>
          <tr class="buildDate"><td>{formatDate(BUILD_DATE)}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

export default function Settings(): JSX.Element {
  const { loadMenu } = useMenu();
  return (
    <div class="settingsMenu menu">
      <div class="menuSpacer"></div>
      <InfoPanel />
      <div class="menuSpacer noBottom"></div>
      <div class="menuButton" onClick={refreshPage}>Refresh App</div>
      <div class="menuSpacer"></div>
      <div class="menuSpacer"></div>
      <div class="menuButton backButton" onClick={[loadMenu, 'main']}>Back</div>
      <div class="menuSpacer"></div>
    </div>
  );
}
