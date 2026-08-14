"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "cafete.cart.v1";
export const MAX_QUANTITY = 20;

export type CartLine = { bottles: number; quantity: number };

/**
 * The cart is a single module-level store over `localStorage`, read through
 * `useSyncExternalStore`.
 *
 * That is the right primitive here rather than `useState` + an effect: it gives
 * a correct server snapshot (so hydration matches instead of flashing an empty
 * basket into a full one), a stable snapshot reference, and cross-tab sync via
 * the `storage` event for free.
 */

function parse(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((line) => ({
        bottles: Number(line?.bottles),
        quantity: Number(line?.quantity),
      }))
      .filter(
        (line) =>
          Number.isInteger(line.bottles) &&
          line.bottles > 0 &&
          Number.isInteger(line.quantity) &&
          line.quantity > 0 &&
          line.quantity <= MAX_QUANTITY,
      );
  } catch {
    // A corrupt or hand-edited value should empty the cart, not crash the page.
    return [];
  }
}

const EMPTY: CartLine[] = [];

/** Cached so `getSnapshot` returns a stable reference — otherwise React loops. */
let cachedRaw: string | null = null;
let cachedLines: CartLine[] = EMPTY;

function getSnapshot(): CartLine[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedLines = parse(raw);
  }
  return cachedLines;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY) emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function write(next: CartLine[]) {
  cachedLines = next;
  cachedRaw = JSON.stringify(next);
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  emit();
}

export function useCart() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // False during SSR and the hydration render, true afterwards — lets callers
  // show a loading state rather than briefly claiming the cart is empty.
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const add = useCallback((bottles: number, quantity = 1) => {
    const current = getSnapshot();
    const existing = current.find((line) => line.bottles === bottles);
    write(
      existing
        ? current.map((line) =>
            line.bottles === bottles
              ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + quantity) }
              : line,
          )
        : [...current, { bottles, quantity }],
    );
  }, []);

  const setQuantity = useCallback((bottles: number, quantity: number) => {
    const current = getSnapshot();
    write(
      quantity <= 0
        ? current.filter((line) => line.bottles !== bottles)
        : current.map((line) =>
            line.bottles === bottles
              ? { ...line, quantity: Math.min(MAX_QUANTITY, quantity) }
              : line,
          ),
    );
  }, []);

  const remove = useCallback((bottles: number) => {
    write(getSnapshot().filter((line) => line.bottles !== bottles));
  }, []);

  const clear = useCallback(() => {
    if (getSnapshot().length > 0) write([]);
  }, []);

  return {
    lines,
    ready,
    totalItems: lines.reduce((sum, line) => sum + line.quantity, 0),
    totalBottles: lines.reduce((sum, line) => sum + line.quantity * line.bottles, 0),
    add,
    setQuantity,
    remove,
    clear,
  };
}
