function r(a: number, b: number): [number, number] {
  return [a, b];
}

export const difficultySpaces = {
  easy: r(35, 45),
  medium: r(30, 35),
  hard: r(25, 30)
} as const;

export declare type Difficulty = keyof typeof difficultySpaces;
export declare type DifficultyMap<T> = Record<Difficulty, T>;
export const difficulties: Difficulty[] = Object.keys(difficultySpaces) as Difficulty[];

export function makeDifficultyMap<T>(iter: (difficulty: Difficulty) => T): DifficultyMap<T> {
  const rv: any = {};
  for(const d of difficulties) {
    rv[d] = iter(d);
  }
  return rv as DifficultyMap<T>;
}
