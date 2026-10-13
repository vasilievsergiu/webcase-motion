import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);
/* Pe mobil, bara de adresă care apare/dispare nu trebuie să recalculeze
   pin-urile (altfel secțiunile fixate „sar”). */
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText };

export const root = document.documentElement;

/** true = vizitatorul a cerut mișcare redusă → nu animăm nimic. */
export const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const mq = (q: string) => window.matchMedia(q).matches;

export const $ = <T extends HTMLElement = HTMLElement>(s: string, c: ParentNode = document) =>
  c.querySelector<T>(s);
export const $$ = <T extends HTMLElement = HTMLElement>(s: string, c: ParentNode = document) =>
  Array.from(c.querySelectorAll<T>(s));

/** Citește o opțiune din data-attribute: data-wm-<nume>="…" (număr sau text). */
export function opt(el: HTMLElement, name: string, fallback: number): number;
export function opt(el: HTMLElement, name: string, fallback: string): string;
export function opt(el: HTMLElement, name: string, fallback: number | string) {
  const raw = el.getAttribute(`data-wm-${name}`);
  if (raw === null || raw === "") return fallback;
  if (typeof fallback === "number") {
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
  }
  return raw;
}

/** Rulează fn o singură dată când elementul intră în ecran. */
export function onEnter(trigger: Element | null, fn: () => void, start = "top 78%") {
  if (!trigger) return;
  ScrollTrigger.create({ trigger, start, once: true, onEnter: fn });
}

/** Rotația scrisă în CSS ca variabilă `--r` (ex. `style="--r: -3deg"`). */
export const cssRot = (el: Element) => parseFloat(getComputedStyle(el).getPropertyValue("--r")) || 0;
