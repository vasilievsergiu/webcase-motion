---
name: add
description: Adaugă biblioteca de animații webcase-motion în proiectul curent — instalează gsap și lenis, copiază biblioteca, pune snippetul în <head>, importă motion.css și pornește initMotion(). Use when the user runs /webcase-motion:add or asks to add/install webcase-motion (or "animațiile Webcase") in a project that doesn't have it yet.
argument-hint: "[pagina sau folderul, opțional]"
---

# /webcase-motion:add — adaugă biblioteca în proiect

Utilizatorul e de obicei **designer, nu programator**. Lucrezi singur, pas cu pas, și la final îi explici pe scurt, fără jargon, ce s-a schimbat. Răspunde în limba lui (de obicei română).

Biblioteca e inclusă în plugin, aici: `${CLAUDE_PLUGIN_ROOT}/lib/webcase-motion` (conține `dist/`, `src/`, `README.md`, `package.json`).
Catalogul animațiilor și regulile sunt în skill-ul `webcase-motion` din același plugin.

Argument (opțional): $ARGUMENTS — pagina sau folderul unde vrea animațiile. Dacă lipsește, instalezi pentru tot site-ul.

## 0. Verifică înainte
- Dacă proiectul are deja biblioteca (un folder `webcase-motion/`, un import din `webcase-motion` sau `data-motion=` în pagini), **nu o adăuga a doua oară**. Spune-i asta și treci la pasul 6.
- Identifică tipul proiectului:
  - **cu `package.json`** (Vite, Astro, Next.js, SvelteKit, Nuxt…) → pașii 1A–4A;
  - **fără `package.json`** (site HTML simplu) → pașii 1B–3B.
- Folosește managerul de pachete al proiectului, după lockfile: `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lockb`/`bun.lock` → bun, altfel npm.

## Proiect cu package.json

**1A. Copiază biblioteca** în rădăcina proiectului, în folderul `webcase-motion/` (fără `node_modules`):
```bash
cp -R "${CLAUDE_PLUGIN_ROOT}/lib/webcase-motion" ./webcase-motion
```

**2A. Instalează** GSAP, Lenis și biblioteca (ca dependență locală):
```bash
npm i gsap lenis ./webcase-motion
```

**3A. Snippetul din `<head>`.** Pune conținutul fișierului `webcase-motion/dist/head-snippet.html` cât mai sus în `<head>`, **înaintea** CSS-ului, în fișierul folosit de toate paginile:
- Vite / HTML: `index.html`;
- Astro: layout-ul principal (`src/layouts/*.astro`), ca `<script is:inline>`;
- Next.js (App Router): `app/layout.tsx`, în `<head>`, ca `<script dangerouslySetInnerHTML={{ __html: "…" }} />` (fără comentariul HTML);
- alt framework: echivalentul lui (layout / `app.html` / `nuxt.config`).

**Loader:** snippetul are un rând cu `wm-loading`. Păstrează-l doar dacă utilizatorul vrea loader (ecranul negru care numără până la 100). **Nu adăuga loader fără să întrebi**; implicit, șterge rândul acela.

**4A. Stilurile și pornirea**, într-un script care rulează pe toate paginile, în browser:
```js
import "webcase-motion/motion.css";
import { initMotion } from "webcase-motion";

initMotion();
```
- Vite: în `src/main.(js|ts)`;
- Astro: un `<script>` în layout-ul principal (Astro îl procesează automat);
- Next.js: o componentă `"use client"` cu `useEffect(() => { initMotion(); }, [])`, inclusă în `app/layout.tsx`; importul CSS în `app/layout.tsx`. Pornește `initMotion()` o singură dată (o variabilă la nivel de modul, ca Strict Mode să nu-l ruleze de două ori).
- Dacă site-ul folosește navigare fără reîncărcare (Astro ClientRouter / View Transitions, Barba etc.), spune-i utilizatorului că animațiile pornesc doar la încărcarea completă a paginii.

## Site HTML simplu (fără package.json)

**1B. Copiază doar fișierele compilate** în `assets/webcase-motion/`:
```bash
mkdir -p assets/webcase-motion && cp "${CLAUDE_PLUGIN_ROOT}/lib/webcase-motion/dist/"* assets/webcase-motion/
```

**2B. În `<head>`-ul fiecărei pagini**, în ordinea asta:
1. conținutul din `assets/webcase-motion/head-snippet.html` (cu aceeași regulă pentru loader ca la 3A);
2. stilurile: `<link rel="stylesheet" href="/assets/webcase-motion/motion.css">`;
3. harta de importuri (GSAP și Lenis vin din CDN):
```html
<script type="importmap">
{
  "imports": {
    "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.15.0/index.js",
    "gsap/ScrollTrigger": "https://cdn.jsdelivr.net/npm/gsap@3.15.0/ScrollTrigger.js",
    "gsap/SplitText": "https://cdn.jsdelivr.net/npm/gsap@3.15.0/SplitText.js",
    "lenis": "https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.mjs",
    "webcase-motion": "/assets/webcase-motion/webcase-motion.js"
  }
}
</script>
```

**3B. Pornirea**, înainte de `</body>`:
```html
<script type="module">
  import { initMotion } from "webcase-motion";
  initMotion();
</script>
```
- Căile încep cu `/`, deci site-ul trebuie servit de la rădăcină. Dacă nu e, folosește căi relative corecte pentru fiecare pagină.
- Paginile trebuie deschise printr-un server local (de ex. `npx serve`), nu direct din fișier (`file://`), altfel modulele nu se încarcă.

## 5. Verifică
- Pornește proiectul (serverul de dev sau `npx serve`) și deschide pagina în browser.
- În consolă: zero erori. Pe `<html>` trebuie să apară clasele `wm-anim wm-ready wm-intro`.
- Pagina se derulează normal și nimic nu rămâne ascuns.
- Nu schimba texte, layout sau design în timpul instalării.

## 6. Spune-i utilizatorului, simplu
Un mesaj scurt, fără cod:
1. ce ai făcut (ex. „Am adăugat biblioteca de animații. Încă nu se mișcă nimic: acum alegem ce animăm.”);
2. ce poate cere mai departe, ca exemple de prompturi:
   - „Animează pagina cu webcase-motion, cu maximum 2 efecte wow.”
   - „Pune split-lines pe titlurile secțiunilor.”
   - „Fă din lista de beneficii un rows-wipe cu bife.”
3. că alegerea animațiilor urmează regulile din skill-ul `webcase-motion` (catalog, timing aprobat, fără fade).

Dacă utilizatorul a cerut direct și animații (ex. „/webcase-motion:add și animează pagina”), continuă cu skill-ul `webcase-motion` după instalare.
