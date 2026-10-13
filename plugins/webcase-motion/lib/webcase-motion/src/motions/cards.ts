import { gsap, $, $$, mq, opt, cssRot, onEnter } from "../core/env";
import { DESKTOP, POINTER, EASE } from "../core/tokens";

/* ───────────────────────────── fan ─────────────────────────────
 * Structură comună pentru fan-hover și fan-emerge:
 *   <div data-motion="fan">
 *     <div data-fan-card style="--r: 9deg"> … </div>      ← carduri din spate
 *     …
 *     <figure data-fan-center> … </figure>                ← imaginea din mijloc
 *   </div>
 * Pozițiile cardurilor le pui tu din CSS: position:absolute + transform: rotate(var(--r)).
 * (transform, NU proprietatea `rotate` — GSAP scrie inline `rotate: none`.)
 * Pe desktop cu mouse → fan-hover; pe tabletă/mobil → fan-emerge.
 */

/** Distanța de la centrul cardului la centrul imaginii (de unde „iese” cardul). */
function pullTo(card: HTMLElement, center: HTMLElement) {
  const a = card.getBoundingClientRect();
  const b = center.getBoundingClientRect();
  return {
    x: (b.left + b.width / 2 - (a.left + a.width / 2)) * 0.85,
    y: (b.top + b.height / 2 - (a.top + a.height / 2)) * 0.85,
  };
}

/**
 * fan-hover — desktop cu mouse. Hover pe un card: se îndreaptă, crește puțin,
 * urcă și iese în lateral (dinspre centru); vecinii se dau la o parte; imaginea
 * din mijloc se retrage puțin. Hover pe imagine: cardurile se strâng spre ea.
 * Plus adâncime: cardurile urmăresc ușor cursorul. Ordinea straturilor NU se
 * schimbă (niciun card nu trece peste altul sau peste imagine).
 */
export function fanHover(fan: HTMLElement) {
  const cards = $$("[data-fan-card]", fan).filter((c) => c.offsetParent !== null);
  const center = $("[data-fan-center]", fan);
  if (!center || !cards.length) return;
  const rot = cards.map((c) => cssRot(c));
  const els = [...cards, center];
  const n = cards.length;
  const depth = els.map((_, i) => (i === n ? 4 : i === 0 || i === n - 1 ? 12 : 8));
  const qx = els.map((el) => gsap.quickTo(el, "x", { duration: 0.6, ease: EASE }));
  const qy = els.map((el) => gsap.quickTo(el, "y", { duration: 0.6, ease: EASE }));
  const side = (i: number) => {
    const a = cards[i].getBoundingClientRect();
    const b = center.getBoundingClientRect();
    return a.left + a.width / 2 < b.left + b.width / 2 ? -1 : 1;
  };
  let active = -1; // 0…n-1 = card, n = imaginea, -1 = nimic
  let px = 0;
  let py = 0;

  const render = () => {
    const spread = fan.offsetWidth * 0.035;
    els.forEach((_, i) => {
      let hx = 0;
      let hy = 0;
      if (active >= 0 && active < n && i < n && i !== active) hx = (i < active ? -1 : 1) * spread;
      if (active === n && i < n) hx = -side(i) * spread * 0.8;
      if (i === active && i < n) {
        hy = -14;
        hx = side(i) * spread * 0.6;
      }
      qx[i](hx + px * depth[i]);
      qy[i](hy + py * depth[i] * 0.6);
    });
  };
  const setActive = (idx: number) => {
    if (idx === active) return;
    active = idx;
    cards.forEach((c, i) => {
      const on = i === active;
      const r = on ? 0 : active >= 0 && active < n ? rot[i] + (i < active ? -3 : 3) : active === n ? rot[i] * 0.7 : rot[i];
      gsap.to(c, { rotation: r, scale: on ? 1.06 : 1, duration: 0.55, ease: "back.out(1.6)", overwrite: "auto" });
    });
    gsap.to(center, {
      scale: active >= 0 && active < n ? 0.97 : active === n ? 1.02 : 1,
      duration: 0.55,
      ease: "back.out(1.6)",
      overwrite: "auto",
    });
    render();
  };

  els.forEach((el, i) => el.addEventListener("mouseenter", () => mq(POINTER) && setActive(i)));
  fan.addEventListener("mouseover", (e) => {
    if (mq(POINTER) && !(e.target as Element).closest("[data-fan-card], [data-fan-center]")) setActive(-1);
  });
  fan.addEventListener("mousemove", (e) => {
    if (!mq(POINTER)) return;
    const r = fan.getBoundingClientRect();
    px = ((e.clientX - r.left) / r.width) * 2 - 1;
    py = ((e.clientY - r.top) / r.height) * 2 - 1;
    render();
  });
  fan.addEventListener("mouseleave", () => {
    px = py = 0;
    setActive(-1);
    render();
  });
}

