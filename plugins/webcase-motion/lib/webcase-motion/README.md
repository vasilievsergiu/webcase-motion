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
| `SOFT` | `cubic-bezier(0.25, 1, 0.5, 1)` | ritmul „soft”, 1,2s: `chars-flip` |
| `SOFT_IN` | `cubic-bezier(0.5, 0, 0.75, 0)` | zoom-ul din `dive-in` |
| `SOFT_INOUT` | `cubic-bezier(0.75, 0, 0.25, 1)` | `slide-reveal`, zoom-ul din `window-merge` |
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

### `chars-flip`

Literele titlului se întorc pe rând, ca niște cărți de joc, și urcă puțin. Se folosește pentru titlurile mari și elegante, de tip editorial.

```html
<h2 data-motion="chars-flip">Arhitectură</h2>
```

- **Opțiuni:** `data-wm-start="top 85%"`; `data-wm-back="hide"`, ca titlul să dispară când urci înapoi și să reapară la coborâre.
- **Timing:** 1,2s, cu 0,05s între litere, easing `SOFT`. Literele pornesc rotite la 90° (din profil sunt invizibile), deci fără fade.

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

### `title-pass`

Un titlu foarte mare stă fix pe centrul ecranului (sticky, fără pin), iar cardurile urcă peste el, fiecare cu altă viteză. Se folosește pentru o listă scurtă de rezultate sau beneficii, de 3 până la 5 carduri.

```html
<section data-motion="title-pass">
  <div data-tp-title><h2>Ce rămâne la tine</h2></div>
  <ul data-tp-cards>
    <li data-tp-card data-depth="0.6"> … </li>
    <li data-tp-card data-depth="1.2"> … </li>
  </ul>
</section>
```

- **Desktop:** cardurile stau în zigzag pe o grilă de 12 coloane, fiecare pe rândul lui.
- **Mobil:** cardurile alternează stânga și dreapta și se mișcă mai puțin.
- **Opțiuni:** `data-depth="1"` pe fiecare card (viteza relativă); `data-wm-k="90"` (desktop) și `data-wm-k-mobile="30"`. Cardul urcă de la `+depth × k` la `−depth × k` px.
- Cardurile au nevoie de fundal opac, ca titlul să nu se citească prin ele.
- Niciun părinte cu `overflow: hidden` sau `auto`: strică sticky. Folosește `overflow: clip`.

### `stack-cards`

Carduri mari care se lipesc pe rând de partea de sus a ecranului și se stivuiesc. Cardul de dedesubt se micșorează puțin cât urcă următorul. Merge bine pentru 3 proiecte sau 3 pași mari.

```html
<div data-motion="stack-cards">
  <article data-stack-card> … </article>
  <article data-stack-card> … </article>
  <article data-stack-card> … </article>
</div>
```

- **Opțiuni:** `data-wm-scale="0.93"` (cât se micșorează), `data-wm-top="16"` și `data-wm-step="10"`, adică `top` în trepte: 16px + i × 10px.
- Pe ecrane joase (înălțime ≤ 480px, de exemplu telefon în landscape) cardurile rămân statice, fără micșorare.
- Fiecare card are nevoie de o înălțime clară (de exemplu `min(70vh, 560px)`) și de fundal opac.

---

## Imagini

### `cross-reveal`

La scroll, un cursor de Figma trage o cruce din stânga sus spre dreapta jos. Imaginea se dezvăluie după cruce și se micșorează de la 1,7 la 1. La final, crucea dispare. Se folosește pentru o poză importantă: portret, studiu de caz, macheta unui proiect.

```html
<figure data-motion="cross-reveal">
  <img src="…" alt="…">
</figure>
```

- **Opțiuni:** `data-wm-gap="16"` (spațiul de la margine, în px), `data-wm-zoom="1.7"` (mărimea de pornire), `data-wm-start="top 88%"`, `data-wm-end="top 26%"`.
- **Culori:** `--wm-xr-cursor` (cursorul, implicit `#ff4365`) și `--wm-xr-line` (liniile crucii).
- Se mărește primul copil sau elementul cu `data-xr-zoom`.
- Fără JS sau la mișcare redusă, imaginea se vede direct.

### `slide-reveal`

Poza intră pe diagonală, din dreapta, printr-o mască oblică. În același timp, imaginea din interior se micșorează de la 1,5 la 1 și alunecă spre stânga. Merge bine pentru pozele dintr-o galerie sau dintr-un studiu de caz.

