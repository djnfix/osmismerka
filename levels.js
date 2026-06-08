(function () {
  "use strict";

  const GRID_SIZE = 16;
  const MAX_LEVELS = 100;
  const MIN_WORD_LENGTH = 3;
  const DIRECTIONS = [
    { code: "E", row: 0, col: 1 },
    { code: "W", row: 0, col: -1 },
    { code: "S", row: 1, col: 0 },
    { code: "N", row: -1, col: 0 },
    { code: "SE", row: 1, col: 1 },
    { code: "SW", row: 1, col: -1 },
    { code: "NE", row: -1, col: 1 },
    { code: "NW", row: -1, col: -1 }
  ];

  const WORD_BANK = uniqueWords([
    "ŠKOLA", "ŘEKA", "ŽÁBA", "KOČKA", "KŮŇ", "DŮM", "ČÁP", "DÉŠŤ", "MĚSTO", "HŘIŠTĚ",
    "KAVÁRNA", "ČOKOLÁDA", "KAMARÁD", "POHÁDKA", "PŘÍBĚH", "PRÁZDNINY", "UČITELKA", "ŽÁK",
    "UČEBNICE", "TABULE", "SEŠIT", "TUŽKA", "PASTELKA", "KNIŽKA", "KNIHOVNA", "DĚDEČEK",
    "BABIČKA", "RODINA", "MAMINKA", "TATÍNEK", "SESTRA", "BRÁCHA", "DĚTI", "HRAČKA",
    "PANENKA", "AUTÍČKO", "KOLOBĚŽKA", "LETADLO", "NÁDRAŽÍ", "VLAK", "TRAMVAJ", "LOĎKA",
    "PŘÍSTAV", "MOST", "SILNICE", "KŘIŽOVATKA", "SEMÁFOR", "ZAHRADA", "KVĚTINA", "STROM",
    "LÍSTEK", "VĚTEV", "KOŘEN", "JABLKO", "HRUŠKA", "TŘEŠEŇ", "JAHODA", "BORŮVKA",
    "MALINA", "MRKEV", "OKURKA", "RAJČE", "PAPRIKA", "BRAMBORA", "POLÉVKA", "KOLÁČ",
    "DORTÍK", "ZMRZLINA", "LÍVANEC", "ŠŤÁVA", "VODA", "ČAJ", "KÁVA", "MLÉKO",
    "SÝR", "MÁSLO", "CHLÉB", "ROHLÍK", "VEČEŘE", "SNÍDANĚ", "OBĚD", "NEDĚLE",
    "PONDĚLÍ", "ÚTERÝ", "STŘEDA", "ČTVRTEK", "PÁTEK", "SOBOTA", "HODINY", "MINUTA",
    "VTEŘINA", "RÁNO", "POLEDNE", "VEČER", "NOC", "MĚSÍC", "SLUNCE", "HVĚZDA",
    "OBLAK", "DUHA", "SNÍH", "VÍTR", "BOUŘKA", "MRAZÍK", "TEPLO", "MOŘE",
    "PLÁŽ", "OSTROV", "POTOK", "JEZERO", "RYBNÍK", "LOUKA", "LES", "HORA",
    "ÚDOLÍ", "SKÁLA", "JESKYNĚ", "CESTA", "VÝLET", "TÁBOR", "STAN", "BATOH",
    "MAPA", "KOMPAS", "LUCERNA", "PÍŠŤALKA", "KYTARA", "PÍSNIČKA", "TANEC", "DIVADLO",
    "KINO", "MUZEUM", "GALERIE", "OBRAZ", "ŠTĚTEC", "BARVA", "PLÁTNO", "FOTKA",
    "KAMERA", "TELEFON", "POČÍTAČ", "TABLET", "OBRAZOVKA", "KLÁVESY", "MYŠ", "TISKÁRNA",
    "ZPRÁVA", "DOPIS", "BALÍK", "POŠTA", "ZNÁMKA", "ADRESA", "MÍČ", "BRANKA",
    "TENIS", "LYŽE", "SÁŇKY", "BRUSLE", "PLAVÁNÍ", "BĚHÁNÍ", "SKOKAN", "VÍTĚZ",
    "ODMĚNA", "POHÁR", "MEDAILE", "ZÁVOD", "HÁDANKA", "TAJENKA", "OTÁZKA", "ODPOVĚĎ",
    "ŘEŠENÍ", "NÁPAD", "PAMĚŤ", "ÚSMĚV", "RADOST", "ŠTĚSTÍ", "PŘÁNÍ", "DÁREK",
    "SVÁTEK", "OSLAVA", "KYTICE", "PÍRKO", "ČEPICE", "RUKAVICE", "BUNDA", "KABÁT",
    "BOTY", "ŠATY", "SUKNĚ", "KALHOTY", "KOŠILE", "BRÝLE", "HŘEBEN", "RUČNÍK",
    "MÝDLO", "KARTÁČ", "ZRCADLO", "POLŠTÁŘ", "PEŘINA", "POSTEL", "ŽIDLE", "STOLEK",
    "OKNO", "DVEŘE", "KLÍČ", "SVĚTLO", "LAMPA", "KOBEREC", "KUCHYNĚ", "KOUPELNA",
    "LOŽNICE", "OBÝVÁK", "SKŘÍŇ", "POLICE", "ŠUPLÍK", "ČÁRA", "DÍRA", "KŮRA",
    "RŮŽE", "ŠÁLA", "PŮDA", "BŘEH", "MÍSA", "ŽÁR", "ŘÁD", "PŮL",
    "DÝM", "LÉK", "ŠÍP", "NŮŽ", "RÁJ", "SŮL", "TÝM", "HRÁČ",
    "HLAVA", "SRDCE", "RUKA", "NOHA", "OKO", "UCHO", "NOS", "TVÁŘ",
    "ŽIVOT", "SVĚT", "NÁVRAT", "POMOC", "DŮVĚRA", "KLID", "SÍLA", "ODVAHA",
    "LÁSKA", "NADĚJE", "VDĚK", "CÍL", "SMĚR", "KROK", "DEN", "CHVÍLE",
    "ZAČÁTEK", "KONEC", "PROMĚNA", "ZÁZRAK", "TICHO", "HLAS", "ÚKOL", "PLÁN",
    "ZVONEK", "KORUNA", "OHEŇ", "KÁMEN", "PERLA", "KŘÍDLO", "KAPKA", "KRUH",
    "HŮLKA", "KOŠÍK", "MISKA", "TAŠKA", "LŽÍCE", "VIDLIČKA", "HRNEK", "SVÍČKA",
    "ANTAGONISTA", "DELTAPLÁN", "NEDOKOŠENEC", "NEDONOŠENEC", "ZMOCNĚNÍ", "SODOMIE",
    "PARLAMENTÁŘ", "AKVIZICE", "KONTRABAND", "DYSKALKULIE", "FENOMENOLOGIE", "INFRASTRUKTURA",
    "METAMORFÓZA", "KONSTELACE", "REKONSTRUKCE", "KONSTRUKTÉR", "REDAKTORKA", "MORFOLOGIE",
    "PARADOXNÍ", "SYNCHRONIZACE", "DEZINFORMACE", "KONSENZUS", "KOMPROMIS", "ARCHITEKTURA",
    "ADMINISTRATIVA", "LEGISLATIVA", "DEMOKRACIE", "DIPLOMACIE", "KOMUNIKACE", "ORGANIZACE",
    "KONFERENCE", "PROJEKTANT", "KANDIDATURA", "PERSPEKTIVA", "INICIATIVA", "STRATEGIE",
    "ARGUMENTACE", "INTERPRETACE", "KONCENTRACE", "ORIENTACE", "TRANSFORMACE", "KONZERVATOŘ",
    "LABORATOŘ", "BIOLOGIE", "PSYCHOLOGIE", "SOCIOLOGIE", "FILOZOFIE", "ETIMOLOGIE",
    "KALIGRAFIE", "TYPOGRAFIE", "KARTOGRAFIE", "HYDROLOGIE", "GEOLOGIE", "ASTRONOMIE",
    "KOSMONAUTIKA", "MATEMATIKA", "STATISTIKA", "MECHANIKA", "ELEKTRONIKA", "ROBOTIKA",
    "ALGORITMUS", "PROGRAMÁTOR", "PROMĚNNÁ", "KOMPILACE", "PARAMETR", "PROCEDURA",
    "KATEGORIE", "HIERARCHIE", "SYMETRIE", "GEOMETRIE", "FRAKCE", "FUNKCE",
    "ROVNICE", "KOEFICIENT", "KONSTANTA", "PARABOLA", "HYPERBOLA", "PERSPEKTIVA",
    "RENESANCE", "BAROKO", "ROMANTISMUS", "REALISMUS", "SYMBOLISMUS", "IMPRESE",
    "KOMPOZICE", "ILUSTRACE", "KALENDÁŘ", "KRONIKÁŘ", "ARCHIVÁŘ", "KNIHOVNÍK",
    "PARLAMENT", "MINISTERSTVO", "ZASTUPITEL", "VELVYSLANEC", "REFERENDUM", "REZOLUCE",
    "KOMPETENCE", "OPRÁVNĚNÍ", "POVĚŘENÍ", "USNESENÍ", "PROHLÁŠENÍ", "VYJEDNÁVÁNÍ",
    "HOSPODÁŘSTVÍ", "EKONOMIKA", "INVESTICE", "DIVIDENDA", "INFLACE", "KALKULACE",
    "GARANCE", "RIZIKO", "ANALÝZA", "DIAGNÓZA", "TERAPIE", "CHIRURGIE",
    "ANESTEZIE", "ANATOMIE", "FYZIOLOGIE", "NEUROLOGIE", "PEDIATRIE", "KARDIOLOGIE",
    "MIKROSKOP", "TELESKOP", "SPEKTROMETR", "CHROMOZOM", "MOLEKULA", "ENZYM",
    "BAKTERIE", "VIRUS", "EVOLUCE", "ADAPTACE", "BIOTOP", "EKOSYSTÉM",
    "ATMOSFÉRA", "BIOSFÉRA", "HYDROSFÉRA", "KONTINENT", "SOUOSTROVÍ", "POLOOSTROV",
    "ROVNOBĚŽKA", "POLEDNÍK", "MERIDIÁN", "MAGNETISMUS", "GRAVITACE", "TERMODYNAMIKA",
    "FOTOSYNTÉZA", "KRYSTALIZACE", "DESTILACE", "FERMENTACE", "KATALYZÁTOR", "ELEKTROLÝZA",
    "KONCENTRÁT", "SUBSTANCE", "REAKTANT", "SLOUČENINA", "ROZPUSTNOST", "KYSELINA",
    "ALKALITA", "IZOLACE", "REAKTOR", "TURBÍNA", "GENERÁTOR", "AKUMULÁTOR"
  ]);

  const QUOTES = [
    { clue: "RÁNO", secret: "JE MOUDŘEJŠÍ VEČERA" },
    { clue: "ÚSMĚV", secret: "OTEVÍRÁ KAŽDÉ DVEŘE" },
    { clue: "KDO HLEDÁ", secret: "TEN NAKONEC NAJDE" },
    { clue: "TRPĚLIVOST", secret: "RŮŽE ČASEM PŘINÁŠÍ" },
    { clue: "LASKAVOST", secret: "SE VŽDYCKY VRACÍ" },
    { clue: "MALÝ KROK", secret: "VEDE K VELKÉ CESTĚ" },
    { clue: "KAŽDÝ DEN", secret: "JE VŽDY NOVÁ ŠANCE" },
    { clue: "DOBRÉ SLOVO", secret: "HŘEJE U DOBRÉHO SRDCE" },
    { clue: "ODVAHA", secret: "OTEVÍRÁ NOVÉ DVEŘE" },
    { clue: "NADĚJE", secret: "NIKDY ÚPLNĚ NEHASNE" },
    { clue: "RADOST", secret: "ROSTE KAŽDÝM SDÍLENÍM" },
    { clue: "KLIDNÁ MYSL", secret: "VIDÍ CESTU JASNĚ" },
    { clue: "KDO SE SMĚJE", secret: "MÁ SLUNCE HLUBOKO V SOBĚ" },
    { clue: "DOBRÝ SKUTEK", secret: "SVÍTÍ DLOUHO DÁL" },
    { clue: "POCTIVÁ PRÁCE", secret: "PŘINÁŠÍ DOBRÉ OVOCE" },
    { clue: "ČAS", secret: "UKÁŽE SPRÁVNÝ SMĚR" },
    { clue: "SRDCE", secret: "VÍ ČASTO VÍC NEŽ OČI" },
    { clue: "KDO POMÁHÁ", secret: "NIKDY NEZŮSTANE SÁM" },
    { clue: "DOMOV", secret: "JE TAM KDE JE LÁSKA" },
    { clue: "PRAVDA", secret: "MÁ TICHOU VELKOU SÍLU" },
    { clue: "SPOLEČNÁ CESTA", secret: "BÝVÁ HNED O KUS LEHČÍ" },
    { clue: "DOBRÁ RADA", secret: "MÁ OPRAVDU CENU ZLATA" },
    { clue: "TICHÝ HLÁSEK", secret: "MŮŽE MÍT VELKOU PRAVDU" },
    { clue: "MALÁ POMOC", secret: "DOKÁŽE VELKÉ VĚCI" },
    { clue: "KDO SE NEVZDÁ", secret: "DOJDE NAKONEC DÁL" },
    { clue: "ČISTÉ SVĚDOMÍ", secret: "JE MĚKKÝ POLŠTÁŘ" },
    { clue: "DOBRÁ MYŠLENKA", secret: "ROSTE V DOBRÉM ČINU" },
    { clue: "LÁSKA", secret: "DÁVÁ VĚCEM SMYSL" },
    { clue: "VDĚČNOST", secret: "MĚNÍ DEN K LEPŠÍMU" },
    { clue: "KDO NASLOUCHÁ", secret: "LÉPE DRUHÝM ROZUMÍ" },
    { clue: "JEDEN ÚSMĚV", secret: "ZLEPŠÍ CELÝ DLOUHÝ DEN" },
    { clue: "POMALU", secret: "SE DOJDE OPRAVDU NEJDÁL" },
    { clue: "KDO ZAČNE", secret: "JE UŽ NA DOBRÉ CESTĚ" },
    { clue: "DOBRÁ VŮLE", secret: "SI NAJDE DOBRÝ ZPŮSOB" },
    { clue: "JASNÝ CÍL", secret: "USNADNÍ KAŽDÝ KROK" },
    { clue: "KDO SE UČÍ", secret: "ROSTE O KOUSEK KAŽDÝ DEN" },
    { clue: "MÍR V SRDCI", secret: "JE VELKÉ BOHATSTVÍ" },
    { clue: "DOBRÝ PŘÍTEL", secret: "JE POKLAD NA CESTĚ" },
    { clue: "SÍLA", secret: "ROSTE Z VNITŘNÍHO KLIDU" },
    { clue: "KDO DĚKUJE", secret: "VIDÍ VÍC RADOSTI" },
    { clue: "PO MALÝCH KROCÍCH", secret: "VZNIKAJÍ ZÁZRAKY" },
    { clue: "DOBRÉ SRDCE", secret: "NIKDY NEZTRÁCÍ SMĚR" },
    { clue: "KLID", secret: "JE ČASTO PŮL ÚSPĚCHU" },
    { clue: "KDO VĚŘÍ", secret: "NAJDE V SOBĚ ODVAHU" },
    { clue: "TICHÁ RADOST", secret: "DLOUHO V SRDCI HŘEJE" },
    { clue: "MALÁ JISKRA", secret: "ROZSVÍTÍ I VELKOU TMU" },
    { clue: "VLÍDNÉ SLOVO", secret: "UMÍ POHLADIT SRDCE" },
    { clue: "KDO SE PTÁ", secret: "TEN SE HODNĚ DOZVÍ" },
    { clue: "NADĚJE", secret: "JE SVĚTLO NA CESTĚ" },
    { clue: "ŠTĚSTÍ", secret: "PŘEJE PŘIPRAVENÝM" },
    { clue: "KDO SDÍLÍ", secret: "MÁ DVAKRÁT RADOST" },
    { clue: "DOBRÝ DEN", secret: "ZAČÍNÁ MILÝM ÚSMĚVEM" },
    { clue: "ODVÁŽNÉ SRDCE", secret: "JDE I PROTI VĚTRU" },
    { clue: "KDO ČEKÁ", secret: "TEN SE NAKONEC DOČKÁ" },
    { clue: "PŘÁNÍ", secret: "ROSTE KDYŽ MU VĚŘÍŠ" },
    { clue: "KDO SE SNAŽÍ", secret: "MÁ VYHRÁNO NAPŮL" },
    { clue: "DOBRÁ NÁLADA", secret: "JE KRÁSNĚ NAKAŽLIVÁ" },
    { clue: "JEDNA SVÍČKA", secret: "ROZSVÍTÍ CELÝ POKOJ" },
    { clue: "KDO MÁ CÍL", secret: "SI NAJDE SPRÁVNOU CESTU" },
    { clue: "TICHÁ CHVÍLE", secret: "VRACÍ ZTRACENOU SÍLU" },
    { clue: "PŘÁTELSTVÍ", secret: "ROSTE Z VELKÉ DŮVĚRY" },
    { clue: "DOBRÝ ZAČÁTEK", secret: "JE ČASTO PŮL PRÁCE" },
    { clue: "KDO DÁVÁ", secret: "TEN TAKÉ DOSTÁVÁ" },
    { clue: "LASKAVÉ SRDCE", secret: "VIDÍ KRÁSU KOLEM SEBE" },
    { clue: "VĚŘ SI", secret: "A UDĚLÁŠ PRVNÍ KROK" },
    { clue: "KAŽDÝ PÁD", secret: "UČÍ ČLOVĚKA ZNOVU VSTÁT" },
    { clue: "DOBRÉ VĚCI", secret: "CHTĚJÍ SVŮJ SPRÁVNÝ ČAS" },
    { clue: "KDO MÁ RADOST", secret: "ROZDÁVÁ KOLEM SVĚTLO" },
    { clue: "NENÍ KAM SPĚCHAT", secret: "KDYŽ JDEŠ SPRÁVNĚ" },
    { clue: "ÚCTA", secret: "OTEVÍRÁ LIDSKÉ SRDCE" },
    { clue: "KDO UMÍ ČEKAT", secret: "DOČKÁ SE KRÁSNÝCH KVĚTŮ" },
    { clue: "SPOKOJENOST", secret: "BYDLÍ V MALIČKOSTECH" },
    { clue: "DOBRÁ CESTA", secret: "ZAČÍNÁ PRVNÍM KROKEM" },
    { clue: "KDO SE USMĚJE", secret: "ROZDÁ KOUSEK SLUNCE" },
    { clue: "KLIDNÉ SRDCE", secret: "SILNĚ A KLIDNĚ BIJE" },
    { clue: "MALÁ RADOST", secret: "UMÍ UDĚLAT VELKÉ DIVY" },
    { clue: "KDO CHCE RŮST", secret: "MUSÍ SE STÁLE UČIT" },
    { clue: "DOBRÝ PŘÍKLAD", secret: "MLUVÍ NEJHLASITĚJI" },
    { clue: "NADĚJE", secret: "DÁVÁ SRDCI KŘÍDLA" },
    { clue: "KDO MÁ KLID", secret: "LÉPE KOLEM SEBE VIDÍ" },
    { clue: "LASKAVÝ ČIN", secret: "ZŮSTANE V PAMĚTI" },
    { clue: "DOBRÉ SNY", secret: "ZAČÍNAJÍ V SRDCI" },
    { clue: "KDO SE DÍVÁ", secret: "NAJDE KRÁSU VŠUDE" },
    { clue: "UPŘÍMNOST", secret: "JE NEJLEPŠÍ CESTA" },
    { clue: "MALÉ DOBRO", secret: "DĚLÁ VELKÝ KRÁSNÝ DEN" },
    { clue: "KDO MÁ NADĚJI", secret: "MÁ V SOBĚ I VELKOU SÍLU" },
    { clue: "SVĚTLO", secret: "JE SILNĚJŠÍ NEŽ TMA" },
    { clue: "DOBRÉ ZPRÁVY", secret: "POTĚŠÍ KAŽDÉ SRDCE" },
    { clue: "KDO DĚLÁ DOBRO", secret: "NIKDY NEJDE ZBYTEČNĚ" },
    { clue: "RADOST", secret: "JE KLIDNÁ CESTA K SOBĚ" },
    { clue: "KAŽDÉ RÁNO", secret: "PŘINÁŠÍ NOVÝ ZAČÁTEK" },
    { clue: "KDO MÁ ODVAHU", secret: "OBJEVÍ NOVÝ SVĚT" },
    { clue: "DOBRÉ TICHO", secret: "LÉČÍ UNAVENOU MYSL" },
    { clue: "LÁSKA", secret: "JE NEJKRATŠÍ CESTA" },
    { clue: "KDO DRŽÍ SLOVO", secret: "STAVÍ PEVNOU DŮVĚRU" },
    { clue: "MALÝ ZÁZRAK", secret: "ČEKÁ NA TEBE KAŽDÝ DEN" },
    { clue: "SÍLA ÚSMĚVU", secret: "JE OPRAVDU VELIKÁ" },
    { clue: "KDO JDE DÁL", secret: "TEN JEDNOU DOJDE K CÍLI" },
    { clue: "DOBRÝ KLID", secret: "PŘINÁŠÍ JASNÉ MYŠLENKY" },
    { clue: "ŽIVOT", secret: "KVETE Z MALIČKOSTÍ" }
  ];

  const WORDS_BY_LENGTH = WORD_BANK.reduce((groups, word) => {
    const length = [...word].length;

    if (length <= GRID_SIZE) {
      groups[length] = groups[length] || [];
      groups[length].push(word);
    }

    return groups;
  }, {});

  window.WORD_SEARCH_LEVEL_COUNT = Math.min(MAX_LEVELS, QUOTES.length);
  window.createWordSearchLevel = function createWordSearchLevel(index) {
    const quotes = createQuotes();
    const safeIndex = ((index % quotes.length) + quotes.length) % quotes.length;

    return buildLevel(quotes[safeIndex], safeIndex);
  };

  function createQuotes() {
    return QUOTES.slice(0, MAX_LEVELS);
  }

  function buildLevel(quote, index) {
    for (let attempt = 0; attempt < 700; attempt += 1) {
      const rng = createRandom((index + 1) * 2654435761 + attempt * 1013904223);
      const level = tryBuildLevel(quote, index, rng);

      if (level) return level;
    }

    throw new Error(`Nepodařilo se vytvořit level ${index + 1}.`);
  }

  function tryBuildLevel(quote, index, rng) {
    const secretLetters = getLetters(quote.secret);
    const targetCoveredCount = GRID_SIZE * GRID_SIZE - secretLetters.length;
    const grid = createEmptyGrid();
    const covered = new Set();
    const usedWords = new Set();
    const words = [];

    if (targetCoveredCount < 220 || targetCoveredCount > 242) return null;

    for (const direction of shuffle(DIRECTIONS, rng)) {
      if (!placeOneWord(grid, covered, usedWords, words, direction, targetCoveredCount, rng)) {
        return null;
      }
    }

    let guard = 0;

    while (covered.size < targetCoveredCount && guard < 600) {
      const direction = pickNextDirection(words, rng);

      if (!placeOneWord(grid, covered, usedWords, words, direction, targetCoveredCount, rng)) {
        guard += 1;
        continue;
      }

      guard = 0;
    }

    if (covered.size !== targetCoveredCount) return null;

    const secretCells = fillSecretCells(grid, secretLetters);

    if (!secretCells) return null;

    return {
      id: `level-${String(index + 1).padStart(3, "0")}`,
      title: `Osmisměrka ${index + 1}`,
      clue: quote.clue,
      secret: quote.secret,
      solution: `${quote.clue} ${quote.secret}`,
      rows: grid.map((row) => row.join("")),
      words: words.sort((first, second) => first.text.localeCompare(second.text, "cs")),
      secretCells
    };
  }

  function placeOneWord(grid, covered, usedWords, words, direction, targetCoveredCount, rng) {
    const remaining = targetCoveredCount - covered.size;
    const candidates = getCandidateWords(remaining, usedWords, rng);

    for (const word of candidates) {
      const options = findPlacementOptions(word, direction, grid, covered, remaining);

      if (!options.length) continue;

      const option = pickPlacementOption(options, rng);
      placeWord(grid, covered, usedWords, words, word, option, direction);
      return true;
    }

    return false;
  }

  function getCandidateWords(remaining, usedWords, rng) {
    const lengths = shuffle(range(MIN_WORD_LENGTH, GRID_SIZE), rng)
      .sort((first, second) => second - first);
    const candidates = [];

    lengths.forEach((length) => {
      const words = WORDS_BY_LENGTH[length] || [];

      shuffle(words, rng).forEach((word) => {
        if (!usedWords.has(word)) candidates.push(word);
      });
    });

    return candidates;
  }

  function findPlacementOptions(word, direction, grid, covered, remaining) {
    const letters = [...word];
    const options = [];

    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const endRow = row + direction.row * (letters.length - 1);
        const endCol = col + direction.col * (letters.length - 1);

        if (!isInside(endRow, endCol)) continue;

        const cells = [];
        let newCells = 0;
        let valid = true;

        for (let index = 0; index < letters.length; index += 1) {
          const cellRow = row + direction.row * index;
          const cellCol = col + direction.col * index;
          const existing = grid[cellRow][cellCol];
          const key = cellKey(cellRow, cellCol);

          if (existing && existing !== letters[index]) {
            valid = false;
            break;
          }

          if (!covered.has(key)) newCells += 1;

          cells.push({
            row: cellRow,
            col: cellCol
          });
        }

        if (valid && newCells > 0 && newCells <= remaining) {
          options.push({
            cells,
            newCells,
            overlap: letters.length - newCells
          });
        }
      }
    }

    return options;
  }

  function pickPlacementOption(options, rng) {
    const sorted = shuffle(options, rng).sort((first, second) => {
      if (second.newCells !== first.newCells) return second.newCells - first.newCells;
      return second.overlap - first.overlap;
    });
    const poolSize = Math.min(8, sorted.length);

    return sorted[Math.floor(rng() * poolSize)];
  }

  function placeWord(grid, covered, usedWords, words, word, option, direction) {
    const letters = [...word];

    option.cells.forEach((cell, index) => {
      grid[cell.row][cell.col] = letters[index];
      covered.add(cellKey(cell.row, cell.col));
    });

    usedWords.add(word);
    words.push({
      text: word,
      cells: option.cells,
      direction: direction.code
    });
  }

  function pickNextDirection(words, rng) {
    const usage = new Map(DIRECTIONS.map((direction) => [direction.code, 0]));

    words.forEach((word) => usage.set(word.direction, usage.get(word.direction) + 1));

    const minUsage = Math.min(...usage.values());
    const leastUsed = DIRECTIONS.filter((direction) => usage.get(direction.code) === minUsage);

    return leastUsed[Math.floor(rng() * leastUsed.length)];
  }

  function fillSecretCells(grid, secretLetters) {
    const secretCells = [];
    let secretIndex = 0;

    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        if (grid[row][col]) continue;
        if (secretIndex >= secretLetters.length) return null;

        grid[row][col] = secretLetters[secretIndex];
        secretCells.push({ row, col });
        secretIndex += 1;
      }
    }

    return secretIndex === secretLetters.length ? secretCells : null;
  }

  function createEmptyGrid() {
    return Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => null));
  }

  function createRandom(seed) {
    let value = seed >>> 0;

    return function random() {
      value += 0x6D2B79F5;
      let next = value;
      next = Math.imul(next ^ next >>> 15, next | 1);
      next ^= next + Math.imul(next ^ next >>> 7, next | 61);
      return ((next ^ next >>> 14) >>> 0) / 4294967296;
    };
  }

  function getLetters(text) {
    return [...text.replace(/\s+/g, "").toUpperCase()];
  }

  function isInside(row, col) {
    return row >= 0 && col >= 0 && row < GRID_SIZE && col < GRID_SIZE;
  }

  function shuffle(items, rng) {
    const result = items.slice();

    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(rng() * (index + 1));
      const item = result[index];
      result[index] = result[swapIndex];
      result[swapIndex] = item;
    }

    return result;
  }

  function range(start, end) {
    const values = [];

    for (let value = start; value <= end; value += 1) {
      values.push(value);
    }

    return values;
  }

  function cellKey(row, col) {
    return `${row}:${col}`;
  }

  function uniqueWords(words) {
    return [...new Set(words.map((word) => word.toUpperCase()))];
  }
}());
