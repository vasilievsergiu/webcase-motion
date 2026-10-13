import { SplitText } from "./env";

/**
 * SplitText „sigur” — lecțiile învățate:
 *  1. reduceWhiteSpace: false → păstrează &nbsp; (altfel SplitText îl face
 *     spațiu normal și ultimul cuvânt rămâne singur pe rând, mai ales în Safari).
 *  2. Masca rândurilor e făcută din CSS cu clip-path extins (vezi motion.css),
 *     nu cu overflow — diacriticele (Î, â) și codițele (g, ș) nu se taie și
 *     textul nu „sare” la final.
 *  3. Dacă împărțirea iese greșită (un „rând” mai înalt de 1,5 rânduri — se
 *     întâmplă la texte cu <span> colorat), renunțăm la împărțire și animăm
 *     textul întreg.
 */
export function splitBroken(el: HTMLElement, lines: Element[]) {
  const cs = getComputedStyle(el);
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
  return lines.some((l) => (l as HTMLElement).offsetHeight > lh * 1.5);
}

type SplitVars = ConstructorParameters<typeof SplitText>[1];

export function safeSplit(el: HTMLElement, vars: SplitVars) {
  return SplitText.create(el, { reduceWhiteSpace: false, ...vars } as SplitVars);
}

/** Anularea unei împărțiri din onSplit se face după ce SplitText termină. */
export const revertLater = (self: { revert: () => void }) => setTimeout(() => self.revert(), 0);
