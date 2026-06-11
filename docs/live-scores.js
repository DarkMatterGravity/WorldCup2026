// Live Scores Service - Fetches actual World Cup results from ESPN API
// Compares actual results vs predictions

class LiveScoresService {
    constructor() {
        this.espnEndpoint = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';
        this.actualResults = new Map(); // key: "TEAM1-TEAM2", value: { home, away, homeScore, awayScore, status }
        this.lastFetch = null;
        this.cacheMinutes = 5;

        // Map ESPN abbreviations to our team codes (most are the same)
        this.espnToOurCodes = {
            'MEX': 'MEX', 'RSA': 'ZAF', 'KOR': 'KOR', 'CZE': 'CZE',
            'CAN': 'CAN', 'SUI': 'SUI', 'QAT': 'QAT', 'BIH': 'BIH',
            'BRA': 'BRA', 'MAR': 'MAR', 'HAI': 'HTI', 'SCO': 'SCO',
            'USA': 'USA', 'PAR': 'PAR', 'AUS': 'AUS', 'TUR': 'TUR',
            'GER': 'GER', 'CUR': 'CUR', 'CIV': 'CIV', 'ECU': 'ECU',
            'NED': 'NED', 'JPN': 'JPN', 'TUN': 'TUN', 'SWE': 'SWE',
            'BEL': 'BEL', 'EGY': 'EGY', 'IRN': 'IRN', 'NZL': 'NZL',
            'ESP': 'ESP', 'CPV': 'CPV', 'KSA': 'SAU', 'URU': 'URU',
            'FRA': 'FRA', 'SEN': 'SEN', 'NOR': 'NOR', 'IRQ': 'IRQ',
            'ARG': 'ARG', 'ALG': 'ALG', 'AUT': 'AUT', 'JOR': 'JOR',
            'POR': 'POR', 'UZB': 'UZB', 'COL': 'COL', 'COD': 'COD',
            'ENG': 'ENG', 'CRO': 'CRO', 'GHA': 'GHA', 'PAN': 'PAN',
            'SAU': 'SAU', 'ZAF': 'ZAF', 'HTI': 'HTI'
        };
    }

    async fetchScores() {
        // Check cache
        if (this.lastFetch && (Date.now() - this.lastFetch) < this.cacheMinutes * 60 * 1000) {
            return this.actualResults;
        }

        try {
            const response = await fetch(this.espnEndpoint);
            if (!response.ok) throw new Error('ESPN API error');

            const data = await response.json();
            this.parseESPNData(data);
            this.lastFetch = Date.now();
        } catch (error) {
            console.warn('Could not fetch live scores:', error);
        }

        return this.actualResults;
    }

    parseESPNData(data) {
        if (!data.events) return;

        data.events.forEach(event => {
            const competitors = event.competitions?.[0]?.competitors;
            if (!competitors || competitors.length !== 2) return;

            const status = event.status?.type?.name; // 'STATUS_FINAL', 'STATUS_SCHEDULED', 'STATUS_IN_PROGRESS'
            if (status !== 'STATUS_FINAL') return; // Only completed matches

            const homeTeam = competitors.find(c => c.homeAway === 'home');
            const awayTeam = competitors.find(c => c.homeAway === 'away');

            if (!homeTeam || !awayTeam) return;

            const homeCode = this.espnToOurCodes[homeTeam.team.abbreviation] || homeTeam.team.abbreviation;
            const awayCode = this.espnToOurCodes[awayTeam.team.abbreviation] || awayTeam.team.abbreviation;

            // Store with both orderings for easy lookup
            const key1 = `${homeCode}-${awayCode}`;
            const key2 = `${awayCode}-${homeCode}`;

            const result = {
                home: homeCode,
                away: awayCode,
                homeScore: parseInt(homeTeam.score) || 0,
                awayScore: parseInt(awayTeam.score) || 0,
                status: 'completed',
                date: event.date
            };

            this.actualResults.set(key1, result);
            this.actualResults.set(key2, {
                home: awayCode,
                away: homeCode,
                homeScore: result.awayScore,
                awayScore: result.homeScore,
                status: 'completed',
                date: event.date
            });
        });
    }

    // Get actual result for a match (if completed)
    getActualResult(team1Code, team2Code) {
        const key = `${team1Code}-${team2Code}`;
        return this.actualResults.get(key) || null;
    }

    // Check if a match has been played
    isMatchCompleted(team1Code, team2Code) {
        return this.actualResults.has(`${team1Code}-${team2Code}`);
    }

    // Compare prediction vs actual
    compareResult(team1Code, team2Code, predictedHome, predictedAway) {
        const actual = this.getActualResult(team1Code, team2Code);
        if (!actual) return null;

        const predictedWinner = predictedHome > predictedAway ? team1Code :
                               predictedAway > predictedHome ? team2Code : 'draw';
        const actualWinner = actual.homeScore > actual.awayScore ? actual.home :
                            actual.awayScore > actual.homeScore ? actual.away : 'draw';

        return {
            predicted: { home: predictedHome, away: predictedAway },
            actual: { home: actual.homeScore, away: actual.awayScore },
            predictedWinner,
            actualWinner,
            correctWinner: predictedWinner === actualWinner,
            exactScore: predictedHome === actual.homeScore && predictedAway === actual.awayScore
        };
    }
}

// Global instance
window.liveScores = new LiveScoresService();
