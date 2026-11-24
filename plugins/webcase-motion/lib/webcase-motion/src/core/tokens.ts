/**
 * Valorile comune de motion (aprobate). Toate animațiile le folosesc de aici,
 * ca tot site-ul să pară făcut de „o singură mână”.
 */
export const EASE = "power3.out"; // intrări obișnuite
export const EXPO = "expo.out"; // rânduri de titlu, carduri mari
export const LAND = "back.out(1.4)"; // „aterizări”: carduri rotite, insigne

/**
 * Curbă cubic-bezier ca funcție de easing pentru GSAP (fără plugin în plus).
 * x(t) se rezolvă cu Newton, cu bisecție ca rezervă.
 */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-6) return sy(t);
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1;
    t = x;
    for (let i = 0; i < 30; i++) {
      if (sx(t) < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}

/* Ritmul „soft” (secțiuni mari, titluri cu litere, poze pe diagonală): 1,2s. */
export const SOFT = bezier(0.25, 1, 0.5, 1); // apariții lungi și moi
export const SOFT_IN = bezier(0.5, 0, 0.75, 0); // accelerează: zoom-ul spre poză
export const SOFT_INOUT = bezier(0.75, 0, 0.25, 1); // deschideri: ferestre, poze pe diagonală

/** Breakpoint-ul de la care avem desktop (pin-uri, parallax, hover). */
export const DESKTOP = "(min-width: 992px)";
/** Desktop cu mouse real (pentru efectele de hover/cursor). */
export const POINTER = "(min-width: 992px) and (hover: hover) and (pointer: fine)";

/** Apariție fără fade: mască de jos în sus (+ 24px). */
export const WIPE_UP = { y: 24, clipPath: "inset(0% 0% 100% 0%)" };
export const WIPE_UP_TO = { y: 0, clipPath: "inset(-40% -10% -40% -10%)", clearProps: "clipPath" };

/** Rând care se dezvăluie de la stânga la dreapta (+ 16px). */
export const WIPE_LR = { x: -16, clipPath: "inset(-20% 100% -20% 0%)" };
export const WIPE_LR_TO = { x: 0, clipPath: "inset(-20% -5% -20% 0%)", clearProps: "clipPath" };
