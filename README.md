# webcase-motion · plugin pentru Claude Code

Animații web în stilul Webcase, folosite direct din Claude Code. Nu scrii cod: îi spui lui Claude ce vrei, iar el folosește animațiile și regulile din plugin.

## Ce primești

- **Biblioteca** de animații: 24 de animații și 6 efecte de hover.
- **Skill-ul `webcase-motion`**: Claude cunoaște catalogul, timing-ul aprobat și regulile (fără fade, hover discret, maximum 1–2 efecte „wow” pe pagină).
- **Comanda `/webcase-motion:add`**: adaugă biblioteca într-un proiect, cu tot ce trebuie configurat.

## Instalare (o singură dată)

**În aplicația Claude (desktop), tab-ul Code:**

1. Pornește o sesiune nouă, în orice folder.
2. Trimite promptul de mai jos. Claude îți cere voie să-ți modifice setările; apasă **Allow**.

   ```text
   Instalează plugin-ul webcase-motion pentru Claude Code. În fișierul meu de setări ~/.claude/settings.json adaugă, fără să ștergi nimic din ce există: la „extraKnownMarketplaces”, intrarea „webcase” cu { "source": { "source": "github", "repo": "vasilievsergiu/webcase-motion" }, "autoUpdate": true }; la „enabledPlugins”, „webcase-motion@webcase”: true. La final, spune-mi să pornesc o sesiune nouă.
   ```

3. Pornește încă o sesiune nouă. Claude Code descarcă plugin-ul singur, iar de acum merge în toate proiectele tale.

Dacă Mac-ul îți cere să instalezi „command line developer tools”, apasă **Install** și așteaptă să termine.

**În terminal** (opțional), două comenzi:

```bash
claude plugin marketplace add vasilievsergiu/webcase-motion
```

```bash
claude plugin install webcase-motion@webcase
```

## Folosire

În proiectul tău, în Claude Code:

1. **Adaugi biblioteca:** scrii `/webcase-motion:add`. Claude instalează tot ce trebuie și îți spune când e gata.
2. **Ceri animații în cuvinte**, de exemplu:
   - „Animează pagina cu webcase-motion, cu maximum 2 efecte wow.”
   - „Pune split-lines pe titlurile secțiunilor.”
   - „Fă din lista de beneficii un rows-wipe cu bife.”
   - „Verifică animațiile pe desktop, tabletă și mobil.”

Lista completă de animații, cu exemple live și prompturi gata de copiat, e pe pagina demo.

## Actualizare și dezinstalare

- **Versiunile noi** vin singure, la pornirea unei sesiuni noi (`autoUpdate`).
- **Dezinstalare:** cere-i lui Claude „Scoate plugin-ul webcase-motion din setările mele”, sau rulează în terminal:

  ```bash
  claude plugin uninstall webcase-motion@webcase
  ```
