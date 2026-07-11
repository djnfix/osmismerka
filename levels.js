(function () {
  "use strict";

  const DIFFICULTIES = {
    hard: {
      key: "hard",
      label: "Těžká",
      gridSize: 16,
      wordCountMin: 27,
      wordCountMax: 36,
      minLength: 4,
      maxLength: 16,
      directions: ["E", "W", "S", "N", "SE", "SW", "NE", "NW"]
    }
  };
  const SUCCESSFUL_ATTEMPTS = {
    hard: [0,0,4,0,1,1,2,2,0,0,0,2,0,1,0,0,0,1,0,0,1,1,0,1,3,5,1,0,1,2,0,0,2,0,0,0,0,0,1,1,0,1,1,1,3,1,1,1,4,0,1,0,3,0,0,2,2,0,0,0,0,5,2,0,0,0,1,1,4,0,0,0,0,0,0,0,0,0,1,0,1,2,0,0,0,1,0,0,1,0,0,0,1,0,1,1,1,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,2,2,0,0,1,0,1,4,0,0,0,0,0,0]
  };
  const DEFAULT_DIFFICULTY = "hard";
  const MAX_GRID_SIZE = 16;
  const MAX_LEVELS = 130;
  const MIN_WORD_LENGTH = 4;
  const BUILD_ATTEMPTS = 1200;
  const TARGET_WORDS_PER_LENGTH = 2;
  const MIN_WORDS_PER_LENGTH_POOL = 20;
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
    "ZVÍDAVOST", "SNAHA", "PÍLE", "VÝDRŽ", "KÁZEŇ", "ČEST", "PRAVDOMLUVNOST", "SPRAVEDLNOST",

    // Rozšířená česká slovní zásoba pro pestřejší těžké osmisměrky.
    "ALBATROS", "ALIGÁTOR", "ANTILOPA", "BABOČKA", "BERAN", "BERNARDÝN", "BIZON", "BLECHA",
    "BULDOK", "BUVOL", "CANDÁT", "CIKÁDA", "ČEJKA", "ČERV", "ČÍŽEK", "DATEL",
    "DIKOBRAZ", "DROZD", "DUDEK", "FENEK", "GEPARD", "HAVRAN", "HROCH", "CHOBOTNICE",
    "CHROUST", "CHŘESTÝŠ", "JAGUÁR", "JEŘÁB", "JESETER", "KALOUS", "KAMZÍK", "KANEC",
    "KARAS", "KASUÁR", "KAVKA", "KOCOUR", "KOLIBŘÍK", "KOMÁR", "KONDOR", "KORMORÁN",
    "KRAJTA", "KRAB", "KŘEPELKA", "KROCAN", "LANGUSTA", "LEDŇÁČEK", "LEMUR", "LENOCHOD",
    "LIŠAJ", "MLOK", "MOUCHA", "MUFLON", "MÝVAL", "NOSOROŽEC", "OCTOMILKA", "PAPOUŠEK",
    "PELIKÁN", "PĚNKAVA", "PLAMEŇÁK", "PLOŠTICE", "PRASE", "PUŠTÍK", "REJSEK", "ROSNIČKA",
    "ROPUCHA", "SARDINKA", "SKŘIVAN", "SLAVÍK", "SLON", "SLUKA", "SOBOL", "SÝČEK",
    "ŠAKAL", "ŠIMPANZ", "ŠKORPION", "ŠTĚNICE", "TCHOŘ", "TETŘEV", "TISÍCINOŽKA", "ŤUHÝK",
    "VAKOVEVERKA", "VARAN", "VIKUŇA", "VLHA", "VRABEC", "VRÁNA", "VŘETENOVKA", "ZMIJE",
    "ZUBR", "ŽAKO", "ŽÁBRONOŽKA", "AKÁT", "AMARANT", "ANEMONKA", "ASTRA", "AZALKA",
    "BLATOUCH", "BOBKOVIŠEŇ", "BODLÁK", "BŘEČŤAN", "BRUSINKA", "CEDR", "CESMÍNA", "ČEKANKA",
    "ČIROK", "NETÝKAVKA", "DEVĚTSIL", "DIVIZNA", "DOBROMYSL", "DRAČINEC", "DŘÍN", "ECHINACEA",
    "EUKALYPTUS", "FIALKA", "FÍKOVNÍK", "FRÉZIE", "FUCHSIE", "GERBERA", "GINKGO", "GLADIOLA",
    "HLOH", "HORTENZIE", "HRÁCH", "HYACINT", "CHMEL", "CHRPA", "IBIŠEK", "JALOVEC",
    "JIŘINA", "KAKTUS", "KAMÉLIE", "KLEN", "KOKOSOVNÍK", "KONVALINKA", "KOSATEC", "KROKUS",
    "KUKUŘICE", "LÉKOŘICE", "LILIE", "LUPINA", "MAGNÓLIE", "MANDLOŇ", "MATEŘÍDOUŠKA", "MEDUŇKA",
    "MIMÓZA", "MORUŠE", "MUŠKÁT", "NETŘESK", "OLEANDR", "OLŠE", "OSTRUŽINÍK", "PELARGONIE",
    "PETÚNIE", "PIVOŇKA", "PLATAN", "PRVOSENKA", "PŠENICE", "RAKYTNÍK", "REBARBORA", "ROZMARÝN",
    "ŘEBŘÍČEK", "ŘEŘICHA", "SAMETKA", "SASANKA", "ŠALVĚJ", "ŠEŘÍK", "TAŘIČKA", "TŘTINA",
    "VAVŘÍN", "VILÍN", "VISTÁRIE", "VŘES", "ZIMOLEZ", "ŽITO", "AJVAR", "ARTIČOK",
    "AVOKÁDO", "BRIOŠKA", "BULGUR", "BURGER", "CAPPUCCINO", "CIZRNA", "ČATNÍ", "ESPRESSO",
    "FEFERONKA", "FONDÁN", "BRAMBORÁK", "GRANOLA", "HALUŠKY", "HAMBURGER", "BATÁT", "HUMMUS",
    "CHŘEST", "JITRNICE", "KAKAO", "KARAMEL", "KEČUP", "KOKTEJL", "KORIANDR", "KROUPA",
    "KRUPICE", "KUSKUS", "KVÁSEK", "LASAGNE", "LILEK", "LUSK", "MAKARONKA", "MARCIPÁN",
    "MARMELÁDA", "MUFFIN", "NOKY", "NUGÁT", "OLIVA", "OMELETA", "OPLATKA", "PAŠTIKA",
    "PEPŘ", "PIZZA", "POMAZÁNKA", "PUDINK", "QUINOA", "RAVIOLI", "ROŠTĚNKA", "SORBET",
    "ŠAFRÁN", "ŠPAGETY", "ŠPEK", "ŠTRÚDL", "TATARÁK", "TOPINKA", "TORTILLA", "TOUST",
    "UTOPENEC", "VAJÍČKO", "VEKA", "VAFLE", "ŽEMLOVKA", "LIMONÁDA", "MOŠT", "NEKTAR",
    "BAŽINA", "BYSTŘINA", "DELTA", "DIVOČINA", "FJORD", "GEJZÍR", "HORIZONT", "HURIKÁN",
    "KANÁL", "KAŇON", "KORYTO", "KRÁTER", "LAVINA", "LEDOVEC", "MANGROV", "MĚLČINA",
    "NÍŽINA", "OÁZA", "OCEÁN", "PEVNINA", "PLANINA", "PLANETA", "POUŠŤ", "PRŮLIV",
    "PŘESYP", "PŘÍTOK", "ROKLINA", "SAVANA", "SOPKA", "SOUŠ", "STEP", "TAJFUN",
    "TROPY", "ÚBOČÍ", "ÚTES", "VODSTVO", "VULKÁN", "VÝŠINA", "ZEMĚKOULE", "BLESK",
    "BOUŘE", "CYKLONA", "DUSNO", "HROM", "INVERZE", "MONZUN", "MRÁZ", "PARNO",
    "PRŮTRŽ", "SMRŠŤ", "TORNÁDO", "ZÁVĚJ", "HLÍNA", "PÍSEK", "ŠTĚRK", "JÍLOVEC",
    "HUMUS", "RULA", "ŽULA", "BŘIDLICE", "ČEDIČ", "KŘEMEN", "MAGMA", "LÁVA",
    "KRÁPNÍK", "KRYSTAL", "NEROST", "HORNINA", "FOSILIE", "UHLÍ", "BRADA", "BRADAVKA",
    "BRÁNICE", "BRZLÍK", "BŘICHO", "BUBÍNEK", "CHODIDLO", "CHRUPAVKA", "ČELIST", "ČELO",
    "DÁSEŇ", "DLAŇ", "HLEZNO", "HLTAN", "HRTAN", "HRUDNÍK", "CHLOUPEK", "JÁTRA",
    "JAZYLKA", "KLOUB", "KOST", "KOSTRA", "KOTNÍK", "KYČEL", "LEBKA", "LOKET",
    "LOPATKA", "LÝTKO", "MÍCHA", "MOZEK", "OBOČÍ", "OČNICE", "ORGÁN", "PALEC",
    "PAŽE", "PLÍCE", "POKOŽKA", "PRST", "PUPÍK", "RAMENO", "ROHOVKA", "SÍTNICE",
    "SKLIVEC", "SLINA", "SLEZINA", "SVAL", "ŠLACHA", "TRUP", "UZLINA", "VLASY",
    "ZÁPĚSTÍ", "ZÁDA", "ŽALUDEK", "ŽEBRO", "ŽÍLA", "ŽLUČNÍK", "ZORNICE", "ALERGIE",
    "AMPUTACE", "ARTRÓZA", "ASTMA", "BOLÁK", "BRONCHITIDA", "CUKROVKA", "DÝCHÁNÍ", "EKZÉM",
    "HOREČKA", "CHŘIPKA", "IMUNITA", "INFEKCE", "JIZVA", "KAŠEL", "KŘEČ", "LÉKÁRNA",
    "MIGRÉNA", "NEŠTOVICE", "OMRZLINA", "OPAR", "OTRAVA", "PRŮJEM", "RÝMA", "SPÁLENINA",
    "TEPLOTA", "ÚRAZ", "VYRÁŽKA", "ZÁNĚT", "ZLOMENINA", "BAČKORA", "BARET", "BOLERKO",
    "BOTASKA", "BOXERKY", "ČELENKA", "DRES", "DŽÍNY", "HALENKA", "HOLÍNKA", "KAPSA",
    "KLOBOUK", "KORZET", "KRAJKA", "KRAVATA", "LEGÍNY", "LODIČKA", "MIKINA", "MOTÝLEK",
    "NÁHRDELNÍK", "NÁUŠNICE", "OPASEK", "PANTOFEL", "PLAVKY", "PLÁŠŤ", "PODPRSENKA", "PONOŽKA",
    "PRSTEN", "PUNČOCHA", "PYŽAMO", "ROUŠKA", "SAKO", "SANDÁL", "SPONKA", "SVETR",
    "ŠORTKY", "TEPLÁKY", "TENISKA", "TÍLKO", "TREPKA", "UNIFORMA", "VESTA", "ZÁSTĚRA",
    "ŽABKA", "DEODORANT", "HOUBIČKA", "KOLÍČEK", "KOSMETIKA", "KRÉM", "LÍČIDLO", "PARFÉM",
    "PINZETA", "ŠAMPON", "BRUSKA", "DLÁTO", "FRÉZA", "HOBLÍK", "HŘEBÍK", "KLADIVO",
    "KLEŠTĚ", "KLÍN", "KOTOUČ", "KRUMPÁČ", "LOPATA", "METR", "MOTYKA", "PILKA",
    "RAŠPLE", "SEKERA", "ŠROUB", "ŠROUBOVÁK", "SVĚRÁK", "VRTAČKA", "VRTÁK", "ZÁVIT",
    "ŽEBŘÍK", "CIHLA", "DLAŽBA", "FASÁDA", "MALTA", "OMÍTKA", "PODLAHA", "STROP",
    "TRÁM", "ZÁKLAD", "ZÁRUBEŇ", "ŽLAB", "AMFIBIE", "BRZDA", "BULDOZER", "CISTERNA",
    "DOPRAVA", "DREZÍNA", "FREGATA", "GALEONA", "KAJAK", "KANOE", "KATAMARÁN", "KOMBI",
    "KŘIŽNÍK", "LOKOMOTIVA", "MINIBUS", "MONOCYKL", "OBRNĚNEC", "PARNÍK", "PLAVIDLO", "PRAMICE",
    "SANITKA", "TRAJEKT", "TRAKTOR", "VAGÓN", "VLEK", "VZDUCHOLOĎ", "AKCELERÁTOR", "AIRBAG",
    "KAROSERIE", "KAPOTA", "NÁRAZNÍK", "PŘEVODOVKA", "ŘETĚZ", "SPOJKA", "TLUMIČ", "VOLANT",
    "VÝFUK", "ZRCÁTKO", "BANKA", "BAZAR", "BENZÍNKA", "BUTIK", "DROGERIE", "FAKULTA",
    "HOSTINEC", "HRAD", "HVĚZDÁRNA", "CHRÁM", "KASÁRNA", "KNIHKUPECTVÍ", "OBCHOD", "PALÁC",
    "PAPÍRNICTVÍ", "PARKOVIŠTĚ", "PEKÁRNA", "POJIŠŤOVNA", "RESTAURACE", "STAVENIŠTĚ", "SUPERMARKET", "TRŽNICE",
    "UBYTOVNA", "VĚZNICE", "ZÁMEČNICTVÍ", "ŽELEZÁŘSTVÍ", "ADVOKÁT", "ARCHEOLOG", "ASTRONAUT", "AUDITOR",
    "AUTOMECHANIK", "BARMAN", "BOTANIK", "CELNÍK", "DESIGNÉR", "DISPEČER", "EKONOM", "FARMACEUT",
    "GEODET", "GRAFIK", "HISTORIK", "HODINÁŘ", "HOSTINSKÝ", "HYDROLOG", "CHOVATEL", "INSPEKTOR",
    "KAMENÍK", "KASKADÉR", "KERAMIK", "KNIHAŘ", "KOMINÍK", "KOREKTOR", "KOSMONAUT", "KRIMINALISTA",
    "LABORANT", "LAKÝRNÍK", "LÉKÁRNÍK", "LOGOPED", "MATEMATIK", "METEOROLOG", "MODERÁTOR", "OCEÁNOLOG",
    "OPTIK", "OSVĚTLOVAČ", "PASTÝŘ", "PORODNÍK", "PSYCHIATR", "PSYCHOLOG", "RESTAURÁTOR", "ŘEŠITEL",
    "SÁZEČ", "SKLÁŘ", "SOCHAŘ", "SPELEOLOG", "STATISTIK", "STROJVŮDCE", "ŠPERKAŘ", "TECHNIK",
    "TESAŘ", "TISKAŘ", "TOPOGRAF", "VETERINÁŘ", "VÝPRAVČÍ", "ZLATNÍK", "ZOOLOG", "AKORDEON",
    "ARÉNA", "BALADA", "BALET", "BÁSEŇ", "ČÍTANKA", "DECHOVKA", "DRAMA", "DRAMATIK",
    "ENCYKLOPEDIE", "ETUDA", "FRESKA", "GONG", "HARFA", "HARMONIKA", "HOBOJ", "ILUSTRÁTOR",
    "KABARET", "KANKÁN", "KINOSÁL", "KLARINET", "KOLÁŽ", "KOMEDIE", "KONCERT", "KONTRABAS",
    "LOUTKA", "LOUTNA", "MANDOLÍNA", "MELODIE", "MUZIKÁL", "NOTA", "NOVELA", "OLEJOMALBA",
    "OPERA", "ORATORIUM", "PANORAMA", "PANTOMIMA", "PARTITURA", "PASTEL", "PÍŠŤALA", "POEZIE",
    "REFRÉN", "ROMÁN", "SATIRA", "SKICA", "SONÁTA", "SOPRÁN", "SYMFONIE", "TANGO",
    "TENOR", "TRAGÉDIE", "TRIOLA", "VARHANY", "VIOLONCELLO", "ŽÁNR", "AKADEMIE", "AREÁL",
    "CVIČENÍ", "DIPLOM", "DISCIPLÍNA", "INSTITUT", "KABINET", "KATEDRA", "KOLEJ", "KURZ",
    "LEKCE", "MATURITA", "MENZA", "PŘEDMĚT", "SEMINÁŘ", "STUDENT", "SYLABUS", "TŘÍDNICE",
    "UČIVO", "UČILIŠTĚ", "UNIVERZITA", "AKROBACIE", "BADMINTON", "BIATLON", "BILIÁR", "BOBOVÁNÍ",
    "BOWLING", "CURLING", "GOLF", "HOKEJBAL", "JACHTING", "KAJAKÁŘSTVÍ", "KANOISTIKA", "KICKBOX",
    "KORFBAL", "KRASOBRUSLENÍ", "KULEČNÍK", "LAKROS", "LUKOSTŘELBA", "MOTOKROS", "PAINTBALL", "PARKOUR",
    "PĚTIBOJ", "POLO", "RAGBY", "SKATEBOARD", "SOFTBAL", "SQUASH", "SURFING", "TRIATLON",
    "BRADLA", "BOBY", "HRAZDA", "CHRÁNIČ", "KOPAČKA", "KRUHY", "KUŽELKA", "PÁLKA",
    "VESLO", "DÁMA", "DOMINO", "KOSTKY", "PEXESO", "POKER", "PIŠKVORKY", "VYBÍJENÁ",
    "ŠACHY", "KANASTA", "ŽOLÍKY", "AKUSTIKA", "ANTROPOLOGIE", "ARCHEOLOGIE", "ASTROFYZIKA", "BOTANIKA",
    "CYTOLOGIE", "DEMOGRAFIE", "EKOLOGIE", "EMBRYOLOGIE", "ENTOMOLOGIE", "EPIDEMIOLOGIE", "ETIKA", "GENETIKA",
    "GEODÉZIE", "IMUNOLOGIE", "INFORMATIKA", "LINGVISTIKA", "METEOROLOGIE", "MINERALOGIE", "MYKOLOGIE", "OCEÁNOGRAFIE",
    "ORNITOLOGIE", "PALEONTOLOGIE", "PARAZITOLOGIE", "PETROLOGIE", "SEISMOLOGIE", "TAXONOMIE", "TOPOGRAFIE", "TOXIKOLOGIE",
    "ZOOLOGIE", "AMPLITUDA", "ANODA", "ATOM", "BÁZE", "BUŇKA", "CÍVKA", "DIODA",
    "ELEKTRODA", "FÁZE", "FILAMENT", "FOTON", "INDUKCE", "IONT", "IZOTOP", "JÁDRO",
    "KATION", "KMITOČET", "LASER", "NEUTRON", "NUKLEON", "ORBITA", "OSCILÁTOR", "PROTON",
    "KVARK", "REZISTOR", "VODIČ", "VLNĚNÍ", "BAJT", "DOMÉNA", "EMULÁTOR", "FIREWALL",
    "FORMÁT", "HARDWARE", "HOSTING", "KLIENT", "KODEK", "KONZOLE", "LAPTOP", "MIKROČIP",
    "PROCESOR", "ROUTER", "SOFTWARE", "TOKEN", "MODEM", "PORTÁL", "PROFIL", "PROTOKOL",
    "REGISTR", "ROZLIŠENÍ", "SYSTÉM", "VYHLEDÁVAČ", "DERIVACE", "INTEGRÁL", "LOGARITMUS", "MATICE",
    "MNOŽINA", "ODCHYLKA", "POSLOUPNOST", "PRAVDĚPODOBNOST", "ROVNOBĚŽNÍK", "TĚŽIŠTĚ", "VEKTOR", "ZLOMEK",
    "ADVOKACIE", "AMNESTIE", "ANARCHIE", "ARBITRÁŽ", "BANKOVNICTVÍ", "BYROKRACIE", "CENÍK", "DEFICIT",
    "DEPOZIT", "DLUH", "DOTACE", "EXPORT", "FIRMA", "FOND", "HYPOTÉKA", "IMPORT",
    "KAPITÁL", "KORPORACE", "LICENCE", "MĚNA", "PLATBA", "POJISTKA", "POPLATEK", "ROZPOČET",
    "SMĚNKA", "SPOŘENÍ", "ÚČTENKA", "ÚROK", "VKLAD", "VÝNOS", "ZISK", "ZTRÁTA",
    "ALIBI", "DĚDICTVÍ", "DOHODA", "EXEKUCE", "KAUCE", "KRÁDEŽ", "OBHAJOBA", "OBŽALOBA",
    "ODVOLÁNÍ", "PARAGRAF", "PODMÍNKA", "PŘEČIN", "ROZSUDEK", "SOUDNICTVÍ", "SVĚDEK", "TREST",
    "VAZBA", "VERDIKT", "ZÁKONÍK", "ZLOČIN", "CENZURA", "CHARITA", "DIKTATURA", "FEDERACE",
    "HUMANITA", "IDEOLOGIE", "KOMUNITA", "KONVENCE", "KULTURA", "MANDÁT", "MIGRACE", "MONARCHIE",
    "MUNICIPALITA", "OPOZICE", "PETICE", "POLITIKA", "PROPAGANDA", "REPUBLIKA", "REŽIM", "SAMOSPRÁVA",
    "SOLIDARITA", "TRADICE", "ÚSTAVA", "VEŘEJNOST", "VOLBY", "AMBICE", "ANTIPATIE", "BEZMOC",
    "BLAHO", "CÍLEVĚDOMOST", "CUDNOST", "DŮSTOJNOST", "EMPATIE", "EUFORIE", "FRUSTRACE", "HRDOST",
    "HUMOR", "CHAMTIVOST", "CHYBA", "ILUZE", "INTUICE", "LHOSTEJNOST", "LÍTOST", "LOAJALITA",
    "MRZUTOST", "NAPĚTÍ", "NENÁVIST", "NEROZHODNOST", "NEVRAŽIVOST", "OBEZŘETNOST", "OBLIBA", "OBAVA",
    "ODDANOST", "ODPOR", "OHLEDUPLNOST", "OPTIMISMUS", "PANIKA", "POKORA", "PRACOVITOST", "PŘEDSUDEK",
    "PÝCHA", "ROZPAKY", "SEBEÚCTA", "SKLESLOST", "SMUTEK", "SOUZNĚNÍ", "STUD", "TOUHA",
    "TRÉMA", "ÚCTA", "ÚDIV", "ÚZKOST", "VÁŠEŇ", "VELKORYSOST", "VSTŘÍCNOST", "ZÁVIST",
    "ZLOBA", "ŽÁRLIVOST", "BUDOUCNOST", "MINULOST", "PŘÍTOMNOST", "OKAMŽIK", "OBDOBÍ", "EPOCHA",
    "TERMÍN", "LHŮTA", "VĚČNOST", "AGENDA", "ANKETA", "BILANCE", "BROŽURA", "CERTIFIKÁT",
    "DOKLAD", "DOTAZNÍK", "EVIDENCE", "FORMULÁŘ", "HLÁŠENÍ", "INVENTURA", "KATALOG", "KONTROLA",
    "KRITÉRIUM", "NABÍDKA", "OBJEDNÁVKA", "POPTÁVKA", "PORADA", "PŘÍLOHA", "REKLAMACE", "ROZPIS",
    "SMLOUVA", "STATUT", "ALTERNATIVA", "ANALYTIKA", "AUTOMATIZACE", "BEZDOMOVECTVÍ", "BEZPROSTŘEDNÍ", "BIOINFORMATIKA",
    "BIOTECHNOLOGIE", "BOMBARDOVÁNÍ", "CHARITATIVNÍ", "CHEMOTERAPIE", "DEMOKRATIČNOST", "DERMATOLOGIE", "DESTRUKTIVNÍ", "DIGITALIZACE",
    "DISCIPLINÁRNÍ", "DOBROČINNOST", "DOBRODRUŽSTVÍ", "DOBROVOLNICTVÍ", "DŮVĚRYHODNOST", "ELEKTROMAGNET", "ELEKTROMECHANIK", "ELEKTROMOTOR",
    "ELEKTRONICKÝ", "ENDOKRINOLOGIE", "EXPERIMENTÁLNÍ", "FARMAKOLOGIE", "FARMACEUTICKÝ", "FOTOGRAFOVÁNÍ", "GASTRONOMICKÝ", "HETEROSEXUÁLNÍ",
    "HISTORIOGRAFIE", "HOMOSEXUALITA", "HYDRODYNAMIKA", "IDENTIFIKACE", "IMAGINATIVNÍ", "INDIVIDUALITA", "INSPIRATIVNÍ", "INTELIGENTNÍ",
    "INTELEKTUALITA", "INVESTIGATIVNÍ", "KAPITALISMUS", "KATEGORIZACE", "KLIMATIZACE", "KONSTRUKTIVNÍ", "KONTINENTÁLNÍ", "KONTROVERZNÍ",
    "KORESPONDENCE", "KRIMINOLOGIE", "KRYPTOGRAFIE", "KULTIVOVANOST", "KVALIFIKOVANÝ", "LEXIKOLOGIE", "MALOMYSLNOST", "MANIPULATIVNÍ",
    "MATERIALIZACE", "METABOLISMUS", "MIKROBIOLOGIE", "MIKROPROCESOR", "MIKROSKOPICKÝ", "MILOSRDENSTVÍ", "MLČENLIVOST", "MNOHOJAZYČNÝ",
    "MNOHONÁSOBNOST", "NAKLADATELSTVÍ", "NANOTECHNOLOGIE", "NEDOROZUMĚNÍ", "NEKONFLIKTNOST", "NEODPUSTITELNÝ", "NEPŘEHLEDNOST", "NEPŘÍJEMNOST",
    "NEPŘÍTOMNOST", "NEPŘÁTELSTVÍ", "NEPOUŽITELNOST", "NEPOSLUŠNOST", "NESMRTELNOST", "NESPRAVEDLNOST", "NEZAMĚSTNANOST", "NEZASTAVITELNÝ",
    "OBYVATELSTVO", "OFTALMOLOGIE", "OSPRAVEDLNĚNÍ", "OŠETŘOVATELKA", "PARANORMÁLNÍ", "PERSONALIZACE", "POHOSTINNOST", "PRÁCESCHOPNOST",
    "PRÁVOPLATNOST", "PROFESIONALITA", "PROFESIONÁLNÍ", "PROGRAMOVÁNÍ", "PRONÁSLEDOVÁNÍ", "PROSTRANSTVÍ", "PROTIOPATŘENÍ", "PŘEDSTAVENSTVO",
    "PŘEDSTAVIVOST", "PŘEPROGRAMOVAT", "PŘÍRODOVĚDECKÝ", "RADIOAKTIVNÍ", "REHABILITACE", "ROZMNOŽOVÁNÍ", "SAMOOBSLUŽNÝ", "SEBEOVLÁDÁNÍ",
    "SENTIMENTÁLNÍ", "SEVEROVÝCHODNÍ", "SCHIZOFRENIE", "SOUKROMOPRÁVNÍ", "SPOLEČENSTVÍ", "SPOLUPACHATEL", "SPOLUPRACOVNÍK", "STANDARDIZACE",
    "STAROŽITNOST", "STŘEDOEVROPSKÝ", "STŘEDOŠKOLSKÝ", "SYSTEMATIZACE", "TAXIDERMISTA", "TELEKOMUNIKACE", "TRANSPLANTACE", "VĚROHODNOST",
    "VICEPREZIDENT", "VLASTENECTVÍ", "VYDAVATELSTVÍ", "VYŠETŘOVATELKA", "VYSOKOŠKOLSKÝ", "VYSOKORYCHLOSTNÍ", "ZADOSTIUČINĚNÍ", "ZÁKONODÁRSTVÍ",
    "ZAMĚSTNAVATEL", "ZAMĚSTNANKYNĚ", "ZASTUPITELSTVÍ", "ZDRAVOTNICTVÍ", "ZODPOVĚDNOST", "ZMRTVÝCHVSTÁNÍ", "ZPRAVODAJSTVÍ", "AGRESIVITA",
    "AKTIVISTKA", "ALPINISMUS", "APOKALYPSA", "APROXIMACE", "ARISTOKRAT", "ASISTENTKA", "AUTOSTRÁDA", "BALANCOVÁNÍ",
    "BOHOSLUŽBA", "BUDDHISMUS", "DELEGOVÁNÍ", "DISTRIBUCE", "DOPORUČENÍ", "ELEKTRÁRNA", "ENERGETIKA", "EXPERIMENT",
    "FOTOGRAFIE", "HUMANISMUS", "INFORMÁTOR", "INOVATIVNÍ", "INSTRUKTOR", "KARIKATURA", "KATASTROFA", "KATASTRÁLNÍ",
    "KLÁVESNICE", "KOMENTÁTOR", "KOMPLIMENT", "KONKURENCE", "KONVERZACE", "KORMIDELNA", "KULTIVÁTOR", "MENSTRUACE",
    "MYŠLENKOVÝ", "NEPŘESNOST", "ODSTRANĚNÍ", "PAPÍROVÁNÍ", "PODNIKATEL", "POLITOVÁNÍ", "POPULARITA", "POROZUMĚNÍ",
    "POTRAVINÁŘ", "PRŮMYSLNÍK", "PŘEMÝŠLENÍ", "REAKTIVITA", "RELATIVITA", "RESPIRÁTOR", "ROZMANITOST", "SEBEOBRANA",
    "SEBEVĚDOMÍ", "SEKRETÁŘKA", "SESTŘENICE", "SOUROZENEC", "SPECIALITA", "STIPENDIUM", "VŠESTRANNÝ", "ZAMĚSTNÁNÍ",
    "ZEMĚDĚLEC", "ZOUFALSTVÍ", "UPOZORNĚNÍ", "SOUVISLOST", "PROSTŘEDEK", "ZAHRANIČNÍ", "AERODYNAMIKA", "ANTIKVARIÁT",
    "AUTOMATICKÝ", "BLÁZNOVSTVÍ", "DEMONSTRACE", "DOBROVOLNÍK", "DŮVĚRYHODNÝ", "FINANCOVÁNÍ", "GASTRONOMIE", "GEOMORFOLOG",
    "GYNEKOLOGIE", "HARMONIZACE", "HEMATOLOGIE", "IMPROVIZACE", "INŽENÝRSTVÍ", "INTELIGENCE", "KARTOGRAFKA", "KVALIFIKACE",
    "KYBERNETIKA", "MANUFAKTURA", "MECHANISMUS", "MISTROVSTVÍ", "MOLEKULÁRNÍ", "MONUMENTÁLNÍ", "NÁBOŽENSTVÍ", "NESCHOPNOST",
    "OBDIVOVATEL", "OBJEKTIVITA", "ODPOVĚDNOST", "OPTIMALIZACE", "ORIGINALITA", "PARTNERSTVÍ", "PERIODICITA", "POKRYTECTVÍ",
    "PORADENSTVÍ", "PRODUKTIVITA", "PROFESIONÁL", "PROGRESIVNÍ", "PŘÍBUZENSTVÍ", "REALISTICKÝ", "ŘEDITELSTVÍ", "SEBEKRITIKA",
    "SENZITIVITA", "SPECIALISTA", "SPOJENECTVÍ", "SPRAVEDLIVÝ", "TECHNOLOGIE", "TEMPERAMENT", "TĚHOTENSTVÍ", "UNIVERZÁLNÍ",
    "VLASTNICTVÍ", "ZAMĚSTNANEC", "ZEMĚDĚLSTVÍ", "ZEMĚTŘESENÍ", "POZORUHODNÝ", "OBDIVUHODNÝ",
    "AKCEPTOVATELNÝ", "AKLIMATIZOVÁNÍ", "ANTIDEPRESIVNÍ", "ANTIKOMUNISMUS", "ANTROPOLOGICKÝ", "ARCIBISKUPSTVÍ", "ARISTOKRATICKÝ", "AUTOMATIZOVÁNÍ",
    "AUTOMOBILISMUS", "AUTORSKOPRÁVNÍ", "BEZCHARAKTERNÍ", "BEZKONKURENČNÍ", "BEZPRECEDENTNÍ", "BEZSKRUPULÓZNÍ", "BIBLIOGRAFICKÝ", "BLÍZKOVÝCHODNÍ",
    "CELOPLANETÁRNÍ", "CENTRALIZOVÁNÍ", "CESTOVATELSTVÍ", "CHALOUPKÁŘSTVÍ", "CHARAKTERIZACE", "CHOREOGRAFICKÝ", "CUKROVARNICTVÍ", "DECENTRALIZACE",
    "DEGRADOVATELNÝ", "DEHUMANIZOVÁNÍ", "DEKONTAMINAČNÍ", "DEMILITARIZACE", "DEMINERALIZACE", "DEMOKRATIZAČNÍ", "DEMONSTRATIVNÍ", "DERMATOLOGICKÝ",
    "DIGITALIZOVÁNÍ", "DISCIPLINOVANÝ", "DISKVALIFIKACE", "DLOUHOMETRÁŽNÍ", "DOKUMENTARISTA", "DRUŽSTEVNICTVÍ", "ELEKTRIFIKAČNÍ", "ELEKTRÁRENSTVÍ",
    "ENCYKLOPEDICKÝ", "ENCYKLOPEDISTA", "EUROATLANTICKÝ", "EVOLUCIONISMUS", "EXPERIMENTÁTOR", "EXPRESIONISMUS", "FARMAKOLOGICKÝ", "FOLKLORISTICKÝ",
    "FOTOELEKTRICKÝ", "FOTOSYNTETICKÝ", "FRAZEOLOGISMUS", "GENERALIZOVÁNÍ", "GEOSTACIONÁRNÍ", "HELIOCENTRICKÝ", "HYPERVENTILACE", "IDENTIFIKOVÁNÍ",
    "IMPRESIONISMUS", "INDIVIDUALISTA", "INKOMPATIBILNÍ", "INSTRUMENTÁLNÍ", "INTROSPEKTIVNÍ", "IRACIONALISMUS", "IZOLACIONISMUS", "KAPITALISTICKÝ",
    "KINEMATOGRAFIE"
  ]).filter(isUsableWord);
  const WORDS_BY_LENGTH = WORD_BANK.reduce((groups, word) => {
    const length = getLetterCount(word);

    groups[length] = groups[length] || [];
    groups[length].push(word);

    return groups;
  }, {});

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
    const knownAttempt = SUCCESSFUL_ATTEMPTS[difficulty.key] && SUCCESSFUL_ATTEMPTS[difficulty.key][index];

    if (Number.isInteger(knownAttempt)) {
      const level = buildLevelAttempt(quote, index, difficulty, knownAttempt);

      if (level) return level;
    }

    for (let attempt = 0; attempt < BUILD_ATTEMPTS; attempt += 1) {
      if (attempt === knownAttempt) continue;

      const level = buildLevelAttempt(quote, index, difficulty, attempt);

      if (level) return level;
    }

    throw new Error(`Nepodařilo se vytvořit level ${index + 1}.`);
  }

  function buildLevelAttempt(quote, index, difficulty, attempt) {
    const seed = (index + 1) * 2654435761 + difficulty.gridSize * 2246822519 + attempt * 1013904223;
    const rng = createRandom(seed);

    return tryBuildLevel(quote, index, difficulty, rng);
  }

  function tryBuildLevel(quote, index, difficulty, rng) {
    const gridSize = difficulty.gridSize;
    const secretLetters = getSecretLetters(quote.secret);
    const targetCoveredCount = gridSize * gridSize - secretLetters.length;
    const grid = createEmptyGrid(gridSize);
    const covered = new Set();
    const usedWords = new Set();
    const placements = [];
    const directions = getDifficultyDirections(difficulty);

    if (targetCoveredCount < gridSize * gridSize * 0.58 || targetCoveredCount > gridSize * gridSize - 8) {
      return null;
    }

    for (const direction of shuffle(directions, rng)) {
      if (!placeOneWord(grid, covered, usedWords, placements, direction, targetCoveredCount, gridSize, difficulty, rng)) {
        return null;
      }
    }

    let guard = 0;

    while (
      covered.size < targetCoveredCount &&
      placements.length < difficulty.wordCountMax &&
      guard < 600
    ) {
      const direction = pickNextDirection(placements, directions, rng);

      if (!placeOneWord(grid, covered, usedWords, placements, direction, targetCoveredCount, gridSize, difficulty, rng)) {
        guard += 1;
        continue;
      }

      guard = 0;
    }

    if (
      covered.size !== targetCoveredCount ||
      placements.length < difficulty.wordCountMin ||
      placements.length > difficulty.wordCountMax
    ) return null;

    const secretCells = fillSecretCells(grid, secretLetters, gridSize);

    if (!secretCells || !hasUniquePlacedWordOccurrences(grid, placements)) return null;

    return {
      id: `${difficulty.key}-${String(index + 1).padStart(3, "0")}`,
      title: `${difficulty.label} osmisměrka ${index + 1}`,
      difficulty: difficulty.key,
      difficultyLabel: difficulty.label,
      gridSize,
      clue: quote.clue,
      secret: quote.secret,
      solution: `${quote.clue} ${quote.secret}`,
      rows: grid.map((row) => row.join("")),
      words: placements
        .map(({ text, cells, direction }) => ({ text, cells, direction }))
        .sort((first, second) => first.text.localeCompare(second.text, "cs")),
      secretCells
    };
  }

  function placeOneWord(grid, covered, usedWords, placements, direction, targetCoveredCount, gridSize, difficulty, rng) {
    const remaining = targetCoveredCount - covered.size;
    const selectedWords = placements.map((placement) => placement.text);
    const candidates = getCandidateWords(remaining, usedWords, selectedWords, gridSize, difficulty, rng);

    for (const word of candidates) {
      const options = findPlacementOptions(word, direction, grid, covered, remaining, gridSize);

      if (!options.length) continue;

      const option = pickPlacementOption(options, rng);
      placeWord(grid, covered, usedWords, placements, word, option, direction);
      return true;
    }

    return false;
  }

  function getCandidateWords(remaining, usedWords, selectedWords, gridSize, difficulty, rng) {
    const maxLength = Math.min(difficulty.maxLength, difficulty.gridSize);
    const usageByLength = selectedWords.reduce((counts, word) => {
      const length = getLetterCount(word);

      counts[length] = (counts[length] || 0) + 1;
      return counts;
    }, {});
    const allLengths = range(difficulty.minLength, maxLength)
      .filter((length) => (WORDS_BY_LENGTH[length] || []).length >= MIN_WORDS_PER_LENGTH_POOL)
      .sort((first, second) => second - first);
    const underusedLengths = allLengths.filter((length) => {
      return (usageByLength[length] || 0) < TARGET_WORDS_PER_LENGTH;
    });
    const lengths = underusedLengths.length
      ? underusedLengths
      : allLengths.sort((first, second) => {
        return (usageByLength[first] || 0) - (usageByLength[second] || 0) || second - first;
      });
    const candidates = [];

    lengths.forEach((length) => {
      const words = WORDS_BY_LENGTH[length] || [];

      shuffle(words, rng).forEach((word) => {
        if (usedWords.has(word)) return;
        if (conflictsWithSelection(word, selectedWords)) return;
        candidates.push(word);
      });
    });

    return candidates;
  }

  function findPlacementOptions(word, direction, grid, covered, remaining, gridSize) {
    const letters = [...word];
    const options = [];

    for (let row = 0; row < gridSize; row += 1) {
      for (let col = 0; col < gridSize; col += 1) {
        const endRow = row + direction.row * (letters.length - 1);
        const endCol = col + direction.col * (letters.length - 1);

        if (!isInside(endRow, endCol, gridSize)) continue;

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

  function placeWord(grid, covered, usedWords, placements, word, option, direction) {
    const letters = [...word];

    option.cells.forEach((cell, index) => {
      grid[cell.row][cell.col] = letters[index];
      covered.add(cellKey(cell.row, cell.col));
    });

    usedWords.add(word);
    placements.push({
      text: word,
      cells: option.cells,
      direction: direction.code,
      orientation: direction.orientation,
      newCells: option.newCells
    });
  }

  function pickNextDirection(placements, directions, rng) {
    const usage = new Map(directions.map((direction) => [direction.code, 0]));

    placements.forEach((placement) => usage.set(placement.direction, usage.get(placement.direction) + 1));

    const minUsage = Math.min(...usage.values());
    const leastUsed = directions.filter((direction) => usage.get(direction.code) === minUsage);

    return leastUsed[Math.floor(rng() * leastUsed.length)];
  }

  function getDifficultyDirections(difficulty) {
    return difficulty.directions.map((code) => DIRECTION_BY_CODE[code]);
  }

  function conflictsWithSelection(word, selected) {
    const reversed = reverseText(word);

    return selected.some((existing) => {
      return existing === reversed || existing.includes(word) || word.includes(existing);
    });
  }

  function fillSecretCells(grid, secretLetters, gridSize) {
    const secretCells = [];
    let secretIndex = 0;

    for (let row = 0; row < gridSize; row += 1) {
      for (let col = 0; col < gridSize; col += 1) {
        if (grid[row][col]) continue;
        if (secretIndex >= secretLetters.length) return null;

        grid[row][col] = secretLetters[secretIndex];
        secretCells.push({ row, col });
        secretIndex += 1;
      }
    }

    return secretIndex === secretLetters.length ? secretCells : null;
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

  function createEmptyGrid(gridSize) {
    return Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => null));
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

  function range(start, end) {
    const values = [];

    for (let value = start; value <= end; value += 1) {
      values.push(value);
    }

    return values;
  }

  function getDifficulty(options) {
    const key = typeof options === "string" ? options : options && options.difficulty;

    return DIFFICULTIES[key] || DIFFICULTIES[DEFAULT_DIFFICULTY];
  }

  function getLetterCount(text) {
    return [...text].length;
  }

  function getSecretLetters(text) {
    return [...text.replace(/\s+/g, "").toUpperCase()];
  }

  function cellKey(row, col) {
    return `${row}:${col}`;
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
