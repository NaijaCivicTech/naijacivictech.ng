import type { PolitilogLocalContext } from "@/features/politilog/lib/politilog-data";

export async function fetchMyResidence(): Promise<PolitilogLocalContext | null> {
  const res = await fetch("/api/me/residence", { credentials: "include" });
  const data = (await res.json()) as {
    residence?: PolitilogLocalContext | null;
    error?: string;
  };
  if (res.status === 401) return null;
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to load residence (${res.status})`);
  }
  return data.residence ?? null;
}

export async function saveMyResidence(
  ctx: PolitilogLocalContext,
): Promise<PolitilogLocalContext> {
  const res = await fetch("/api/me/residence", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: ctx.state, lga: ctx.lga, key: ctx.key }),
  });
  const data = (await res.json()) as {
    residence?: PolitilogLocalContext | null;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to save residence (${res.status})`);
  }
  if (!data.residence) {
    throw new Error("Invalid save response");
  }
  return data.residence;
}

export async function clearMyResidence(): Promise<void> {
  const res = await fetch("/api/me/residence", {
    method: "DELETE",
    credentials: "include",
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Failed to clear residence (${res.status})`);
  }
}
