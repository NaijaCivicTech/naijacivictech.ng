/**
 * Ref-counted body/html overflow lock so nested modals don't fight each other.
 */

let locks = 0;
let savedBody = "";
let savedHtml = "";

export function lockBodyScroll(): void {
  if (typeof document === "undefined") return;
  locks += 1;
  if (locks !== 1) return;
  savedBody = document.body.style.overflow;
  savedHtml = document.documentElement.style.overflow;
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
}

export function unlockBodyScroll(): void {
  if (typeof document === "undefined") return;
  locks = Math.max(0, locks - 1);
  if (locks !== 0) return;
  document.body.style.overflow = savedBody;
  document.documentElement.style.overflow = savedHtml;
  savedBody = "";
  savedHtml = "";
}
