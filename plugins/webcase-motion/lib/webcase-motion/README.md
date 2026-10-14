# webcase-motion

Animații web reutilizabile, construite pe **GSAP 3** (ScrollTrigger, SplitText) și **Lenis**.
Le pornești direct din HTML, cu un atribut: `data-motion="numele-animației"`. JavaScript nu scrii.

Toate au aceleași reguli de bază:

- Easing-urile sunt aprobate și la fel peste tot. Durata stă între 0,6 și 1,1 secunde.
- Apariția la scroll nu folosește fade: elementele apar dintr-o **mască** (clip-path).
- Hover-ul există doar pe desktop cu mouse. E discret: ridicare de 5–6px, înclinare de ~1°, fără efect magnetic.
- Dacă vizitatorul a cerut **mișcare redusă** (prefers-reduced-motion), pagina rămâne statică și complet vizibilă.
- Dacă JS-ul nu pornește în 4 secunde, pagina se afișează normal, fără animații.

---

## Instalare

```bash
npm i gsap lenis
```

Copiază folderul `webcase-motion` în proiect (sau `npm i ../webcase-motion`) și urmează 3 pași:

**1. În `<head>`**, cât mai sus, pune conținutul din `src/head-snippet.html`. Snippetul adaugă pe `<html>`:

- clasa `wm-anim`, care înseamnă că animațiile pot porni;
- clasa `wm-loading`, doar dacă pagina are loader. Dacă n-are, șterge rândul respectiv din snippet.

**2. Stilurile:**

```js
import "webcase-motion/motion.css";
```

**3. Pornirea:**

```js
import { initMotion } from "webcase-motion";
initMotion(); // sau initMotion({ smooth: false, anchorOffset: 88 })
```

`initMotion()` face, în ordine:

1. așteaptă fonturile;
2. pornește scroll-ul lin (Lenis, doar pe desktop);
3. rulează loader-ul, o singură dată pe sesiune;
4. rulează intrarea primului ecran;
5. activează toate animațiile la scroll.

**Opțiunile** se dau tot din HTML: `data-wm-<opțiune>="valoare"`.

---

## Tokeni (timing aprobat)

| Nume | Valoare | Unde se folosește |
|---|---|---|
| `EASE` | `power3.out` | apariții standard, texte mici, butoane |
| `EXPO` | `expo.out` | titluri, rânduri care urcă din mască |
| `LAND` | `back.out(1.4)` | carduri care „aterizează”, cu un mic recul |
| `DESKTOP` | `(min-width: 992px)` | pin-uri, scroll lin |
| `POINTER` | desktop + `hover:hover` + `pointer:fine` | orice hover |
| `WIPE_UP` | mască de jos în sus + 24px | apariția standard |
| `WIPE_LR` | mască de la stânga la dreapta + 16px | rânduri, liste |

```js
import { EASE, EXPO, LAND, gsap } from "webcase-motion"; // pentru animațiile tale proprii
```

---

## Text

### `split-lines`

Rândurile titlului urcă pe rând din spatele unei măști. Se folosește la titlurile secțiunilor.

```html
<h2 data-motion="split-lines">Titlul secțiunii</h2>
```

- **Opțiuni:** `data-wm-start="top 82%"`.
- **Timing:** 0,9s `expo.out`, cu 0,1s între rânduri.

### `split-sides`

La titlurile centrate, rândurile vin alternativ din stânga și din dreapta, legat de scroll. Rândurile sunt cele de pe ecran, deci pe mobil sunt altele decât pe desktop.

```html
<h2 data-motion="split-sides">Titlu centrat pe două rânduri</h2>
```

- **Opțiuni:** `data-wm-shift="40"`, adică cât vine din lateral, în % din lățimea rândului.
- Pune `overflow: clip` pe secțiune, ca rândurile să nu lărgească pagina.

### `words-scrub`

Textul gri se „aprinde” cuvânt cu cuvânt la scroll. Se folosește la paragrafele mari, de manifest.

```html
<p data-motion="words-scrub">Un paragraf mare…</p>
```

- **Opțiuni:** `data-wm-from="0.15"`, `data-wm-start="top 85%"`, `data-wm-end="top 40%"`.

### `reveal-wipe`

Apariția standard pentru texte mici, butoane și blocuri: mască de jos în sus, plus 24px.

```html
<p data-motion="reveal-wipe">Subtitlu</p>
```

- **Opțiuni:** `data-wm-start="top 80%"`.
- **Timing:** 0,8s `power3.out`.

### `rows-wipe`

Rândurile unei liste se dezvăluie de la stânga la dreapta, unul după altul. Copiii direcți sunt rândurile.

```html
<div data-motion="rows-wipe">
  <div>Rând 1 <span data-wm-arrow>→</span></div>
  <div>Rând 2</div>
</div>
```

**Opțiuni** — `data-wm-mode` are două valori:

- `scroll` (implicit): dezvăluirea e legată de scroll. Elementul `[data-wm-arrow]` alunecă 8px.
- `enter`: se dezvăluie o singură dată, la intrarea în ecran. Linia de deasupra se desenează, iconița `[data-wm-mark]` „pocnește”, iar textul `[data-wm-text]` intră din mască. Pentru linie, adaugă clasa `wm-rows-line`.

