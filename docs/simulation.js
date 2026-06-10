// World Cup 2026 Deterministic Prediction Engine
// Based on team strength ratings derived from betting odds, FIFA rankings, and expert analysis
// Produces realistic, varied scorelines based on historical World Cup data

class WorldCupSimulation {
    constructor() {
        this.groupResults = {};
        this.groupStandings = {};
        this.knockoutResults = {};
        this.thirdPlaceTeams = [];
        this.r32Teams = [];
        this.r16Teams = [];
        this.qfTeams = [];
        this.sfTeams = [];
        this.finalists = [];
        this.champion = null;
        this.runnerUp = null;
        this.allMatches = [];
        this.totalGoals = 0;
        this.matchIndex = 0; // Used for deterministic variety
    }

    // Realistic scoreline distributions based on World Cup history
    // Format: [homeGoals, awayGoals, weight]
    getScoreDistributions() {
        return {
            // Huge mismatch (20+ strength diff) - dominant wins
            huge: [
                [4, 0, 15], [3, 0, 25], [4, 1, 15], [3, 1, 20], [5, 0, 5],
                [2, 0, 15], [5, 1, 5]
            ],
            // Big favorite (12-20 strength diff)
            big: [
                [3, 0, 20], [2, 0, 25], [3, 1, 20], [2, 1, 15], [4, 1, 10],
                [1, 0, 10]
            ],
            // Clear favorite (7-12 strength diff)
            clear: [
                [2, 0, 25], [2, 1, 25], [1, 0, 20], [3, 1, 15], [3, 0, 10],
                [3, 2, 5]
            ],
            // Slight favorite (3-7 strength diff)
            slight: [
                [1, 0, 30], [2, 1, 25], [2, 0, 20], [1, 1, 15], [3, 2, 5],
                [0, 0, 5]
            ],
            // Toss-up (0-3 strength diff)
            tossup: [
                [1, 1, 25], [1, 0, 20], [0, 1, 15], [2, 1, 15], [1, 2, 10],
                [0, 0, 10], [2, 2, 5]
            ]
        };
    }

    // Select a scoreline deterministically based on match index
    selectScore(category, strengthDiff, matchIndex, isHomeStronger) {
        const distributions = this.getScoreDistributions();
        const scores = distributions[category];

        // Create weighted selection array
        const weighted = [];
        scores.forEach(([h, a, weight]) => {
            for (let i = 0; i < weight; i++) {
                weighted.push([h, a]);
            }
        });

        // Use match index to deterministically select a score
        const selection = weighted[matchIndex % weighted.length];
        let [homeGoals, awayGoals] = selection;

        // If away team is stronger, flip the score
        if (!isHomeStronger && homeGoals !== awayGoals) {
            [homeGoals, awayGoals] = [awayGoals, homeGoals];
        }

        return { homeGoals, awayGoals };
    }

    // Deterministic match prediction with realistic scorelines
    simulateMatch(homeCode, awayCode, isKnockout = false) {
        const home = TEAMS[homeCode];
        const away = TEAMS[awayCode];
        const strengthDiff = Math.abs(home.strength - away.strength);
        const isHomeStronger = home.strength >= away.strength;

        // Determine category based on strength difference
        let category;
        if (strengthDiff >= 20) category = 'huge';
        else if (strengthDiff >= 12) category = 'big';
        else if (strengthDiff >= 7) category = 'clear';
        else if (strengthDiff >= 3) category = 'slight';
        else category = 'tossup';

        // Get deterministic score based on match index
        let { homeGoals, awayGoals } = this.selectScore(
            category,
            strengthDiff,
            this.matchIndex,
            isHomeStronger
        );

        this.matchIndex++;

        // Handle knockout draws
        let extraTime = false;
        let penalties = false;

        if (isKnockout && homeGoals === awayGoals) {
            extraTime = true;
            // Stronger team wins - determine method based on how close
            if (strengthDiff < 3) {
                // Very close - penalties
                penalties = true;
                if (isHomeStronger) {
                    homeGoals += 0.5;
                } else {
                    awayGoals += 0.5;
                }
            } else if (strengthDiff < 6) {
                // Close - extra time goal
                if (isHomeStronger) {
                    homeGoals += 1;
                } else {
                    awayGoals += 1;
                }
            } else {
                // Moderate difference - extra time goal
                if (isHomeStronger) {
                    homeGoals += 1;
                } else {
                    awayGoals += 1;
                }
            }
        }

        this.totalGoals += Math.floor(homeGoals) + Math.floor(awayGoals);

        const winner = homeGoals > awayGoals ? homeCode :
                      (awayGoals > homeGoals ? awayCode : null);

        return {
            home: homeCode,
            away: awayCode,
            homeGoals: homeGoals,
            awayGoals: awayGoals,
            extraTime: extraTime,
            penalties: penalties,
            winner: winner
        };
    }

