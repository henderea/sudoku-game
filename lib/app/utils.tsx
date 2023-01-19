import { createSignal, createMemo } from 'solid-js';

export interface GetAndSet<T> {
  (): T;
  set(value: T): void;
}

export interface Getter<T> {
  (): T;
}

export function getAndSet<T>(get: () => T, set: (value: T) => void): GetAndSet<T> {
  const getter = () => get();
  getter.set = set;
  return getter;
}

export function getAndSetProxy<T>(orig: () => GetAndSet<T>): GetAndSet<T> {
  const get = () => orig()();
  const set = (value: T) => orig().set(value);
  return getAndSet(get, set);
}

export function getAndSetSignal<T>(initialValue: T): GetAndSet<T> {
  const [get, set] = createSignal(initialValue);
  return getAndSet<T>(get, set);
}

export function getter<T>(get: () => T): Getter<T> {
  return get;
}

export function getterProxy<T>(orig: () => Getter<T>): Getter<T> {
  return () => orig()();
}

export function memoGetter<T>(func: () => T): Getter<T> {
  return getter(createMemo(func));
}
