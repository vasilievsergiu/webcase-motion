import { gsap, $, $$, mq, opt } from "../core/env";
import { DESKTOP, SOFT_IN, SOFT_INOUT } from "../core/tokens";

/** Mută toți copiii elementului într-un înveliș nou (pentru partea sticky). */
function wrapChildren(el: HTMLElement, className: string) {
  const wrap = document.createElement("div");
  wrap.className = className;
  wrap.append(...Array.from(el.childNodes));
  el.append(wrap);
  return wrap;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ─────────────────────────────── dive-in ───────────────────────────────
 * <section data-motion="dive-in" data-wm-arc-text="Trei motive să ne alegi">
 *   <div data-dive-bg> <img …> </div>             ← imaginea care crește spre tine
 *   <div data-dive-content> titlu, butoane </div>  ← textul primului ecran
 * </section>
 * Secțiunea e înaltă (data-wm-length ecrane), iar conținutul ei stă sticky.
 * La scroll: textul urcă mai repede decât imaginea (parallax), apoi imaginea
 * crește de la 1 la data-wm-zoom, din punctul aflat la 75% din înălțime,
 * cu SOFT_IN. Dacă există data-wm-arc-text, peste ea urcă un cerc mare
 * (SVG generat aici) cu textul scris pe margine; spațiul dintre cuvinte
 * crește cât derulezi. Secțiunea următoare are aceeași culoare cu cercul.
 * Pe telefon: doar zoom-ul și cercul.
 * Opțiuni: data-wm-length="4" data-wm-zoom="2" data-wm-arc-text="…"
 *          data-wm-arc-spread="4" (em între cuvinte, la final)
 * Culori: --wm-arc-color (cercul), --wm-arc-ink (textul de pe cerc).
 */
export function diveIn(sec: HTMLElement) {
  if (sec.querySelector(":scope > .wm-dive-stick")) return;
  const bg = $("[data-dive-bg]", sec);
  const content = $("[data-dive-content]", sec);
  const zoom = opt(sec, "zoom", 2);
  const arcText = opt(sec, "arc-text", "");
  const spread = opt(sec, "arc-spread", 4);
  sec.style.setProperty("--wm-dive-length", String(opt(sec, "length", 4)));
  const stick = wrapChildren(sec, "wm-dive-stick");

  let arc: HTMLElement | null = null;
  let words: SVGTextElement | null = null;
  if (arcText) {
    const id = `wm-arc-${Math.random().toString(36).slice(2, 9)}`;
    arc = document.createElement("div");
    arc.className = "wm-dive-arc";
    arc.setAttribute("aria-hidden", "true");
    arc.innerHTML =
      `<svg viewBox="0 0 1000 1000"><circle cx="500" cy="500" r="500" />` +
      `<path id="${id}" d="M 70,500 A 430,430 0 0 1 930,500" fill="none" />` +
      `<text><textPath href="#${id}" startOffset="50%" text-anchor="middle">${esc(arcText)}</textPath></text></svg>`;
    stick.append(arc);
    words = arc.querySelector("text");
  }

  /* Textul stă doar pe partea de arc vizibilă pe ecran: pe ecrane înguste
     cercul e mai lat decât ecranul, deci arcul se scurtează, textul se
     micșorează cât să încapă, iar spațiul dintre cuvinte crește cât mai e loc. */
  let maxSpread = spread;
  const layoutArc = () => {
    if (!arc || !words) return;
    const path = arc.querySelector("path");
    const size = arc.offsetWidth;
    if (!path || !size) return;
    const r = 430;
    const dx = Math.min(r, ((window.innerWidth / 2 / size) * 1000) * 0.88);
    const y = 500 - Math.sqrt(r * r - dx * dx);
    path.setAttribute("d", `M ${500 - dx},${y} A ${r},${r} 0 0 1 ${500 + dx},${y}`);
    const arcLen = path.getTotalLength();
    let fs = 30;
    words.style.fontSize = `${fs}px`;
    words.style.wordSpacing = "0em";
    let len = words.getComputedTextLength();
    if (len > arcLen * 0.9) {
      fs = Math.max(12, (fs * arcLen * 0.9) / len);
      words.style.fontSize = `${fs}px`;
      len = words.getComputedTextLength();
    }
    const gaps = Math.max(1, arcText.trim().split(/\s+/).length - 1);
    maxSpread = Math.max(0, (arcLen * 0.95 - len) / gaps / fs);
  };
  layoutArc();

  const desktop = mq(DESKTOP);
  const vh = () => window.innerHeight;
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sec,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onRefreshInit: layoutArc,
    },
  });
  if (desktop) {
    if (content) tl.fromTo(content, { y: 0 }, { y: () => -vh() * 0.9, ease: "none", duration: 0.6 }, 0);
    if (bg) tl.fromTo(bg, { y: 0 }, { y: () => -vh() * 0.12, ease: "none", duration: 0.6 }, 0);
  }
  if (bg) tl.fromTo(bg, { scale: 1 }, { scale: zoom, ease: SOFT_IN, duration: 0.6 }, desktop ? 0.4 : 0);
  if (arc) {
    tl.fromTo(arc, { y: () => vh() }, { y: () => vh() * 0.3, ease: "none", duration: 0.55 }, desktop ? 0.45 : 0.3);
    if (words)
      tl.fromTo(
        words,
        { wordSpacing: "0em" },
        { wordSpacing: () => `${Math.min(spread, maxSpread)}em`, ease: "none", duration: 0.55 },
        "<",
      );
  }
  tl.to({}, { duration: 0 }, 1);
}

