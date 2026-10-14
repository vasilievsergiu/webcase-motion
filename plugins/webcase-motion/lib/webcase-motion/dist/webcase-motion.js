// src/core/env.ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });
var root = document.documentElement;
var reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var mq = (q) => window.matchMedia(q).matches;
var $ = (s, c = document) => c.querySelector(s);
var $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
function opt(el, name, fallback) {
  const raw = el.getAttribute(`data-wm-${name}`);
  if (raw === null || raw === "") return fallback;
  if (typeof fallback === "number") {
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
  }
  return raw;
}
function onEnter(trigger, fn, start = "top 78%") {
  if (!trigger) return;
  ScrollTrigger.create({ trigger, start, once: true, onEnter: fn });
}
var cssRot = (el) => parseFloat(getComputedStyle(el).getPropertyValue("--r")) || 0;

// src/core/tokens.ts
var EASE = "power3.out";
var EXPO = "expo.out";
var LAND = "back.out(1.4)";
var DESKTOP = "(min-width: 992px)";
var POINTER = "(min-width: 992px) and (hover: hover) and (pointer: fine)";
var WIPE_UP = { y: 24, clipPath: "inset(0% 0% 100% 0%)" };
var WIPE_UP_TO = { y: 0, clipPath: "inset(-40% -10% -40% -10%)", clearProps: "clipPath" };
var WIPE_LR = { x: -16, clipPath: "inset(-20% 100% -20% 0%)" };
var WIPE_LR_TO = { x: 0, clipPath: "inset(-20% -5% -20% 0%)", clearProps: "clipPath" };

// src/core/split.ts
function splitBroken(el, lines) {
  const cs = getComputedStyle(el);
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
  return lines.some((l) => l.offsetHeight > lh * 1.5);
}
function safeSplit(el, vars) {
  return SplitText.create(el, { reduceWhiteSpace: false, ...vars });
}
var revertLater = (self) => setTimeout(() => self.revert(), 0);

