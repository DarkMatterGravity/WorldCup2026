// World Cup 2026 Deterministic Prediction Engine
// Based on team strength ratings derived from betting odds, FIFA rankings, and expert analysis
// No randomness - produces the most likely outcome based on available data

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

    // Deterministic match prediction based on team strengths
    // Returns expected goals for each team (no randomness)
    simulateMatch(homeCode, awayCode, isKnockout = false) {
        const home = TEAMS[homeCode];
        const away = TEAMS[awayCode];

        // Calculate strength differential
        const strengthDiff = home.strength - away.strength;

        // Base expected goals (average World Cup match ~2.5 total goals)
        // Higher strength = more goals scored, fewer conceded
        const baseGoals = 1.25;

        // Goal calculation based on strength differential
        // Every 10 points of strength difference = ~0.5 goal swing
        let homeGoals = baseGoals + (strengthDiff / 20);
        let awayGoals = baseGoals - (strengthDiff / 20);

        // Ensure minimum goals and round to reasonable values
        homeGoals = Math.max(0, homeGoals);
        awayGoals = Math.max(0, awayGoals);

        // Round to nearest 0.5 for display, then floor for actual score
        homeGoals = Math.round(homeGoals * 2) / 2;
        awayGoals = Math.round(awayGoals * 2) / 2;

        // Convert to integers for final score
        let homeScore = Math.round(homeGoals);
        let awayScore = Math.round(awayGoals);

        // Handle draws - in deterministic model, stronger team edges it
        let extraTime = false;
        let penalties = false;

        if (isKnockout && homeScore === awayScore) {
            extraTime = true;
            // Stronger team wins in extra time or penalties
            if (home.strength > away.strength) {
                // Close match goes to penalties, clear favorite wins in ET
                if (Math.abs(strengthDiff) < 5) {
                    penalties = true;
                    homeScore += 0.5; // Indicates penalty win
                } else {
                    homeScore += 1;
                }
            } else if (away.strength > home.strength) {
                if (Math.abs(strengthDiff) < 5) {
                    penalties = true;
                    awayScore += 0.5;
                } else {
                    awayScore += 1;
                }
            } else {
                // Exact same strength - use FIFA ranking as tiebreaker
                penalties = true;
                if (home.fifaRank < away.fifaRank) {
                    homeScore += 0.5;
                } else {
                    awayScore += 0.5;
                }
            }
        }

        // For group stage draws, keep them as draws if strengths are very close
        if (!isKnockout && Math.abs(strengthDiff) < 8 && homeScore === awayScore) {
            // This is a valid draw, keep it
        } else if (!isKnockout && homeScore === awayScore) {
            // Slight edge to stronger team in group stage
            if (home.strength > away.strength) {
                homeScore = Math.max(1, homeScore);
                awayScore = Math.max(0, homeScore - 1);
            } else {
                awayScore = Math.max(1, awayScore);
                homeScore = Math.max(0, awayScore - 1);
            }
        }

        this.totalGoals += Math.floor(homeScore) + Math.floor(awayScore);

        const winner = homeScore > awayScore ? homeCode :
                      (awayScore > homeScore ? awayCode : null);

        return {
            home: homeCode,
            away: awayCode,
            homeGoals: homeScore,
            awayGoals: awayScore,
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

        // Sort standings by points, then GD, then GF, then strength (as final tiebreaker)
        const sortedStandings = Object.values(standings).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            return b.strength - a.strength; // Use strength as final tiebreaker
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
            const third = { ...this.groupStandings[group][2] };
            third.group = group;
            thirdPlaceTeams.push(third);
        });

        // Sort third place teams
        thirdPlaceTeams.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            return b.strength - a.strength;
        });

        // Best 8 qualify
        this.thirdPlaceTeams = thirdPlaceTeams.slice(0, 8);

        // Build R32 bracket
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

        // R32 Matchups following FIFA bracket structure
        // Winners face 3rd place teams, Runners-up face each other
        const r32Pairings = [
            // Left side of bracket
            [firstPlace['A'], thirdPlace[7]],    // 1A vs best 3rd #8
            [secondPlace['C'], secondPlace['D']], // 2C vs 2D
            [firstPlace['B'], thirdPlace[6]],    // 1B vs best 3rd #7
            [secondPlace['A'], secondPlace['B']], // 2A vs 2B
            [firstPlace['C'], thirdPlace[5]],    // 1C vs best 3rd #6
            [secondPlace['E'], secondPlace['F']], // 2E vs 2F
            [firstPlace['D'], thirdPlace[4]],    // 1D vs best 3rd #5
            [secondPlace['G'], secondPlace['H']], // 2G vs 2H

            // Right side of bracket
            [firstPlace['E'], thirdPlace[3]],    // 1E vs best 3rd #4
            [secondPlace['I'], secondPlace['J']], // 2I vs 2J
            [firstPlace['F'], thirdPlace[2]],    // 1F vs best 3rd #3
            [secondPlace['K'], secondPlace['L']], // 2K vs 2L
            [firstPlace['G'], thirdPlace[1]],    // 1G vs best 3rd #2
            [firstPlace['H'], secondPlace['I']], // 1H vs 2I
            [firstPlace['I'], thirdPlace[0]],    // 1I vs best 3rd #1
            [firstPlace['J'], firstPlace['K']]   // 1J vs 1K (tough draw)
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

            // Determine winner (considering penalty wins)
            const winner = result.homeGoals > result.awayGoals ? result.home : result.away;

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

        // Create R16 matchups (winners play each other in bracket order)
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
