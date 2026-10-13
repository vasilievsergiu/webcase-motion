import { ScrollTrigger, root } from "./core/env";
import { initText } from "./motions/text";
import { initCards } from "./motions/cards";
import { initUi, loader, smoothScroll } from "./motions/ui";
import { intro } from "./motions/intro";

export * from "./core/tokens";
export { gsap, ScrollTrigger, SplitText, reduced } from "./core/env";
export * from "./motions/text";
export * from "./motions/cards";
export * from "./motions/ui";
export { intro } from "./motions/intro";

export interface MotionOptions {
  /** Scroll lin (Lenis) pe desktop. Implicit: true. */
  smooth?: boolean;
  /** Spațiul lăsat deasupra la linkurile #ancoră (bara fixă). Implicit: 88. */
  anchorOffset?: number;
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Pornește tot: citește atributele data-motion / data-intro din pagină.
 * Nu face nimic dacă `html.wm-anim` lipsește (reduced-motion sau fără snippetul
 * din <head>) — atunci pagina rămâne statică și complet vizibilă.
 * Ordinea: fonturi → loader (o dată pe sesiune) → intro → animațiile la scroll.
 */
export async function initMotion(opts: MotionOptions = {}) {
  if (!root.classList.contains("wm-anim")) return;
  root.classList.add("wm-ready");
  try {
    /* Rândurile se calculează corect doar cu fonturile încărcate. */
    await Promise.race([document.fonts?.ready ?? Promise.resolve(), wait(1500)]);
    if (opts.smooth !== false) smoothScroll(opts.anchorOffset);
    initUi();
    await loader();
    intro();
    initText();
    initCards();
    window.addEventListener("load", () => ScrollTrigger.refresh());
  } catch (err) {
    /* Orice eroare: pagina rămâne vizibilă, statică. */
    console.error(err);
    root.classList.remove("wm-anim", "wm-loading");
    root.classList.add("wm-intro");
  }
}