```html
<figure data-motion="slide-reveal">
  <img src="…" alt="…">
</figure>
```

- **Opțiuni:** `data-wm-start="top 85%"`.
- **Timing:** 1,2s, easing `SOFT_INOUT`. Rulează o singură dată.

### `parallax`

Poza se mișcă mai încet decât pagina, în rama ei, sau un bloc întreg se mișcă puțin în sus ori în jos. Dă adâncime fără să atragă atenția.

```html
<figure data-motion="parallax"><img src="…" alt="…"></figure>
<div data-motion="parallax" data-wm-mode="block" data-wm-speed="-10"> … </div>
```

- **Opțiuni:** `data-wm-mode="img"` (implicit, poza în ramă, ±15%) sau `"block"` (elementul întreg, ±10%); `data-wm-speed` (procente; negativ = blocul urcă); `data-wm-mobile="off"`.
- În modul `img`, poza e mărită automat cu `1 + 2 × speed / 100`, ca să nu apară goluri la margini.

---

## Secțiuni

Efecte mari, pentru o secțiune întreagă. Sunt „wow”: cel mult unul sau două pe pagină.

### `dive-in`

Primul ecran stă pe loc, iar la scroll imaginea din spate crește spre tine, ca și cum ai intra în ea. Textul urcă mai repede decât imaginea. Opțional, peste ea urcă un cerc mare, cu un text scris pe margine, care face trecerea spre secțiunea următoare.

```html
<section data-motion="dive-in" data-wm-arc-text="Trei motive să ne alegi">
  <div data-dive-bg><img src="…" alt="…"></div>
  <div data-dive-content> titlu, butoane </div>
</section>
```

- **Opțiuni:** `data-wm-length="4"` (câte ecrane de scroll), `data-wm-zoom="2"`, `data-wm-arc-text` (fără el nu apare cercul), `data-wm-arc-spread="4"` (spațiul final dintre cuvintele de pe cerc, în em).
- **Culori:** `--wm-arc-color` (cercul) și `--wm-arc-ink` (textul de pe cerc). Secțiunea următoare trebuie să aibă aceeași culoare cu cercul.
- **Pe telefon:** doar zoom-ul și cercul.

### `window-merge`

O singură poză, văzută prin două ferestre decalate. La scroll, ferestrele se aliniază, se unesc într-una, apoi fereastra crește până umple ecranul. Decorul din margini (flori, forme) iese în lateral.

```html
<section data-motion="window-merge">
  <div data-win-media><img src="…" alt="…"></div>
  <div data-win-side="left"> decor </div>
  <div data-win-side="right"> decor </div>
</section>
```

- **Opțiuni:** `data-wm-zoom="1.84"`, `data-wm-length="2"` (ecrane de scroll).
- Doar desktop. Pe telefon rămâne o poză simplă.
- În jurul ferestrelor se vede fundalul secțiunii.

### `cloud-drift`

Straturi de nori care plutesc continuu, fiecare cu viteza lui, ca să pară la adâncimi diferite. Sus se topesc în culoarea paginii. Imaginea de dedesubt se micșorează încet la scroll.

```html
<section data-motion="cloud-drift">
  <img data-cloud data-speed="60" src="nori-1.png" alt="">
  <img data-cloud data-speed="43" data-top="12%" src="nori-2.png" alt="">
  <div data-cloud-bg><img src="…" alt="…"></div>
</section>
```

- **Opțiuni:** `data-speed` (px pe secundă) și `data-top` pe fiecare strat; `data-wm-fade="288"` (înălțimea topirii, px).
- **Culoare:** `--wm-cloud-fade`, culoarea în care se topesc norii (pune culoarea fundalului paginii).
- Pozele cu nori au fundal transparent (PNG, WebP sau AVIF). Benzile rulează doar cât secțiunea e pe ecran.

### `frame-close`

La finalul paginii, secțiunea cu poza se strânge într-un cadru cât pleci din ea, iar secțiunea următoare (de obicei footer-ul) crește spre tine.

```html
<section data-motion="frame-close"> secțiunea cu poza </section>
<footer data-frame-next> … </footer>
```

- **Opțiuni:** `data-wm-inset="8% 22%"` (cadrul final pe desktop) și `data-wm-inset-mobile="4% 32%"`.
- În jurul cadrului se vede fundalul paginii. Crește `[data-frame-grow]` din footer sau primul lui copil.

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