    // Simulate all matches in a group
    simulateGroup(groupLetter) {
        const teams = GROUPS[groupLetter];
        const matches = [];
        const standings = {};

        // Initialize standings
        teams.forEach(code => {
            standings[code] = {
                code: code,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                goalDiff: 0,
                points: 0,
                strength: TEAMS[code].strength
            };
        });

        // Generate all 6 matches (each team plays others once)
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                const match = this.simulateMatch(teams[i], teams[j], false);
                matches.push(match);

                // Update standings
                const homeStats = standings[match.home];
                const awayStats = standings[match.away];

                homeStats.played++;
                awayStats.played++;
                homeStats.goalsFor += Math.floor(match.homeGoals);
                homeStats.goalsAgainst += Math.floor(match.awayGoals);
                awayStats.goalsFor += Math.floor(match.awayGoals);
                awayStats.goalsAgainst += Math.floor(match.homeGoals);

                if (match.homeGoals > match.awayGoals) {
                    homeStats.won++;
                    homeStats.points += 3;
                    awayStats.lost++;
                } else if (match.awayGoals > match.homeGoals) {
                    awayStats.won++;
                    awayStats.points += 3;
                    homeStats.lost++;
                } else {
                    homeStats.drawn++;
                    awayStats.drawn++;
                    homeStats.points++;
                    awayStats.points++;
                }

                homeStats.goalDiff = homeStats.goalsFor - homeStats.goalsAgainst;
                awayStats.goalDiff = awayStats.goalsFor - awayStats.goalsAgainst;
            }
        }

        // Sort standings by points, then GD, then GF, then strength
        const sortedStandings = Object.values(standings).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            return b.strength - a.strength;
        });

        this.groupResults[groupLetter] = matches;
        this.groupStandings[groupLetter] = sortedStandings;
        this.allMatches.push(...matches);

        return {
            matches: matches,
            standings: sortedStandings
        };
    }

    // Simulate all groups
    simulateAllGroups() {
        const groupLetters = Object.keys(GROUPS);
        groupLetters.forEach(letter => {
            this.simulateGroup(letter);
        });

        this.determineThirdPlaceQualifiers();
        return this.groupStandings;
    }

    // Determine which 8 third-place teams qualify
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
        this.buildR32Bracket();
    }

    // Build the Round of 32 bracket following FIFA format
    buildR32Bracket() {
        const groupOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

        const firstPlace = {};
        const secondPlace = {};

        groupOrder.forEach(g => {
            firstPlace[g] = this.groupStandings[g][0].code;
            secondPlace[g] = this.groupStandings[g][1].code;
        });

        const thirdPlace = this.thirdPlaceTeams.map(t => t.code);

        // R32 Matchups - structured for proper bracket flow
        const r32Pairings = [
            // Bracket 1 (feeds to QF1)
            [firstPlace['A'], thirdPlace[7]],
            [secondPlace['C'], secondPlace['D']],
            // Bracket 2 (feeds to QF1)
            [firstPlace['B'], thirdPlace[6]],
            [secondPlace['A'], secondPlace['B']],

            // Bracket 3 (feeds to QF2)
            [firstPlace['C'], thirdPlace[5]],
            [secondPlace['E'], secondPlace['F']],
            // Bracket 4 (feeds to QF2)
            [firstPlace['D'], thirdPlace[4]],
            [secondPlace['G'], secondPlace['H']],

            // Bracket 5 (feeds to QF3)
            [firstPlace['E'], thirdPlace[3]],
            [secondPlace['I'], secondPlace['J']],
            // Bracket 6 (feeds to QF3)
            [firstPlace['F'], thirdPlace[2]],
            [secondPlace['K'], secondPlace['L']],

            // Bracket 7 (feeds to QF4)
            [firstPlace['G'], thirdPlace[1]],
            [firstPlace['H'], secondPlace['I']],
            // Bracket 8 (feeds to QF4)
            [firstPlace['I'], thirdPlace[0]],
            [firstPlace['J'], firstPlace['K']]
        ];

        this.knockoutResults.r32 = r32Pairings.map((pair, index) => ({
            matchNumber: index + 1,
            home: pair[0],
            away: pair[1],
            result: null
        }));

        return this.knockoutResults.r32;
    }

    // Simulate a knockout round
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

    // Simulate Round of 32
    simulateR32() {
        const { results, winners } = this.simulateKnockoutRound('r32', this.knockoutResults.r32);
        this.r16Teams = winners;

        // Create R16 matchups (adjacent R32 winners play each other)
        this.knockoutResults.r16 = [];
        for (let i = 0; i < winners.length; i += 2) {
            this.knockoutResults.r16.push({
                matchNumber: Math.floor(i / 2) + 1,
                home: winners[i],
                away: winners[i + 1],
                result: null
            });
        }

        return results;
    }

    // Simulate Round of 16
    simulateR16() {
        const { results, winners } = this.simulateKnockoutRound('r16', this.knockoutResults.r16);
        this.qfTeams = winners;

        this.knockoutResults.qf = [];
        for (let i = 0; i < winners.length; i += 2) {
            this.knockoutResults.qf.push({
                matchNumber: Math.floor(i / 2) + 1,
                home: winners[i],
                away: winners[i + 1],
                result: null
            });
        }

        return results;
    }

    // Simulate Quarter Finals
    simulateQF() {
        const { results, winners } = this.simulateKnockoutRound('qf', this.knockoutResults.qf);
        this.sfTeams = winners;

        this.knockoutResults.sf = [];
        for (let i = 0; i < winners.length; i += 2) {
            this.knockoutResults.sf.push({
                matchNumber: Math.floor(i / 2) + 1,
                home: winners[i],
                away: winners[i + 1],
                result: null
            });
        }

        return results;
    }

    // Simulate Semi Finals
    simulateSF() {
        const { results, winners } = this.simulateKnockoutRound('sf', this.knockoutResults.sf);
        this.finalists = winners;

        this.knockoutResults.final = [{
            matchNumber: 1,
            home: winners[0],
            away: winners[1],
            result: null
        }];

        return results;
    }

    // Simulate the Final
    simulateFinal() {
        const { results, winners } = this.simulateKnockoutRound('final', this.knockoutResults.final);
        this.champion = winners[0];
        this.runnerUp = this.finalists.find(t => t !== this.champion);
        return results[0];
    }

    // Get tournament statistics
    getStats() {
        const matchCount = this.allMatches.length;
        const avgGoals = matchCount > 0 ? (this.totalGoals / matchCount).toFixed(2) : 0;

        let biggestWin = null;
        let biggestMargin = 0;

        this.allMatches.forEach(match => {
            const margin = Math.abs(Math.floor(match.homeGoals) - Math.floor(match.awayGoals));
            if (margin > biggestMargin) {
                biggestMargin = margin;
                biggestWin = match;
            }
        });

        return {
            totalMatches: matchCount,
            totalGoals: this.totalGoals,
            avgGoals: avgGoals,
            biggestWin: biggestWin,
            champion: this.champion,
            runnerUp: this.runnerUp
        };
    }

    formatScore(match) {
        const homeGoals = Math.floor(match.homeGoals);
        const awayGoals = Math.floor(match.awayGoals);

        let suffix = '';
        if (match.penalties) suffix = ' (P)';
        else if (match.extraTime) suffix = ' (AET)';

        return `${homeGoals} - ${awayGoals}${suffix}`;
    }
}

window.WorldCupSimulation = WorldCupSimulation;