/**
 * fan-emerge — tabletă/mobil (fără hover): cardurile „ies” din spatele
 * imaginii spre locul lor, apoi plutesc lent în buclă, iar la scroll
 * evantaiul se deschide (cardurile se depărtează de imagine).
 * Opțiuni: data-wm-delay="0" (secunde, ex. după un loader)
 */
export function fanEmerge(fan: HTMLElement) {
  const cards = $$("[data-fan-card]", fan).filter((c) => c.offsetParent !== null);
  const center = $("[data-fan-center]", fan);
  if (!center || !cards.length) return;
  const rot = cards.map((c) => cssRot(c));
  gsap.set(cards, { rotation: (i: number) => rot[i] });
  const fr = fan.getBoundingClientRect();
  const cx = fr.left + fr.width / 2;
  gsap.fromTo(
    cards,
    {
      x: (i: number) => pullTo(cards[i], center).x,
      y: (i: number) => pullTo(cards[i], center).y,
      scale: 0.55,
      rotation: 0,
      autoAlpha: 0,
    },
    {
      x: 0,
      y: 0,
      scale: 1,
      rotation: (i: number) => rot[i],
      autoAlpha: 1,
      duration: 1,
      ease: "back.out(1.3)",
      stagger: 0.07,
      delay: opt(fan, "delay", 0),
      onComplete: () => {
        cards.forEach((c, i) => {
          gsap.to(c, {
            y: i % 2 ? -5 : 5,
            rotation: rot[i] + (i % 2 ? 1.5 : -1.5),
            duration: 2.4 + (i % 3) * 0.5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
          const r = c.getBoundingClientRect();
          gsap.to(c, {
            xPercent: (r.left + r.width / 2 < cx ? -1 : 1) * 16,
            ease: "none",
            scrollTrigger: { trigger: fan, start: "top 45%", end: "bottom top", scrub: 0.6 },
          });
        });
      },
    },
  );
}

export function fan(el: HTMLElement) {
  if (mq(POINTER)) fanHover(el);
  else if (!mq(DESKTOP)) fanEmerge(el);
}

/* ─────────────────────────── slider-tilt ───────────────────────────
 * <ul data-motion="slider-tilt" class="wm-slider">        ← lista derulabilă
 *   <li class="wm-slide">                                  ← slotul (snap, NU se rotește)
 *     <div data-slide-card> … </div>                       ← cardul (se rotește)
 *   </li> …
 * </ul>
 * Rotirea depinde de poziție: cardul din stânga e aproape drept, spre dreapta
 * tot mai rotit, în afara ecranului și mai mult. Legat 1:1 de scroll — când
 * sliderul se oprește, nu mai rulează nimic.
 * Opțiuni: data-wm-min="1.5" data-wm-edge="6" data-wm-max="9" (grade)
 */
export function sliderTilt(track: HTMLElement) {
  const cards = $$("[data-slide-card]", track);
  if (!cards.length) return;
  const MIN = opt(track, "min", 1.5);
  const EDGE = opt(track, "edge", 6);
  const MAX = opt(track, "max", 9);
  const tilt = (card: HTMLElement, view: DOMRect) => {
    const r = (card.parentElement ?? card).getBoundingClientRect();
    const t = (r.left - view.left) / Math.max(1, view.width);
    if (t <= 0) return MIN;
    if (t <= 1) return MIN + (EDGE - MIN) * t;
    return Math.min(MAX, EDGE + (MAX - EDGE) * (t - 1) * 2);
  };
  const set = cards.map((c) => gsap.quickSetter(c, "rotation", "deg"));
  const view0 = track.getBoundingClientRect();
  const start = cards.map((c) => tilt(c, view0));

  let raf = 0;
  const update = () => {
    raf = 0;
    const view = track.getBoundingClientRect();
    cards.forEach((c, i) => set[i](tilt(c, view)));
  };
  const live = () => {
    track.addEventListener("scroll", () => (raf ||= requestAnimationFrame(update)), { passive: true });
    window.addEventListener("resize", () => (raf ||= requestAnimationFrame(update)));
    update();
  };
  /* Lista nu are voie să se deruleze vertical (iOS o face uneori). */
  track.addEventListener("scroll", () => track.scrollTop && (track.scrollTop = 0), { passive: true });

  /* Intrare care NU iese din cutia sliderului: vin din dreapta, ușor
     micșorate, și se rotesc în poziție. */
  gsap.set(cards, { x: 140, scale: 0.86, rotation: (i: number) => start[i] + 7 });
  onEnter(track, () =>
    gsap.to(cards, {
      x: 0,
      scale: 1,
      rotation: (i: number) => start[i],
      duration: 0.9,
      ease: "back.out(1.4)",
      stagger: 0.08,
      onComplete: live,
    }),
  );
}

/* ──────────────────────────── pin-cards ────────────────────────────
 * <section data-motion="pin-cards">
 *   <div data-pin-area class="wm-pin-area">        ← zona cardurilor (position: relative)
 *     <div data-card style="--r: 6deg; left: 9%; top: 14em"> … </div> …
 *   </div>
 * </section>
 * Desktop: secțiunea se fixează, iar la fiecare pas de scroll intră din jos
 * câte un card — deja rotit — și se oprește lin (fără recul la final).
 * Mobil: fără fixare, fiecare card urcă rotit, legat de scroll.
 * Pe desktop cardurile sunt centrate pe punctul (left, top): translate(-50%,-50%).
 */
export function pinCards(sec: HTMLElement) {
  const area = $("[data-pin-area]", sec);
  const cards = $$("[data-card]", sec);
  if (!area || !cards.length) return;
  const rs = cards.map((c) => cssRot(c));
  if (mq(DESKTOP)) {
    gsap.set(cards, { xPercent: -50, yPercent: -50, rotation: (i: number) => rs[i] });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: area,
        start: "center 55%",
        end: () => `+=${window.innerHeight * opt(sec, "length", 1.8)}`,
        pin: sec,
        pinSpacing: true, // obligatoriu dacă părintele e flex
        scrub: 0.6,
        anticipatePin: 1,
      },
    });
    cards.forEach((c, i) => {
      tl.fromTo(
        c,
        { y: () => window.innerHeight * 0.85, rotation: rs[i] },
        { y: 0, rotation: rs[i], duration: 1, ease: "power2.out" },
        i * 0.8,
      );
    });
    tl.to({}, { duration: 0.4 });
  } else {
    cards.forEach((c, i) => {
      const late = i % 2 === 1;
      gsap.fromTo(
        c,
        { y: 160, rotation: rs[i] },
        {
          y: 0,
          rotation: rs[i],
          ease: "power2.out",
          scrollTrigger: {
            trigger: c,
            start: late ? "top 84%" : "top 90%",
            end: late ? "top 42%" : "top 50%",
            scrub: 0.6,
          },
        },
      );
    });
  }
}

