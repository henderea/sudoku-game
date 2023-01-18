import { Difficulty, DifficultyMap, makeDifficultyMap } from 'lib/sudoku/difficulty';

export interface Storage {
  get bestTimes(): DifficultyMap<number>;
  set bestTimes(value: DifficultyMap<number>);

  setBestTime(difficulty: Difficulty, millis: number): Storage;
  updateBestTime(difficulty: Difficulty, millis: number): Storage;

  loadTimes(): Storage;
  saveTimes(): Storage;
}

const TIMES_STORAGE_KEY: string = 'game-times';

const emptyDifficultyMap = () => makeDifficultyMap(() => 0);

class StorageImpl implements Storage {
  private _bestTimes: DifficultyMap<number> = emptyDifficultyMap();

  get bestTimes(): DifficultyMap<number> { return this._bestTimes; }
  set bestTimes(value: DifficultyMap<number>) { this._bestTimes = value; }

  setBestTime(difficulty: Difficulty, millis: number): Storage {
    this.bestTimes[difficulty] = millis;
    return this;
  }

  updateBestTime(difficulty: Difficulty, millis: number): Storage {
    const currentBest: number = this.bestTimes[difficulty];
    if(currentBest <= 0 || currentBest > millis) {
      this.setBestTime(difficulty, millis);
    }
    return this;
  }

  private load<K extends keyof this>(key: K, storageKey: string, parse: (data: string) => this[K], fallback: () => this[K]): this {
    const data: string | null = window.localStorage.getItem(storageKey);
    if(data) {
      this[key] = parse(data);
    } else {
      this[key] = fallback();
    }
    return this;
  }

  private save<K extends keyof this>(key: K, storageKey: string, stringify: (value: this[K]) => string | null): this {
    const data: string | null = stringify(this[key]);
    if(data) {
      window.localStorage.setItem(storageKey, data);
    } else {
      window.localStorage.removeItem(storageKey);
    }
    return this;
  }

  loadTimes(): Storage { return this.load('bestTimes', TIMES_STORAGE_KEY, JSON.parse, emptyDifficultyMap); }
  saveTimes(): Storage { return this.save('bestTimes', TIMES_STORAGE_KEY, JSON.stringify); }
}

export const storage: Storage = new StorageImpl();