// src/motions/text.ts
function wholeReveal(el, start) {
  return gsap.fromTo(el, WIPE_UP, {
    ...WIPE_UP_TO,
    duration: 0.9,
    ease: EASE,
    scrollTrigger: { trigger: el, start, once: true }
  });
}
function splitLines(el) {
  const start = opt(el, "start", "top 82%");
  safeSplit(el, {
    type: "lines",
    mask: "lines",
    linesClass: "wm-line",
    autoSplit: true,
    onSplit: (self) => {
      if (splitBroken(el, self.lines)) {
        revertLater(self);
        return wholeReveal(el, start);
      }
      return gsap.from(self.lines, {
        yPercent: 125,
        duration: 0.9,
        ease: EXPO,
        stagger: 0.1,
        scrollTrigger: { trigger: el, start, once: true }
      });
    }
  });
}
function splitSides(el) {
  const shift = opt(el, "shift", 40);
  safeSplit(el, {
    type: "lines",
    linesClass: "wm-line",
    autoSplit: true,
    onSplit: (self) => {
      if (splitBroken(el, self.lines)) {
        revertLater(self);
        return wholeReveal(el, "top 80%");
      }
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 80%", end: "center 40%", scrub: 1.2 }
      });
      tl.fromTo(
        self.lines,
        { xPercent: (i) => i % 2 ? shift : -shift },
        { xPercent: 0, duration: 1, ease: "sine.out" },
        0
      ).fromTo(self.lines, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, 0);
      return tl;
    }
  });
}
function wordsScrub(el) {
  const from = opt(el, "from", 0.15);
  const start = opt(el, "start", "top 85%");
  const end = opt(el, "end", "top 40%");
  safeSplit(el, {
    type: "words",
    autoSplit: true,
    onSplit: (self) => gsap.fromTo(
      self.words,
      { opacity: from },
      { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start, end, scrub: true } }
    )
  });
}
function revealWipe(els) {
  if (!els.length) return;
  gsap.set(els, WIPE_UP);
  els.forEach((el) => {
    gsap.to(el, {
      ...WIPE_UP_TO,
      duration: 0.8,
      ease: EASE,
      scrollTrigger: { trigger: el, start: opt(el, "start", "top 80%"), once: true }
    });
  });
}
function rowsWipe(el) {
  const rows = Array.from(el.children);
  if (!rows.length) return;
  const mode = opt(el, "mode", "scroll");
  if (mode === "enter") {
    gsap.set(rows, { "--wm-ln": 0 });
    const marks = rows.map((r) => r.querySelector("[data-wm-mark]"));
    const texts = rows.map((r) => r.querySelector("[data-wm-text]") ?? r);
    marks.forEach((m) => m && gsap.set(m, { scale: 0 }));
    texts.forEach((t, i) => t !== rows[i] && gsap.set(t, WIPE_LR));
    const tl2 = gsap.timeline({ paused: true, delay: opt(el, "delay", 0.2) });
    rows.forEach((r, i) => {
      const t = i * 0.16;
      tl2.to(r, { "--wm-ln": 1, duration: 0.6, ease: "power2.inOut" }, t);
      if (marks[i]) tl2.to(marks[i], { scale: 1, duration: 0.5, ease: "back.out(2.5)" }, t + 0.12);
      if (texts[i] !== r) tl2.to(texts[i], { ...WIPE_LR_TO, duration: 0.6, ease: EASE }, t + 0.15);
    });
    gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", once: true, onEnter: () => tl2.play() } });
    return;
  }
  const tl = gsap.timeline({
    scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 45%", scrub: 0.8 }
  });
  rows.forEach((row, i) => {
    tl.fromTo(
      row,
      { clipPath: "inset(-10% 100% -10% 0%)" },
      { clipPath: "inset(-10% 0% -10% 0%)", duration: 1, ease: "power1.inOut" },
      i * 0.6
    );
    const arrow = row.querySelector("[data-wm-arrow]");
    if (arrow) tl.fromTo(arrow, { x: -8 }, { x: 0, duration: 0.6, ease: "power2.out" }, i * 0.6 + 0.3);
  });
}
function landFromRight(el) {
  const host = el.parentElement;
  if (!host) return;
  el.style.display = "inline-block";
  const lead = el.previousSibling;
  let leadWrap = null;
  if (lead && lead.nodeType === 3 && lead.textContent?.trim()) {
    leadWrap = document.createElement("span");
    leadWrap.style.display = "inline-block";
    host.insertBefore(leadWrap, lead);
    leadWrap.textContent = (lead.textContent || "").trimEnd();
    lead.textContent = " ";
    gsap.set(leadWrap, WIPE_UP);
  }
  const rot = opt(el, "rotate", 8);
  gsap.set(el, { x: () => window.innerWidth * 0.6, rotation: rot });
  gsap.timeline({ scrollTrigger: { trigger: host, start: "top 80%", once: true } }).to(leadWrap ?? {}, { ...WIPE_UP_TO, duration: 0.9, ease: EXPO }).to(el, { x: 0, rotation: 0, duration: 1, ease: "back.out(1.2)" }, 0.45);
}
var SWAP_OUT = "cubic-bezier(0.5, 0, 0.75, 0)";
var SWAP_IN = "cubic-bezier(0.2, 0.7, 0.1, 1)";
function textSwap(el) {
  const phrases = opt(el, "lines", "").split(";;").map((p) => p.split("|").map((r) => r.trim())).filter((p) => p.join("").length);
  if (phrases.length < 2) return;
  const interval = opt(el, "interval", 4.8) * 1e3;
  const render = (rows) => {
    el.replaceChildren();
    const chars2 = [];
    rows.forEach((row, r) => {
      row.split(/\s+/).forEach((word, wi, words) => {
        const w = document.createElement("span");
        w.className = "wm-swap-w";
        for (const c of word) {
          const s = document.createElement("span");
          s.className = "wm-swap-ch";
          s.textContent = c;
          w.append(s);
          chars2.push(s);
        }
        el.append(w);
        if (wi < words.length - 1) el.append(" ");
      });
      if (r < rows.length - 1) el.append(document.createElement("br"));
    });
    el.setAttribute("aria-label", rows.join(" "));
    return chars2;
  };
  const reserve = () => {
    el.style.minHeight = "";
    let h = 0;
    phrases.forEach((p) => {
      render(p);
      h = Math.max(h, el.offsetHeight);
    });
    el.style.minHeight = `${h}px`;
  };
  let i = 0;
  reserve();
  let chars = render(phrases[0]);
  addEventListener("resize", () => {
    reserve();
    chars = render(phrases[i]);
  });
  const hidden = { opacity: 0, filter: "blur(14px)", transform: "translateY(0.12em)" };
  const shown = { opacity: 1, filter: "blur(0px)", transform: "none" };
  let busy = false;
  const next = async () => {
    if (busy || document.hidden) return;
    busy = true;
    await Promise.all(
      chars.map(
        (c, k) => c.animate([shown, { ...hidden, transform: "translateY(-0.12em)" }], {
          duration: 420,
          delay: k * 18,
          easing: SWAP_OUT,
          fill: "forwards"
        }).finished
      )
    );
    i = (i + 1) % phrases.length;
    chars = render(phrases[i]);
    chars.forEach(
      (c, k) => c.animate([hidden, shown], { duration: 700, delay: k * 28, easing: SWAP_IN, fill: "backwards" })
    );
    busy = false;
  };
  let timer = 0;
  new IntersectionObserver(([e]) => {
    clearInterval(timer);
    if (e.isIntersecting) timer = window.setInterval(next, interval);
  }).observe(el);
}
function initText(scope = document) {
  $$("[data-motion='split-lines']", scope).forEach(splitLines);
  $$("[data-motion='split-sides']", scope).forEach(splitSides);
  $$("[data-motion='words-scrub']", scope).forEach(wordsScrub);
  revealWipe($$("[data-motion='reveal-wipe']", scope));
  $$("[data-motion='rows-wipe']", scope).forEach(rowsWipe);
  $$("[data-motion='land-from-right']", scope).forEach(landFromRight);
  $$("[data-motion='text-swap']", scope).forEach(textSwap);
}

