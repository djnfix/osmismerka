# Osmisměrka - poznámky k projektu

Aktuální stav k 2026-06-08. Tento soubor slouží jako rychlý kontext pro další úpravy aplikace.

## Repo a spuštění

- Lokální projekt: `/Users/nfix/Library/Mobile Documents/com~apple~CloudDocs/Programování/Github/Web/slovni_hledaci_hadanka`
- GitHub: `https://github.com/djnfix/osmismerka.git`
- Deploy: Vercel, veřejná URL používaná při testování: `https://osmismerka.vercel.app`
- Lokální test: `python3 -m http.server 8787 --bind 127.0.0.1`
- Lokální URL: `http://localhost:8787/`

## Současná struktura

- `index.html` - statická kostra aplikace.
- `styles.css` - kompletní layout, barvy, responzivita a vzhled písmen.
- `levels.js` - generátor 100 levelů, slovník slov, tajenky, obtížnosti.
- `app.js` - interakce, výběr slov tahem prstu/myší, ukládání stavu, render čar.

## Hlavní požadavky

- Aplikace je interaktivní osmisměrka pro iPad, výběr slov musí fungovat tahem prstu.
- Tajenka vzniká pouze ze zbylých neoznačených písmen.
- Slova musí mít českou diakritiku.
- Slova se ukládají do osmisměrky všemi 8 směry: vodorovně, svisle i šikmo, oběma směry.
- Při načtení se otevře náhodný level.
- Tlačítko `Nová osmisměrka` načte jiný náhodný level ve stejné obtížnosti.
- Výchozí obtížnost je `Těžká`.

## Obtížnosti

- `Lehká`: 10 x 10
- `Střední`: 13 x 13
- `Těžká`: 16 x 16

Obtížnost se ukládá do `localStorage` pod klíčem `wordSearchDifficulty`.
Poslední level se ukládá zvlášť pro každou obtížnost pod klíčem `wordSearchLastLevel:<difficulty>`.

## Aktuální design

- Podklad celé stránky: baby pink `#fff1f7`.
- Všechny hlavní tabulky/karty mají bílé podbarvení.
- Levá strana má 3 části:
  - horní info karta s obtížností a tlačítkem `Nová osmisměrka`
  - karta `Hledaná slova`
  - karta `Tajenka`
- Pravá strana je karta s osmisměrkou.
- Hrací plocha musí zůstat čtvercová.
- Cíl pro iPad Pro 11 na šířku: bez scrollování a bez ořezu spodní části.
- Šedé stroke kolem tabulek byly odstraněny, design má být čistý, fresh a jemný.
- Zvýrazňovací barvy slov jsou veselejší pastelové odstíny definované v `app.js` v poli `colors`.

## Důležité layoutové poznámky

- Výška aplikace používá CSS proměnnou `--visual-height`, kterou nastavuje `app.js` z `window.visualViewport.height`.
- To je důležité hlavně pro iPad/Safari, kde klasické `100vh` neodpovídá vždy viditelné ploše.
- `.app-shell` má `overflow: hidden`, aby se hra na iPadu nesnažila scrollovat.
- `.game-card` má omezenou výšku `min(610px, calc(var(--visual-height) - 16px))`.
- `.board-wrap` má `aspect-ratio: 1`, aby osmisměrka zůstala čtvercová.
- Seznam slov nesmí scrollovat. `app.js` má funkci `fitWordList()`, která automaticky zmenšuje slova přes CSS proměnnou `--word-scale`.

## Výběr slov a zvýraznění

- Výběr funguje přes pointer events, ne přes click.
- Aktivní náhled tahu má tyrkysovou barvu `#63dce2`.
- Nalezená slova se kreslí jako SVG linky v `app.js`.
- Tloušťka linky je teď:
  - `strokeWidth = Math.max(13, state.cellSize * 0.56)`
- Přesah linky je:
  - `extension = Math.max(4, state.cellSize * 0.08)`
