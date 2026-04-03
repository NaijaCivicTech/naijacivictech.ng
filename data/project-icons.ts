/**
 * Icon pools per project category. Keys must match `PROJECT_CATEGORY_OPTIONS`
 * in `lib/civic-utils.ts`.
 */
const DEFAULT_ICON_POOL = [
  "🗳️",
  "🏛️",
  "📋",
  "📊",
  "🗺️",
  "💡",
] as const;

export const CATEGORY_ICON_POOLS: Record<string, readonly string[]> = {
  AI: ["🤖", "🧠", "💻", "🔮", "📡", "🧬"],
  "Agriculture & food": ["🌾", "🌽", "🥬", "🚜", "🌱", "🧺"],
  "Climate & environment": ["🌍", "🌳", "♻️", "🌊", "☀️", "🍃"],
  "Culture & media": ["🎭", "📰", "🎬", "📻", "🖼️", "✍️"],
  Democracy: ["🗳️", "🏛️", "📢", "⚖️", "📣", "🏴"],
  Economy: ["💹", "💼", "🏦", "📈", "🪙", "🧾"],
  Education: ["🎓", "📚", "📖", "✏️", "🏫", "📒"],
  Electricity: ["⚡", "💡", "🔌", "🔋", "☀️", "🏭"],
  Health: ["🏥", "💊", "💉", "🩺", "🌡️", "❤️"],
  "Housing & cities": ["🏘️", "🏢", "🏠", "🗝️", "🌆", "🧱"],
  "Human rights": ["⚖️", "🤝", "✊", "📜", "🕊️", "🙌"],
  Infrastructure: ["🏗️", "🛣️", "🌉", "🚧", "⚙️", "🏭"],
  "Justice & legal": ["⚖️", "📜", "🏛️", "📑", "🔏", "📋"],
  "Oil & gas": ["🛢️", "⛽", "🏭", "🔥", "🌊", "⚙️"],
  "Open data": ["📊", "📡", "🗄️", "🔍", "💾", "📋"],
  "Public safety": ["🚨", "🛡️", "🚒", "🚑", "⚠️", "📣"],
  Security: ["🔒", "🛡️", "👁️", "🔐", "📡", "🔑"],
  "Social protection": ["🤝", "🏠", "🧒", "🍲", "🛟", "💜"],
  Transport: ["🚌", "🚆", "✈️", "🚢", "🛤️", "⛴️"],
  Traffic: ["🚦", "🛣️", "🚗", "🚸", "📍", "🅿️"],
  Transparency: ["🔍", "📢", "🪟", "📋", "☀️", "🧾"],
  Other: ["🗳️", "💡", "📌", "🌟", "📋", "🏛️"],
};

export function pickRandomIconForCategory(category: string): string {
  const trimmed = category.trim();
  const pool = CATEGORY_ICON_POOLS[trimmed] ?? DEFAULT_ICON_POOL;
  const i = Math.floor(Math.random() * pool.length);
  return pool[i] ?? DEFAULT_ICON_POOL[0]!;
}
