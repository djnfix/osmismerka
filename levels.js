(function () {
  "use strict";

  const DIFFICULTIES = {
    easy: {
      key: "easy",
      label: "Lehká",
      gridSize: 10,
      wordCountMin: 8,
      wordCountMax: 10,
      minLength: 4,
      maxLength: 8,
      directions: ["E", "S", "SE", "NE"]
    },
    medium: {
      key: "medium",
      label: "Střední",
      gridSize: 13,
      wordCountMin: 12,
      wordCountMax: 15,
      minLength: 5,
      maxLength: 11,
      directions: ["E", "W", "S", "N", "SE", "SW"]
    },
    hard: {
      key: "hard",
      label: "Těžká",
      gridSize: 16,
      wordCountMin: 17,
      wordCountMax: 21,
      minLength: 6,
      maxLength: 15,
      directions: ["E", "W", "S", "N", "SE", "SW", "NE", "NW"]
    }
  };
  const DEFAULT_DIFFICULTY = "hard";
  const MAX_GRID_SIZE = 16;
  const MAX_LEVELS = 130;
  const MIN_WORD_LENGTH = 4;
  const BUILD_ATTEMPTS = 1200;
  const FILL_ATTEMPTS = 120;
  const SECTOR_COUNT = 4;
  const DIRECTIONS = [
    { code: "E", row: 0, col: 1, orientation: "horizontal" },
    { code: "W", row: 0, col: -1, orientation: "horizontal" },
    { code: "S", row: 1, col: 0, orientation: "vertical" },
    { code: "N", row: -1, col: 0, orientation: "vertical" },
    { code: "SE", row: 1, col: 1, orientation: "diagonal" },
    { code: "SW", row: 1, col: -1, orientation: "diagonal" },
    { code: "NE", row: -1, col: 1, orientation: "diagonal" },
    { code: "NW", row: -1, col: -1, orientation: "diagonal" }
  ];
  const DIRECTION_BY_CODE = DIRECTIONS.reduce((map, direction) => {
    map[direction.code] = direction;
    return map;
  }, {});
  const FILLER_LETTERS = [
    ..."AAAAAAAAÁÁBBCCCČČDDĎEEEEEEEEÉÉĚĚFGGHHIIIIÍÍJKKKLLLLMMNNNŇOOOOÓPPRRRRŘSSSŠŠTTTŤUUÚŮVVYYÝZZŽ"
  ];

  const WORD_BANK = uniqueWords([
    "ŠKOLA", "ŘEKA", "ŽÁBA", "KOČKA", "DÉŠŤ", "MĚSTO", "HŘIŠTĚ", "KAVÁRNA",
    "ČOKOLÁDA", "KAMARÁD", "POHÁDKA", "PŘÍBĚH", "PRÁZDNINY", "UČITELKA", "UČEBNICE", "TABULE",
    "SEŠIT", "TUŽKA", "PASTELKA", "KNIŽKA", "KNIHOVNA", "DĚDEČEK", "BABIČKA", "RODINA",
    "MAMINKA", "TATÍNEK", "SESTRA", "BRÁCHA", "HRAČKA", "PANENKA", "AUTÍČKO", "KOLOBĚŽKA",
    "LETADLO", "NÁDRAŽÍ", "TRAMVAJ", "LOĎKA", "PŘÍSTAV", "MOST", "SILNICE", "KŘIŽOVATKA",
    "SEMÁFOR", "ZAHRADA", "KVĚTINA", "STROM", "LÍSTEK", "VĚTEV", "KOŘEN", "JABLKO",
    "HRUŠKA", "TŘEŠEŇ", "JAHODA", "BORŮVKA", "MALINA", "MRKEV", "OKURKA", "RAJČE",
    "PAPRIKA", "BRAMBORA", "POLÉVKA", "KOLÁČ", "DORTÍK", "ZMRZLINA", "LÍVANEC", "ŠŤÁVA",
    "VODA", "KÁVA", "MLÉKO", "MÁSLO", "CHLÉB", "ROHLÍK", "VEČEŘE", "SNÍDANĚ",
    "OBĚD", "NEDĚLE", "PONDĚLÍ", "ÚTERÝ", "STŘEDA", "ČTVRTEK", "PÁTEK", "SOBOTA",
    "HODINY", "MINUTA", "VTEŘINA", "RÁNO", "POLEDNE", "VEČER", "MĚSÍC", "SLUNCE",
    "HVĚZDA", "OBLAK", "DUHA", "SNÍH", "VÍTR", "BOUŘKA", "MRAZÍK", "TEPLO",
    "MOŘE", "PLÁŽ", "OSTROV", "POTOK", "JEZERO", "RYBNÍK", "LOUKA", "HORA",
    "ÚDOLÍ", "SKÁLA", "JESKYNĚ", "CESTA", "VÝLET", "TÁBOR", "STAN", "BATOH",
    "MAPA", "KOMPAS", "LUCERNA", "PÍŠŤALKA", "KYTARA", "PÍSNIČKA", "TANEC", "DIVADLO",
    "KINO", "MUZEUM", "GALERIE", "OBRAZ", "ŠTĚTEC", "BARVA", "PLÁTNO", "FOTKA",
    "KAMERA", "TELEFON", "POČÍTAČ", "TABLET", "OBRAZOVKA", "KLÁVESY", "TISKÁRNA", "ZPRÁVA",
    "DOPIS", "BALÍK", "POŠTA", "ZNÁMKA", "ADRESA", "BRANKA", "TENIS", "LYŽE",
    "SÁŇKY", "BRUSLE", "PLAVÁNÍ", "BĚHÁNÍ", "SKOKAN", "VÍTĚZ", "ODMĚNA", "POHÁR",
    "MEDAILE", "ZÁVOD", "HÁDANKA", "TAJENKA", "OTÁZKA", "ODPOVĚĎ", "ŘEŠENÍ", "NÁPAD",
    "PAMĚŤ", "ÚSMĚV", "RADOST", "ŠTĚSTÍ", "PŘÁNÍ", "DÁREK", "SVÁTEK", "OSLAVA",
    "KYTICE", "PÍRKO", "ČEPICE", "RUKAVICE", "BUNDA", "KABÁT", "BOTY", "ŠATY",
    "SUKNĚ", "KALHOTY", "KOŠILE", "BRÝLE", "HŘEBEN", "RUČNÍK", "MÝDLO", "KARTÁČ",
    "ZRCADLO", "POLŠTÁŘ", "PEŘINA", "POSTEL", "ŽIDLE", "STOLEK", "OKNO", "DVEŘE",
    "KLÍČ", "SVĚTLO", "LAMPA", "KOBEREC", "KUCHYNĚ", "KOUPELNA", "LOŽNICE", "OBÝVÁK",
    "SKŘÍŇ", "POLICE", "ŠUPLÍK", "ČÁRA", "DÍRA", "KŮRA", "RŮŽE", "ŠÁLA",
    "PŮDA", "BŘEH", "MÍSA", "HRÁČ", "HLAVA", "SRDCE", "RUKA", "NOHA",
    "UCHO", "TVÁŘ", "ŽIVOT", "SVĚT", "NÁVRAT", "POMOC", "DŮVĚRA", "KLID",
    "SÍLA", "ODVAHA", "LÁSKA", "NADĚJE", "CHVÍLE", "ZAČÁTEK", "KONEC", "PROMĚNA",
    "ZÁZRAK", "TICHO", "HLAS", "ÚKOL", "PLÁN", "ZVONEK", "KORUNA", "OHEŇ",
    "KÁMEN", "PERLA", "KŘÍDLO", "KAPKA", "KRUH", "HŮLKA", "KOŠÍK", "MISKA",
    "TAŠKA", "LŽÍCE", "VIDLIČKA", "HRNEK", "SVÍČKA", "ANTAGONISTA", "DELTAPLÁN", "NEDOKOŠENEC",
    "NEDONOŠENEC", "ZMOCNĚNÍ", "SODOMIE", "PARLAMENTÁŘ", "AKVIZICE", "KONTRABAND", "DYSKALKULIE", "FENOMENOLOGIE",
    "INFRASTRUKTURA", "METAMORFÓZA", "KONSTELACE", "REKONSTRUKCE", "KONSTRUKTÉR", "REDAKTORKA", "MORFOLOGIE", "PARADOXNÍ",
    "SYNCHRONIZACE", "DEZINFORMACE", "KONSENZUS", "KOMPROMIS", "ARCHITEKTURA", "ADMINISTRATIVA", "LEGISLATIVA", "DEMOKRACIE",
    "DIPLOMACIE", "KOMUNIKACE", "ORGANIZACE", "KONFERENCE", "PROJEKTANT", "KANDIDATURA", "PERSPEKTIVA", "INICIATIVA",
    "STRATEGIE", "ARGUMENTACE", "INTERPRETACE", "KONCENTRACE", "ORIENTACE", "TRANSFORMACE", "KONZERVATOŘ", "LABORATOŘ",
    "BIOLOGIE", "PSYCHOLOGIE", "SOCIOLOGIE", "FILOZOFIE", "ETIMOLOGIE", "KALIGRAFIE", "TYPOGRAFIE", "KARTOGRAFIE",
    "HYDROLOGIE", "GEOLOGIE", "ASTRONOMIE", "KOSMONAUTIKA", "MATEMATIKA", "STATISTIKA", "MECHANIKA", "ELEKTRONIKA",
    "ROBOTIKA", "ALGORITMUS", "PROGRAMÁTOR", "PROMĚNNÁ", "KOMPILACE", "PARAMETR", "PROCEDURA", "KATEGORIE",
    "HIERARCHIE", "SYMETRIE", "GEOMETRIE", "FRAKCE", "FUNKCE", "ROVNICE", "KOEFICIENT", "KONSTANTA",
    "PARABOLA", "HYPERBOLA", "RENESANCE", "BAROKO", "ROMANTISMUS", "REALISMUS", "SYMBOLISMUS", "IMPRESE",
    "KOMPOZICE", "ILUSTRACE", "KALENDÁŘ", "KRONIKÁŘ", "ARCHIVÁŘ", "KNIHOVNÍK", "PARLAMENT", "MINISTERSTVO",
    "ZASTUPITEL", "VELVYSLANEC", "REFERENDUM", "REZOLUCE", "KOMPETENCE", "OPRÁVNĚNÍ", "POVĚŘENÍ", "USNESENÍ",
    "PROHLÁŠENÍ", "VYJEDNÁVÁNÍ", "HOSPODÁŘSTVÍ", "EKONOMIKA", "INVESTICE", "DIVIDENDA", "INFLACE", "KALKULACE",
    "GARANCE", "RIZIKO", "ANALÝZA", "DIAGNÓZA", "TERAPIE", "CHIRURGIE", "ANESTEZIE", "ANATOMIE",
    "FYZIOLOGIE", "NEUROLOGIE", "PEDIATRIE", "KARDIOLOGIE", "MIKROSKOP", "TELESKOP", "SPEKTROMETR", "CHROMOZOM",
    "MOLEKULA", "ENZYM", "BAKTERIE", "VIRUS", "EVOLUCE", "ADAPTACE", "BIOTOP", "EKOSYSTÉM",
    "ATMOSFÉRA", "BIOSFÉRA", "HYDROSFÉRA", "KONTINENT", "SOUOSTROVÍ", "POLOOSTROV", "ROVNOBĚŽKA", "POLEDNÍK",
    "MERIDIÁN", "MAGNETISMUS", "GRAVITACE", "TERMODYNAMIKA", "FOTOSYNTÉZA", "KRYSTALIZACE", "DESTILACE", "FERMENTACE",
    "KATALYZÁTOR", "ELEKTROLÝZA", "KONCENTRÁT", "SUBSTANCE", "REAKTANT", "SLOUČENINA", "ROZPUSTNOST", "KYSELINA",
    "ALKALITA", "IZOLACE", "REAKTOR", "TURBÍNA", "GENERÁTOR", "AKUMULÁTOR",

    "VEVERKA", "JEŽEK", "KŘEČEK", "KRÁLÍK", "LIŠKA", "JELEN", "SRNEC", "DANĚK",
    "VYDRA", "BOBR", "JEZEVEC", "MEDVĚD", "VLČICE", "KUNA", "LASIČKA", "SOVA",
    "VLAŠTOVKA", "SÝKORA", "KOSÁK", "KOROPTEV", "BAŽANT", "ČÁPICE", "VOLAVKA", "LABUŤ",
    "RACEK", "SOKOL", "POŠTOLKA", "KÁNĚ", "OSEL", "KOZA", "OVCE", "KRÁVA",
    "BÝČEK", "TELÁTKO", "HŘÍBĚ", "PONÍK", "VELBLOUD", "ŽIRAFA", "ZEBRA", "LEVHART",
    "TYGR", "GORILA", "OPICE", "PANDA", "TULEŇ", "DELFÍN", "VELRYBA", "ŽRALOK",
    "KAPR", "PSTRUH", "ŠTIKA", "OKOUN", "SUMEC", "LOSOS", "RAK", "ŠNEK",
    "MOTÝL", "VČELA", "ČMELÁK", "MRAVENEC", "SVĚTLUŠKA", "KOBYLKA", "BERUŠKA", "VÁŽKA",
    "PAVOUK", "ŽÍŽALA", "HLEMÝŽĎ", "JEŠTĚRKA", "UŽOVKA", "ŽELVA", "KROKODÝL", "TUČŇÁK",

    "BOROVICE", "SMRK", "MODŘÍN", "JEDLE", "JAVOR", "LÍPA", "JASAN", "TOPOL",
    "KAŠTAN", "BŘÍZA", "VRBA", "BUKVICE", "DUBINA", "KAPRADÍ", "MECH", "LIŠEJNÍK",
    "PASEKA", "MÝTINA", "HÁJ", "HÁJOVNA", "ROKLE", "STRÁŇ", "HŘEBEN", "VRCHOL",
    "KOPEC", "SVAH", "PRAMEN", "VODOPÁD", "PEŘEJ", "TŮŇKA", "ZÁTOKA", "ZÁLIV",
    "PŘEHRADA", "MOKŘAD", "RAŠELINIŠTĚ", "VINICE", "SAD", "POLE", "LÁN", "ÚHOR",
    "OBLOHA", "ČERVÁNKY", "MLHA", "ROSA", "KROUPY", "MRHOLENÍ", "LIJÁK", "POVODEŇ",
    "SUCHO", "MRAKY", "VÁNEK", "VICHŘICE", "PŘEHÁŇKA", "JINOVATKA", "NÁMRAZA", "ÚRODA",
    "SEMÍNKO", "SAZENICE", "PUPEN", "KVĚT", "OKVĚTÍ", "BYLINA", "JETEL", "MÁTA",
    "LEVANDULE", "SEDMIKRÁSKA", "PAMPELIŠKA", "KOPRETINA", "TULIPÁN", "NARCIS", "ORCHIDEJ", "SLUNEČNICE",

    "HOUSKA", "BAGETA", "ŽEMLE", "VÁNOČKA", "BÁBOVKA", "BUCHTA", "KOBLIHA", "MAKOVEC",
    "PERNÍK", "MEDOVNÍK", "PALAČINKA", "NÁKYP", "KAŠE", "RÝŽE", "TĚSTOVINY", "OMÁČKA",
    "SALÁT", "ŠUNKA", "KLOBÁSA", "PÁREK", "SLANINA", "ŘÍZEK", "KROKETA", "SEKANÁ",
    "GULÁŠ", "SVÍČKOVÁ", "KNEDLÍK", "KAPUSTA", "CIBULE", "ČESNEK", "DÝNĚ", "HRÁŠEK",
    "ČOČKA", "FAZOLE", "CUKETA", "KEDLUBNA", "ŘEDKVIČKA", "KVĚTÁK", "BROKOLICE", "ŠPENÁT",
    "ŠVESTKA", "MERUŇKA", "BROSKVE", "NEKTARINKA", "ANGREŠT", "RYBÍZ", "OSTRUŽINA", "MELOUN",
    "ANANAS", "BANÁN", "POMERANČ", "CITRON", "LIMETKA", "MANDARINKA", "OŘECH", "MANDLE",
    "LÍSKÁČ", "PISTÁCIE", "VANILKA", "SKOŘICE", "KMÍN", "KOPR", "PETRŽEL", "PAŽITKA",
    "HOŘČICE", "MAJONÉZA", "TVAROH", "JOGURT", "SMETANA", "ZÁKUSEK", "SUŠENKA", "LÍZÁTKO",

    "PŘEDSÍŇ", "KOMORA", "SPÍŽ", "TERASA", "BALKON", "PODKROVÍ", "SCHODIŠTĚ", "CHODBA",
    "KANCELÁŘ", "DÍLNA", "GARÁŽ", "SKLEP", "VÝTAH", "ZÁBRADLÍ", "STŘECHA", "OKAP",
    "KOMÍN", "KRB", "KŘESLO", "LAVICE", "POHOVKA", "VĚŠÁK", "ZÁVĚS", "ZÁCLONA",
    "UBRUS", "TALÍŘ", "SKLENICE", "KONVICE", "PÁNEV", "HRNEC", "PRKÉNKO", "MÍCHAČKA",
    "PRAČKA", "LEDNICE", "MRAZÁK", "VYSAVAČ", "ŽEHLIČKA", "HODINKY", "BUDÍK", "TELEVIZE",
    "OVLADAČ", "REPRODUKTOR", "RÁDIO", "NABÍJEČKA", "ZÁSUVKA", "VYPÍNAČ", "KLIKA", "ZÁMEK",
    "BRÁNA", "PLOT", "DVOREK", "ZAHRÁDKA", "SKLENÍK", "KŮLNA", "ALTÁN", "LAVIČKA",

    "NÁMĚSTÍ", "RADNICE", "KOSTEL", "KATEDRÁLA", "KAPLE", "ZVONICE", "HŘBITOV", "PARK",
    "SÍDLIŠTĚ", "ULICE", "TŘÍDA", "PASÁŽ", "PODCHOD", "NADCHOD", "ZASTÁVKA", "NÁSTUPIŠTĚ",
    "TROLEJBUS", "AUTOBUS", "METRO", "LANOVKA", "TAXÍK", "KOČÁR", "DODÁVKA", "NÁKLAĎÁK",
    "KARAVAN", "SKÚTR", "MOTORKA", "BICYKL", "PŘILBA", "SEDLO", "PEDÁL", "ŘÍDÍTKA",
    "PNEUMATIKA", "KUFŘÍK", "JÍZDENKA", "VSTUPENKA", "PAS", "VÍZUM", "LETENKA", "KUFR",
    "BAŤŮŽEK", "CESTOVKA", "HOTEL", "PENZION", "RECEPCE", "PRŮVODCE", "MAPKA", "VYHLÍDKA",
    "MAJÁK", "PŘÍVOZ", "LODĚNICE", "PLACHETNICE", "PONORKA", "VRTULNÍK", "RAKETA", "DRUŽICE",

    "LÉKAŘKA", "ZUBAŘ", "SESTRA", "HASIČ", "POLICISTA", "KUCHAŘKA", "PEKAŘ", "CUKRÁŘ",
    "ŘEZNÍK", "KNIHKUPEC", "KVĚTINÁŘ", "KOVÁŘ", "TRUHLÁŘ", "ZEDNÍK", "MALÍŘ", "INSTALATÉR",
    "ELEKTRIKÁŘ", "ZAHRADNÍK", "FARMÁŘ", "VČELAŘ", "RYBÁŘ", "MYSLIVEC", "LESNÍK", "ARCHITEKT",
    "INŽENÝR", "PRÁVNÍK", "SOUDCE", "NOVINÁŘ", "REPORTÉR", "FOTOGRAF", "HEREČKA", "ZPĚVÁK",
    "HUDEBNÍK", "TANEČNICE", "REŽISÉR", "KNIHOVNICE", "POKLADNÍ", "PRODAVAČ", "ŘIDIČ", "PILOT",
    "KAPITÁN", "NÁMOŘNÍK", "TRENÉR", "ROZHODČÍ", "VĚDEC", "BADATEL", "CHEMIK", "FYZIK",
    "PŘEKLADATEL", "TLUMOČNÍK", "ÚČETNÍ", "SPRÁVCE", "HLÍDAČ", "KURÝR", "DORUČOVATEL", "KREJČÍ",

    "KOPANÁ", "HOKEJ", "FLORBAL", "BASKETBAL", "VOLEJBAL", "HÁZENÁ", "ATLETIKA", "GYMNASTIKA",
    "KARATE", "JUDO", "ŠERM", "BOX", "VESLOVÁNÍ", "CYKLISTIKA", "TURISTIKA", "LEZENÍ",
    "BĚŽKY", "SNOWBOARD", "PLACHETNÍK", "POTÁPĚNÍ", "ŠVIHADLO", "ČINKA", "ŽÍNĚNKA", "STADION",
    "TĚLOCVIČNA", "HŘIŠTĚ", "BAZÉN", "DRÁHA", "TRASA", "TURNAJ", "TRÉNINK", "FINÁLE",
    "PORÁŽKA", "REMÍZA", "VÝKON", "REKORD", "PŘESNOST", "RYCHLOST", "VYTRVALOST", "SOUPER",
    "BRANKÁŘ", "OBRÁNCE", "ÚTOČNÍK", "KAPITÁN", "DRUŽSTVO", "ROZCVIČKA", "ROZBĚH", "DOSKOK",

    "ABECEDA", "PÍSMENO", "SLABIKA", "VĚTA", "ODSTAVEC", "SLOVNÍK", "PRAVOPIS", "ČTENÍ",
    "PSANÍ", "POČÍTÁNÍ", "NÁSOBENÍ", "DĚLENÍ", "SČÍTÁNÍ", "ODČÍTÁNÍ", "ÚHLOMĚR", "PRAVÍTKO",
    "KRUŽÍTKO", "GEOGRAFIE", "DĚJEPIS", "PŘÍRODOPIS", "CHEMIE", "FYZIKA", "HUDEBKA", "VÝTVARKA",
    "TĚLOCVIK", "ROZVRH", "PŘESTÁVKA", "DOMÁCÍKOL", "ZKOUŠKA", "ZNÁMKA", "VYSVĚDČENÍ", "AKTOVKA",
    "PENÁL", "FIXA", "GUMA", "OŘEZÁVÁTKO", "LEPIDLO", "NŮŽKY", "BLOK", "SLOŽKA",
    "MAPA", "GLOBUS", "MODEL", "POKUS", "VÝZKUM", "OTEVŘENOST", "ZVĚDAVOST", "SOUSTŘEDĚNÍ",

    "KARNEVAL", "MASOPUST", "VELIKONOCE", "POMLÁZKA", "KRASLICE", "VÁNOCE", "ADVENT", "KOLEDA",
    "STROMEČEK", "CUKROVÍ", "PRSKAVKA", "OHŇOSTROJ", "NAROZENINY", "JMENINY", "SVATBA", "VÝROČÍ",
    "POZVÁNKA", "PŘEKVAPENÍ", "GRATULACE", "DĚKOVÁNÍ", "PODĚKOVÁNÍ", "OBJETÍ", "PÍSEŇ", "KYTARA",
    "BUBEN", "FLÉTNA", "HOUSLE", "KLAVÍR", "TRUBKA", "ČINELY", "ORCHESTR", "SBOR",
    "JEVIŠTĚ", "HLEDIŠTĚ", "OPONA", "KULISA", "MASKA", "KOSTÝM", "SCÉNÁŘ", "POTLESK",
    "VÝSTAVA", "SOCHA", "MOZAIKA", "KRESBA", "PORTRÉT", "KRAJINA", "RÁM", "ATELIÉR",

    "APLIKACE", "PROHLÍŽEČ", "INTERNET", "HESLO", "ÚČET", "SLOŽKA", "SOUBOR", "IKONA",
    "KURZOR", "TLAČÍTKO", "TISK", "SKENER", "KOPÍRKA", "MONITOR", "NOTEBOOK", "SERVER",
    "DATABÁZE", "ZÁLOHA", "AKTUALIZACE", "SOUKROMÍ", "BEZPEČÍ", "SÍŤ", "ANTÉNA", "SIGNÁL",
    "BATERIE", "ADAPTÉR", "KABEL", "ČIP", "SENZOR", "DISPLEJ", "PIXEL", "PROGRAM",
    "SCRIPT", "MODUL", "BALÍČEK", "KNIHOVNA", "FUNKCIONALITA", "ROZHRANÍ", "ŠABLONA", "KOMPONENTA",

    "KRUHÁČ", "OBDÉLNÍK", "ČTVEREC", "TROJÚHELNÍK", "KOSOČTVEREC", "LICHOBĚŽNÍK", "KRYCHLE", "KVÁDR",
    "VÁLEC", "KUŽEL", "KOULE", "HRANOL", "OBJEM", "OBVOD", "POVRCH", "PRŮMĚR",
    "POLOMĚR", "PŘÍMKA", "ÚSEČKA", "PAPRSEK", "SOUŘADNICE", "MĚŘÍTKO", "TABULKA", "GRAF",
    "VZOREC", "VÝPOČET", "VÝSLEDEK", "POSTUP", "DŮKAZ", "ODHAD", "POMĚR", "PROCENTO",

    "ŠTĚDROST", "LASKAVOST", "UPŘÍMNOST", "TRPĚLIVOST", "PEČLIVOST", "POZORNOST", "STATEČNOST", "SKROMNOST",
    "SLUŠNOST", "DŮSLEDNOST", "NADŠENÍ", "POHODA", "DŮVĚRA", "VDĚČNOST", "PŘÁTELSTVÍ", "SOUCIT",
    "RESPEKT", "PODPORA", "SPOLUPRÁCE", "ODHODLÁNÍ", "KREATIVITA", "FANTAZIE", "PŘEDSTAVA", "MYŠLENKA",
    "OTEVŘENOST", "JISTOTA", "ROVNOVÁHA", "POKOJ", "SMÍŘENÍ", "NÁLADA", "ÚLEVA", "NADHLED",
    "ZVÍDAVOST", "SNAHA", "PÍLE", "VÝDRŽ", "KÁZEŇ", "ČEST", "PRAVDOMLUVNOST", "SPRAVEDLNOST"
  ]).filter(isUsableWord);

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
    { clue: "ŽIVOT", secret: "KVETE Z MALIČKOSTÍ" },
    { clue: "SOUSTŘEDĚNÍ", secret: "POMÁHÁ OBJEVIT DETAILY" },
    { clue: "TICHÝ KROK", secret: "DOVEDE ČLOVĚKA DALEKO" },
    { clue: "POZORNÉ OČI", secret: "NAJDOU I MALÝ POKLAD" },
    { clue: "DOBRÁ HRA", secret: "POTŘEBUJE ČISTÁ PRAVIDLA" },
    { clue: "CHYTRÁ MYSL", secret: "HLEDÁ VÍC NEŽ JEDNU CESTU" },
    { clue: "PEVNÝ KLID", secret: "DRŽÍ SMĚR I V NEČASE" },
    { clue: "KDO POZORUJE", secret: "VIDÍ SOUVISLOSTI" },
    { clue: "MALÝ POSTŘEH", secret: "MŮŽE ZMĚNIT CELÝ DEN" },
    { clue: "KDO HRAJE FÉR", secret: "MÁ RADOST Z VÍTĚZSTVÍ" },
    { clue: "ČISTÁ RADOST", secret: "ROSTE BEZ VELKÝCH SLOV" },
    { clue: "DOBRÁ OTÁZKA", secret: "OTEVÍRÁ NOVÉ DVEŘE" },
    { clue: "KDO SE SOUSTŘEDÍ", secret: "NAJDE SPRÁVNOU STOPU" },
    { clue: "JASNÁ PRAVIDLA", secret: "DĚLAJÍ HŘE DOBRÝ ŘÁD" },
    { clue: "KLIDNÝ DECH", secret: "VRACÍ MYSL NA MÍSTO" },
    { clue: "DOBRÝ POSTŘEH", secret: "JE V HÁDANCE PŮL ÚSPĚCHU" },
    { clue: "KDO VYTRVÁ", secret: "DOKONČÍ I TĚŽKÝ ÚKOL" },
    { clue: "MALÁ TRPĚLIVOST", secret: "PŘINÁŠÍ VELKÝ VÝSLEDEK" },
    { clue: "POCTIVÉ HLEDÁNÍ", secret: "NAKONEC UKÁŽE ŘEŠENÍ" },
    { clue: "PŘESNÝ TAH", secret: "MŮŽE ROZHODNOUT HRU" },
    { clue: "DOBRÁ PAMĚŤ", secret: "DRŽÍ STOPU V PRAVÝ ČAS" },
    { clue: "KDO MÁ NÁPAD", secret: "VIDÍ CESTU I V MLZE" },
    { clue: "KLID A POŘÁDEK", secret: "POMÁHAJÍ NAJÍT SMYSL" },
    { clue: "VŠÍMAVÉ SRDCE", secret: "OBJEVÍ KRÁSU V DETAILU" },
    { clue: "CHVÍLE TICHA", secret: "UMÍ NAPOVĚDĚT SPRÁVNĚ" },
    { clue: "DOBRÝ RYTMUS", secret: "NENECHÁ MYSL ZBLOUDIT" },
    { clue: "KDO POČKÁ", secret: "LÉPE UVIDÍ CELÝ OBRAZ" },
    { clue: "MALÝ ÚSPĚCH", secret: "DODÁ CHUŤ POKRAČOVAT" },
    { clue: "JASNÁ STOPA", secret: "VEDE K TAJENCE PŘÍMO" },
    { clue: "POHODOVÁ MYSL", secret: "HLEDÁ LEHČEJI" },
    { clue: "DOBRÉ ŘEŠENÍ", secret: "MÁ BÝT JEDNOZNAČNÉ" }
  ];

  window.WORD_SEARCH_LEVEL_COUNT = Math.min(MAX_LEVELS, QUOTES.length);
  window.WORD_SEARCH_DEFAULT_DIFFICULTY = DEFAULT_DIFFICULTY;
  window.WORD_SEARCH_DIFFICULTIES = Object.values(DIFFICULTIES).map(({ key, label, gridSize }) => ({
    key,
    label,
    gridSize
  }));
  window.WORD_SEARCH_WORD_BANK_SIZE = WORD_BANK.length;
  window.createWordSearchLevel = function createWordSearchLevel(index, options) {
    const quotes = createQuotes();
    const safeIndex = ((index % quotes.length) + quotes.length) % quotes.length;
    const difficulty = getDifficulty(options);

    return buildLevel(quotes[safeIndex], safeIndex, difficulty);
  };

  function createQuotes() {
    return QUOTES.slice(0, MAX_LEVELS);
  }

  function buildLevel(quote, index, difficulty) {
    for (let attempt = 0; attempt < BUILD_ATTEMPTS; attempt += 1) {
      const seed = (index + 1) * 2654435761 + difficulty.gridSize * 2246822519 + attempt * 1013904223;
      const rng = createRandom(seed);
      const words = pickWords(index, difficulty, rng);
      const level = tryBuildLevel(quote, index, difficulty, words, rng);

      if (level) return level;
    }

    throw new Error(`Nepodařilo se vytvořit level ${index + 1}.`);
  }

  function tryBuildLevel(quote, index, difficulty, selectedWords, rng) {
    const gridSize = difficulty.gridSize;
    const grid = createEmptyGrid(gridSize);
    const placements = [];
    const queue = orderWordsForPlacement(selectedWords, rng);

    for (const word of queue) {
      const placement = pickPlacement(word, grid, placements, difficulty, rng);

      if (!placement) return null;

      placeWord(grid, placement);
      placements.push(placement);
    }

    for (let attempt = 0; attempt < FILL_ATTEMPTS; attempt += 1) {
      const filledGrid = cloneGrid(grid);
      fillEmptyCells(filledGrid, rng);

      if (hasUniquePlacedWordOccurrences(filledGrid, placements)) {
        return {
          id: `${difficulty.key}-${String(index + 1).padStart(3, "0")}`,
          title: `${difficulty.label} osmisměrka ${index + 1}`,
          difficulty: difficulty.key,
          difficultyLabel: difficulty.label,
          gridSize,
          clue: quote.clue,
          secret: quote.secret,
          solution: `${quote.clue} ${quote.secret}`,
          rows: filledGrid.map((row) => row.join("")),
          words: placements
            .map(({ text, cells, direction }) => ({ text, cells, direction }))
            .sort((first, second) => first.text.localeCompare(second.text, "cs")),
          secretCells: []
        };
      }
    }

    return null;
  }

  function pickWords(index, difficulty, rng) {
    const targetCount = randomInt(difficulty.wordCountMin, difficulty.wordCountMax, rng);
    const maxLength = Math.min(difficulty.maxLength, difficulty.gridSize);
    const levelShift = (index * 37) % WORD_BANK.length;
    const eligible = shuffle(WORD_BANK, rng)
      .map((word, position) => ({
        word,
        rank: (position + levelShift) % WORD_BANK.length
      }))
      .sort((first, second) => first.rank - second.rank)
      .map((entry) => entry.word)
      .filter((word) => {
        const length = getLetterCount(word);
        return length >= difficulty.minLength && length <= maxLength;
      });
    const selected = [];

    for (const word of eligible) {
      if (selected.length >= targetCount) break;
      if (conflictsWithSelection(word, selected)) continue;

      selected.push(word);
    }

    return selected;
  }

  function conflictsWithSelection(word, selected) {
    const reversed = reverseText(word);

    return selected.some((existing) => {
      return existing === reversed || existing.includes(word) || word.includes(existing);
    });
  }

  function orderWordsForPlacement(words, rng) {
    return shuffle(words, rng).sort((first, second) => {
      const lengthDiff = getLetterCount(second) - getLetterCount(first);
      return lengthDiff || first.localeCompare(second, "cs");
    });
  }

  function pickPlacement(word, grid, placements, difficulty, rng) {
    const directions = difficulty.directions.map((code) => DIRECTION_BY_CODE[code]);
    const options = findPlacementOptions(word, grid, directions, difficulty.gridSize);

    if (!options.length) return null;

    const scored = options
      .map((option) => ({
        option,
        score: scorePlacement(option, placements, difficulty.gridSize, rng)
      }))
      .sort((first, second) => second.score - first.score);
    const poolSize = Math.max(1, Math.min(scored.length, 8 + Math.floor(scored.length * 0.04)));
    const pickIndex = Math.floor(rng() * poolSize);

    return scored[pickIndex].option;
  }

  function findPlacementOptions(word, grid, directions, gridSize) {
    const letters = [...word];
    const options = [];

    for (const direction of directions) {
      for (let row = 0; row < gridSize; row += 1) {
        for (let col = 0; col < gridSize; col += 1) {
          const endRow = row + direction.row * (letters.length - 1);
          const endCol = col + direction.col * (letters.length - 1);

          if (!isInside(endRow, endCol, gridSize)) continue;

          const cells = [];
          let overlap = 0;
          let valid = true;

          for (let index = 0; index < letters.length; index += 1) {
            const cellRow = row + direction.row * index;
            const cellCol = col + direction.col * index;
            const existing = grid[cellRow][cellCol];

            if (existing && existing !== letters[index]) {
              valid = false;
              break;
            }

            if (existing === letters[index]) overlap += 1;
            cells.push({ row: cellRow, col: cellCol });
          }

          if (valid && overlap < letters.length) {
            options.push({
              text: word,
              cells,
              direction: direction.code,
              orientation: direction.orientation,
              overlap,
              newCells: letters.length - overlap
            });
          }
        }
      }
    }

    return options;
  }

  function scorePlacement(option, placements, gridSize, rng) {
    const directionUsage = countBy(placements, "direction");
    const orientationUsage = countBy(placements, "orientation");
    const sectorUsage = countSectors(placements, gridSize);
    const center = getPlacementCenter(option);
    const sector = getSector(center, gridSize);
    const borderTouches = option.cells.filter((cell) => {
      return cell.row === 0 || cell.col === 0 || cell.row === gridSize - 1 || cell.col === gridSize - 1;
    }).length;
    const edgeLine = option.cells.every((cell) => cell.row === 0 || cell.row === gridSize - 1) ||
      option.cells.every((cell) => cell.col === 0 || cell.col === gridSize - 1);
    const balancedOverlap = option.overlap <= 2 ? option.overlap * 1.25 : 2.5 - (option.overlap - 2) * 0.9;
    const directionPenalty = (directionUsage.get(option.direction) || 0) * 2.2;
    const orientationPenalty = (orientationUsage.get(option.orientation) || 0) * 1.15;
    const sectorPenalty = (sectorUsage.get(sector) || 0) * 2.4;
    const edgePenalty = borderTouches * 0.18 + (edgeLine ? 1.6 : 0);
    const coverageBonus = option.newCells / option.cells.length;

    return rng() * 4 + balancedOverlap + coverageBonus - directionPenalty - orientationPenalty - sectorPenalty - edgePenalty;
  }

  function placeWord(grid, placement) {
    [...placement.text].forEach((letter, index) => {
      const cell = placement.cells[index];
      grid[cell.row][cell.col] = letter;
    });
  }

  function fillEmptyCells(grid, rng) {
    grid.forEach((row) => {
      row.forEach((letter, colIndex) => {
        if (letter) return;
        row[colIndex] = FILLER_LETTERS[Math.floor(rng() * FILLER_LETTERS.length)];
      });
    });
  }

  function hasUniquePlacedWordOccurrences(grid, placements) {
    return placements.every((placement) => {
      const occurrences = findOccurrences(grid, placement.text);

      return occurrences.length === 1 && cellsEqual(occurrences[0], placement.cells);
    });
  }

  function findOccurrences(grid, word) {
    const gridSize = grid.length;
    const letters = [...word];
    const occurrences = [];

    for (let row = 0; row < gridSize; row += 1) {
      for (let col = 0; col < gridSize; col += 1) {
        if (grid[row][col] !== letters[0]) continue;

        DIRECTIONS.forEach((direction) => {
          const endRow = row + direction.row * (letters.length - 1);
          const endCol = col + direction.col * (letters.length - 1);

          if (!isInside(endRow, endCol, gridSize)) return;

          const cells = [];

          for (let index = 0; index < letters.length; index += 1) {
            const cellRow = row + direction.row * index;
            const cellCol = col + direction.col * index;

            if (grid[cellRow][cellCol] !== letters[index]) return;
            cells.push({ row: cellRow, col: cellCol });
          }

          occurrences.push(cells);
        });
      }
    }

    return occurrences;
  }

  function countBy(items, key) {
    const counts = new Map();

    items.forEach((item) => counts.set(item[key], (counts.get(item[key]) || 0) + 1));

    return counts;
  }

  function countSectors(placements, gridSize) {
    const counts = new Map();

    placements.forEach((placement) => {
      const sector = getSector(getPlacementCenter(placement), gridSize);
      counts.set(sector, (counts.get(sector) || 0) + 1);
    });

    return counts;
  }

  function getPlacementCenter(placement) {
    const total = placement.cells.reduce((sum, cell) => {
      sum.row += cell.row;
      sum.col += cell.col;
      return sum;
    }, { row: 0, col: 0 });

    return {
      row: total.row / placement.cells.length,
      col: total.col / placement.cells.length
    };
  }

  function getSector(center, gridSize) {
    const rowSector = Math.min(SECTOR_COUNT - 1, Math.floor(center.row / gridSize * SECTOR_COUNT));
    const colSector = Math.min(SECTOR_COUNT - 1, Math.floor(center.col / gridSize * SECTOR_COUNT));

    return `${rowSector}:${colSector}`;
  }

  function createEmptyGrid(gridSize) {
    return Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => null));
  }

  function cloneGrid(grid) {
    return grid.map((row) => row.slice());
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

  function randomInt(min, max, rng) {
    return min + Math.floor(rng() * (max - min + 1));
  }

  function isInside(row, col, gridSize) {
    return row >= 0 && col >= 0 && row < gridSize && col < gridSize;
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

  function getDifficulty(options) {
    const key = typeof options === "string" ? options : options && options.difficulty;

    return DIFFICULTIES[key] || DIFFICULTIES[DEFAULT_DIFFICULTY];
  }

  function getLetterCount(text) {
    return [...text].length;
  }

  function reverseText(text) {
    return [...text].reverse().join("");
  }

  function cellsEqual(first, second) {
    if (!first || !second || first.length !== second.length) return false;

    return first.every((cell, index) => cell.row === second[index].row && cell.col === second[index].col);
  }

  function isUsableWord(word) {
    const length = getLetterCount(word);

    return length >= MIN_WORD_LENGTH &&
      length <= MAX_GRID_SIZE &&
      /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+$/.test(word);
  }

  function uniqueWords(words) {
    return [...new Set(words.map((word) => word.toUpperCase()))];
  }
}());