/* ──────────────────────────── window-merge ────────────────────────────
 * <section data-motion="window-merge">
 *   <div data-win-media> <img …> </div>             ← o singură poză
 *   <div data-win-side="left"> decor </div>          ← opțional (flori, forme)
 *   <div data-win-side="right"> decor </div>
 * </section>
 * Doar desktop. Poza se vede prin două ferestre decalate pe înălțime
 * (clip-path cu două dreptunghiuri). La scroll: ferestrele se aliniază (50%
 * din drum), se unesc într-una (10%), apoi totul crește de data-wm-zoom ori
 * (40%, SOFT_INOUT) până fereastra umple ecranul; decorul iese în lateral.
 * Pe telefon rămâne o poză simplă.
 * Opțiuni: data-wm-zoom="1.84" data-wm-length="2" (ecrane de scroll)
 */
export function windowMerge(sec: HTMLElement) {
  const media = $("[data-win-media]", sec);
  if (!media || !mq(DESKTOP) || sec.classList.contains("is-win-on")) return;
  const zoom = opt(sec, "zoom", 1.84);
  sec.style.setProperty("--wm-win-length", String(opt(sec, "length", 2)));
  sec.classList.add("is-win-on");
  const stick = wrapChildren(sec, "wm-win-stick");
  const frame = document.createElement("div");
  frame.className = "wm-win-frame";
  stick.prepend(frame);
  frame.append(media);
  const sides = $$("[data-win-side]", sec);

  const st = { a: 0, m: 0 };
  const lerp = (x: number, y: number, t: number) => x + (y - x) * t;
  const draw = () => {
    const w = frame.clientWidth;
    const h = frame.clientHeight;
    const rect = (x1: number, y1: number, x2: number, y2: number) =>
      `M${(x1 * w) / 100} ${(y1 * h) / 100}H${(x2 * w) / 100}V${(y2 * h) / 100}H${(x1 * w) / 100}Z`;
    /* Stânga pornește mai jos, dreapta mai sus; se aliniază la 18–82%. */
    const left = rect(22, lerp(26, 18, st.a), lerp(49, 50.5, st.m), lerp(90, 82, st.a));
    const right = rect(lerp(51, 49.5, st.m), lerp(10, 18, st.a), 78, lerp(74, 82, st.a));
    frame.style.clipPath = `path("${left} ${right}")`;
  };
  draw();

  const tl = gsap.timeline({
    scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: true, onRefresh: draw },
  });
  tl.to(st, { a: 1, ease: "none", duration: 0.5, onUpdate: draw })
    .to(st, { m: 1, ease: "none", duration: 0.1, onUpdate: draw })
    .to(frame, { scale: zoom, ease: SOFT_INOUT, duration: 0.4 });
  sides.forEach((s) => {
    const dir = s.dataset.winSide === "left" ? -1 : 1;
    tl.to(s, { xPercent: 50 * dir, scale: zoom, ease: SOFT_INOUT, duration: 0.4 }, "<");
  });
}

/* ──────────────────────────── frame-close ────────────────────────────
 * <section data-motion="frame-close"> secțiunea cu poza </section>
 * <footer data-frame-next> … </footer>             ← opțional, crește de la 0,75 la 1
 * Cât pleci din secțiune, ea se strânge spre interior până la un cadru
 * (clip-path inset), iar fundalul paginii apare în jurul ei. Secțiunea
 * următoare (cu data-frame-next) crește în același timp. Legat de scroll.
 * Ținta creșterii: [data-frame-grow] din ea sau primul ei copil.
 * Opțiuni: data-wm-inset="8% 22%" (desktop), data-wm-inset-mobile="4% 32%"
 */
export function frameClose(sec: HTMLElement) {
  const inset = mq(DESKTOP) ? opt(sec, "inset", "8% 22%") : opt(sec, "inset-mobile", "4% 32%");
  const next = sec.nextElementSibling as HTMLElement | null;
  const grow = next?.hasAttribute("data-frame-next")
    ? (next.querySelector<HTMLElement>("[data-frame-grow]") ?? (next.firstElementChild as HTMLElement | null))
    : null;
  const tl = gsap.timeline({
    scrollTrigger: { trigger: sec, start: "bottom bottom", end: "bottom top", scrub: 0.5 },
  });
  tl.fromTo(sec, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: `inset(${inset})`, ease: "none" }, 0);
  if (grow) tl.fromTo(grow, { scale: 0.75 }, { scale: 1, transformOrigin: "center top", ease: "none" }, 0);
}

export function initSections(scope: ParentNode = document) {
  $$("[data-motion='dive-in']", scope).forEach(diveIn);
  $$("[data-motion='window-merge']", scope).forEach(windowMerge);
  $$("[data-motion='frame-close']", scope).forEach(frameClose);
}
