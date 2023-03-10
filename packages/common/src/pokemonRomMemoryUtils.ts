// https://datacrystal.romhacking.net/wiki/Pok%C3%A9mon_Red/Blue:RAM_map

export const GAMEBOY_MEMORY_OFFSET = 0x8000;

export const LETTER_PRINTING_DELAY_FLAGS_LOCATION = 0xd358;

// Pokemon 1, use as starting point for all pokemon
export const POKEMON_1_NAME = 0xd16b;
export const POKEMON_1_NICKNAME_START = 0xd2b5;
export const POKEMON_1_HP_START = 0xd16c;
export const POKEMON_1_MAX_HP_START = 0xd18d;
export const POKEMON_1_LEVEL = 0xd18c;

// Pokemon data offsets
export const POKEMON_HP_SIZE = 2;
export const POKEMON_NICKNAME_SIZE = 11;
export const POKEMON_SIZE = 44;

export const TOTAL_ITEMS_INDEX = 0xd31d;

export const BADGES_INDEX = 0xd356;

export const BADGE_NAMES = [
  "Boulder",
  "Cascade",
  "Thunder",
  "Rainbow",
  "Soul",
  "Marsh",
  "Volcano",
  "Earth",
];

// https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_index_number_(Generation_I)
export const POKEMON_INDEX = [
  null,
  "RHYDON",
  "KANGASKHAN",
  "NIDORAN♂",
  "CLEFAIRY",
  "SPEAROW",
  "VOLTORB",
  "NIDOKING",
  "SLOWBRO",
  "IVYSAUR",
  "EXEGGUTOR",
  "LICKITUNG",
  "EXEGGCUTE",
  "GRIMER",
  "GENGAR",
  "NIDORAN♀",
  "NIDOQUEEN",
  "CUBONE",
  "RHYHORN",
  "LAPRAS",
  "ARCANINE",
  "MEW",
  "GYARADOS",
  "SHELLDER",
  "TENTACOOL",
  "GASTLY",
  "SCYTHER",
  "STARYU",
  "BLASTOISE",
  "PINSIR",
  "TANGELA",
  null,
  null,
  "GROWLITHE",
  "ONIX",
  "FEAROW",
  "PIDGEY",
  "SLOWPOKE",
  "KADABRA",
  "GRAVELER",
  "CHANSEY",
  "MACHOKE",
  "MR. MIME",
  "HITMONLEE",
  "HITMONCHAN",
  "ARBOK",
  "PARASECT",
  "PSYDUCK",
  "DROWZEE",
  "GOLEM",
  null,
  "MAGMAR",
  null,
  "ELECTABUZZ",
  "MAGNETON",
  "KOFFING",
  null,
  "MANKEY",
  "SEEL",
  "DIGLETT",
  "TAUROS",
  null,
  null,
  null,
  "FARFETCH'D",
  "VENONAT",
  "DRAGONITE",
  null,
  null,
  null,
  "DODUO",
  "POLIWAG",
  "JYNX",
  "MOLTRES",
  "ARTICUNO",
  "ZAPDOS",
  "DITTO",
  "MEOWTH",
  "KRABBY",
  null,
  null,
  null,
  "VULPIX",
  "NINETALES",
  "PIKACHU",
  "RAICHU",
  null,
  null,
  "DRATINI",
  "DRAGONAIR",
  "KABUTO",
  "KABUTOPS",
  "HORSEA",
  "SEADRA",
  null,
  null,
  "SANDSHREW",
  "SANDSLASH",
  "OMANYTE",
  "OMASTAR",
  "JIGGLYPUFF",
  "WIGGLYTUFF",
  "EEVEE",
  "FLAREON",
  "JOLTEON",
  "VAPOREON",
  "MACHOP",
  "ZUBAT",
  "EKANS",
  "PARAS",
  "POLIWHIRL",
  "POLIWRATH",
  "WEEDLE",
  "KAKUNA",
  "BEEDRILL",
  null,
  "DODRIO",
  "PRIMEAPE",
  "DUGTRIO",
  "VENOMOTH",
  "DEWGONG",
  null,
  null,
  "CATERPIE",
  "METAPOD",
  "BUTTERFREE",
  "MACHAMP",
  null,
  "GOLDUCK",
  "HYPNO",
  "GOLBAT",
  "MEWTWO",
  "SNORLAX",
  "MAGIKARP",
  null,
  null,
  "MUK",
  null,
  "KINGLER",
  "CLOYSTER",
  null,
  "ELECTRODE",
  "CLEFABLE",
  "WEEZING",
  "PERSIAN",
  "MAROWAK",
  null,
  "HAUNTER",
  "ABRA",
  "ALAKAZAM",
  "PIDGEOTTO",
  "PIDGEOT",
  "STARMIE",
  "BULBASAUR",
  "VENUSAUR",
  "TENTACRUEL",
  null,
  "GOLDEEN",
  "SEAKING",
  null,
  null,
  null,
  null,
  "PONYTA",
  "RAPIDASH",
  "RATTATA",
  "RATICATE",
  "NIDORINO",
  "NIDORINA",
  "GEODUDE",
  "PORYGON",
  "AERODACTYL",
  null,
  "MAGNEMITE",
  null,
  null,
  "CHARMANDER",
  "SQUIRTLE",
  "CHARMELEON",
  "WARTORTLE",
  "CHARIZARD",
  null,
  null,
  null,
  null,
  "ODDISH",
  "GLOOM",
  "VILEPLUME",
  "BELLSPROUT",
  "WEEPINBELL",
  "VICTREEBEL",
];

