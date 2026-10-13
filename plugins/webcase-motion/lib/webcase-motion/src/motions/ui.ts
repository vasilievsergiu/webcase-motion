import Lenis from "lenis";
import { gsap, ScrollTrigger, root, $, $$, mq, opt } from "../core/env";
import { DESKTOP, POINTER } from "../core/tokens";

/* ───────────────────────────── smooth-scroll ─────────────────────────────
 * Scroll lin (Lenis), DOAR pe desktop. Linkurile-ancoră (href="#…") derulează
 * lin, cu loc pentru o bară fixă. Se pornește din initMotion({ smooth: true }).
 */
let lenis: Lenis | null = null;
export const getLenis = () => lenis;

export function smoothScroll(anchorOffset = 88) {
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
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.matchMedia(DESKTOP).addEventListener("change", sync);
  sync();

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented) return;
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href")!.slice(1);
    const target = id === "top" || id === "" ? document.body : document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = mq("(min-width: 768px)") ? -anchorOffset : -8;
    if (lenis) lenis.scrollTo(id === "top" ? 0 : target, { offset, duration: 1.4 });
    else window.scrollTo({ top: id === "top" ? 0 : target.getBoundingClientRect().top + scrollY + offset, behavior: "smooth" });
  });
}

/* ───────────────────────────── marquee ─────────────────────────────
 * <div data-motion="marquee" class="wm-marquee">
 *   <div data-marquee-track class="wm-marquee__track"> elemente… </div>
 * </div>
 * Bandă care rulează continuu; își accelerează viteza după viteza scroll-ului
 * și își schimbă direcția la scroll în sus. Conținutul se dublează automat.
 * Opțiuni: data-wm-speed="40" (px/s în repaus)
 */
export function marquee(el: HTMLElement) {
  const track = $("[data-marquee-track]", el);
  if (!track) return;
  const items = Array.from(track.children);
  const copies = Math.max(2, Math.ceil((window.innerWidth * 2) / Math.max(1, track.scrollWidth)));
  for (let c = 0; c < copies; c++)
    items.forEach((it) => {
      const k = it.cloneNode(true) as HTMLElement;
      k.setAttribute("aria-hidden", "true");
      track.append(k);
    });
  let period = 0;
  const measure = () => {
    const first = track.children[0] as HTMLElement;
    const twin = track.children[items.length] as HTMLElement;
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
    pos += (speed * dt) / 1000;
    if (!period) return;
    const p = ((pos % period) + period) % period;
    track.style.transform = `translate3d(${-p}px,0,0)`;
  });
}

/* ───────────────────────────── marquee-css ─────────────────────────────
 * <div data-motion="marquee-css" class="wm-marquee-css">
 *   <ul class="wm-marquee-css__track"> <li>…</li> … </ul>
 * </div>
 * Variantă simplă, doar CSS (ideală pe mobil, pentru un rând de fapte scurte):
 * un singur rând care rulează continuu, cu marginile estompate. JS doar dublează
 * conținutul. Viteza: --wm-marquee-duration (implicit 28s).
 */
export function marqueeCss(el: HTMLElement) {
  const track = el.querySelector<HTMLElement>(".wm-marquee-css__track") ?? (el.firstElementChild as HTMLElement);
  if (!track || track.dataset.wmDup) return;
  track.dataset.wmDup = "1";
  Array.from(track.children).forEach((it) => {
    const k = it.cloneNode(true) as HTMLElement;
    k.setAttribute("aria-hidden", "true");
    k.classList.add("is-dup");
    track.append(k);
  });
}

/* ───────────────────────────── topbar-glass ─────────────────────────────
 * <div data-motion="topbar-glass" class="wm-topbar" inert> … </div>
 * Bară fixă cu fundal „sticlă”: ascunsă la scroll în jos, revine la scroll în
 * sus, doar după primul ecran. (Pe mobil o ascundem din CSS, dacă e cazul.)
 */
export function topbarGlass(bar: HTMLElement) {
  let shown = false;
  let lastY = scrollY;
  const set = (v: boolean) => {
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
    { passive: true },
  );
}

