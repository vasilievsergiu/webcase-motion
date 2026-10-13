import { gsap, root, $$, opt } from "../core/env";
import { EASE, EXPO, LAND } from "../core/tokens";
import { safeSplit } from "../core/split";

/* ───────────────────────────── intro ─────────────────────────────
 * Intrarea primului ecran (după loader, dacă există). Marchezi elementele cu
 * data-intro="<tip>"; pornesc în ordinea din pagină, la 0,1s unul după altul
 * (sau la momentul din data-wm-at="0.45").
 *   drop  — coboară 20px (header, meniu)
 *   rise  — urcă 16–24px (eyebrow, subtitlu, butoane)
 *   lines — titlu: rândurile urcă din mască (ca split-lines)
 *   lift  — imagine mare: urcă 90px și crește de la 0,92
 *   pop   — insignă/sticker: „aterizează” de la 1,3 la 1, apoi plutește lent
 * Până pornește, elementele sunt ascunse din CSS (fără flash înainte de JS).
 */
export function intro(scope: ParentNode = document) {
  const els = $$("[data-intro]", scope);
  root.classList.add("wm-intro");
  if (!els.length) return gsap.timeline();
  const tl = gsap.timeline({ defaults: { ease: EXPO } });
  els.forEach((el, i) => {
    const at = opt(el, "at", i * 0.1);
    switch (el.dataset.intro) {
      case "drop":
        tl.fromTo(el, { y: -20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, at);
        break;
      case "lines": {
        const split = safeSplit(el, { type: "lines", mask: "lines", linesClass: "wm-line" });
        tl.from(split.lines, { yPercent: 125, duration: 1, stagger: 0.1, onComplete: () => split.revert() }, at);
        break;
      }
      case "lift":
        tl.fromTo(el, { y: 90, scale: 0.92, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 1.1 }, at);
        break;
      case "pop": {
        const r = Number(gsap.getProperty(el, "rotation"));
        tl.fromTo(el, { scale: 1.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: LAND }, at).add(
          () =>
            /* Plutire foarte lentă (±2px, ±1°), în buclă. */
            gsap.to(el, {
              keyframes: [
                { y: -2, rotation: r - 1, duration: 1.6 + i * 0.3 },
                { y: 2, rotation: r + 1, duration: 3.2 + i * 0.6 },
                { y: 0, rotation: r, duration: 1.6 + i * 0.3 },
              ],
              ease: "sine.inOut",
              repeat: -1,
            }),
          at + 0.7,
        );
        break;
      }
      default: // rise
        tl.fromTo(el, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: EASE }, at);
    }
  });
  return tl;
}