// https://bulbapedia.bulbagarden.net/wiki/Character_encoding_(Generation_I)
const CHARCTER_ENCODING = [
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "V",
    "S",
    "L",
    "M",
    ":",
    "ぃ",
    "ぅ",
  ],

  ["‘", "’", "“", "”", "・", "⋯", "ぁ", "ぇ", "ぉ", "", "", "", "", "", "", ""],

  [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
  ],

  [
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "(",
    ")",
    ":",
    ";",
    "[",
    "]",
  ],

  [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
  ],

  [
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "e",
    "'d",
    "'l",
    "'s",
    "'t",
    "'v",
  ],

  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  [
    "'",
    "PK",
    "MN",
    "-",
    "'r",
    "'m",
    "?",
    "!",
    ".",
    "ァ",
    "ゥ",
    "ェ",
    "▷",
    "▶",
    "▼",
    "♂",
  ],

  [
    "$",
    "×",
    ".",
    "/",
    ",",
    "♀",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ],
];
export const memorySliceToString = (memorySlice: Uint8Array) => {
  const charArray = [];
  for (let i = 0; i < memorySlice.length; i++) {
    const firstNibble = (memorySlice[i] & 0xf0) >> 4;
    const secondNibble = memorySlice[i] & 0xf;
    const char = CHARCTER_ENCODING[firstNibble][secondNibble];
    charArray.push(char);
  }
  const relevantChars = charArray.filter(
    (_char, i, arr) => arr.findIndex((char) => char === "") > i // drop all characters after the first empty string
  );
  return relevantChars.join("");
};

// https://bulbapedia.bulbagarden.net/wiki/List_of_items_by_index_number_(Generation_I)
export const ITEMS_INDEX: Record<number, string> = {
  1: "Master Ball",
  2: "Ultra Ball",
  3: "Great Ball",
  4: "Poke Ball",
  5: "Town Map",
  6: "Bicycle",
  7: "?????",
  8: "Safari Ball",
  9: "Pokedex",
  10: "Moon Stone",
  11: "Antidote",
  12: "Burn Heal",
  13: "Ice Heal",
  14: "Awakening",
  15: "Parlyz Heal",
  16: "Full Restore",
  17: "Max Potion",
  18: "Hyper Potion",
  19: "Super Potion",
  20: "Potion",
  21: "BoulderBadge",
  22: "CascadeBadge",
  23: "ThunderBadge",
  24: "RainbowBadge",
  25: "SoulBadge",
  26: "MarshBadge",
  27: "VolcanoBadge",
  28: "EarthBadge",
  29: "Escape Rope",
  30: "Repel",
  31: "Old Amber",
  32: "Fire Stone",
  33: "Thunderstone",
  34: "Water Stone",
  35: "HP Up",
  36: "Protein",
  37: "Iron",
  38: "Carbos",
  39: "Calcium",
  40: "Rare Candy",
  41: "Dome Fossil",
  42: "Helix Fossil",
  43: "Secret Key",
  44: "?????",
  45: "Bike Voucher",
  46: "X Accuracy",
  47: "Leaf Stone",
  48: "Card Key",
  49: "Nugget",
  50: "PP Up*",
  51: "Poke Doll",
  52: "Full Heal",
  53: "Revive",
  54: "Max Revive",
  55: "Guard Spec.",
  56: "Super Repel",
  57: "Max Repel",
  58: "Dire Hit",
  59: "Coin",
  60: "Fresh Water",
  61: "Soda Pop",
  62: "Lemonade",
  63: "S.S. Ticket",
  64: "Gold Teeth",
  65: "X Attack",
  66: "X Defend",
  67: "X Speed",
  68: "X Special",
  69: "Coin Case",
  70: "Oak's Parcel",
  71: "Itemfinder",
  72: "Silph Scope",
  73: "Poke Flute",
  74: "Lift Key",
  75: "Exp. All",
  76: "Old Rod",
  77: "Good Rod",
  78: "Super Rod",
  79: "PP Up",
  80: "Ether",
  81: "Max Ether",
  82: "Elixer",
  83: "Max Elixer",
  196: "HM1",
  197: "HM2",
  198: "HM3",
  199: "HM4",
  200: "HM5",
  201: "TM1",
  202: "TM2",
  203: "TM3",
  204: "TM4",
  205: "TM5",
  206: "TM6",
  207: "TM7",
  208: "TM8",
  209: "TM09",
  210: "TM10",
  211: "TM11",
  212: "TM12",
  213: "TM13",
  214: "TM14",
  215: "TM15",
  216: "TM16",
  217: "TM17",
  218: "TM18",
  219: "TM19",
  220: "TM20",
  221: "TM21",
  222: "TM22",
  223: "TM23",
  224: "TM24",
  225: "TM25",
  226: "TM26",
  227: "TM27",
  228: "TM28",
  229: "TM29",
  230: "TM30",
  231: "TM31",
  232: "TM32",
  233: "TM33",
  234: "TM34",
  235: "TM35",
  236: "TM36",
  237: "TM37",
  238: "TM38",
  239: "TM39",
  240: "TM40",
  241: "TM41",
  242: "TM42",
  243: "TM43",
  244: "TM44",
  245: "TM45",
  246: "TM46",
  247: "TM47",
  248: "TM48",
  249: "TM49",
  250: "TM50",
  251: "TM51",
  252: "TM52",
  253: "TM53",
  254: "TM54",
  255: "TM55",
};
