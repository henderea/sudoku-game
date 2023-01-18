function r(a: number, b: number): [number, number] {
  return [a, b];
}

export type DifficultyMap<T> = {
    easy: T,
    medium: T,
    hard: T
};

export const difficultySpaces: DifficultyMap<[number, number]> = {
  easy: r(35, 45),
  medium: r(30, 35),
  hard: r(25, 30)
};

export declare type Difficulty = keyof DifficultyMap<any>;