### `land-from-right`

Un cuvânt vine din dreapta, puțin rotit, și aterizează lângă textul de dinainte, care între timp urcă din mască. Merge bine pentru o replică scurtă la finalul titlului.

```html
<h2>Ai terminat cursul. <span data-motion="land-from-right">Ok.</span></h2>
```

- **Opțiuni:** `data-wm-rotate="8"`.

### `text-swap`

O frază care se schimbă singură, în buclă. Literele vechi se estompează în blur și urcă puțin, apoi cele noi apar din blur, literă cu literă. Se folosește pentru 2–4 mesaje scurte, alternative, de exemplu în primul ecran sau la finalul paginii.

```html
<p data-motion="text-swap" data-wm-lines="Design care se|înțelege din prima.;;Mișcare care|ghidează privirea.">
  Design care se<br>înțelege din prima.
</p>
```

- **Opțiuni:** `data-wm-lines`, adică frazele: se despart cu `;;`, iar rândurile unei fraze cu `|`. Apoi `data-wm-interval="4.8"`, adică secundele dintre schimbări.
- Textul scris în HTML (prima frază) rămâne vizibil fără JS și la mișcare redusă.
- Rulează doar cât fraza e pe ecran. Cuvintele nu se rup la mijloc.
- **Timing:** ieșire 0,42s, cu 18ms între litere; intrare 0,7s, cu 28ms între litere; blur 14px.

---

## Intrarea primului ecran — `data-intro`

Pornește după loader, dacă pagina are unul. Elementele intră în ordinea din pagină, la 0,1s unul după altul. Momentul exact se poate fixa cu `data-wm-at="0.45"`.

| Valoare | Ce face | Pentru |
|---|---|---|
| `drop` | coboară 20px | header, meniu |
| `rise` | urcă 24px | eyebrow, subtitlu, butoane |
| `lines` | rândurile urcă din mască | titlul H1 |
| `lift` | urcă 90px și crește de la 0,92 | imaginea mare |
| `pop` | aterizează de la 1,3 la 1, apoi plutește lent | insigne, stickere |

```html
<h1 data-intro="lines">Titlul paginii</h1>
<p data-intro="rise">Subtitlu</p>
```

---

## Carduri

### `fan` (`fan-hover` + `fan-emerge`)

Un evantai de carduri în jurul unei imagini. Se comportă diferit în funcție de dispozitiv:

- **Desktop cu mouse:**
  - hover pe un card: cardul se îndreaptă, crește puțin și urcă; vecinii se dau la o parte;
  - toate cardurile urmăresc ușor cursorul, pentru senzația de adâncime;
  - ordinea straturilor nu se schimbă, deci niciun card nu trece peste altul.
- **Mobil și tabletă:** cardurile „ies” din spatele imaginii, apoi plutesc lent. La scroll, evantaiul se deschide.

```html
<div data-motion="fan" class="my-fan">
  <div data-fan-card style="--r: -9deg"> … </div>
  <figure data-fan-center> … </figure>
  <div data-fan-card style="--r: 9deg"> … </div>
</div>
```

- Rotația se pune în CSS cu `transform: rotate(var(--r))`. **Nu** folosi proprietatea `rotate`.
- **Opțiuni:** `data-wm-delay="0"`.

### `slider-tilt`

Un slider orizontal în care rotația cardurilor depinde de poziție. Cardul din stânga e aproape drept, iar spre dreapta cardurile sunt tot mai rotite. Când sliderul stă, nu rulează nimic.

```html
<ul data-motion="slider-tilt" class="wm-slider">
  <li class="wm-slide"><div data-slide-card> … </div></li>
</ul>
```

- **Opțiuni** (în grade): `data-wm-min="1.5"`, `data-wm-edge="6"`, `data-wm-max="9"`.
- ⚠️ Slotul (`li`) face snap și **nu** se mișcă. Rotația se aplică doar pe cardul din interior.

### `pin-cards`

- **Desktop:** secțiunea se fixează, iar la fiecare pas de scroll intră din jos un card, deja rotit, care se oprește lin.
- **Mobil:** cardurile urcă rotite, legat de scroll.

```html
<section data-motion="pin-cards" class="wm-pin-sheet">
  <div data-pin-area class="wm-pin-area">
    <div data-card style="--r: 6deg; left: 25%; top: 40%"> … </div>
  </div>
</section>
```

- **Opțiuni:** `data-wm-length="1.8"`, adică lungimea fixării, în înălțimi de ecran.

### `fly-cards`

- **Desktop:** cardurile zboară alternativ din stânga și din dreapta, rotite ±25°, și aterizează cu un mic recul. Primul card zboară încă dinainte de fixare, ca zona să nu pară goală.
- **Mobil:** cardurile zboară lent, legat de scroll.

Markup-ul e ca la `pin-cards`, cu `data-fly-area`. Un card cu `data-fly-accent` primește o umbră mare o clipă, la aterizare.

### `horizontal-pin`

