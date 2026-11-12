import { gsap, $$, opt } from "../core/env";

/* ───────────────────────────── cross-reveal ─────────────────────────────
 * <figure data-motion="cross-reveal"> <img src="…" alt="…"> </figure>
 * La scroll, un cursor de Figma trage o cruce din stânga sus spre dreapta
 * jos. Conținutul se dezvăluie după cruce (clip-path) și se micșorează de la
 * data-wm-zoom la 1. La final crucea dispare. Crucea și cursorul se
 * generează aici; conținutul e învelit într-o mască (.wm-xr-clip).
 * Ținta zoom-ului: elementul cu [data-xr-zoom] sau primul copil.
 * Opțiuni: data-wm-gap="16" (px) data-wm-zoom="1.7"
 *          data-wm-start="top 88%" data-wm-end="top 26%"
 * Culori: --wm-xr-cursor (cursorul), --wm-xr-line (liniile crucii).
 */
export function crossReveal(box: HTMLElement) {
  if (box.querySelector(":scope > .wm-xr")) return;
  const gap = opt(box, "gap", 16);
  const zoom = opt(box, "zoom", 1.7);
  const clip = document.createElement("div");
  clip.className = "wm-xr-clip";
  clip.append(...Array.from(box.childNodes));
  box.append(clip);
  box.classList.add("wm-xr-host");

  const ui = document.createElement("div");
  ui.className = "wm-xr";
  ui.setAttribute("aria-hidden", "true");
  ui.style.setProperty("--gap", `${gap}px`);
  ui.innerHTML =
    '<i class="wm-xr__vf"></i><i class="wm-xr__hf"></i><i class="wm-xr__v"></i><i class="wm-xr__h"></i>' +
    '<svg class="wm-xr__c" viewBox="0 0 20 20"><path d="M2.5 2 18 8.4l-7.1 2.5L8.4 18z" /></svg>';
  box.append(ui);
  const v = ui.querySelector<HTMLElement>(".wm-xr__v")!;
  const h = ui.querySelector<HTMLElement>(".wm-xr__h")!;
  const cursor = ui.querySelector<SVGElement>(".wm-xr__c")!;
  const media = clip.querySelector<HTMLElement>("[data-xr-zoom]") ?? (clip.firstElementChild as HTMLElement | null);
  media?.classList.add("wm-xr-zoom");

  const state = { p: 0 };
  const draw = () => {
    const w = box.clientWidth;
    const ht = box.clientHeight;
    const x = gap + (w - gap) * state.p;
    const y = gap + (ht - gap) * state.p;
    const o = gap * (1 - state.p);
    clip.style.clipPath =
      state.p >= 0.995 ? "none" : `inset(${o}px ${Math.max(0, w - x)}px ${Math.max(0, ht - y)}px ${o}px)`;
    v.style.transform = `translate3d(${x}px, 0, 0)`;
    h.style.transform = `translate3d(0, ${y}px, 0)`;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    /* Crucea dispare pe ultimele 8% din drum. */
    ui.style.opacity = state.p > 0.92 ? String((1 - state.p) / 0.08) : "1";
    if (media) media.style.transform = `scale(${zoom - (zoom - 1) * state.p})`;
  };
  draw();
  gsap.to(state, {
    p: 1,
    ease: "none",
    onUpdate: draw,
    scrollTrigger: {
      trigger: box,
      start: opt(box, "start", "top 88%"),
      end: opt(box, "end", "top 26%"),
      scrub: 0.4,
      onRefresh: draw,
    },
  });
}

export function initMedia(scope: ParentNode = document) {
  $$("[data-motion='cross-reveal']", scope).forEach(crossReveal);
}
