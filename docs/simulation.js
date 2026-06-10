// World Cup 2026 Deterministic Prediction Engine
// Uses official FIFA bracket structure with correct match flow
// Source: FIFA match schedule M73-M104

class WorldCupSimulation {
    constructor() {
        this.groupResults = {};
        this.groupStandings = {};
        this.knockoutResults = {};
        this.thirdPlaceTeams = [];
        this.thirdPlaceGroups = [];
        this.r32Teams = [];
        this.r16Teams = [];
        this.qfTeams = [];
        this.sfTeams = [];
        this.finalists = [];
        this.champion = null;
        this.runnerUp = null;
        this.allMatches = [];
        this.totalGoals = 0;
        this.matchIndex = 0;
    }

    getScoreDistributions() {
        return {
            huge: [[4, 0, 15], [3, 0, 25], [4, 1, 15], [3, 1, 20], [5, 0, 5], [2, 0, 15], [5, 1, 5]],
            big: [[3, 0, 20], [2, 0, 25], [3, 1, 20], [2, 1, 15], [4, 1, 10], [1, 0, 10]],
            clear: [[2, 0, 25], [2, 1, 25], [1, 0, 20], [3, 1, 15], [3, 0, 10], [3, 2, 5]],
            slight: [[1, 0, 30], [2, 1, 25], [2, 0, 20], [1, 1, 15], [3, 2, 5], [0, 0, 5]],
            tossup: [[1, 1, 25], [1, 0, 20], [0, 1, 15], [2, 1, 15], [1, 2, 10], [0, 0, 10], [2, 2, 5]]
        };
    }

    selectScore(category, strengthDiff, matchIndex, isHomeStronger) {
        const distributions = this.getScoreDistributions();
        const scores = distributions[category];
        const weighted = [];
        scores.forEach(([h, a, weight]) => {
            for (let i = 0; i < weight; i++) weighted.push([h, a]);
        });
        const selection = weighted[matchIndex % weighted.length];
        let [homeGoals, awayGoals] = selection;
        if (!isHomeStronger && homeGoals !== awayGoals) {
            [homeGoals, awayGoals] = [awayGoals, homeGoals];
        }
        return { homeGoals, awayGoals };
    }

    simulateMatch(homeCode, awayCode, isKnockout = false) {
        const home = TEAMS[homeCode];
        const away = TEAMS[awayCode];
        const strengthDiff = Math.abs(home.strength - away.strength);
        const isHomeStronger = home.strength >= away.strength;

        let category;
        if (strengthDiff >= 20) category = 'huge';
        else if (strengthDiff >= 12) category = 'big';
        else if (strengthDiff >= 7) category = 'clear';
        else if (strengthDiff >= 3) category = 'slight';
        else category = 'tossup';

        let { homeGoals, awayGoals } = this.selectScore(category, strengthDiff, this.matchIndex, isHomeStronger);
        this.matchIndex++;

        let extraTime = false;
        let penalties = false;

        if (isKnockout && homeGoals === awayGoals) {
            extraTime = true;
            if (strengthDiff < 3) {
                penalties = true;
                if (isHomeStronger) homeGoals += 0.5;
                else awayGoals += 0.5;
            } else {
                if (isHomeStronger) homeGoals += 1;
                else awayGoals += 1;
            }
        }

        this.totalGoals += Math.floor(homeGoals) + Math.floor(awayGoals);
        const winner = homeGoals > awayGoals ? homeCode : (awayGoals > homeGoals ? awayCode : null);

        return { home: homeCode, away: awayCode, homeGoals, awayGoals, extraTime, penalties, winner };
    }

