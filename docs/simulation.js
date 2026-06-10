// World Cup 2026 Simulation Engine

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
    }

    // Simulate a single match between two teams
    simulateMatch(homeCode, awayCode, isKnockout = false) {
        const home = TEAMS[homeCode];
        const away = TEAMS[awayCode];

        // Base expected goals based on team strength
        const homeAdvantage = 3; // Slight home/first-listed advantage
        const homeStrength = home.strength + homeAdvantage;
        const awayStrength = away.strength;

        // Calculate expected goals (poisson-ish distribution)
        const homeExpectedGoals = 1.2 + (homeStrength - awayStrength) / 30;
        const awayExpectedGoals = 1.2 + (awayStrength - homeStrength) / 30;

        // Generate actual goals with some randomness
        let homeGoals = this.poissonRandom(Math.max(0.3, homeExpectedGoals));
        let awayGoals = this.poissonRandom(Math.max(0.3, awayExpectedGoals));

        // Knockout matches can't end in draw - simulate extra time/penalties
        let extraTime = false;
        let penalties = false;

        if (isKnockout && homeGoals === awayGoals) {
            extraTime = true;
            // Extra time - slight chance for goals
            if (Math.random() < 0.4) {
                if (Math.random() < (homeStrength / (homeStrength + awayStrength))) {
                    homeGoals++;
                } else {
                    awayGoals++;
                }
            }

            // Still tied? Penalties
            if (homeGoals === awayGoals) {
                penalties = true;
                // 50/50 with slight advantage to stronger team
                const strongerWins = Math.random() < (homeStrength / (homeStrength + awayStrength) * 0.2 + 0.4);
                if (strongerWins) {
                    homeGoals += 0.5; // Use .5 to indicate penalty win
                } else {
                    awayGoals += 0.5;
                }
            }
        }

        this.totalGoals += Math.floor(homeGoals) + Math.floor(awayGoals);

        return {
            home: homeCode,
            away: awayCode,
            homeGoals: homeGoals,
            awayGoals: awayGoals,
            extraTime: extraTime,
            penalties: penalties,
            winner: homeGoals > awayGoals ? homeCode : (awayGoals > homeGoals ? awayCode : null)
        };
    }

    // Poisson random number generator
    poissonRandom(lambda) {
        let L = Math.exp(-lambda);
        let k = 0;
        let p = 1;

        do {
            k++;
            p *= Math.random();
        } while (p > L);

        return k - 1;
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
                points: 0
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
                homeStats.goalsFor += match.homeGoals;
                homeStats.goalsAgainst += match.awayGoals;
                awayStats.goalsFor += match.awayGoals;
                awayStats.goalsAgainst += match.homeGoals;

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

        // Sort standings
        const sortedStandings = Object.values(standings).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            return 0;
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

        // Collect third place teams and determine best 8
        this.determineThirdPlaceQualifiers();

        return this.groupStandings;
    }

    // Determine which 8 third-place teams qualify
    determineThirdPlaceQualifiers() {
        const thirdPlaceTeams = [];

        Object.keys(this.groupStandings).forEach(group => {
            const third = this.groupStandings[group][2];
            third.group = group;
            thirdPlaceTeams.push(third);
        });

        // Sort third place teams
        thirdPlaceTeams.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            return 0;
        });

        // Best 8 qualify
        this.thirdPlaceTeams = thirdPlaceTeams.slice(0, 8);

        // Build R32 bracket
        this.buildR32Bracket();
    }

    // Build the Round of 32 bracket
    buildR32Bracket() {
        // Get all qualified teams (24 from top 2 + 8 third place)
        const qualified = [];

        Object.keys(this.groupStandings).forEach(group => {
            qualified.push({
                code: this.groupStandings[group][0].code,
                position: "1st",
                group: group
            });
            qualified.push({
                code: this.groupStandings[group][1].code,
                position: "2nd",
                group: group
            });
        });

        this.thirdPlaceTeams.forEach(team => {
            qualified.push({
                code: team.code,
                position: "3rd",
                group: team.group
            });
        });

        this.r32Teams = qualified;

        // Create R32 matchups (1st vs 3rd, 2nd vs 2nd pattern simplified)
        this.knockoutResults.r32 = this.createR32Matchups();
    }

    // Create Round of 32 matchups
    createR32Matchups() {
        const matchups = [];
        const groupOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

        // Standard FIFA bracket pattern (simplified)
        // Winner Group A vs 3rd place from C/D/E
        // Runner-up Group A vs Runner-up Group B
        // etc.

        const firstPlace = {};
        const secondPlace = {};
        const thirdPlace = this.thirdPlaceTeams.map(t => t.code);

        groupOrder.forEach(g => {
            firstPlace[g] = this.groupStandings[g][0].code;
            secondPlace[g] = this.groupStandings[g][1].code;
        });

        // R32 Matchups (16 matches)
        const r32Pairings = [
            [firstPlace['A'], thirdPlace[0] || secondPlace['L']],
            [secondPlace['A'], secondPlace['B']],
            [firstPlace['B'], thirdPlace[1] || secondPlace['K']],
            [secondPlace['C'], secondPlace['D']],
            [firstPlace['C'], thirdPlace[2] || secondPlace['J']],
            [secondPlace['E'], secondPlace['F']],
            [firstPlace['D'], thirdPlace[3] || secondPlace['I']],
            [secondPlace['G'], secondPlace['H']],
            [firstPlace['E'], thirdPlace[4] || secondPlace['H']],
            [secondPlace['I'], secondPlace['J']],
            [firstPlace['F'], thirdPlace[5] || secondPlace['G']],
            [secondPlace['K'], secondPlace['L']],
            [firstPlace['G'], thirdPlace[6] || secondPlace['F']],
            [firstPlace['H'], thirdPlace[7] || secondPlace['E']],
            [firstPlace['I'], secondPlace['L']],
            [firstPlace['J'], firstPlace['K']]
        ];

        r32Pairings.forEach((pair, index) => {
            matchups.push({
                matchNumber: index + 1,
                home: pair[0],
                away: pair[1],
                result: null
            });
        });

        return matchups;
    }

    // Simulate a knockout round
    simulateKnockoutRound(roundName, matchups) {
        const results = [];
        const winners = [];

        matchups.forEach((matchup, index) => {
            const result = this.simulateMatch(matchup.home, matchup.away, true);
            result.matchNumber = index + 1;

            // Determine winner (considering penalty wins)
            const winner = Math.floor(result.homeGoals) > Math.floor(result.awayGoals) ?
                result.home :
                (Math.floor(result.awayGoals) > Math.floor(result.homeGoals) ?
                    result.away :
                    (result.homeGoals > result.awayGoals ? result.home : result.away));

            result.winner = winner;
            results.push(result);
            winners.push(winner);
            this.allMatches.push(result);
        });

        this.knockoutResults[roundName] = results;

        return { results, winners };
    }

    // Simulate Round of 32
    simulateR32() {
        const { results, winners } = this.simulateKnockoutRound('r32', this.knockoutResults.r32);
        this.r16Teams = winners;

        // Create R16 matchups
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

        // Create QF matchups
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

        // Create SF matchups
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

        // Create Final matchup
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

        // Find biggest win
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

    // Format score for display
    formatScore(match) {
        const homeGoals = Math.floor(match.homeGoals);
        const awayGoals = Math.floor(match.awayGoals);

        let suffix = '';
        if (match.penalties) {
            suffix = ' (P)';
        } else if (match.extraTime) {
            suffix = ' (AET)';
        }

        return `${homeGoals} - ${awayGoals}${suffix}`;
    }
}

// Export
window.WorldCupSimulation = WorldCupSimulation;
