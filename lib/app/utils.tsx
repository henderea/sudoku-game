import { createSignal, createMemo } from 'solid-js';

export interface GetAndSet<T> {
  get(): T;
  set(value: T): void;
}

export interface Getter<T> {
  get(): T;
}

export function getAndSet<T>(initialValue: T): GetAndSet<T> {
  const [get, set] = createSignal(initialValue);
  return { get, set };
}

export function getter<T>(get: () => T): Getter<T> {
  return { get };
}

export function memoGetter<T>(func: () => T): Getter<T> {
  return getter(createMemo(func));
}