/* ──────────────────────────── fly-cards ────────────────────────────
 * <section data-motion="fly-cards">
 *   <ol data-fly-area> <li data-card style="--r: 3deg; …"> … </li> … </ol>
 * </section>
 * Desktop: cardurile zboară alternativ din stânga/dreapta (rotite ±25°,
 * mărite 1.15) și aterizează în poziție cu un mic recul; primul zboară deja
 * cât secțiunea urcă (zona nu pare goală), restul cu secțiunea fixată.
 * Un card cu [data-fly-accent] primește o umbră mai mare o clipă la aterizare.
 * Mobil: o coloană, fiecare card zboară lent, legat de scroll.
 */
export function flyCards(sec: HTMLElement) {
  const area = $("[data-fly-area]", sec);
  const cards = $$("[data-card]", sec);
  if (!area || !cards.length) return;
  const rs = cards.map((c) => cssRot(c));
  if (mq(DESKTOP)) {
    gsap.set(cards, { xPercent: -50, yPercent: -50 });
    const from = (i: number) => {
      const left = i % 2 === 0;
      return [
        { x: () => (left ? -1 : 1) * window.innerWidth * 0.62, rotation: left ? -25 : 25, scale: 1.15 },
        { x: 0, rotation: rs[i], scale: 1, duration: 1, ease: "back.out(1.4)" },
      ] as const;
    };
    const [f0, t0] = from(0);
    gsap
      .timeline({ scrollTrigger: { trigger: area, start: "top 95%", end: "center center", scrub: 0.6 } })
      .fromTo(cards[0], f0, t0, 0)
      .fromTo(cards[0], { y: () => window.innerHeight * 0.6 }, { y: 0, duration: 1, ease: "power2.out" }, 0);
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: area,
        start: "center center",
        end: () => `+=${window.innerHeight * opt(sec, "length", 1.8)}`,
        pin: sec,
        pinSpacing: true,
        scrub: 0.6,
        anticipatePin: 1,
      },
    });
    cards.forEach((c, i) => {
      if (i === 0) return;
      const t = (i - 1) * 0.9;
      const [f, to] = from(i);
      tl.fromTo(c, f, to, t).fromTo(c, { y: () => window.innerHeight * 0.75 }, { y: 0, duration: 1, ease: "power2.out" }, t);
      if (c.hasAttribute("data-fly-accent")) {
        const base = getComputedStyle(c).boxShadow;
        tl.to(c, { boxShadow: "0 48px 100px rgba(0,0,0,0.32)", duration: 0.2 }, t + 0.85).to(
          c,
          { boxShadow: base, duration: 0.35 },
          t + 1.05,
        );
      }
    });
    tl.to({}, { duration: 0.4 });
  } else {
    cards.forEach((c, i) => {
      const left = i % 2 === 0;
      gsap
        .timeline({ scrollTrigger: { trigger: c, start: "top 90%", end: "top 30%", scrub: 0.8 } })
        .fromTo(
          c,
          { x: () => (left ? -1 : 1) * window.innerWidth * 0.75, rotation: left ? -16 : 16, scale: 1.08 },
          { x: 0, rotation: rs[i], scale: 1, duration: 1, ease: "power1.out" },
          0,
        )
        .fromTo(c, { y: 120 }, { y: 0, duration: 1, ease: "sine.out" }, 0);
    });
  }
}

