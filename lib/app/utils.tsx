import type { Signal, Setter } from 'solid-js';

import { createMemo, createSignal } from 'solid-js';

export interface Observable<T> {
    (): T;
    set: Setter<T>;
}

export interface Computed<T> {
    (): T;
}

function getAndSet<T>(get: () => T, set: Setter<T>): Observable<T> {
  const getter: Observable<T> = () => get();
  getter.set = set;
  return getter;
}

function obs<T, D extends T>(initialValue: D): Observable<T> {
  const [get, set]: Signal<T> = createSignal<T>(initialValue);
  return getAndSet<T>(get, set);
}

obs.proxy = function obsProxy<T>(orig: () => Observable<T>): Observable<T> {
  const get = () => orig()();
  const set: Setter<T> = (value?: any) => orig().set(value);
  return getAndSet(get, set);
};

function getter<T>(get: () => T): Computed<T> {
  return get;
}

function comp<T>(func: () => T): Computed<T> {
  return getter(createMemo(func));
}

comp.proxy = function compProxy<T>(orig: () => Computed<T>): Computed<T> {
  return () => orig()();
};

export { obs, comp };