- Linky byly dříve moc tlusté a při diagonále zasahovaly do okolních písmen. Při dalších úpravách testovat hlavně diagonální slova.

## Generátor levelů

- `levels.js` obsahuje slovník `WORD_BANK` a 100 pozitivních tajenek v `QUOTES`.
- `createWordSearchLevel(index, { difficulty })` vytvoří konkrétní level.
- Generátor umisťuje slova tak, aby zbylá neobsazená pole přesně odpovídala tajence bez mezer.
- `secretCells` jsou pole tajenky, ale uživatel vidí jen masku a po vyřešení celou větu.
- Slova se řadí abecedně přes `localeCompare(..., "cs")`.

## Ověření před pushem

Rychlá syntaktická kontrola:

```sh
node --check app.js
node --check levels.js
```

Kompletní kontrola všech 100 levelů pro všechny 3 obtížnosti:

```sh
node -e "global.window={}; require('./levels.js'); const ds=window.WORD_SEARCH_DIFFICULTIES; const letters=s=>[...s.replace(/\s+/g,'').toUpperCase()].join(''); for (const d of ds){ const dirs=new Set(); let min=Infinity,max=0; for(let i=0;i<window.WORD_SEARCH_LEVEL_COUNT;i++){ const level=window.createWordSearchLevel(i,{difficulty:d.key}); if(level.rows.length!==d.gridSize) throw new Error('bad size '+d.key+' '+i); if(!level.rows.every(row=>[...row].length===d.gridSize)) throw new Error('bad row '+d.key+' '+i); min=Math.min(min,level.words.length); max=Math.max(max,level.words.length); const used=new Set(); for(const entry of level.words){ const text=entry.cells.map(c=>[...level.rows[c.row]][c.col]).join(''); if(text!==entry.text) throw new Error('bad word '+d.key+' '+i+' '+entry.text+' '+text); const dr=Math.sign(entry.cells.at(-1).row-entry.cells[0].row); const dc=Math.sign(entry.cells.at(-1).col-entry.cells[0].col); dirs.add(dr+','+dc); entry.cells.forEach(c=>used.add(c.row+':'+c.col)); } const leftover=[]; level.rows.forEach((row,r)=>[...row].forEach((letter,c)=>{ if(!used.has(r+':'+c)) leftover.push(letter); })); if(leftover.join('')!==letters(level.secret)) throw new Error('bad secret '+d.key+' '+i+' '+leftover.join('')+' !== '+letters(level.secret)); } console.log(d.key,d.gridSize,'words',min+'-'+max,'dirs',[...dirs].sort().join(' ')); }"
```

Očekávaný směr výstupu:

```text
easy 10 words 12-18 dirs -1,-1 -1,0 -1,1 0,-1 0,1 1,-1 1,0 1,1
medium 13 words 18-26 dirs -1,-1 -1,0 -1,1 0,-1 0,1 1,-1 1,0 1,1
hard 16 words 27-36 dirs -1,-1 -1,0 -1,1 0,-1 0,1 1,-1 1,0 1,1
```

## Poslední důležité commity

- `05073e2` - bílé panely a nadpis `Hledaná slova`
- `04aa249` - přepínač obtížnosti
- `40af470` - obnovení šířky hrací plochy a tenčí výběrové linky
- `ba70d24` - prevence ořezu zvýraznění a čtvercová karta
- `900d866` - oprava iPad viewportu a highlight pills

## Pozor při dalších úpravách

- Na desktopu může layout vypadat dobře, ale iPad Safari je rozhodující test.
- Nesmí se objevit scroll v levém panelu se slovy.
- Nesmí se ořezat spodní řádek osmisměrky.
- Nesmí se znovu přidat počítadlo `0 / x nalezeno`.
- Karty mají zůstat bílé, podklad celé stránky baby pink.
- Před pushem vždy spustit kontrolu levelů, protože tajenka musí přesně sedět.
