// World Cup 2026 Deterministic Prediction Engine
// Based on team strength ratings derived from betting odds, FIFA rankings, and expert analysis
// Uses official FIFA bracket structure for knockout rounds

class WorldCupSimulation {
    constructor() {
        this.groupResults = {};
        this.groupStandings = {};
        this.knockoutResults = {};
        this.thirdPlaceTeams = [];
        this.thirdPlaceGroups = []; // Which groups the qualifying 3rd place teams came from
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

    // Realistic scoreline distributions based on World Cup history
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

        return {
            home: homeCode, away: awayCode,
            homeGoals, awayGoals,
            extraTime, penalties, winner
        };
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

    // Get third place team from specific group, or first available from list of options
    getThirdFrom(preferredGroups) {
        for (const group of preferredGroups) {
            const team = this.thirdPlaceTeams.find(t => t.group === group);
            if (team) return team.code;
        }
        // Fallback to any available third place team
        return this.thirdPlaceTeams[0]?.code;
    }

    // Official FIFA Round of 32 bracket structure
    buildR32Bracket() {
        const first = {}, second = {};
        Object.keys(this.groupStandings).forEach(g => {
            first[g] = this.groupStandings[g][0].code;
            second[g] = this.groupStandings[g][1].code;
        });

        // Third place team assignment based on which groups qualified
        // This is simplified - FIFA has 495 scenarios, we pick from preferred groups
        const third = {};
        const qualGroups = this.thirdPlaceGroups;

        // Assign third place teams based on FIFA's general structure
        // Each group winner faces a third place team from specific possible groups
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

        // Assign thirds avoiding duplicates
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

        // Official FIFA R32 bracket matchups
        const r32Pairings = [
            // Match 1-4 (Left bracket, top)
            [first['A'], third['A'] || this.thirdPlaceTeams[0]?.code],  // 1A vs 3rd
            [second['A'], second['B']],                                   // 2A vs 2B
            [first['B'], third['B'] || this.thirdPlaceTeams[1]?.code],  // 1B vs 3rd
            [first['C'], second['F']],                                    // 1C vs 2F

            // Match 5-8 (Left bracket, bottom)
            [first['D'], third['D'] || this.thirdPlaceTeams[2]?.code],  // 1D vs 3rd
            [second['D'], second['G']],                                   // 2D vs 2G
            [first['E'], third['E'] || this.thirdPlaceTeams[3]?.code],  // 1E vs 3rd
            [first['F'], second['C']],                                    // 1F vs 2C

            // Match 9-12 (Right bracket, top)
            [first['G'], third['G'] || this.thirdPlaceTeams[4]?.code],  // 1G vs 3rd
            [second['E'], second['I']],                                   // 2E vs 2I
            [first['H'], second['J']],                                    // 1H vs 2J
            [first['I'], third['I'] || this.thirdPlaceTeams[5]?.code],  // 1I vs 3rd

            // Match 13-16 (Right bracket, bottom)
            [first['J'], second['H']],                                    // 1J vs 2H
            [second['K'], second['L']],                                   // 2K vs 2L
            [first['K'], third['K'] || this.thirdPlaceTeams[6]?.code],  // 1K vs 3rd
            [first['L'], third['L'] || this.thirdPlaceTeams[7]?.code]   // 1L vs 3rd
        ];

        this.knockoutResults.r32 = r32Pairings.map((pair, index) => ({
            matchNumber: index + 1,
            home: pair[0],
            away: pair[1],
            result: null
        }));

        return this.knockoutResults.r32;
    }

    simulateKnockoutRound(roundName, matchups) {
        const results = [];
        const winners = [];

        matchups.forEach((matchup, index) => {
            const result = this.simulateMatch(matchup.home, matchup.away, true);
            result.matchNumber = index + 1;
            result.winner = result.homeGoals > result.awayGoals ? result.home : result.away;
            results.push(result);
            winners.push(result.winner);
            this.allMatches.push(result);
        });

        this.knockoutResults[roundName] = results;
        return { results, winners };
    }

    simulateR32() {
        const { results, winners } = this.simulateKnockoutRound('r32', this.knockoutResults.r32);
        this.r16Teams = winners;

        // R16 matchups: adjacent R32 winners
        this.knockoutResults.r16 = [];
        for (let i = 0; i < winners.length; i += 2) {
            this.knockoutResults.r16.push({
                matchNumber: Math.floor(i / 2) + 1,
                home: winners[i], away: winners[i + 1], result: null
            });
        }
        return results;
    }

    simulateR16() {
        const { results, winners } = this.simulateKnockoutRound('r16', this.knockoutResults.r16);
        this.qfTeams = winners;

        this.knockoutResults.qf = [];
        for (let i = 0; i < winners.length; i += 2) {
            this.knockoutResults.qf.push({
                matchNumber: Math.floor(i / 2) + 1,
                home: winners[i], away: winners[i + 1], result: null
            });
        }
        return results;
    }

    simulateQF() {
        const { results, winners } = this.simulateKnockoutRound('qf', this.knockoutResults.qf);
        this.sfTeams = winners;

        this.knockoutResults.sf = [];
        for (let i = 0; i < winners.length; i += 2) {
            this.knockoutResults.sf.push({
                matchNumber: Math.floor(i / 2) + 1,
                home: winners[i], away: winners[i + 1], result: null
            });
        }
        return results;
    }

    simulateSF() {
        const { results, winners } = this.simulateKnockoutRound('sf', this.knockoutResults.sf);
        this.finalists = winners;
        this.knockoutResults.final = [{
            matchNumber: 1, home: winners[0], away: winners[1], result: null
        }];
        return results;
    }

    simulateFinal() {
        const { results, winners } = this.simulateKnockoutRound('final', this.knockoutResults.final);
        this.champion = winners[0];
        this.runnerUp = this.finalists.find(t => t !== this.champion);
        return results[0];
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