/* ───────────────────────────── dots-cursor ─────────────────────────────
 * <section data-motion="dots-cursor"> … </section>
 * O rețea discretă de puncte în fundalul secțiunii; punctele de lângă cursor
 * se aprind în culori (gradient de la stânga la dreapta), cresc și se dau ușor
 * la o parte. Doar desktop cu mouse. Desenat pe <canvas>, rulează doar cât e
 * nevoie (mouse în secțiune sau încă se liniștește) și cât secțiunea e în ecran.
 * Opțiuni: data-wm-from="#ff4365" data-wm-to="#146ef5" data-wm-gap="26"
 *          data-wm-radius="170" data-wm-base="rgba(255,255,255,0.1)"
 */
export function dotsCursor(sec: HTMLElement) {
  if (!mq(POINTER)) return;
  const canvas = document.createElement("canvas");
  canvas.className = "wm-dots";
  canvas.setAttribute("aria-hidden", "true");
  sec.prepend(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = hex(opt(sec, "from", "#ff4365"));
  const B = hex(opt(sec, "to", "#146ef5"));
  const GAP = opt(sec, "gap", 26);
  const R = opt(sec, "radius", 170);
  const BASE = opt(sec, "base", "rgba(255,255,255,0.1)");
  let w = 0;
  let h = 0;
  let dpr = 1;
  let dots: { x: number; y: number; k: number }[] = [];
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
    const ox = (w % GAP) / 2;
    for (let y = GAP / 2; y < h; y += GAP) for (let x = ox; x < w; x += GAP) dots.push({ x, y, k: 0 });
    draw();
  };
  function draw() {
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, w, h);
    let busy = false;
    for (const d of dots) {
      const dx = d.x - m.x;
      const dy = d.y - m.y;
      const dist = Math.hypot(dx, dy);
      const target = m.on && dist < R ? Math.pow(1 - dist / R, 2) : 0;
      d.k += (target - d.k) * 0.18;
      if (Math.abs(target - d.k) > 0.004) busy = true;
      const k = d.k;
      const push = k * 12;
      const px = dist > 0.01 ? d.x + (dx / dist) * push : d.x;
      const py = dist > 0.01 ? d.y + (dy / dist) * push : d.y;
      if (k < 0.01) {
        ctx!.fillStyle = BASE;
        ctx!.fillRect(px - 1, py - 1, 2, 2);
      } else {
        const t = d.x / w;
        const c = A.map((a, i) => Math.round(a + (B[i] - a) * t));
        ctx!.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.1 + 0.9 * k})`;
        const s = 2 + 4 * k;
        ctx!.beginPath();
        ctx!.roundRect(px - s / 2, py - s / 2, s, s, s * 0.3);
        ctx!.fill();
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

/* ───────────────────────────── accordion ─────────────────────────────
 * <div data-motion="accordion">
 *   <details class="wm-acc"> <summary>Întrebare <span class="wm-acc__icon"></span></summary>
 *     <div class="wm-acc__body"><p>Răspuns</p></div> </details> …
 * </div>
 * Înălțime animată (0,4s), „+” se rotește în „−”, o singură întrebare deschisă.
 */
export function accordion(box: HTMLElement) {
  const items = $$<HTMLDetailsElement>("details", box);
  const body = (it: HTMLElement) => it.querySelector<HTMLElement>(".wm-acc__body") ?? (it.lastElementChild as HTMLElement);
  const close = (it: HTMLDetailsElement) => {
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
        },
      },
    );
  };
  const open = (it: HTMLDetailsElement) => {
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

/* ───────────────────────────── countdown ─────────────────────────────
 * <div data-motion="countdown" data-wm-deadline="2026-12-31T18:00:00+02:00" hidden>
 *   <span data-cd="d">00</span> <span data-cd="h">00</span>
 *   <span data-cd="m">00</span> <span data-cd="s">00</span>
 * </div>
 * Countdown live; cifrele noi intră discret de jos (slide). După expirare
 * blocul se ascunde și pe document se emite evenimentul „wm:countdown-end”.
 */
export function countdown(el: HTMLElement) {
  const deadline = new Date(opt(el, "deadline", "")).getTime();
  if (!Number.isFinite(deadline)) return;
  const parts: Record<string, HTMLElement | null> = {};
  ["d", "h", "m", "s"].forEach((k) => (parts[k] = el.querySelector(`[data-cd="${k}"]`)));
  const pad = (n: number) => String(n).padStart(2, "0");
  let timer = 0;
  const tick = () => {
    const left = deadline - Date.now();
    if (left <= 0) {
      el.hidden = true;
      clearInterval(timer);
      document.dispatchEvent(new CustomEvent("wm:countdown-end", { detail: el }));
      return;
    }
    const s = Math.floor(left / 1000);
    const v: Record<string, number> = { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
    for (const k in v) {
      const n = parts[k];
      if (n && n.textContent !== pad(v[k])) {
        n.textContent = pad(v[k]);
        if (!el.hidden)
          n.animate([{ transform: "translateY(45%)", opacity: 0 }, { transform: "none", opacity: 1 }], {
            duration: 380,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          });
      }
    }
    el.hidden = false;
  };
  tick();
  timer = window.setInterval(tick, 1000);
}

/* ───────────────────────────── loader ─────────────────────────────
 * <div data-motion="loader" class="wm-loader" aria-hidden="true">
 *   <div class="wm-loader__inner">
 *     <span class="wm-loader__tag">Numele site-ului</span>        ← opțional
 *     <span class="wm-loader__num"><span data-loader-num>0</span>%</span>
 *     <span class="wm-loader__bar"><span data-loader-bar></span></span>
 *   </div>
 * </div>
 * Ecran negru complet; numără până la 100 (sau data-wm-to), bara se umple,
 * conținutul iese în sus, apoi foaia urcă (colțurile de jos se rotunjesc doar
 * la urcare). O singură dată pe sesiune. Returnează un Promise care se rezolvă
 * când foaia a trecut de partea de sus — atunci pornește intrarea hero-ului.
 */
export function loader(): Promise<void> {
  const el = $("[data-motion='loader']");
  /* Fără loader în pagină, dar cu rândul „wm-loading” rămas în snippet:
     scoatem clasa, altfel pagina rămâne blocată (overflow: hidden). */
  if (!el) {
    root.classList.remove("wm-loading");
    lenis?.start();
    return Promise.resolve();
  }
  if (!root.classList.contains("wm-loading")) return Promise.resolve();
  const to = opt(el, "to", 100);
  const num = $("[data-loader-num]", el);
  const bar = $("[data-loader-bar]", el);
  const inner = el.firstElementChild as HTMLElement | null;
  return new Promise((resolve) => {
    const o = { v: 0 };
    gsap
      .timeline()
      .to(o, { v: to, duration: 0.65, ease: "power2.inOut", onUpdate: () => num && (num.textContent = String(Math.round(o.v))) }, 0)
      .to(bar, { scaleX: 1, duration: 0.65, ease: "power2.inOut" }, 0)
      .to(inner, { y: -24, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 0.7)
      .to(el, { borderBottomLeftRadius: 40, borderBottomRightRadius: 40, duration: 0.25, ease: "power2.out" }, 0.8)
      .to(el, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, 0.8)
      /* Intrarea paginii pornește după ce foaia a trecut de partea de sus
         (care se descoperă ultima) — altfel titlul se animă sub loader. */
      .add(() => resolve(), 1.3)
      .add(() => {
        root.classList.remove("wm-loading");
        try {
          sessionStorage.setItem("wm-loader", "1");
        } catch {}
        lenis?.start();
        gsap.set(el, { clearProps: "all" });
      });
  });
}

export function initUi(scope: ParentNode = document) {
  $$("[data-motion='marquee']", scope).forEach(marquee);
  $$("[data-motion='marquee-css']", scope).forEach(marqueeCss);
  $$("[data-motion='topbar-glass']", scope).forEach(topbarGlass);
  $$("[data-motion='dots-cursor']", scope).forEach(dotsCursor);
  $$("[data-motion='accordion']", scope).forEach(accordion);
  $$("[data-motion='countdown']", scope).forEach(countdown);
}
