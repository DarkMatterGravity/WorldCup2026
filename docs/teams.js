// World Cup 2026 Teams Data
// 48 teams organized into 12 groups of 4

const TEAMS = {
    // Pot 1 - Top seeds (hosts + top ranked)
    USA: { name: "USA", flag: "🇺🇸", code: "USA", rank: 11, confederation: "CONCACAF", strength: 82 },
    MEX: { name: "Mexico", flag: "🇲🇽", code: "MEX", rank: 14, confederation: "CONCACAF", strength: 80 },
    CAN: { name: "Canada", flag: "🇨🇦", code: "CAN", rank: 22, confederation: "CONCACAF", strength: 75 },
    ARG: { name: "Argentina", flag: "🇦🇷", code: "ARG", rank: 1, confederation: "CONMEBOL", strength: 95 },
    FRA: { name: "France", flag: "🇫🇷", code: "FRA", rank: 2, confederation: "UEFA", strength: 93 },
    ESP: { name: "Spain", flag: "🇪🇸", code: "ESP", rank: 3, confederation: "UEFA", strength: 92 },
    ENG: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", code: "ENG", rank: 4, confederation: "UEFA", strength: 91 },
    BRA: { name: "Brazil", flag: "🇧🇷", code: "BRA", rank: 5, confederation: "CONMEBOL", strength: 90 },
    POR: { name: "Portugal", flag: "🇵🇹", code: "POR", rank: 6, confederation: "UEFA", strength: 89 },
    NED: { name: "Netherlands", flag: "🇳🇱", code: "NED", rank: 7, confederation: "UEFA", strength: 88 },
    BEL: { name: "Belgium", flag: "🇧🇪", code: "BEL", rank: 8, confederation: "UEFA", strength: 87 },
    GER: { name: "Germany", flag: "🇩🇪", code: "GER", rank: 9, confederation: "UEFA", strength: 87 },

    // Pot 2
    ITA: { name: "Italy", flag: "🇮🇹", code: "ITA", rank: 10, confederation: "UEFA", strength: 86 },
    COL: { name: "Colombia", flag: "🇨🇴", code: "COL", rank: 12, confederation: "CONMEBOL", strength: 84 },
    URU: { name: "Uruguay", flag: "🇺🇾", code: "URU", rank: 13, confederation: "CONMEBOL", strength: 83 },
    CRO: { name: "Croatia", flag: "🇭🇷", code: "CRO", rank: 15, confederation: "UEFA", strength: 83 },
    JPN: { name: "Japan", flag: "🇯🇵", code: "JPN", rank: 16, confederation: "AFC", strength: 82 },
    MAR: { name: "Morocco", flag: "🇲🇦", code: "MAR", rank: 17, confederation: "CAF", strength: 81 },
    SUI: { name: "Switzerland", flag: "🇨🇭", code: "SUI", rank: 18, confederation: "UEFA", strength: 81 },
    DEN: { name: "Denmark", flag: "🇩🇰", code: "DEN", rank: 19, confederation: "UEFA", strength: 80 },
    AUT: { name: "Austria", flag: "🇦🇹", code: "AUT", rank: 20, confederation: "UEFA", strength: 79 },
    SEN: { name: "Senegal", flag: "🇸🇳", code: "SEN", rank: 21, confederation: "CAF", strength: 78 },
    KOR: { name: "South Korea", flag: "🇰🇷", code: "KOR", rank: 23, confederation: "AFC", strength: 77 },
    UKR: { name: "Ukraine", flag: "🇺🇦", code: "UKR", rank: 24, confederation: "UEFA", strength: 77 },

    // Pot 3
    TUR: { name: "Turkey", flag: "🇹🇷", code: "TUR", rank: 25, confederation: "UEFA", strength: 76 },
    POL: { name: "Poland", flag: "🇵🇱", code: "POL", rank: 26, confederation: "UEFA", strength: 76 },
    SRB: { name: "Serbia", flag: "🇷🇸", code: "SRB", rank: 27, confederation: "UEFA", strength: 75 },
    ECU: { name: "Ecuador", flag: "🇪🇨", code: "ECU", rank: 28, confederation: "CONMEBOL", strength: 75 },
    IRN: { name: "Iran", flag: "🇮🇷", code: "IRN", rank: 29, confederation: "AFC", strength: 74 },
    AUS: { name: "Australia", flag: "🇦🇺", code: "AUS", rank: 30, confederation: "AFC", strength: 74 },
    NGA: { name: "Nigeria", flag: "🇳🇬", code: "NGA", rank: 31, confederation: "CAF", strength: 74 },
    CZE: { name: "Czechia", flag: "🇨🇿", code: "CZE", rank: 32, confederation: "UEFA", strength: 73 },
    WAL: { name: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", code: "WAL", rank: 33, confederation: "UEFA", strength: 72 },
    ALG: { name: "Algeria", flag: "🇩🇿", code: "ALG", rank: 34, confederation: "CAF", strength: 72 },
    PAR: { name: "Paraguay", flag: "🇵🇾", code: "PAR", rank: 35, confederation: "CONMEBOL", strength: 71 },
    EGY: { name: "Egypt", flag: "🇪🇬", code: "EGY", rank: 36, confederation: "CAF", strength: 71 },

    // Pot 4
    SCO: { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", code: "SCO", rank: 37, confederation: "UEFA", strength: 70 },
    VEN: { name: "Venezuela", flag: "🇻🇪", code: "VEN", rank: 38, confederation: "CONMEBOL", strength: 70 },
    CMR: { name: "Cameroon", flag: "🇨🇲", code: "CMR", rank: 39, confederation: "CAF", strength: 69 },
    GHA: { name: "Ghana", flag: "🇬🇭", code: "GHA", rank: 40, confederation: "CAF", strength: 68 },
    CIV: { name: "Ivory Coast", flag: "🇨🇮", code: "CIV", rank: 41, confederation: "CAF", strength: 68 },
    JAM: { name: "Jamaica", flag: "🇯🇲", code: "JAM", rank: 42, confederation: "CONCACAF", strength: 67 },
    CRC: { name: "Costa Rica", flag: "🇨🇷", code: "CRC", rank: 43, confederation: "CONCACAF", strength: 67 },
    PAN: { name: "Panama", flag: "🇵🇦", code: "PAN", rank: 44, confederation: "CONCACAF", strength: 66 },
    SAU: { name: "Saudi Arabia", flag: "🇸🇦", code: "SAU", rank: 45, confederation: "AFC", strength: 66 },
    QAT: { name: "Qatar", flag: "🇶🇦", code: "QAT", rank: 46, confederation: "AFC", strength: 65 },
    TUN: { name: "Tunisia", flag: "🇹🇳", code: "TUN", rank: 47, confederation: "CAF", strength: 65 },
    NZL: { name: "New Zealand", flag: "🇳🇿", code: "NZL", rank: 48, confederation: "OFC", strength: 64 }
};

// Official World Cup 2026 Groups (simulated draw)
const GROUPS = {
    A: ["USA", "NED", "SEN", "NZL"],
    B: ["MEX", "GER", "JPN", "QAT"],
    C: ["CAN", "BEL", "UKR", "JAM"],
    D: ["ARG", "DEN", "NGA", "PAN"],
    E: ["FRA", "COL", "AUS", "TUN"],
    F: ["ESP", "CRO", "IRN", "CMR"],
    G: ["ENG", "URU", "POL", "GHA"],
    H: ["BRA", "SUI", "SRB", "CIV"],
    I: ["POR", "MAR", "ECU", "SAU"],
    J: ["ITA", "KOR", "TUR", "CRC"],
    K: ["NED", "AUT", "ALG", "VEN"],
    L: ["GER", "CZE", "EGY", "SCO"]
};

// Wait - there's an issue with my groups, I have some teams appearing twice.
// Let me fix this with proper 12 groups of 4 teams = 48 teams

const GROUPS_FIXED = {
    A: ["USA", "SEN", "AUS", "NZL"],
    B: ["MEX", "JPN", "TUR", "QAT"],
    C: ["CAN", "UKR", "NGA", "JAM"],
    D: ["ARG", "DEN", "ECU", "PAN"],
    E: ["FRA", "COL", "IRN", "TUN"],
    F: ["ESP", "CRO", "POL", "CMR"],
    G: ["ENG", "URU", "ALG", "GHA"],
    H: ["BRA", "SUI", "SRB", "CIV"],
    I: ["POR", "MAR", "PAR", "SAU"],
    J: ["NED", "KOR", "WAL", "CRC"],
    K: ["BEL", "AUT", "EGY", "VEN"],
    L: ["GER", "ITA", "CZE", "SCO"]
};

// Star players for each team (for display purposes)
const STAR_PLAYERS = {
    USA: "Christian Pulisic",
    MEX: "Hirving Lozano",
    CAN: "Alphonso Davies",
    ARG: "Lionel Messi",
    FRA: "Kylian Mbappé",
    ESP: "Lamine Yamal",
    ENG: "Jude Bellingham",
    BRA: "Vinícius Jr.",
    POR: "Cristiano Ronaldo",
    NED: "Virgil van Dijk",
    BEL: "Kevin De Bruyne",
    GER: "Florian Wirtz",
    ITA: "Federico Chiesa",
    COL: "Luis Díaz",
    URU: "Federico Valverde",
    CRO: "Luka Modrić",
    JPN: "Takefusa Kubo",
    MAR: "Achraf Hakimi",
    SUI: "Granit Xhaka",
    DEN: "Christian Eriksen",
    AUT: "David Alaba",
    SEN: "Sadio Mané",
    KOR: "Son Heung-min",
    UKR: "Mykhailo Mudryk",
    TUR: "Arda Güler",
    POL: "Robert Lewandowski",
    SRB: "Dušan Vlahović",
    ECU: "Moisés Caicedo",
    IRN: "Mehdi Taremi",
    AUS: "Mathew Leckie",
    NGA: "Victor Osimhen",
    CZE: "Patrik Schick",
    WAL: "Aaron Ramsey",
    ALG: "Riyad Mahrez",
    PAR: "Miguel Almirón",
    EGY: "Mohamed Salah",
    SCO: "Scott McTominay",
    VEN: "Salomón Rondón",
    CMR: "André-Frank Zambo Anguissa",
    GHA: "Mohammed Kudus",
    CIV: "Sébastien Haller",
    JAM: "Michail Antonio",
    CRC: "Keylor Navas",
    PAN: "Adalberto Carrasquilla",
    SAU: "Salem Al-Dawsari",
    QAT: "Akram Afif",
    TUN: "Wahbi Khazri",
    NZL: "Chris Wood"
};

// Export for use in other files
window.TEAMS = TEAMS;
window.GROUPS = GROUPS_FIXED;
window.STAR_PLAYERS = STAR_PLAYERS;
