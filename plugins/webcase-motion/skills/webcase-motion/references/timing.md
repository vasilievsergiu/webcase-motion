# Timing aprobat

Valorile de mai jos sunt cele aprobate după testare pe desktop și iPhone. Nu le „îmbunătăți” fără cerere: diferențe de 0,1–0,2s se simt.

## Easing
| Token | Valoare | Folosire |
|---|---|---|
| `EASE` | `power3.out` | apariții standard (`reveal-wipe`, intro rise), hover JS |
| `EXPO` | `expo.out` | titluri pe rânduri, intrarea primului ecran |
| `LAND` | `back.out(1.4)` | carduri care aterizează (slider, fly-cards) |
| — | `back.out(1.6)` | fan hover (cardul se îndreaptă) |
| — | `back.out(2.5)` | iconițe/bife care „pocnesc” |
| — | `power2.out` | carduri care se opresc lin, fără recul (pin-cards) |
| — | `power2.inOut` | loader (numărătoarea), linii desenate, accordion la închidere |
| — | `expo.inOut` | foaia loader-ului care urcă |
| — | `sine.inOut` | plutire în buclă |
| CSS | `cubic-bezier(0.22, 1, 0.36, 1)` | tranziții CSS (hover, topbar, countdown) |
| CSS | `cubic-bezier(0.5, 0, 0.75, 0)` | `text-swap`: literele care pleacă (accelerează) |
| CSS | `cubic-bezier(0.2, 0.7, 0.1, 1)` | `text-swap`: literele care se așază (frânează lin) |

## Durate
- Text: 0,8s (`reveal-wipe`) · 0,9s (`split-lines`) · 1s (H1 în intro); stagger între rânduri 0,1s.
- Carduri: 0,9–1,1s; stagger 0,07–0,08s.
- Hover: 300ms CSS (ridicare/înclinare) · 550ms GSAP (fan).
- Accordion 0,4s · topbar 450ms · cifre countdown 380ms.
- `text-swap`: ieșire 0,42s (18ms între litere) → intrare 0,7s (28ms între litere) · schimbare la 4,8s · blur 14px, ±0,12em pe verticală.
- Loader: numărătoare 0,65s → conținutul iese la 0,7s (0,35s) → foaia urcă la 0,8s (0,8s) → intrarea paginii pornește la **1,3s** (după ce foaia a trecut de titlu, altfel titlul se animă sub loader).

## Când pornesc (ScrollTrigger)
| Animație | start | end | scrub |
|---|---|---|---|
| `reveal-wipe` | `top 80%` | — (o dată) | — |
| `split-lines` | `top 82%` | — | — |
| `split-sides` | `top 80%` | `center 40%` | 1.2 |
| `words-scrub` | `top 85%` | `top 40%` | true |
| `rows-wipe` scroll | `top 85%` | `bottom 45%` | 0.8 |
| `rows-wipe` enter | `top 80%` | — | — (0,16s între rânduri) |
| `pin-cards` desktop | `center 55%` | +1,8 × înălțimea ecranului | 0.6 |
| `pin-cards` mobil | `top 90%` / `top 84%` | `top 50%` / `top 42%` | 0.6 |
| `fly-cards` desktop | primul card `top 95%`→`center center`, restul fixat | +1,8 ecrane | 0.6 |
| `fly-cards` mobil | `top 90%` | `top 30%` | 0.8 |
| `fan-emerge` deschidere | `top 45%` | `bottom top` | 0.6 |

Reguli: titlurile nu pornesc prea devreme (sub ~80% din ecran) și nici prea repede; scrub-ul legat de scroll trebuie să aibă drum lung, ca mișcarea să se vadă.

## Distanțe
- Mască de jos: +24px · din stânga: −16px · rânduri: `yPercent: 125`.
- `split-sides`: ±40% din lățimea rândului.
- Hover: −5px (carduri) / −6px (carduri mari), ±1° înclinare, fan hover −14px + scale 1,06.
- `slider-tilt`: 1,5° stânga → 6° la marginea dreaptă → max 9° în afara ecranului.
- `fly-cards`: ±62% din lățimea ecranului, ±25°, scale 1,15 (desktop); ±75%, ±16°, 1,08 (mobil).
- Plutire: ±2px / ±1° (insigne), ±5px / ±1,5° (carduri fan pe mobil).
