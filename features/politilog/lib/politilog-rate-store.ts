/**
 * Client-only overlay state for "Rate performance" on PolitiLog (per timeline segment).
 */

type Snapshot = {
  open: boolean;
  politicianId: string | null;
  segmentId: string | null;
};

const initial: Snapshot = {
  open: false,
  politicianId: null,
  segmentId: null,
};

let snapshot: Snapshot = initial;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const politilogRateStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => void listeners.delete(cb);
  },
  getSnapshot(): Snapshot {
    return snapshot;
  },
  getServerSnapshot(): Snapshot {
    return initial;
  },
  open(politicianId: string, segmentId: string) {
    snapshot = { open: true, politicianId, segmentId };
    emit();
  },
  close() {
    snapshot = initial;
    emit();
  },
};
