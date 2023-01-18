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
