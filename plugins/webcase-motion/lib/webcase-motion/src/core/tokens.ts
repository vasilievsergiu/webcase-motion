/**
 * Valorile comune de motion (aprobate). Toate animațiile le folosesc de aici,
 * ca tot site-ul să pară făcut de „o singură mână”.
 */
export const EASE = "power3.out"; // intrări obișnuite
export const EXPO = "expo.out"; // rânduri de titlu, carduri mari
export const LAND = "back.out(1.4)"; // „aterizări”: carduri rotite, insigne

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