    simulateGroup(groupLetter) {
        const teams = GROUPS[groupLetter];
        const matches = [];
        const standings = {};

        teams.forEach(code => {
            standings[code] = {
                code, played: 0, won: 0, drawn: 0, lost: 0,
                goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
                strength: TEAMS[code].strength
            };
        });

        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                const match = this.simulateMatch(teams[i], teams[j], false);
                matches.push(match);

                const homeStats = standings[match.home];
                const awayStats = standings[match.away];

                homeStats.played++; awayStats.played++;
                homeStats.goalsFor += Math.floor(match.homeGoals);
                homeStats.goalsAgainst += Math.floor(match.awayGoals);
                awayStats.goalsFor += Math.floor(match.awayGoals);
                awayStats.goalsAgainst += Math.floor(match.homeGoals);

                if (match.homeGoals > match.awayGoals) {
                    homeStats.won++; homeStats.points += 3; awayStats.lost++;
                } else if (match.awayGoals > match.homeGoals) {
                    awayStats.won++; awayStats.points += 3; homeStats.lost++;
                } else {
                    homeStats.drawn++; awayStats.drawn++;
                    homeStats.points++; awayStats.points++;
                }

                homeStats.goalDiff = homeStats.goalsFor - homeStats.goalsAgainst;
                awayStats.goalDiff = awayStats.goalsFor - awayStats.goalsAgainst;
            }
        }

        const sortedStandings = Object.values(standings).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            return b.strength - a.strength;
        });

        this.groupResults[groupLetter] = matches;
        this.groupStandings[groupLetter] = sortedStandings;
        this.allMatches.push(...matches);
        return { matches, standings: sortedStandings };
    }

    simulateAllGroups() {
        Object.keys(GROUPS).forEach(letter => this.simulateGroup(letter));
        this.determineThirdPlaceQualifiers();
        return this.groupStandings;
    }

    determineThirdPlaceQualifiers() {
        const thirdPlaceTeams = [];
        Object.keys(this.groupStandings).forEach(group => {
            const third = { ...this.groupStandings[group][2] };
            third.group = group;
            thirdPlaceTeams.push(third);
        });

        thirdPlaceTeams.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            return b.strength - a.strength;
        });

        this.thirdPlaceTeams = thirdPlaceTeams.slice(0, 8);
        this.thirdPlaceGroups = this.thirdPlaceTeams.map(t => t.group).sort();
        this.buildR32Bracket();
    }

    // Official FIFA R32 bracket structure
    // Match numbers M73-M88 with correct pairings
    buildR32Bracket() {
        const first = {}, second = {};
        Object.keys(this.groupStandings).forEach(g => {
            first[g] = this.groupStandings[g][0].code;
            second[g] = this.groupStandings[g][1].code;
        });

        // Assign third place teams based on which groups qualified
        const third = {};
        const qualGroups = this.thirdPlaceGroups;
        const thirdAssignments = {
            'A': ['C', 'E', 'F', 'H', 'I'],
            'B': ['E', 'F', 'G', 'I', 'J'],
            'D': ['B', 'E', 'F', 'I', 'J'],
            'E': ['A', 'B', 'C', 'D', 'F'],
            'G': ['A', 'E', 'H', 'I', 'J'],
            'I': ['C', 'D', 'F', 'G', 'H'],
            'K': ['D', 'E', 'I', 'J', 'L'],
            'L': ['E', 'H', 'I', 'J', 'K']
        };

        const usedThirds = new Set();
        for (const [groupWinner, options] of Object.entries(thirdAssignments)) {
            for (const opt of options) {
                if (qualGroups.includes(opt) && !usedThirds.has(opt)) {
                    third[groupWinner] = this.thirdPlaceTeams.find(t => t.group === opt).code;
                    usedThirds.add(opt);
                    break;
                }
            }
        }

        // Fallback for any unassigned thirds
        const getThird = (key) => third[key] || this.thirdPlaceTeams.find(t => !usedThirds.has(t.group))?.code;

        // Official FIFA R32 matchups (M73-M88)
        // Index corresponds to match number - 73
        const r32Pairings = [
            // M73: 1A vs 3rd
            [first['A'], getThird('A')],
            // M74: 1B vs 3rd
            [first['B'], getThird('B')],
            // M75: 1C vs 2F
            [first['C'], second['F']],
            // M76: 1D vs 3rd
            [first['D'], getThird('D')],
            // M77: 1E vs 3rd
            [first['E'], getThird('E')],
            // M78: 2E vs 2I
            [second['E'], second['I']],
            // M79: 1F vs 2C
            [first['F'], second['C']],
            // M80: 1G vs 3rd
            [first['G'], getThird('G')],
            // M81: 1H vs 2J
            [first['H'], second['J']],
            // M82: 1I vs 3rd
            [first['I'], getThird('I')],
            // M83: 1J vs 2H
            [first['J'], second['H']],
            // M84: 1K vs 3rd
            [first['K'], getThird('K')],
            // M85: 2K vs 2L
            [second['K'], second['L']],
            // M86: 1L vs 3rd
            [first['L'], getThird('L')],
            // M87: 2A vs 2B
            [second['A'], second['B']],
            // M88: 2D vs 2G
            [second['D'], second['G']]
        ];

        this.knockoutResults.r32 = r32Pairings.map((pair, index) => ({
            matchNumber: 73 + index,
            home: pair[0],
            away: pair[1],
            result: null
        }));

        return this.knockoutResults.r32;
    }

    simulateR32() {
        // Simulate all R32 matches
        const results = [];
        this.knockoutResults.r32.forEach((matchup, index) => {
            const result = this.simulateMatch(matchup.home, matchup.away, true);
            result.matchNumber = 73 + index;
            result.winner = result.homeGoals > result.awayGoals ? result.home : result.away;
            results.push(result);
            this.allMatches.push(result);
        });
        this.knockoutResults.r32 = results;

        // Official FIFA R16 bracket flow (which R32 matches feed into which R16)
        // R16 match numbers are M89-M96
        // Pattern: M73+M75→M90, M74+M77→M89, M76+M78→M91, M79+M80→M92,
        //          M81+M82→M94, M83+M84→M93, M85+M87→M96, M86+M88→M95

        const r32Winners = results.map(r => r.winner);

        // R32 index mapping (index = matchNum - 73)
        // M73=0, M74=1, M75=2, M76=3, M77=4, M78=5, M79=6, M80=7
        // M81=8, M82=9, M83=10, M84=11, M85=12, M86=13, M87=14, M88=15

        // R16 matchups based on FIFA bracket
        const r16Pairings = [
            // M89: Winner M74 vs Winner M77 (indices 1 vs 4)
            { matchNum: 89, home: r32Winners[1], away: r32Winners[4] },
            // M90: Winner M73 vs Winner M75 (indices 0 vs 2)
            { matchNum: 90, home: r32Winners[0], away: r32Winners[2] },
            // M91: Winner M76 vs Winner M78 (indices 3 vs 5)
            { matchNum: 91, home: r32Winners[3], away: r32Winners[5] },
            // M92: Winner M79 vs Winner M80 (indices 6 vs 7)
            { matchNum: 92, home: r32Winners[6], away: r32Winners[7] },
            // M93: Winner M83 vs Winner M84 (indices 10 vs 11)
            { matchNum: 93, home: r32Winners[10], away: r32Winners[11] },
            // M94: Winner M81 vs Winner M82 (indices 8 vs 9)
            { matchNum: 94, home: r32Winners[8], away: r32Winners[9] },
            // M95: Winner M86 vs Winner M88 (indices 13 vs 15)
            { matchNum: 95, home: r32Winners[13], away: r32Winners[15] },
            // M96: Winner M85 vs Winner M87 (indices 12 vs 14)
            { matchNum: 96, home: r32Winners[12], away: r32Winners[14] }
        ];

        this.knockoutResults.r16 = r16Pairings.map(p => ({
            matchNumber: p.matchNum,
            home: p.home,
            away: p.away,
            result: null
        }));

        return results;
    }

    simulateR16() {
        const results = [];
        this.knockoutResults.r16.forEach((matchup) => {
            const result = this.simulateMatch(matchup.home, matchup.away, true);
            result.matchNumber = matchup.matchNumber;
            result.winner = result.homeGoals > result.awayGoals ? result.home : result.away;
            results.push(result);
            this.allMatches.push(result);
        });
        this.knockoutResults.r16 = results;

        // R16 results indexed by match number
        const r16Winners = {};
        results.forEach(r => { r16Winners[r.matchNumber] = r.winner; });

        // Official FIFA QF bracket flow
        // M97: Winner M89 vs Winner M90
        // M98: Winner M93 vs Winner M94
        // M99: Winner M91 vs Winner M92
        // M100: Winner M95 vs Winner M96
        const qfPairings = [
            { matchNum: 97, home: r16Winners[89], away: r16Winners[90] },
            { matchNum: 98, home: r16Winners[93], away: r16Winners[94] },
            { matchNum: 99, home: r16Winners[91], away: r16Winners[92] },
            { matchNum: 100, home: r16Winners[95], away: r16Winners[96] }
        ];

        this.knockoutResults.qf = qfPairings.map(p => ({
            matchNumber: p.matchNum,
            home: p.home,
            away: p.away,
            result: null
        }));

        this.qfTeams = Object.values(r16Winners);
        return results;
    }

    simulateQF() {
        const results = [];
        this.knockoutResults.qf.forEach((matchup) => {
            const result = this.simulateMatch(matchup.home, matchup.away, true);
            result.matchNumber = matchup.matchNumber;
            result.winner = result.homeGoals > result.awayGoals ? result.home : result.away;
            results.push(result);
            this.allMatches.push(result);
        });
        this.knockoutResults.qf = results;

        const qfWinners = {};
        results.forEach(r => { qfWinners[r.matchNumber] = r.winner; });

        // Official FIFA SF bracket flow
        // M101: Winner M97 vs Winner M98
        // M102: Winner M99 vs Winner M100
        const sfPairings = [
            { matchNum: 101, home: qfWinners[97], away: qfWinners[98] },
            { matchNum: 102, home: qfWinners[99], away: qfWinners[100] }
        ];

        this.knockoutResults.sf = sfPairings.map(p => ({
            matchNumber: p.matchNum,
            home: p.home,
            away: p.away,
            result: null
        }));

        this.sfTeams = Object.values(qfWinners);
        return results;
    }

    simulateSF() {
        const results = [];
        this.knockoutResults.sf.forEach((matchup) => {
            const result = this.simulateMatch(matchup.home, matchup.away, true);
            result.matchNumber = matchup.matchNumber;
            result.winner = result.homeGoals > result.awayGoals ? result.home : result.away;
            results.push(result);
            this.allMatches.push(result);
        });
        this.knockoutResults.sf = results;

        const sfWinners = {};
        results.forEach(r => { sfWinners[r.matchNumber] = r.winner; });

        this.finalists = [sfWinners[101], sfWinners[102]];

        // M104: Final (M103 is 3rd place match, we skip it)
        this.knockoutResults.final = [{
            matchNumber: 104,
            home: sfWinners[101],
            away: sfWinners[102],
            result: null
        }];

        return results;
    }

    simulateFinal() {
        const matchup = this.knockoutResults.final[0];
        const result = this.simulateMatch(matchup.home, matchup.away, true);
        result.matchNumber = 104;
        result.winner = result.homeGoals > result.awayGoals ? result.home : result.away;
        this.knockoutResults.final = [result];
        this.allMatches.push(result);

        this.champion = result.winner;
        this.runnerUp = this.finalists.find(t => t !== this.champion);
        return result;
    }

    getStats() {
        const matchCount = this.allMatches.length;
        const avgGoals = matchCount > 0 ? (this.totalGoals / matchCount).toFixed(2) : 0;
        let biggestWin = null, biggestMargin = 0;
        this.allMatches.forEach(match => {
            const margin = Math.abs(Math.floor(match.homeGoals) - Math.floor(match.awayGoals));
            if (margin > biggestMargin) { biggestMargin = margin; biggestWin = match; }
        });
        return { totalMatches: matchCount, totalGoals: this.totalGoals, avgGoals, biggestWin, champion: this.champion, runnerUp: this.runnerUp };
    }

    formatScore(match) {
        const homeGoals = Math.floor(match.homeGoals);
        const awayGoals = Math.floor(match.awayGoals);
        let suffix = match.penalties ? ' (P)' : (match.extraTime ? ' (AET)' : '');
        return `${homeGoals} - ${awayGoals}${suffix}`;
    }
}

window.WorldCupSimulation = WorldCupSimulation;
