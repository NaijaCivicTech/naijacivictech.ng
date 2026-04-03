/**
 * Client overlay state for “Propose an update” on a PolitiLog profile.
 */

type Snapshot = {
  open: boolean;
  politicianId: string | null;
};

const initial: Snapshot = {
  open: false,
  politicianId: null,
};

let snapshot: Snapshot = initial;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const politilogProposeStore = {
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
  open(politicianId: string) {
    snapshot = { open: true, politicianId };
    emit();
  },
  close() {
    snapshot = initial;
    emit();
  },
};