// src/motions/cards.ts
function pullTo(card, center) {
  const a = card.getBoundingClientRect();
  const b = center.getBoundingClientRect();
  return {
    x: (b.left + b.width / 2 - (a.left + a.width / 2)) * 0.85,
    y: (b.top + b.height / 2 - (a.top + a.height / 2)) * 0.85
  };
}
function fanHover(fan2) {
  const cards = $$("[data-fan-card]", fan2).filter((c) => c.offsetParent !== null);
  const center = $("[data-fan-center]", fan2);
  if (!center || !cards.length) return;
  const rot = cards.map((c) => cssRot(c));
  const els = [...cards, center];
  const n = cards.length;
  const depth = els.map((_, i) => i === n ? 4 : i === 0 || i === n - 1 ? 12 : 8);
  const qx = els.map((el) => gsap.quickTo(el, "x", { duration: 0.6, ease: EASE }));
  const qy = els.map((el) => gsap.quickTo(el, "y", { duration: 0.6, ease: EASE }));
  const side = (i) => {
    const a = cards[i].getBoundingClientRect();
    const b = center.getBoundingClientRect();
    return a.left + a.width / 2 < b.left + b.width / 2 ? -1 : 1;
  };
  let active = -1;
  let px = 0;
  let py = 0;
  const render = () => {
    const spread = fan2.offsetWidth * 0.035;
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
  const setActive = (idx) => {
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
      overwrite: "auto"
    });
    render();
  };
  els.forEach((el, i) => el.addEventListener("mouseenter", () => mq(POINTER) && setActive(i)));
  fan2.addEventListener("mouseover", (e) => {
    if (mq(POINTER) && !e.target.closest("[data-fan-card], [data-fan-center]")) setActive(-1);
  });
  fan2.addEventListener("mousemove", (e) => {
    if (!mq(POINTER)) return;
    const r = fan2.getBoundingClientRect();
    px = (e.clientX - r.left) / r.width * 2 - 1;
    py = (e.clientY - r.top) / r.height * 2 - 1;
    render();
  });
  fan2.addEventListener("mouseleave", () => {
    px = py = 0;
    setActive(-1);
    render();
  });
}
function fanEmerge(fan2) {
  const cards = $$("[data-fan-card]", fan2).filter((c) => c.offsetParent !== null);
  const center = $("[data-fan-center]", fan2);
  if (!center || !cards.length) return;
  const rot = cards.map((c) => cssRot(c));
  gsap.set(cards, { rotation: (i) => rot[i] });
  const fr = fan2.getBoundingClientRect();
  const cx = fr.left + fr.width / 2;
  gsap.fromTo(
    cards,
    {
      x: (i) => pullTo(cards[i], center).x,
      y: (i) => pullTo(cards[i], center).y,
      scale: 0.55,
      rotation: 0,
      autoAlpha: 0
    },
    {
      x: 0,
      y: 0,
      scale: 1,
      rotation: (i) => rot[i],
      autoAlpha: 1,
      duration: 1,
      ease: "back.out(1.3)",
      stagger: 0.07,
      delay: opt(fan2, "delay", 0),
      onComplete: () => {
        cards.forEach((c, i) => {
          gsap.to(c, {
            y: i % 2 ? -5 : 5,
            rotation: rot[i] + (i % 2 ? 1.5 : -1.5),
            duration: 2.4 + i % 3 * 0.5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
          });
          const r = c.getBoundingClientRect();
          gsap.to(c, {
            xPercent: (r.left + r.width / 2 < cx ? -1 : 1) * 16,
            ease: "none",
            scrollTrigger: { trigger: fan2, start: "top 45%", end: "bottom top", scrub: 0.6 }
          });
        });
      }
    }
  );
}
function fan(el) {
  if (mq(POINTER)) fanHover(el);
  else if (!mq(DESKTOP)) fanEmerge(el);
}
function sliderTilt(track) {
  const cards = $$("[data-slide-card]", track);
  if (!cards.length) return;
  const MIN = opt(track, "min", 1.5);
  const EDGE = opt(track, "edge", 6);
  const MAX = opt(track, "max", 9);
  const tilt = (card, view) => {
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
    track.addEventListener("scroll", () => raf || (raf = requestAnimationFrame(update)), { passive: true });
    window.addEventListener("resize", () => raf || (raf = requestAnimationFrame(update)));
    update();
  };
  track.addEventListener("scroll", () => track.scrollTop && (track.scrollTop = 0), { passive: true });
  gsap.set(cards, { x: 140, scale: 0.86, rotation: (i) => start[i] + 7 });
  onEnter(
    track,
    () => gsap.to(cards, {
      x: 0,
      scale: 1,
      rotation: (i) => start[i],
      duration: 0.9,
      ease: "back.out(1.4)",
      stagger: 0.08,
      onComplete: live
    })
  );
}
function pinCards(sec) {
  const area = $("[data-pin-area]", sec);
  const cards = $$("[data-card]", sec);
  if (!area || !cards.length) return;
  const rs = cards.map((c) => cssRot(c));
  if (mq(DESKTOP)) {
    gsap.set(cards, { xPercent: -50, yPercent: -50, rotation: (i) => rs[i] });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: area,
        start: "center 55%",
        end: () => `+=${window.innerHeight * opt(sec, "length", 1.8)}`,
        pin: sec,
        pinSpacing: true,
        // obligatoriu dacă părintele e flex
        scrub: 0.6,
        anticipatePin: 1
      }
    });
    cards.forEach((c, i) => {
      tl.fromTo(
        c,
        { y: () => window.innerHeight * 0.85, rotation: rs[i] },
        { y: 0, rotation: rs[i], duration: 1, ease: "power2.out" },
        i * 0.8
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
            scrub: 0.6
          }
        }
      );
    });
  }
}
function flyCards(sec) {
  const area = $("[data-fly-area]", sec);
  const cards = $$("[data-card]", sec);
  if (!area || !cards.length) return;
  const rs = cards.map((c) => cssRot(c));
  if (mq(DESKTOP)) {
    gsap.set(cards, { xPercent: -50, yPercent: -50 });
    const from = (i) => {
      const left = i % 2 === 0;
      return [
        { x: () => (left ? -1 : 1) * window.innerWidth * 0.62, rotation: left ? -25 : 25, scale: 1.15 },
        { x: 0, rotation: rs[i], scale: 1, duration: 1, ease: "back.out(1.4)" }
      ];
    };
    const [f0, t0] = from(0);
    gsap.timeline({ scrollTrigger: { trigger: area, start: "top 95%", end: "center center", scrub: 0.6 } }).fromTo(cards[0], f0, t0, 0).fromTo(cards[0], { y: () => window.innerHeight * 0.6 }, { y: 0, duration: 1, ease: "power2.out" }, 0);
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: area,
        start: "center center",
        end: () => `+=${window.innerHeight * opt(sec, "length", 1.8)}`,
        pin: sec,
        pinSpacing: true,
        scrub: 0.6,
        anticipatePin: 1
      }
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
          t + 1.05
        );
      }
    });
    tl.to({}, { duration: 0.4 });
  } else {
    cards.forEach((c, i) => {
      const left = i % 2 === 0;
      gsap.timeline({ scrollTrigger: { trigger: c, start: "top 90%", end: "top 30%", scrub: 0.8 } }).fromTo(
        c,
        { x: () => (left ? -1 : 1) * window.innerWidth * 0.75, rotation: left ? -16 : 16, scale: 1.08 },
        { x: 0, rotation: rs[i], scale: 1, duration: 1, ease: "power1.out" },
        0
      ).fromTo(c, { y: 120 }, { y: 0, duration: 1, ease: "sine.out" }, 0);
    });
  }
}
function horizontalPin(sec) {
  const vp = $("[data-hp-viewport]", sec);
  const track = $("[data-hp-track]", sec);
  if (!vp || !track) return;
  const fill = $("[data-hp-fill]", sec);
  const dots = $$("[data-hp-dot]", sec);
  const steps = $$("[data-hp-step]", sec);
  const progress = (p) => {
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
        start: () => sec.offsetHeight > window.innerHeight ? "bottom bottom" : "top top",
        end: () => `+=${dist()}`,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => progress(self.progress)
      }
    });
    gsap.set(steps, { y: 90 });
    onEnter(vp, () => gsap.to(steps, { y: 0, duration: 0.9, ease: EASE, stagger: 0.08 }), "top 85%");
  } else {
    vp.addEventListener("scroll", () => progress(vp.scrollLeft / Math.max(1, vp.scrollWidth - vp.clientWidth)), {
      passive: true
    });
  }
}
function initCards(scope = document) {
  $$("[data-motion='fan']", scope).forEach(fan);
  $$("[data-motion='fan-hover']", scope).forEach((el) => mq(POINTER) && fanHover(el));
  $$("[data-motion='fan-emerge']", scope).forEach(fanEmerge);
  $$("[data-motion='slider-tilt']", scope).forEach(sliderTilt);
  $$("[data-motion='pin-cards']", scope).forEach(pinCards);
  $$("[data-motion='fly-cards']", scope).forEach(flyCards);
  $$("[data-motion='horizontal-pin']", scope).forEach(horizontalPin);
}

