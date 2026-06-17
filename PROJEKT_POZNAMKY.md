# Osmisměrka - poznámky k projektu

Aktuální stav k 2026-06-16. Tento soubor slouží jako rychlý kontext pro další úpravy aplikace.

## Repo a spuštění

- Lokální projekt: `/Users/nfix/Library/Mobile Documents/com~apple~CloudDocs/Programování/Github/Web/slovni_hledaci_hadanka`
- GitHub: `https://github.com/djnfix/osmismerka.git`
- Produkční/deploy URL používaná při testování: `https://osmismerka.vercel.app`
- Lokální test: `python3 -m http.server 8787 --bind 127.0.0.1`
- Lokální URL: `http://localhost:8787/`
- Poslední push: `origin/main`, commit `053e65a Improve word search generation`

## Současná struktura

- `index.html` - statická kostra aplikace a výsledkový dialog tajenky.
- `styles.css` - layout, responzivita, vzhled mřížky, seznamu slov a popupu.
- `levels.js` - generátor levelů, obtížnosti, slovník, tajenky a validační logika generování.
- `app.js` - interakce, výběr slov tahem prstu/myší, render čar, runtime validace slov a popup po dohrání.

## Aktuální požadavky

- Aplikace je interaktivní česká osmisměrka pro iPad i desktop.
- Výběr slov musí fungovat tahem prstu i myší.
- Hledaná slova mají českou diakritiku.
- Krátká 3písmenná slova se nepoužívají, protože snadno vznikají v mřížce náhodně vícekrát.
- Každé hledané slovo musí být v hotové mřížce právě jednou.
- Slova se nemají opakovat napříč osmisměrkami tak nápadně jako dřív.
- Pozice a směry slov se mají výrazně měnit mezi levely.
- Blok `Tajenka` se během hry zobrazuje v levém panelu.
- Během hry ukazuje jen nápovědní část a hledanou tajenku jako tečky po slovech.
- Celá tajenka se ukáže až po nalezení všech slov v zavíratelném popupu.
- Tlačítko `Nová osmisměrka` načte jiný náhodný level ve stejné obtížnosti.
- Výchozí obtížnost je `Těžká`.

## Obtížnosti

- `Lehká`: 10 x 10, 12-18 slov, délka slov 4-8, jednodušší směry.
- `Střední`: 13 x 13, 18-26 slov, délka slov 4-11, přidává opačné směry.
- `Těžká`: 16 x 16, 27-36 slov, délka slov 4-16, všech 8 směrů.

Obtížnost se ukládá do `localStorage` pod klíčem `wordSearchDifficulty`.
Poslední level se ukládá zvlášť pro každou obtížnost pod klíčem `wordSearchLastLevel:<difficulty>`.

## Aktuální design

- Podklad celé stránky: baby pink `#fff1f7`.
- Hlavní panely jsou bílé.
- Levá strana má:
  - horní info kartu s obtížností a tlačítkem `Nová osmisměrka`
  - kartu `Hledaná slova`
  - kartu `Tajenka` s nápovědou a tečkovanou maskou
- Plná tajenka se zobrazuje až ve `.result-dialog` po dohrání.
- Popup má zavírací tlačítko, zavření přes klik mimo panel a zavření přes `Escape`.
- Popup obsahuje také tlačítko `Nová osmisměrka`.
- Pravá strana je bílá karta s osmisměrkou.
- Hrací plocha musí zůstat čtvercová.
- Cíl pro iPad Pro 11 na šířku: bez scrollování a bez ořezu spodní části.
- Zvýrazňovací barvy slov jsou pastelové odstíny v `app.js` v poli `colors`.

## Důležité layoutové poznámky