- **Desktop:** secțiunea se fixează și pașii trec orizontal. Linia de progres (`--p`) avansează, iar punctele primesc clasa `.is-on`.
- **Mobil:** rândul de pași se derulează cu degetul.

```html
<section data-motion="horizontal-pin">
  <div data-hp-fill></div>
  <div data-hp-viewport class="wm-hp-viewport">
    <ol data-hp-track class="wm-hp-track"><li data-hp-step> … </li></ol>
  </div>
</section>
```

---

## Interfață

### `loader`

Ecran negru complet, afișat o singură dată pe sesiune:

1. numără până la 100 și bara se umple;
2. conținutul iese în sus;
3. foaia urcă, iar colțurile de jos se rotunjesc doar cât urcă;
4. intrarea paginii pornește după ce foaia a trecut de titlu.

```html
<div data-motion="loader" class="wm-loader" aria-hidden="true">
  <div class="wm-loader__inner">
    <span class="wm-loader__tag">Numele site-ului</span>
    <span class="wm-loader__num"><span data-loader-num>0</span>%</span>
    <span class="wm-loader__bar"><span data-loader-bar></span></span>
  </div>
</div>
```

- **Opțiuni:** `data-wm-to="100"`.
- **Culori:** `--wm-loader-bg`, `--wm-loader-fg`, `--wm-accent` (culoarea barei).

### `marquee`

Bandă care rulează continuu. Accelerează după viteza scroll-ului și își schimbă direcția când derulezi în sus.

```html
<div data-motion="marquee" class="wm-marquee">
  <div data-marquee-track class="wm-marquee__track"><span>Text</span><span>•</span></div>
</div>
```

- **Opțiuni:** `data-wm-speed="40"`, în px/s, viteza în repaus.

### `marquee-css`

Variantă simplă, doar CSS, cu marginile estompate. Merge bine pe mobil, pentru un rând de fapte scurte.

```html
<div data-motion="marquee-css" class="wm-marquee-css">
  <ul class="wm-marquee-css__track"><li>Fapt 1</li><li>Fapt 2</li></ul>
</div>
```

- **Viteza:** `--wm-marquee-duration: 28s`.

### `topbar-glass`

Bară fixă cu fundal de sticlă. Apare la scroll în sus, după primul ecran, și dispare la scroll în jos.

```html
<div data-motion="topbar-glass" class="wm-topbar" inert>
  <div class="wm-topbar__inner"> logo · meniu · buton </div>
</div>
```

### `dots-cursor`

O rețea discretă de puncte în fundalul secțiunii. Punctele de lângă cursor se colorează, cresc și se dau ușor la o parte. Merge doar pe desktop cu mouse.

```html
<section data-motion="dots-cursor"> … </section>
```

- **Opțiuni:** `data-wm-from="#ff4365"`, `data-wm-to="#146ef5"`, `data-wm-gap="26"`, `data-wm-radius="170"`.

### `accordion`

FAQ cu înălțime animată (0,4s). Semnul „+” se transformă în „−”, iar o singură întrebare e deschisă la un moment dat.

```html
<div data-motion="accordion">
  <details class="wm-acc">
    <summary>Întrebare <span class="wm-acc__icon"></span></summary>
    <div class="wm-acc__body"><p>Răspuns</p></div>
  </details>
</div>
```

### `countdown`

Countdown live, în care cifrele noi intră discret de jos. După expirare, blocul se ascunde și se emite evenimentul `wm:countdown-end`.

```html
<div data-motion="countdown" data-wm-deadline="2026-12-31T18:00:00+02:00" hidden>
  <span class="wm-cd-box"><span data-cd="d">00</span></span> :
  <span class="wm-cd-box"><span data-cd="h">00</span></span> : …
</div>
```

### Scroll lin (Lenis)

E activ implicit, doar pe desktop. Linkurile `href="#…"` derulează lin și lasă loc pentru bara fixă. Îl dezactivezi cu `initMotion({ smooth: false })`.

---

## Hover (clase CSS)

Funcționează doar pe desktop cu mouse.

| Clasă | Efect |
|---|---|
| `wm-hover-lift` | urcă 5px |
| `wm-hover-tilt-l` / `wm-hover-tilt-r` | urcă 5px și se înclină −1° / +1° |
| `wm-hover-straighten` | cardul rotit cu `--r` se îndreaptă pe jumătate |
| `wm-hover-shadow` | umbră mai mare |
| `wm-btn-fill` | butonul se închide puțin la culoare (`--wm-btn-shade`) |

---

## Animații proprii

Toate funcțiile se pot folosi și direct, pe elementele tale:

```js
import { splitLines, revealWipe, pinCards, gsap, EXPO } from "webcase-motion";
splitLines(document.querySelector(".my-title"));
```

Pentru reguli și capcane, citește [`skill/webcase-motion/references/gotchas.md`](skill/webcase-motion/references/gotchas.md) (capcanele rezolvate) și `timing.md` (timing-ul exact).

---

## Build

```bash
npm install
npm run typecheck
npm run build   # → dist/webcase-motion.js (ESM, gsap/lenis externe) + dist/motion.css
```
