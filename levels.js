(function () {
  "use strict";

  const GRID_SIZE = 10;
  const PARTITIONS = {
    6: [[3, 3], [6]],
    7: [[3, 4], [4, 3], [7]],
    8: [[4, 4], [3, 5], [5, 3], [8]],
    9: [[4, 5], [5, 4], [3, 6], [6, 3], [9]],
    10: [[5, 5], [4, 6], [6, 4], [3, 7], [7, 3], [10]]
  };

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
    "DÝM", "LÉK", "ŠÍP", "NŮŽ", "RÁJ", "SŮL", "TÝM", "HRÁČ"
  ]);

  const PHRASE_STARTS = [
    "KAŽDÝ DEN", "MALÝ KROK", "DOBRÉ SRDCE", "TICHÁ MYSL", "LASKAVÉ SLOVO",
    "ODVÁŽNÝ ČIN", "ČISTÁ RADOST", "NOVÁ NADĚJE", "JASNÝ CÍL", "VELKÝ ÚSMĚV",
    "LEHKÝ DECH", "KLIDNÁ DUŠE", "TEPLÉ SVĚTLO", "VĚRNÁ SNAHA", "ŠŤASTNÁ CHVÍLE",
    "MILÉ GESTO", "TRPĚLIVÉ SRDCE", "SVĚŽÍ NÁPAD", "PEVNÁ VÍRA", "HRAVÁ MYŠLENKA"
  ];

  const PHRASE_ENDS = [
    "PŘINÁŠÍ RADOST", "VEDE K CÍLI", "MÁ VELKOU SÍLU", "OTEVÍRÁ CESTU", "SVÍTÍ DÁL"
  ];

  const WORDS_BY_LENGTH = WORD_BANK.reduce((groups, word) => {
    const length = [...word].length;
    if (length <= GRID_SIZE) {
      groups[length] = groups[length] || [];
      groups[length].push(word);
    }
    return groups;
  }, {});

  window.WORD_SEARCH_LEVELS = createSecrets().map((secret, index) => buildLevel(secret, index));

  function createSecrets() {
    const secrets = [];

    PHRASE_STARTS.forEach((start) => {
      PHRASE_ENDS.forEach((end) => secrets.push(`${start} ${end}`));
    });

    return secrets.slice(0, 100);
  }

  function buildLevel(secret, index) {
    for (let attempt = 0; attempt < 250; attempt += 1) {
      const rng = createRandom((index + 1) * 2654435761 + attempt * 1013904223);
      const built = tryBuildLevel(secret, index, rng);

      if (built) return built;
    }

    throw new Error(`Nepodařilo se vytvořit level ${index + 1}.`);
  }

  function tryBuildLevel(secret, index, rng) {
    const secretLetters = [...secret.replace(/\s+/g, "").toUpperCase()];
    const usedWords = new Set();
    const rows = [];
    const words = [];
    let secretIndex = 0;

    for (let row = 0; row < GRID_SIZE; row += 1) {
      const rowsLeft = GRID_SIZE - row;
      const remainingSecrets = secretLetters.length - secretIndex;
      const minSecrets = Math.max(0, remainingSecrets - (rowsLeft - 1) * 4);
      const maxSecrets = Math.min(4, remainingSecrets);
      const secretCounts = shuffle(range(minSecrets, maxSecrets), rng);
      const rowBuild = buildRow(row, secretCounts, secretLetters, secretIndex, usedWords, rng);

      if (!rowBuild) return null;

      rows.push(rowBuild.rowText);
      words.push(...rowBuild.words);
      secretIndex += rowBuild.secretCount;
    }

    if (secretIndex !== secretLetters.length) return null;

    return {
      id: `level-${String(index + 1).padStart(3, "0")}`,
      title: `Hádanka ${index + 1}`,
      secret,
      rows,
      words
    };
  }

  function buildRow(rowIndex, secretCounts, secretLetters, secretIndex, usedWords, rng) {
    for (const secretCount of secretCounts) {
      const wordCells = GRID_SIZE - secretCount;
      const partitions = shuffle(PARTITIONS[wordCells] || [], rng);

      for (const partition of partitions) {
        const pickedWords = pickWordsForPartition(partition, usedWords, rng);

        if (!pickedWords) continue;

        const rowLetters = [];
        const rowWords = [];
        const tokenSlots = createTokenSlots(secretCount, pickedWords.length, rng);
        const shuffledWords = shuffle(pickedWords.slice(), rng);
        let nextSecret = secretIndex;
        let nextWord = 0;

        tokenSlots.forEach((slot) => {
          if (slot === "secret") {
            rowLetters.push(secretLetters[nextSecret]);
            nextSecret += 1;
            return;
          }

          const text = shuffledWords[nextWord];
          const reversed = rng() < 0.38;
          const displayLetters = reversed ? [...text].reverse() : [...text];
          const startCol = rowLetters.length;

          rowLetters.push(...displayLetters);
          rowWords.push({
            text,
            cells: createAnswerCells(rowIndex, startCol, text.length, reversed)
          });
          nextWord += 1;
        });

        if (rowLetters.length !== GRID_SIZE) continue;

        pickedWords.forEach((word) => usedWords.add(word));

        return {
          rowText: rowLetters.join(""),
          secretCount,
          words: rowWords
        };
      }
    }

    return null;
  }

  function pickWordsForPartition(partition, usedWords, rng) {
    const picked = [];
    const pendingUsed = new Set(usedWords);

    for (const length of partition) {
      const candidates = (WORDS_BY_LENGTH[length] || []).filter((word) => !pendingUsed.has(word));

      if (!candidates.length) return null;

      const word = candidates[Math.floor(rng() * candidates.length)];
      pendingUsed.add(word);
      picked.push(word);
    }

    return picked;
  }

  function createTokenSlots(secretCount, wordCount, rng) {
    const slotCount = secretCount + wordCount;
    const secretPositions = new Set(shuffle(range(0, slotCount - 1), rng).slice(0, secretCount));
    const slots = [];

    for (let index = 0; index < slotCount; index += 1) {
      slots.push(secretPositions.has(index) ? "secret" : "word");
    }

    return slots;
  }

  function createAnswerCells(row, startCol, length, reversed) {
    const cells = [];

    for (let offset = 0; offset < length; offset += 1) {
      cells.push({
        row,
        col: reversed ? startCol + length - 1 - offset : startCol + offset
      });
    }

    return cells;
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

  function uniqueWords(words) {
    return [...new Set(words.map((word) => word.toUpperCase()))];
  }
}());
