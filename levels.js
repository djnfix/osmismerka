(function () {
  "use strict";

  const GRID_SIZE = 10;
  const MAX_LEVELS = 100;
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
    "HŮLKA", "KOŠÍK", "MISKA", "TAŠKA", "LŽÍCE", "VIDLIČKA", "HRNEK", "SVÍČKA"
  ]);

  const QUOTE_STARTS = [
    "KAŽDÝ DEN", "MALÝ KROK", "DOBRÉ SRDCE", "LASKAVÉ SLOVO", "ODVÁŽNÝ ČIN",
    "ČISTÁ RADOST", "NOVÁ NADĚJE", "JASNÝ CÍL", "VELKÝ ÚSMĚV", "KLIDNÁ MYSL",
    "TEPLÉ SVĚTLO", "PEVNÁ VÍRA", "TICHÁ SNAHA", "MILÉ GESTO", "SVĚŽÍ NÁPAD",
    "POCTIVÁ PRÁCE", "RADOSTNÁ CHVÍLE", "LEHKÝ DECH", "DOBRÝ NÁPAD", "ŠŤASTNÁ MYSL"
  ];

  const QUOTE_ENDS = [
    "PŘINÁŠÍ TICHOU RADOST",
    "VEDE K DOBRÉMU CÍLI",
    "OTEVÍRÁ NOVOU CESTU",
    "MÁ V SOBĚ VELKOU SÍLU",
    "SVÍTÍ I V TICHU DÁL"
  ];

  const WORDS_BY_LENGTH = WORD_BANK.reduce((groups, word) => {
    const length = [...word].length;

    if (length <= GRID_SIZE) {
      groups[length] = groups[length] || [];
      groups[length].push(word);
    }

    return groups;
  }, {});

  window.WORD_SEARCH_LEVELS = createQuotes().map((quote, index) => buildLevel(quote, index));

  function createQuotes() {
    const quotes = [
      {
        clue: "RÁNO",
        secret: "JE MOUDŘEJŠÍ VEČERA"
      }
    ];

    QUOTE_STARTS.forEach((clue) => {
      QUOTE_ENDS.forEach((secret) => quotes.push({ clue, secret }));
    });

    return quotes.slice(0, MAX_LEVELS);
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

    if (targetCoveredCount < 62 || targetCoveredCount > 88) return null;

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
    const minLength = Math.min(3, remaining);
    const lengths = shuffle(range(minLength, GRID_SIZE), rng);
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
