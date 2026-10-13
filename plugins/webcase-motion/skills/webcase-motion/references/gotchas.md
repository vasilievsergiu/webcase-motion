# Capcane rezolvate (citește înainte să scrii cod de animație)

Fiecare punct de mai jos a fost un bug real, văzut pe iPhone sau desktop.

## Text
1. **SplitText distruge `&nbsp;`** → ultimul cuvânt rămâne singur pe rând (mai ales pe iPhone). Folosește mereu `reduceWhiteSpace: false`.
2. **Pune `&nbsp;` între ultimele două cuvinte** ale textelor mari (titluri, subtitluri), plus `text-wrap: balance` pe titlurile de pe mobil.
3. **Masca rândurilor taie diacriticele** (Î, â sus; g, ș, ț jos) dacă e `overflow: hidden/clip` exact pe înălțimea rândului; plus textul „sare” la final. Fix: `overflow: visible` + `clip-path: inset(-0.25em -0.2em -0.22em -0.2em)` pe mască.
4. **Împărțire greșită pe rânduri** (un „rând” mai înalt de 1,5 × line-height — apare la texte cu `<span>` colorat): renunță la split și animă textul întreg.
5. **Fonturile trebuie încărcate** înainte de split (`document.fonts.ready`, cu timeout 1,5s), altfel rândurile se calculează greșit.
6. Pe mobil, textele mari au nevoie de line-height puțin mai mare (~1,14), altfel rândurile se ating în timpul animației.

## Scroll / pin
7. **Pin într-un părinte flex** → secțiunile se suprapun. Folosește `pinSpacing: true` și **nicio margine** pe elementul fixat (ScrollTrigger îi dă lățimea cu tot cu margini → scroll orizontal). Inset-ul lateral = `border` transparent + `background-clip: padding-box`.
8. Triggerele create **înaintea** unui pin, dar aflate mai jos în pagină: `refreshPriority: -1` sau creează-le după pin.
9. `ScrollTrigger.config({ ignoreMobileResize: true })` — altfel bara de adresă de pe iPhone recalculează pin-urile și secțiunile sar.
10. `ScrollTrigger.refresh()` la `window.load` (imaginile schimbă înălțimile).
11. Titluri care vin din lateral (`split-sides`) → `overflow: clip` pe secțiune, altfel apare scroll orizontal.

## Slidere
12. **Scroll-snap + transform pe slotul de snap = buclă infinită** (sliderul „se mișcă singur la nesfârșit”). Slotul (`li`) face snap și nu se mișcă; transformi doar cardul din interior.
13. Pe iOS, o listă orizontală se poate trage și vertical → `overflow-y: hidden` + resetare `scrollTop` la scroll.
14. Cardurile din slider nu primesc `scale` la hover (mută punctul de snap).
15. Animația de intrare a sliderului nu trebuie să iasă din cutia lui (nu peste imaginile de deasupra).

## Hover
16. GSAP scrie inline `translate: none; rotate: none; scale: none` pe ce animă → hover-ul din CSS pe aceleași elemente are nevoie de `!important` sau de o proprietate separată (`translate`/`rotate` individuale, nu `transform`).
17. Rotațiile de bază ale cardurilor: `transform: rotate(var(--r))` (GSAP o citește), nu proprietatea `rotate`.
18. Hover doar cu `(min-width: 992px) and (hover: hover) and (pointer: fine)` — pe telefon „hover-ul” rămâne lipit după tap.
19. Hover pe un grup de carduri suprapuse: **nu schimba z-index-ul** (niciun card nu sare deasupra altuia sau a imaginii).

## Loader / intro
20. Loader-ul acoperă tot ecranul **fără colțuri rotunjite** (pe telefon se vede alb în colțuri); colțurile de jos apar doar cât urcă.
21. Intrarea primului ecran pornește **după** ce foaia loader-ului a trecut de titlu (~1,3s), nu la final și nici la început.
22. Loader-ul rulează o singură dată pe sesiune (`sessionStorage`); dacă JS nu pornește în 4s, se scoate și pagina apare.
23. Elementele primului ecran sunt ascunse din CSS până pornește intro-ul (fără flash), dar **doar** sub `html.wm-anim`.

## Imagini / SVG
24. **SVG cu `mask`/`filter` (blur) într-un `<img>` e pixelat pe iOS** (Safari îl rasterizează la 1x). Pune-l inline sau simplifică-l.
25. Parallax pe imagini: imaginea are nevoie de rezervă (`scale: 1.14`), altfel apar goluri la margini.

## Verificare
26. În panoul de preview, `requestAnimationFrame` îngheață între comenzi: o captură poate prinde mijlocul animației. Așteaptă sau citește starea finală cu `gsap.getProperty`.
27. Verifică pe build-ul de producție, nu doar în dev (ordinea CSS poate diferi).

## Pop-up
28. **Pop-up / modal cu scroll intern + Lenis:** Lenis interceptează rotița în toată pagina → panoul nu se derulează, se mișcă pagina din spate. Pune `data-lenis-prevent` pe `<dialog>`, blochează pagina cât e deschis (`html:has(dialog[open]) { overflow: hidden }`), `overscroll-behavior: contain` pe panou și `max-height: 90dvh`.
