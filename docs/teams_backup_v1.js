// World Cup 2026 Teams - Accurate Data
// Based on: FIFA Rankings, ELO ratings, ESPN Power Rankings, betting odds, expert analysis
// Data compiled June 10, 2026

// Strength ratings (0-100) derived from:
// - Betting odds (converted to implied win probability)
// - ESPN squad rankings
// - Current FIFA rankings
// - Recent form and expert consensus

const TEAMS = {
    // TIER 1: Title Favorites (odds +450 to +900)
    ESP: { name: "Spain", flag: "🇪🇸", code: "ESP", fifaRank: 2, strength: 94, odds: "+450", tier: 1 },
    FRA: { name: "France", flag: "🇫🇷", code: "FRA", fifaRank: 3, strength: 93, odds: "+500", tier: 1 },
    ENG: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", code: "ENG", fifaRank: 4, strength: 91, odds: "+700", tier: 1 },
    BRA: { name: "Brazil", flag: "🇧🇷", code: "BRA", fifaRank: 6, strength: 90, odds: "+800", tier: 1 },
    POR: { name: "Portugal", flag: "🇵🇹", code: "POR", fifaRank: 5, strength: 89, odds: "+900", tier: 1 },
    ARG: { name: "Argentina", flag: "🇦🇷", code: "ARG", fifaRank: 1, strength: 88, odds: "+900", tier: 1 },

    // TIER 2: Contenders (odds +1400 to +4000)
    GER: { name: "Germany", flag: "🇩🇪", code: "GER", fifaRank: 8, strength: 85, odds: "+1400", tier: 2 },
    NED: { name: "Netherlands", flag: "🇳🇱", code: "NED", fifaRank: 7, strength: 84, odds: "+2000", tier: 2 },
    BEL: { name: "Belgium", flag: "🇧🇪", code: "BEL", fifaRank: 9, strength: 82, odds: "+4000", tier: 2 },
    NOR: { name: "Norway", flag: "🇳🇴", code: "NOR", fifaRank: 18, strength: 81, odds: "+3500", tier: 2 },
    COL: { name: "Colombia", flag: "🇨🇴", code: "COL", fifaRank: 12, strength: 80, odds: "+4000", tier: 2 },
    URU: { name: "Uruguay", flag: "🇺🇾", code: "URU", fifaRank: 13, strength: 79, odds: "+6500", tier: 2 },
    CRO: { name: "Croatia", flag: "🇭🇷", code: "CRO", fifaRank: 15, strength: 79, odds: "+5000", tier: 2 },

    // TIER 3: Dark Horses (odds +5000 to +15000)
    JPN: { name: "Japan", flag: "🇯🇵", code: "JPN", fifaRank: 16, strength: 77, odds: "+6000", tier: 3 },
    MAR: { name: "Morocco", flag: "🇲🇦", code: "MAR", fifaRank: 17, strength: 77, odds: "+5000", tier: 3 },
    USA: { name: "USA", flag: "🇺🇸", code: "USA", fifaRank: 11, strength: 76, odds: "+5000", tier: 3 },
    MEX: { name: "Mexico", flag: "🇲🇽", code: "MEX", fifaRank: 14, strength: 75, odds: "+8000", tier: 3 },
    SUI: { name: "Switzerland", flag: "🇨🇭", code: "SUI", fifaRank: 19, strength: 75, odds: "+10000", tier: 3 },
    SEN: { name: "Senegal", flag: "🇸🇳", code: "SEN", fifaRank: 21, strength: 74, odds: "+15000", tier: 3 },
    ECU: { name: "Ecuador", flag: "🇪🇨", code: "ECU", fifaRank: 28, strength: 74, odds: "+10000", tier: 3 },
    CAN: { name: "Canada", flag: "🇨🇦", code: "CAN", fifaRank: 22, strength: 73, odds: "+15000", tier: 3 },

    // TIER 4: Competitive Teams
    SWE: { name: "Sweden", flag: "🇸🇪", code: "SWE", fifaRank: 23, strength: 72, odds: "+20000", tier: 4 },
    TUR: { name: "Türkiye", flag: "🇹🇷", code: "TUR", fifaRank: 25, strength: 72, odds: "+15000", tier: 4 },
    AUT: { name: "Austria", flag: "🇦🇹", code: "AUT", fifaRank: 20, strength: 71, odds: "+25000", tier: 4 },
    CIV: { name: "Ivory Coast", flag: "🇨🇮", code: "CIV", fifaRank: 41, strength: 70, odds: "+30000", tier: 4 },
    ALG: { name: "Algeria", flag: "🇩🇿", code: "ALG", fifaRank: 34, strength: 69, odds: "+30000", tier: 4 },
    PAR: { name: "Paraguay", flag: "🇵🇾", code: "PAR", fifaRank: 35, strength: 68, odds: "+40000", tier: 4 },
    EGY: { name: "Egypt", flag: "🇪🇬", code: "EGY", fifaRank: 36, strength: 68, odds: "+40000", tier: 4 },
    AUS: { name: "Australia", flag: "🇦🇺", code: "AUS", fifaRank: 30, strength: 67, odds: "+30000", tier: 4 },

    // TIER 5: Underdogs
    KOR: { name: "South Korea", flag: "🇰🇷", code: "KOR", fifaRank: 23, strength: 66, odds: "+25000", tier: 5 },
    SCO: { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", code: "SCO", fifaRank: 37, strength: 65, odds: "+50000", tier: 5 },
    CZE: { name: "Czechia", flag: "🇨🇿", code: "CZE", fifaRank: 32, strength: 65, odds: "+50000", tier: 5 },
    IRN: { name: "Iran", flag: "🇮🇷", code: "IRN", fifaRank: 29, strength: 64, odds: "+50000", tier: 5 },
    GHA: { name: "Ghana", flag: "🇬🇭", code: "GHA", fifaRank: 40, strength: 64, odds: "+50000", tier: 5 },
    TUN: { name: "Tunisia", flag: "🇹🇳", code: "TUN", fifaRank: 47, strength: 63, odds: "+75000", tier: 5 },
    UZB: { name: "Uzbekistan", flag: "🇺🇿", code: "UZB", fifaRank: 55, strength: 62, odds: "+100000", tier: 5 },
    BIH: { name: "Bosnia", flag: "🇧🇦", code: "BIH", fifaRank: 52, strength: 62, odds: "+100000", tier: 5 },

    // TIER 6: Long Shots
    PAN: { name: "Panama", flag: "🇵🇦", code: "PAN", fifaRank: 44, strength: 58, odds: "+150000", tier: 6 },
    IRQ: { name: "Iraq", flag: "🇮🇶", code: "IRQ", fifaRank: 53, strength: 57, odds: "+200000", tier: 6 },
    JOR: { name: "Jordan", flag: "🇯🇴", code: "JOR", fifaRank: 68, strength: 56, odds: "+200000", tier: 6 },
    COD: { name: "DR Congo", flag: "🇨🇩", code: "COD", fifaRank: 60, strength: 56, odds: "+200000", tier: 6 },
    NZL: { name: "New Zealand", flag: "🇳🇿", code: "NZL", fifaRank: 93, strength: 52, odds: "+250000", tier: 6 },
    SAU: { name: "Saudi Arabia", flag: "🇸🇦", code: "SAU", fifaRank: 45, strength: 55, odds: "+100000", tier: 6 },
    ZAF: { name: "South Africa", flag: "🇿🇦", code: "ZAF", fifaRank: 58, strength: 54, odds: "+200000", tier: 6 },
    HTI: { name: "Haiti", flag: "🇭🇹", code: "HTI", fifaRank: 85, strength: 50, odds: "+300000", tier: 6 },
    CPV: { name: "Cape Verde", flag: "🇨🇻", code: "CPV", fifaRank: 72, strength: 49, odds: "+300000", tier: 6 },
    QAT: { name: "Qatar", flag: "🇶🇦", code: "QAT", fifaRank: 95, strength: 48, odds: "+500000", tier: 6 },
    CUR: { name: "Curaçao", flag: "🇨🇼", code: "CUR", fifaRank: 108, strength: 45, odds: "+500000", tier: 6 }
};

// Official World Cup 2026 Groups (confirmed draw)
const GROUPS = {
    A: ["MEX", "ZAF", "KOR", "CZE"],
    B: ["CAN", "SUI", "QAT", "BIH"],
    C: ["BRA", "MAR", "HTI", "SCO"],
    D: ["USA", "PAR", "AUS", "TUR"],
    E: ["GER", "CUR", "CIV", "ECU"],
    F: ["NED", "JPN", "TUN", "SWE"],
    G: ["BEL", "EGY", "IRN", "NZL"],
    H: ["ESP", "CPV", "SAU", "URU"],
    I: ["FRA", "SEN", "NOR", "IRQ"],
    J: ["ARG", "ALG", "AUT", "JOR"],
    K: ["POR", "UZB", "COL", "COD"],
    L: ["ENG", "CRO", "GHA", "PAN"]
};

// Group descriptions for display
const GROUP_INFO = {
    A: { name: "Group A", venue: "Mexico City & Dallas" },
    B: { name: "Group B", venue: "Toronto & Vancouver" },
    C: { name: "Group C", venue: "Los Angeles & Houston" },
    D: { name: "Group D", venue: "Atlanta & Miami" },
    E: { name: "Group E", venue: "New York & Philadelphia" },
    F: { name: "Group F", venue: "Seattle & San Francisco" },
    G: { name: "Group G", venue: "Kansas City & Dallas" },
    H: { name: "Group H", venue: "Miami & Houston" },
    I: { name: "Group I", venue: "Boston & New York" },
    J: { name: "Group J", venue: "Los Angeles & Phoenix" },
    K: { name: "Group K", venue: "Atlanta & Philadelphia" },
    L: { name: "Group L", venue: "Guadalajara & Monterrey" }
};

// Prediction model weights based on expert consensus
const PREDICTION_WEIGHTS = {
    espnPowerRank: 0.25,      // ESPN expert power rankings
    bettingOdds: 0.30,        // Implied probability from odds
    fifaRank: 0.15,           // Official FIFA ranking
    recentForm: 0.20,         // Recent match results
    squadStrength: 0.10       // Transfermarkt squad value
};

// Export for use in other files
window.TEAMS = TEAMS;
window.GROUPS = GROUPS;
window.GROUP_INFO = GROUP_INFO;
