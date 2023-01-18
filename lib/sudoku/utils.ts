export function getAcrossFromNumber(n: number): number {
  const rv: number = n % 9;
  return rv == 0 ? 9 : rv;
}

export function getDownFromNumber(n: number): number {
  return Math.floor(n / 9) + (getAcrossFromNumber(n) == 9 ? 0 : 1);
}

export function getSubIndexFromNumber(n: number): number {
  const a: number = getAcrossFromNumber(n);
  const d: number = getDownFromNumber(n);
  return (Math.floor((d - 1) / 3) * 3) + Math.floor((a - 1) / 3) + 1;
}

function getRowColFromSubIndex(s: number): [number, number] {
  return [Math.floor((s - 1) / 3) + 1, ((s - 1) % 3) + 1];
}

export function getRowColFromRegionSubIndex(r: number, s: number): [number, number] {
  const [row1, col1] = getRowColFromSubIndex(r);
  const [row2, col2] = getRowColFromSubIndex(s);
  return [((row1 - 1) * 3) + row2, ((col1 - 1) * 3) + col2];
}

export function getRegionFromNumber(n: number): number {
  const a: number = getAcrossFromNumber(n);
  const d: number = getDownFromNumber(n);
  return (Math.floor((d-1) / 3) * 3) + Math.floor((a-1) / 3) + 1;
}