- Výška aplikace používá CSS proměnnou `--visual-height`, kterou nastavuje `app.js` z `window.visualViewport.height`.
- To je důležité hlavně pro iPad/Safari, kde klasické `100vh` neodpovídá vždy viditelné ploše.
- `.app-shell` má `overflow: hidden`, aby se hra na iPadu nesnažila scrollovat.
- `.game-card` má omezenou výšku `min(610px, calc(var(--visual-height) - 16px))`.
- `.board-wrap` má `aspect-ratio: 1`, aby osmisměrka zůstala čtvercová.
- Seznam slov nesmí scrollovat. `app.js` má funkci `fitWordList()`, která automaticky zmenšuje slova přes CSS proměnnou `--word-scale`.
- Na mobilech se layout přepne do jednoho sloupce a seznam slov má omezenou výšku.

## Výběr slov a zvýraznění

- Výběr funguje přes pointer events, ne přes click.
- Aktivní náhled tahu má tyrkysovou barvu `#63dce2`.
- Nalezená slova se kreslí jako SVG linky v `app.js`.
- Tloušťka linky:
  - `strokeWidth = Math.max(13, state.cellSize * 0.56)`
- Přesah linky:
  - `extension = Math.max(4, state.cellSize * 0.08)`
- Aplikace při načtení levelu validuje, že souřadnice každého slova odpovídají textu.
- Aplikace zároveň runtime validuje, že každé hledané slovo existuje v mřížce právě jednou.

## Generátor levelů

- Generátor umisťuje slova tak, aby všechna zbylá neoznačená pole přesně odpovídala tajence bez mezer.
- Hledaných slov je záměrně víc než v předchozí verzi, aby v mřížce zbyl jen text tajenky.
- `SUCCESSFUL_ATTEMPTS` obsahuje předpočítaný úspěšný seed offset pro každý index a obtížnost, aby se konkrétní level v prohlížeči nestavěl dlouhou fallback smyčkou.
- Generátor zároveň kontroluje jednoznačnost každého hledaného slova.
- `WORD_BANK` má aktuálně 1033 použitelných slov.
- Krátká slova pod 4 písmena se filtrují přes `MIN_WORD_LENGTH = 4`.
- `MAX_LEVELS = 130`.
- Reálně se při validačním průchodu použilo 988 různých slov napříč všemi levely a obtížnostmi.
- `QUOTES` má 130 tajenek.
- `createWordSearchLevel(index, { difficulty })` vytvoří konkrétní level deterministicky podle indexu, obtížnosti a pokusu.
- Hledaná slova jsou uložená s přesnými `cells`, takže uživatel může zaškrtnout jen zamýšlený výskyt.
- `hasUniquePlacedWordOccurrences()` odmítne hotovou mřížku, pokud se některé hledané slovo dá přečíst více než jednou.
- `secretCells` jsou přesně pole, která po nalezení všech slov zůstávají neoznačená.

## Ověření před pushem

Rychlá syntaktická kontrola:

```sh
node --check app.js
node --check levels.js
git diff --check
```

Kompletní kontrola generátoru všech 130 levelů pro všechny 3 obtížnosti:

