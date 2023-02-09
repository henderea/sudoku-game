import type { KeysOfType } from './general';
import type { Difficulty, DifficultyMap } from 'lib/sudoku/difficulty';
import type { GetAndSet } from 'lib/app/utils';

import { makeDifficultyMap } from 'lib/sudoku/difficulty';

export interface Storage {
  get bestTimes(): DifficultyMap<number>;
  set bestTimes(value: DifficultyMap<number>);

  get playCounts(): DifficultyMap<number>;
  set playCounts(value: DifficultyMap<number>);

  setBestTime(difficulty: Difficulty, millis: number): Storage;
  updateBestTime(difficulty: Difficulty, millis: number, newHighScore: GetAndSet<boolean>): Storage;

  incrementPlayCount(difficulty: Difficulty): Storage;

  resetTimes(): Storage;
  resetPlayCounts(): Storage;

  loadTimes(): Storage;
  saveTimes(): Storage;

  loadPlayCounts(): Storage;
  savePlayCounts(): Storage;
}

const TIMES_STORAGE_KEY: string = 'game-times';
const PLAY_COUNTS_STORAGE_KEY: string = 'game-play-counts';

// True to automatically load/save before/after each operation (method)
const AUTO_LOAD_AND_SAVE: boolean = true;

const emptyDifficultyMap = () => makeDifficultyMap(() => 0);

class StorageImpl implements Storage {
  private _bestTimes: DifficultyMap<number> = emptyDifficultyMap();
  private _playCounts: DifficultyMap<number> = emptyDifficultyMap();

  get bestTimes(): DifficultyMap<number> { return this._bestTimes; }
  set bestTimes(value: DifficultyMap<number>) { this._bestTimes = value; }
  get playCounts(): DifficultyMap<number> { return this._playCounts; }
  set playCounts(value: DifficultyMap<number>) { this._playCounts = value; }

  setBestTime(difficulty: Difficulty, millis: number): Storage {
    this.autoLoad('loadTimes');
    this.bestTimes[difficulty] = millis;
    return this.autoSave('saveTimes');
  }

  updateBestTime(difficulty: Difficulty, millis: number, newHighScore: GetAndSet<boolean>): Storage {
    this.autoLoad('loadTimes');
    const currentBest: number = this.bestTimes[difficulty];
    if(currentBest <= 0 || currentBest > millis) {
      newHighScore.set(true);
      this.bestTimes[difficulty] = millis;
    } else {
      newHighScore.set(false);
    }
    return this.autoSave('saveTimes');
  }

  incrementPlayCount(difficulty: Difficulty): Storage {
    this.autoLoad('loadPlayCounts');
    this.playCounts[difficulty] = this.playCounts[difficulty] + 1;
    return this.autoSave('savePlayCounts');
  }

  resetTimes(): Storage {
    this.bestTimes = emptyDifficultyMap();
    return this.autoSave('saveTimes');
  }

  resetPlayCounts(): Storage {
    this.playCounts = emptyDifficultyMap();
    return this.autoSave('savePlayCounts');
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

  private autoLoad<K extends KeysOfType<StorageImpl, () => Storage> & `load${string}`>(key: K): this {
    if(AUTO_LOAD_AND_SAVE) { this[key](); }
    return this;
  }

  private autoSave<K extends KeysOfType<StorageImpl, () => Storage> & `save${string}`>(key: K): this {
    if(AUTO_LOAD_AND_SAVE) { this[key](); }
    return this;
  }

  loadTimes(): Storage { return this.load('bestTimes', TIMES_STORAGE_KEY, JSON.parse, emptyDifficultyMap); }
  saveTimes(): Storage { return this.save('bestTimes', TIMES_STORAGE_KEY, JSON.stringify); }

  loadPlayCounts(): Storage { return this.load('playCounts', PLAY_COUNTS_STORAGE_KEY, JSON.parse, emptyDifficultyMap); }
  savePlayCounts(): Storage { return this.save('playCounts', PLAY_COUNTS_STORAGE_KEY, JSON.stringify); }

  autoLoadAll(): this {
    return this.autoLoad('loadTimes').autoLoad('loadPlayCounts');
  }
}

export const storage: Storage = new StorageImpl().autoLoadAll();
