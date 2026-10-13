import { gsap, $$, opt } from "../core/env";
import { EASE, EXPO, WIPE_UP, WIPE_UP_TO, WIPE_LR, WIPE_LR_TO } from "../core/tokens";
import { safeSplit, splitBroken, revertLater } from "../core/split";

/** Apariția textului întreg (fallback): mască de jos în sus, fără fade. */
function wholeReveal(el: HTMLElement, start: string) {
  return gsap.fromTo(el, WIPE_UP, {
    ...WIPE_UP_TO,
    duration: 0.9,
    ease: EASE,
    scrollTrigger: { trigger: el, start, once: true },
  });
}

/**
 * split-lines — rândurile titlului urcă, pe rând, din spatele unei măști.
 * Opțiuni: data-wm-start="top 82%"
 */
export function splitLines(el: HTMLElement) {
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
        scrollTrigger: { trigger: el, start, once: true },
      });
    },
  });
}

/**
 * split-sides — pentru titluri centrate: rândurile vin alternativ din stânga
 * și din dreapta (1 stânga, 2 dreapta, 3 stânga…) și se opresc pe loc, legat
 * de scroll. Rândurile sunt cele reale de pe ecran (diferă pe mobil).
 * Opțiuni: data-wm-shift="40" (procente din lățimea rândului)
 */
export function splitSides(el: HTMLElement) {
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
      /* De când titlul e bine în ecran (80%) până când mijlocul lui ajunge
         la 40% de sus: drum lung de scroll → mișcare lentă, vizibilă.
         Opacitatea vine în primele 30%, ca rândurile să se vadă alunecând. */
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 80%", end: "center 40%", scrub: 1.2 },
      });
      tl.fromTo(
        self.lines,
        { xPercent: (i: number) => (i % 2 ? shift : -shift) },
        { xPercent: 0, duration: 1, ease: "sine.out" },
        0,
      ).fromTo(self.lines, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, 0);
      return tl;
    },
  });
}

/**
 * words-scrub — textul (de obicei gri) se „aprinde” cuvânt cu cuvânt la scroll.
 * Opțiuni: data-wm-from="0.15" (opacitatea de pornire),
 *          data-wm-start="top 85%", data-wm-end="top 40%"
 */
export function wordsScrub(el: HTMLElement) {
  const from = opt(el, "from", 0.15);
  const start = opt(el, "start", "top 85%");
  const end = opt(el, "end", "top 40%");
  safeSplit(el, {
    type: "words",
    autoSplit: true,
    onSplit: (self) =>
      gsap.fromTo(
        self.words,
        { opacity: from },
        { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start, end, scrub: true } },
      ),
  });
}

/**
 * reveal-wipe — apariție standard pentru texte mici, butoane, blocuri:
 * mască de jos în sus + 24px. Fără fade. Elementele vecine apar în val.
 * Opțiuni: data-wm-start="top 80%"
 */
export function revealWipe(els: HTMLElement[]) {
  if (!els.length) return;
  gsap.set(els, WIPE_UP);
  els.forEach((el) => {
    gsap.to(el, {
      ...WIPE_UP_TO,
      duration: 0.8,
      ease: EASE,
      scrollTrigger: { trigger: el, start: opt(el, "start", "top 80%"), once: true },
    });
  });
}

/**
 * rows-wipe — rândurile unei liste se dezvăluie de la stânga la dreapta, unul
 * după altul. Copiii direcți sunt rândurile. Un element cu [data-wm-arrow] din
 * rând alunecă 8px la apariție.
 * Opțiuni: data-wm-mode="scroll" (legat de scroll, implicit) | "enter" (o dată,
 *          la intrarea în ecran, cu linie desenată + iconiță care „pocnește”)
 */
export function rowsWipe(el: HTMLElement) {
  const rows = Array.from(el.children) as HTMLElement[];
  if (!rows.length) return;
  const mode = opt(el, "mode", "scroll");

  if (mode === "enter") {
    /* Linia de deasupra rândului: definește border-ul ca ::before cu
       transform: scaleX(var(--wm-ln, 1)) — vezi motion.css (.wm-rows-line). */
    gsap.set(rows, { "--wm-ln": 0 });
    const marks = rows.map((r) => r.querySelector<HTMLElement>("[data-wm-mark]"));
    const texts = rows.map((r) => r.querySelector<HTMLElement>("[data-wm-text]") ?? r);
    marks.forEach((m) => m && gsap.set(m, { scale: 0 }));
    texts.forEach((t, i) => t !== rows[i] && gsap.set(t, WIPE_LR));
    const tl = gsap.timeline({ paused: true, delay: opt(el, "delay", 0.2) });
    rows.forEach((r, i) => {
      const t = i * 0.16;
      tl.to(r, { "--wm-ln": 1, duration: 0.6, ease: "power2.inOut" }, t);
      if (marks[i]) tl.to(marks[i], { scale: 1, duration: 0.5, ease: "back.out(2.5)" }, t + 0.12);
      if (texts[i] !== r) tl.to(texts[i], { ...WIPE_LR_TO, duration: 0.6, ease: EASE }, t + 0.15);
    });
    gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", once: true, onEnter: () => tl.play() } });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 45%", scrub: 0.8 },
  });
  rows.forEach((row, i) => {
    tl.fromTo(
      row,
      { clipPath: "inset(-10% 100% -10% 0%)" },
      { clipPath: "inset(-10% 0% -10% 0%)", duration: 1, ease: "power1.inOut" },
      i * 0.6,
    );
    const arrow = row.querySelector("[data-wm-arrow]");
    if (arrow) tl.fromTo(arrow, { x: -8 }, { x: 0, duration: 0.6, ease: "power2.out" }, i * 0.6 + 0.3);
  });
}

/**
 * land-from-right — un cuvânt/element vine din dreapta, puțin rotit, și
 * aterizează lângă textul de dinainte (ex. „Ai învățat design. Ok.”).
 * Se pune pe un <span> din interiorul titlului. Restul titlului urcă din mască.
 * Opțiuni: data-wm-rotate="8"
 */
export function landFromRight(el: HTMLElement) {
  const host = el.parentElement;
  if (!host) return;
  el.style.display = "inline-block";
  /* Textul de dinainte devine un bloc care urcă; spațiul rămâne în afară. */
  const lead = el.previousSibling;
  let leadWrap: HTMLElement | null = null;
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
  gsap.timeline({ scrollTrigger: { trigger: host, start: "top 80%", once: true } })
    .to(leadWrap ?? {}, { ...WIPE_UP_TO, duration: 0.9, ease: EXPO })
    .to(el, { x: 0, rotation: 0, duration: 1, ease: "back.out(1.2)" }, 0.45);
}

/** Pentru elementele marcate pe pagină. */
export function initText(scope: ParentNode = document) {
  $$("[data-motion='split-lines']", scope).forEach(splitLines);
  $$("[data-motion='split-sides']", scope).forEach(splitSides);
  $$("[data-motion='words-scrub']", scope).forEach(wordsScrub);
  revealWipe($$("[data-motion='reveal-wipe']", scope));
  $$("[data-motion='rows-wipe']", scope).forEach(rowsWipe);
  $$("[data-motion='land-from-right']", scope).forEach(landFromRight);
}

