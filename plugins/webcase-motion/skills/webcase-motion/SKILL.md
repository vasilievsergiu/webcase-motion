---
name: webcase-motion
description: 'Adds web animations in the Webcase house style (GSAP + ScrollTrigger + SplitText + Lenis) — masked text reveals, card fans, pinned card sections, tilt sliders, loaders, marquees, hover. Use when the user asks to animate a page, add scroll/hover/intro motion, or "make it feel like the Webcase pages". Descriere RO: animații în stilul Webcase, cu timing-ul și regulile aprobate.'
---

# webcase-motion

Animații web în stilul aprobat Webcase. Scopul: mișcare **calmă, precisă, fără fade**, care nu strică performanța, accesibilitatea sau layout-ul pe iPhone.

Răspunde utilizatorului în limba lui (de obicei română). Numele animațiilor rămân în engleză.

## Când îl folosești
- „Animează pagina / secțiunea X”, „pune animații la scroll”, „un loader”, „hover pe carduri”, „titlul să apară frumos”.
- Pagini noi (landing, ofertă, curs) care trebuie să se simtă ca restul site-ului.

## Pași
1. **Verifică dacă proiectul are deja biblioteca** `webcase-motion` (import din `webcase-motion` sau un folder copiat). Dacă da → folosește atributele `data-motion` / `data-intro` din [references/catalog.md](references/catalog.md). Nu reinventa.
2. Dacă nu o are și utilizatorul vrea animații: adaug-o întâi. Cu plugin-ul `webcase-motion` instalat, folosește skill-ul `add` (comanda `/webcase-motion:add`), care instalează și configurează totul. Fără plugin: gsap + lenis + biblioteca, după README-ul ei, sau cod GSAP **după aceleași reguli și același timing** ([references/timing.md](references/timing.md)).
3. **Întreabă înainte** de lucrurile care schimbă experiența: loader (da/nu), scroll lin, secțiuni fixate (pin). Restul (apariții, hover discret) le poți propune direct.
4. Alege animația după rol, nu după efect (tabelul de mai jos). Maximum 1–2 animații „wow” pe pagină (fan, fly-cards, pin); restul simple.
5. Aplică regulile din [references/gotchas.md](references/gotchas.md) — sunt bug-uri reale deja rezolvate (iPhone, Safari, pin în flex, SplitText).
6. **Verifică** în browser: desktop 1440, tabletă 834, mobil 390. Derulează toată pagina; caută: text tăiat, cuvânt singur pe ultimul rând, scroll orizontal, carduri care sar, elemente care rămân ascunse. Ține minte: în panoul de preview rAF îngheață între comenzi — o captură „ciudată” poate fi doar mijlocul animației.

## Ce animație pentru ce rol

| Rol pe pagină | Animație |
|---|---|
| Titlu de secțiune (aliniat stânga) | `split-lines` |
| Titlu centrat, pe 2 rânduri, important | `split-sides` |
| Paragraf mare, de manifest | `words-scrub` |
| Subtitlu, buton, bloc mic | `reveal-wipe` |
| Listă de beneficii / pași / „ce intră” | `rows-wipe` (`enter` pentru liste cu bife) |
| Replică scurtă la final de titlu | `land-from-right` |
| Primul ecran | `data-intro` (drop / rise / lines / lift / pop) |
| Imagine + carduri în jur | `fan` |
| Rezultate / proiecte într-un rând | `slider-tilt` |
| 3–5 carduri care „se adună” | `pin-cards` (calm) sau `fly-cards` (energic) |
| Pași / proces / roadmap | `horizontal-pin` |
| Fapte scurte, logo-uri | `marquee` (la scroll) sau `marquee-css` (mobil) |
| Navigație pe pagini lungi | `topbar-glass` |
| CTA final, fundal închis | `dots-cursor` |
| FAQ | `accordion` |
| Ofertă cu termen real | `countdown` (doar cu termen REAL) |

## Reguli de neîncălcat
- **Fără fade la apariții.** Elementele apar din mască (clip-path) sau din mișcare. Opacitate doar la: loader, intrarea primului ecran, `words-scrub`, începutul `split-sides`.
- **Hover strict ca site-ul:** doar desktop cu mouse, ridicare 5–6px, înclinare ~1°, umbră discretă. Fără efect magnetic, fără să schimbi z-index-ul (niciun card nu trece peste altul).
- **Reduced-motion = static.** Totul vizibil fără JS și fără animații; stările ascunse există doar sub `html.wm-anim`.
- **Animă doar `transform`, `opacity`, `clip-path`** (excepție: înălțimea la accordion).
- **Nu schimba texte, layout sau design** ca să „încapă” o animație. Dacă o animație cere altă structură, întreabă.
- **Performanța nu scade:** fără animații pe imaginea LCP înainte de încărcare, fără biblioteci în plus, fără `will-change` peste tot.
- Countdown și „ultimele locuri” doar dacă sunt **adevărate**.

## Referințe
- [references/catalog.md](references/catalog.md) — fiecare animație: markup, opțiuni, ce face pe desktop / mobil.
- [references/timing.md](references/timing.md) — easing-uri, durate, start/end ScrollTrigger aprobate.
- [references/gotchas.md](references/gotchas.md) — capcane rezolvate (iOS, SplitText, pin, scroll-snap, SVG).