/* ────────────────────────── horizontal-pin ──────────────────────────
 * <section data-motion="horizontal-pin">
 *   <div data-hp-fill></div> <span data-hp-dot style="--c:#f00"></span> …   ← opțional, progres
 *   <div data-hp-viewport class="wm-hp-viewport">
 *     <ol data-hp-track class="wm-hp-track"> <li data-hp-step> … </li> … </ol>
 *   </div>
 * </section>
 * Desktop: secțiunea se fixează și pașii trec orizontal; linia de progres
 * (--p de la 0 la 1) avansează, iar punctele primesc .is-on pe rând.
 * Mobil: rândul de pași se derulează cu degetul, progresul urmează derularea.
 */
export function horizontalPin(sec: HTMLElement) {
  const vp = $("[data-hp-viewport]", sec);
  const track = $("[data-hp-track]", sec);
  if (!vp || !track) return;
  const fill = $("[data-hp-fill]", sec);
  const dots = $$("[data-hp-dot]", sec);
  const steps = $$("[data-hp-step]", sec);
  const progress = (p: number) => {
    fill?.style.setProperty("--p", String(p));
    dots.forEach((d, i) => d.classList.toggle("is-on", p >= i / Math.max(1, dots.length - 1) - 0.01));
  };
  progress(0);
  if (mq(DESKTOP)) {
    vp.classList.add("is-pinned");
    const dist = () => Math.max(0, track.offsetWidth - vp.clientWidth);
    gsap.to(track, {
      x: () => -dist(),
      ease: "none",
      scrollTrigger: {
        trigger: sec,
        pin: true,
        pinSpacing: true,
        start: () => (sec.offsetHeight > window.innerHeight ? "bottom bottom" : "top top"),
        end: () => `+=${dist()}`,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => progress(self.progress),
      },
    });
    gsap.set(steps, { y: 90 });
    onEnter(vp, () => gsap.to(steps, { y: 0, duration: 0.9, ease: EASE, stagger: 0.08 }), "top 85%");
  } else {
    vp.addEventListener("scroll", () => progress(vp.scrollLeft / Math.max(1, vp.scrollWidth - vp.clientWidth)), {
      passive: true,
    });
  }
}

export function initCards(scope: ParentNode = document) {
  $$("[data-motion='fan']", scope).forEach(fan);
  $$("[data-motion='fan-hover']", scope).forEach((el) => mq(POINTER) && fanHover(el));
  $$("[data-motion='fan-emerge']", scope).forEach(fanEmerge);
  $$("[data-motion='slider-tilt']", scope).forEach(sliderTilt);
  $$("[data-motion='pin-cards']", scope).forEach(pinCards);
  $$("[data-motion='fly-cards']", scope).forEach(flyCards);
  $$("[data-motion='horizontal-pin']", scope).forEach(horizontalPin);
}

