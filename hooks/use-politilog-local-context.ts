"use client";

import type { PolitilogLocalContext } from "@/lib/politilog-data";
import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "naijacivic:politilog-local-lga";

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function parseStored(raw: string | null): PolitilogLocalContext | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as unknown;
    if (
      p &&
      typeof p === "object" &&
      "state" in p &&
      "lga" in p &&
      "key" in p &&
      typeof (p as PolitilogLocalContext).key === "string"
    ) {
      return p as PolitilogLocalContext;
    }
  } catch {
    /* ignore */
  }
  return null;
}

let clientCacheJson: string | null | undefined;
let clientCache: PolitilogLocalContext | null | undefined;

function readSnapshot(): PolitilogLocalContext | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === clientCacheJson) return clientCache ?? null;
  clientCacheJson = raw;
  clientCache = parseStored(raw);
  return clientCache;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      clientCacheJson = undefined;
      clientCache = undefined;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getServerSnapshot(): PolitilogLocalContext | null {
  return null;
}

export function usePolitilogLocalContext() {
  const localContext = useSyncExternalStore(
    subscribe,
    readSnapshot,
    getServerSnapshot,
  );

  const setLocalContext = useCallback((next: PolitilogLocalContext) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    clientCacheJson = undefined;
    clientCache = undefined;
    emit();
  }, []);

  const clearLocalContext = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    clientCacheJson = undefined;
    clientCache = undefined;
    emit();
  }, []);

  return { localContext, setLocalContext, clearLocalContext };
}