```sh
node -e 'const fs=require("fs"); const vm=require("vm"); const ctx={window:{}}; vm.runInNewContext(fs.readFileSync("levels.js","utf8"), ctx, {filename:"levels.js"}); const dirs=[{r:0,c:1},{r:0,c:-1},{r:1,c:0},{r:-1,c:0},{r:1,c:1},{r:1,c:-1},{r:-1,c:1},{r:-1,c:-1}]; const stats={wordBank:ctx.window.WORD_SEARCH_WORD_BANK_SIZE, levelCount:ctx.window.WORD_SEARCH_LEVEL_COUNT, generated:0, minWords:Infinity, maxWords:0, minLength:Infinity, maxLength:0, uniqueUsed:0, directions:{}}; const used=new Set(); function inside(r,c,n){return r>=0&&c>=0&&r<n&&c<n;} function cellsEqual(a,b){return a.length===b.length&&a.every((cell,i)=>cell.row===b[i].row&&cell.col===b[i].col);} function wordAt(rows,cells){return cells.map(cell=>[...rows[cell.row]][cell.col]).join("");} function occurrences(rows,word){const grid=rows.map(row=>[...row]); const letters=[...word]; const found=[]; for(let r=0;r<grid.length;r++){for(let c=0;c<grid.length;c++){if(grid[r][c]!==letters[0]) continue; for(const d of dirs){const endR=r+d.r*(letters.length-1); const endC=c+d.c*(letters.length-1); if(!inside(endR,endC,grid.length)) continue; const cells=[]; let ok=true; for(let i=0;i<letters.length;i++){const rr=r+d.r*i; const cc=c+d.c*i; if(grid[rr][cc]!==letters[i]){ok=false; break;} cells.push({row:rr,col:cc});} if(ok) found.push(cells);}}} return found;} for(const diff of ctx.window.WORD_SEARCH_DIFFICULTIES){for(let i=0;i<ctx.window.WORD_SEARCH_LEVEL_COUNT;i++){const level=ctx.window.createWordSearchLevel(i,{difficulty:diff.key}); stats.generated++; if(level.rows.length!==diff.gridSize) throw new Error(level.id+" wrong row count"); if(level.rows.some(row=>[...row].length!==diff.gridSize)) throw new Error(level.id+" wrong row length"); const words=new Set(); stats.minWords=Math.min(stats.minWords,level.words.length); stats.maxWords=Math.max(stats.maxWords,level.words.length); for(const entry of level.words){if(words.has(entry.text)) throw new Error(level.id+" duplicate listed word "+entry.text); words.add(entry.text); used.add(entry.text); stats.minLength=Math.min(stats.minLength,[...entry.text].length); stats.maxLength=Math.max(stats.maxLength,[...entry.text].length); const spelled=wordAt(level.rows,entry.cells); if(spelled!==entry.text) throw new Error(level.id+" bad cells for "+entry.text+" got "+spelled); const found=occurrences(level.rows,entry.text); if(found.length!==1) throw new Error(level.id+" occurrence count "+entry.text+" = "+found.length); if(!cellsEqual(found[0],entry.cells)) throw new Error(level.id+" occurrence cells mismatch "+entry.text); stats.directions[entry.direction]=(stats.directions[entry.direction]||0)+1;}}} stats.uniqueUsed=used.size; console.log(JSON.stringify(stats,null,2));'
```

Poslední ověřený výsledek:

```json
{
  "wordBank": 1033,
  "levelCount": 130,
  "generated": 390,
  "minWords": 12,
  "maxWords": 34,
  "minLength": 4,
  "maxLength": 14,
  "uniqueUsed": 988,
  "directions": {
    "NE": 911,
    "SE": 1330,
    "E": 1336,
    "S": 1335,
    "N": 908,
    "W": 906,
    "SW": 912,
    "NW": 480
  }
}
```

## Poslední důležité commity

- `053e65a` - přepsání generátoru, větší slovník, jednoznačné výskyty slov, popup tajenky.
- `16b4058` - přidání projektových poznámek.
- `05073e2` - bílé panely a nadpis `Hledaná slova`.
- `04aa249` - přepínač obtížnosti.
- `40af470` - obnovení šířky hrací plochy a tenčí výběrové linky.
- `ba70d24` - prevence ořezu zvýraznění a čtvercová karta.

## Pozor při dalších úpravách

- Na desktopu může layout vypadat dobře, ale iPad Safari je rozhodující test.
- Nesmí se objevit scroll v levém panelu se slovy.
- Nesmí se ořezat spodní řádek osmisměrky.
- Nesmí se znovu přidat počítadlo `0 / x nalezeno`.
- Blok tajenky v levém panelu nesmí odhalit řešení, má ukazovat jen tečkovanou masku.
- Karty mají zůstat bílé, podklad celé stránky baby pink.
- Před pushem vždy spustit kontrolu generátoru, protože každé hledané slovo musí mít právě jeden výskyt.
- Při přidávání slov dávat pozor na podřetězce: pokud jedno slovo obsahuje jiné hledané slovo, může to zhoršit jednoznačnost.
- Pokud se změní slovník, tajenky, obtížnosti nebo seedování, znovu spočítat `SUCCESSFUL_ATTEMPTS` a ověřit všech 390 kombinací levelů.