// src/motions/ui.ts
import Lenis from "lenis";
var lenis = null;
var getLenis = () => lenis;
function smoothScroll(anchorOffset = 88) {
  const sync = () => {
    if (mq(DESKTOP) && !lenis) {
      lenis = new Lenis({ lerp: 0.1 });
      lenis.on("scroll", ScrollTrigger.update);
      if (root.classList.contains("wm-loading")) lenis.stop();
    } else if (!mq(DESKTOP) && lenis) {
      lenis.destroy();
      lenis = null;
    }
  };
  gsap.ticker.add((t) => lenis?.raf(t * 1e3));
  gsap.ticker.lagSmoothing(0);
  window.matchMedia(DESKTOP).addEventListener("change", sync);
  sync();
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented) return;
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const target = id === "top" || id === "" ? document.body : document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = mq("(min-width: 768px)") ? -anchorOffset : -8;
    if (lenis) lenis.scrollTo(id === "top" ? 0 : target, { offset, duration: 1.4 });
    else window.scrollTo({ top: id === "top" ? 0 : target.getBoundingClientRect().top + scrollY + offset, behavior: "smooth" });
  });
}
function marquee(el) {
  const track = $("[data-marquee-track]", el);
  if (!track) return;
  const items = Array.from(track.children);
  const copies = Math.max(2, Math.ceil(window.innerWidth * 2 / Math.max(1, track.scrollWidth)));
  for (let c = 0; c < copies; c++)
    items.forEach((it) => {
      const k = it.cloneNode(true);
      k.setAttribute("aria-hidden", "true");
      track.append(k);
    });
  let period = 0;
  const measure = () => {
    const first = track.children[0];
    const twin = track.children[items.length];
    period = twin && first ? twin.offsetLeft - first.offsetLeft : 0;
  };
  measure();
  window.addEventListener("resize", measure);
  document.fonts?.ready.then(measure);
  const base = opt(el, "speed", 40);
  let pos = 0;
  let speed = base;
  let dir = 1;
  let lastY = scrollY;
  gsap.ticker.add((_t, dt) => {
    const dy = scrollY - lastY;
    lastY = scrollY;
    if (dy !== 0) dir = dy > 0 ? 1 : -1;
    const boost = Math.min(Math.abs(dy) * 6, 600);
    speed += (dir * (base + boost) - speed) * 0.08;
    pos += speed * dt / 1e3;
    if (!period) return;
    const p = (pos % period + period) % period;
    track.style.transform = `translate3d(${-p}px,0,0)`;
  });
}
function marqueeCss(el) {
  const track = el.querySelector(".wm-marquee-css__track") ?? el.firstElementChild;
  if (!track || track.dataset.wmDup) return;
  track.dataset.wmDup = "1";
  Array.from(track.children).forEach((it) => {
    const k = it.cloneNode(true);
    k.setAttribute("aria-hidden", "true");
    k.classList.add("is-dup");
    track.append(k);
  });
}
function topbarGlass(bar) {
  let shown = false;
  let lastY = scrollY;
  const set = (v) => {
    if (v === shown) return;
    shown = v;
    bar.classList.toggle("is-shown", v);
    bar.toggleAttribute("inert", !v);
  };
  addEventListener(
    "scroll",
    () => {
      const dy = scrollY - lastY;
      if (Math.abs(dy) < 6) return;
      lastY = scrollY;
      set(scrollY > innerHeight * 0.9 && dy < 0);
    },
    { passive: true }
  );
}
function dotsCursor(sec) {
  if (!mq(POINTER)) return;
  const canvas = document.createElement("canvas");
  canvas.className = "wm-dots";
  canvas.setAttribute("aria-hidden", "true");
  sec.prepend(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const hex = (h2) => [1, 3, 5].map((i) => parseInt(h2.slice(i, i + 2), 16));
  const A = hex(opt(sec, "from", "#ff4365"));
  const B = hex(opt(sec, "to", "#146ef5"));
  const GAP = opt(sec, "gap", 26);
  const R = opt(sec, "radius", 170);
  const BASE = opt(sec, "base", "rgba(255,255,255,0.1)");
  let w = 0;
  let h = 0;
  let dpr = 1;
  let dots = [];
  const m = { x: -9999, y: -9999, tx: -9999, ty: -9999, on: false };
  let raf = 0;
  let visible = false;
  const layout = () => {
    w = sec.clientWidth;
    h = sec.clientHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    dots = [];
    const ox = w % GAP / 2;
    for (let y = GAP / 2; y < h; y += GAP) for (let x = ox; x < w; x += GAP) dots.push({ x, y, k: 0 });
    draw();
  };
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    let busy = false;
    for (const d of dots) {
      const dx = d.x - m.x;
      const dy = d.y - m.y;
      const dist = Math.hypot(dx, dy);
      const target = m.on && dist < R ? Math.pow(1 - dist / R, 2) : 0;
      d.k += (target - d.k) * 0.18;
      if (Math.abs(target - d.k) > 4e-3) busy = true;
      const k = d.k;
      const push = k * 12;
      const px = dist > 0.01 ? d.x + dx / dist * push : d.x;
      const py = dist > 0.01 ? d.y + dy / dist * push : d.y;
      if (k < 0.01) {
        ctx.fillStyle = BASE;
        ctx.fillRect(px - 1, py - 1, 2, 2);
      } else {
        const t = d.x / w;
        const c = A.map((a, i) => Math.round(a + (B[i] - a) * t));
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.1 + 0.9 * k})`;
        const s = 2 + 4 * k;
        ctx.beginPath();
        ctx.roundRect(px - s / 2, py - s / 2, s, s, s * 0.3);
        ctx.fill();
      }
    }
    return busy;
  }
  const loop = () => {
    m.x += (m.tx - m.x) * 0.2;
    m.y += (m.ty - m.y) * 0.2;
    const busy = draw();
    raf = visible && (m.on || busy) ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => {
    if (!raf && visible) raf = requestAnimationFrame(loop);
  };
  sec.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    m.tx = e.clientX - r.left;
    m.ty = e.clientY - r.top;
    if (!m.on) {
      m.x = m.tx;
      m.y = m.ty;
    }
    m.on = true;
    kick();
  });
  sec.addEventListener("mouseleave", () => {
    m.on = false;
    kick();
  });
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) kick();
  }).observe(sec);
  new ResizeObserver(layout).observe(sec);
  layout();
}
function accordion(box) {
  const items = $$("details", box);
  const body = (it) => it.querySelector(".wm-acc__body") ?? it.lastElementChild;
  const close = (it) => {
    it.classList.add("is-closing");
    gsap.fromTo(
      body(it),
      { height: body(it).offsetHeight },
      {
        height: 0,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => {
          it.open = false;
          it.classList.remove("is-closing");
          gsap.set(body(it), { clearProps: "height" });
        }
      }
    );
  };
  const open = (it) => {
    it.open = true;
    gsap.fromTo(body(it), { height: 0 }, { height: "auto", duration: 0.4, ease: "power2.out", clearProps: "height" });
  };
  items.forEach((it) => {
    it.removeAttribute("name");
    it.querySelector("summary")?.addEventListener("click", (e) => {
      e.preventDefault();
      if (it.open && !it.classList.contains("is-closing")) close(it);
      else {
        items.forEach((o) => o !== it && o.open && !o.classList.contains("is-closing") && close(o));
        open(it);
      }
    });
  });
}
function countdown(el) {
  const deadline = new Date(opt(el, "deadline", "")).getTime();
  if (!Number.isFinite(deadline)) return;
  const parts = {};
  ["d", "h", "m", "s"].forEach((k) => parts[k] = el.querySelector(`[data-cd="${k}"]`));
  const pad = (n) => String(n).padStart(2, "0");
  let timer = 0;
  const tick = () => {
    const left = deadline - Date.now();
    if (left <= 0) {
      el.hidden = true;
      clearInterval(timer);
      document.dispatchEvent(new CustomEvent("wm:countdown-end", { detail: el }));
      return;
    }
    const s = Math.floor(left / 1e3);
    const v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    for (const k in v) {
      const n = parts[k];
      if (n && n.textContent !== pad(v[k])) {
        n.textContent = pad(v[k]);
        if (!el.hidden)
          n.animate([{ transform: "translateY(45%)", opacity: 0 }, { transform: "none", opacity: 1 }], {
            duration: 380,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)"
          });
      }
    }
    el.hidden = false;
  };
  tick();
  timer = window.setInterval(tick, 1e3);
}
function loader() {
  const el = $("[data-motion='loader']");
  if (!el) {
    root.classList.remove("wm-loading");
    lenis?.start();
    return Promise.resolve();
  }
  if (!root.classList.contains("wm-loading")) return Promise.resolve();
  const to = opt(el, "to", 100);
  const num = $("[data-loader-num]", el);
  const bar = $("[data-loader-bar]", el);
  const inner = el.firstElementChild;
  return new Promise((resolve) => {
    const o = { v: 0 };
    gsap.timeline().to(o, { v: to, duration: 0.65, ease: "power2.inOut", onUpdate: () => num && (num.textContent = String(Math.round(o.v))) }, 0).to(bar, { scaleX: 1, duration: 0.65, ease: "power2.inOut" }, 0).to(inner, { y: -24, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 0.7).to(el, { borderBottomLeftRadius: 40, borderBottomRightRadius: 40, duration: 0.25, ease: "power2.out" }, 0.8).to(el, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, 0.8).add(() => resolve(), 1.3).add(() => {
      root.classList.remove("wm-loading");
      try {
        sessionStorage.setItem("wm-loader", "1");
      } catch {
      }
      lenis?.start();
      gsap.set(el, { clearProps: "all" });
    });
  });
}
function initUi(scope = document) {
  $$("[data-motion='marquee']", scope).forEach(marquee);
  $$("[data-motion='marquee-css']", scope).forEach(marqueeCss);
  $$("[data-motion='topbar-glass']", scope).forEach(topbarGlass);
  $$("[data-motion='dots-cursor']", scope).forEach(dotsCursor);
  $$("[data-motion='accordion']", scope).forEach(accordion);
  $$("[data-motion='countdown']", scope).forEach(countdown);
}

// src/motions/intro.ts
function intro(scope = document) {
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
          () => (
            /* Plutire foarte lentă (±2px, ±1°), în buclă. */
            gsap.to(el, {
              keyframes: [
                { y: -2, rotation: r - 1, duration: 1.6 + i * 0.3 },
                { y: 2, rotation: r + 1, duration: 3.2 + i * 0.6 },
                { y: 0, rotation: r, duration: 1.6 + i * 0.3 }
              ],
              ease: "sine.inOut",
              repeat: -1
            })
          ),
          at + 0.7
        );
        break;
      }
      default:
        tl.fromTo(el, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: EASE }, at);
    }
  });
  return tl;
}

// src/index.ts
var wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function initMotion(opts = {}) {
  if (!root.classList.contains("wm-anim")) return;
  root.classList.add("wm-ready");
  try {
    await Promise.race([document.fonts?.ready ?? Promise.resolve(), wait(1500)]);
    if (opts.smooth !== false) smoothScroll(opts.anchorOffset);
    initUi();
    await loader();
    intro();
    initText();
    initCards();
    window.addEventListener("load", () => ScrollTrigger.refresh());
  } catch (err) {
    console.error(err);
    root.classList.remove("wm-anim", "wm-loading");
    root.classList.add("wm-intro");
  }
}
export {
  DESKTOP,
  EASE,
  EXPO,
  LAND,
  POINTER,
  ScrollTrigger,
  SplitText,
  WIPE_LR,
  WIPE_LR_TO,
  WIPE_UP,
  WIPE_UP_TO,
  accordion,
  countdown,
  dotsCursor,
  fan,
  fanEmerge,
  fanHover,
  flyCards,
  getLenis,
  gsap,
  horizontalPin,
  initCards,
  initMotion,
  initText,
  initUi,
  intro,
  landFromRight,
  loader,
  marquee,
  marqueeCss,
  pinCards,
  reduced,
  revealWipe,
  rowsWipe,
  sliderTilt,
  smoothScroll,
  splitLines,
  splitSides,
  textSwap,
  topbarGlass,
  wordsScrub
};
