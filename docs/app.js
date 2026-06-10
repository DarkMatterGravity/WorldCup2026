// World Cup 2026 Simulator - Presentation Controller

class PresentationController {
    constructor() {
        this.simulation = new WorldCupSimulation();
        this.currentSlideIndex = 0;
        this.slides = [];
        this.currentState = 'title';
        this.currentGroup = 0;
        this.currentGroupPhase = 'intro'; // intro, matches, results
        this.currentKnockoutRound = null;
        this.currentKnockoutMatch = 0;
        this.knockoutPhase = 'matchup'; // matchup, result

        this.groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

        this.init();
    }

    init() {
        // Click anywhere to advance
        document.getElementById('app').addEventListener('click', (e) => {
            // Don't advance if clicking specific elements
            if (e.target.tagName === 'BUTTON') return;
            this.advance();
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
                e.preventDefault();
                this.advance();
            }
        });

        this.updateProgress(0, 'Welcome');
    }

    advance() {
        switch (this.currentState) {
            case 'title':
                this.showGroupStageIntro();
                break;
            case 'groupIntro':
                this.startGroupStage();
                break;
            case 'groupDisplay':
                this.showGroupResults();
                break;
            case 'groupResults':
                this.nextGroup();
                break;
            case 'r32Intro':
                this.startR32();
                break;
            case 'r32Matchup':
                this.showR32Result();
                break;
            case 'r32Result':
                this.nextR32Match();
                break;
            case 'r16Intro':
                this.startR16();
                break;
            case 'r16Matchup':
                this.showR16Result();
                break;
            case 'r16Result':
                this.nextR16Match();
                break;
            case 'qfIntro':
                this.startQF();
                break;
            case 'qfMatchup':
                this.showQFResult();
                break;
            case 'qfResult':
                this.nextQFMatch();
                break;
            case 'sfIntro':
                this.startSF();
                break;
            case 'sfMatchup':
                this.showSFResult();
                break;
            case 'sfResult':
                this.nextSFMatch();
                break;
            case 'finalIntro':
                this.showFinalMatchup();
                break;
            case 'finalMatchup':
                this.showChampion();
                break;
            case 'champion':
                // Prediction complete - no restart needed
                break;
        }
    }

    transitionSlide(fromId, toId) {
        const from = document.getElementById(fromId);
        const to = document.getElementById(toId);

        if (from) {
            from.classList.add('exit');
            setTimeout(() => {
                from.classList.remove('active', 'exit');
            }, 400);
        }

        if (to) {
            setTimeout(() => {
                to.classList.add('active');
            }, 100);
        }
    }

    showGroupStageIntro() {
        this.transitionSlide('titleSlide', 'groupIntroSlide');
        this.currentState = 'groupIntro';
        this.updateProgress(2, 'Group Stage');
    }

    startGroupStage() {
        this.currentGroup = 0;
        this.simulation.simulateAllGroups();
        this.showGroup(0);
    }

    showGroup(index) {
        const letter = this.groupLetters[index];
        const teams = GROUPS[letter];

        // Build group display content
        const slide = document.getElementById('groupSlide');
        document.getElementById('groupLetter').textContent = letter;

        // Build team table
        const tableHtml = teams.map(code => {
            const team = TEAMS[code];
            return `
                <div class="group-team">
                    <span class="team-flag">${team.flag}</span>
                    <span class="team-name">${team.name}</span>
                    <span class="team-rank">#${team.fifaRank} FIFA</span>
                </div>
            `;
        }).join('');

        document.getElementById('groupTable').innerHTML = tableHtml;

        // Build matches (showing matchups, not results yet)
        const matches = this.simulation.groupResults[letter];
        const matchesHtml = matches.map(match => `
            <div class="match-row">
                <div class="match-team home">
                    <span class="team-flag">${TEAMS[match.home].flag}</span>
                    <span class="team-name">${TEAMS[match.home].name}</span>
                </div>
                <div class="match-score pending">
                    <span>vs</span>
                </div>
                <div class="match-team away">
                    <span class="team-name">${TEAMS[match.away].name}</span>
                    <span class="team-flag">${TEAMS[match.away].flag}</span>
                </div>
            </div>
        `).join('');

        document.getElementById('groupMatches').innerHTML = matchesHtml;

        // Transition
        const fromSlide = index === 0 ? 'groupIntroSlide' : 'groupResultsSlide';
        this.transitionSlide(fromSlide, 'groupSlide');
        this.currentState = 'groupDisplay';

        const progress = 5 + (index * 7);
        this.updateProgress(progress, `Group ${letter}`);
    }

    showGroupResults() {
        const letter = this.groupLetters[this.currentGroup];
        const standings = this.simulation.groupStandings[letter];
        const matches = this.simulation.groupResults[letter];

        // First, reveal match scores with animation
        const matchRows = document.querySelectorAll('#groupMatches .match-row');
        matches.forEach((match, i) => {
            setTimeout(() => {
                const scoreEl = matchRows[i].querySelector('.match-score');
                scoreEl.classList.remove('pending');
                scoreEl.innerHTML = `
                    <span class="home-score">${match.homeGoals}</span>
                    <span class="score-separator">-</span>
                    <span class="away-score">${match.awayGoals}</span>
                `;
                scoreEl.classList.add('score-reveal');
            }, i * 150);
        });

        // After scores revealed, show standings
        setTimeout(() => {
            document.getElementById('resultGroupLetter').textContent = letter;

            const standingsHtml = `
                <div class="standings-header">
                    <span>#</span>
                    <span>Team</span>
                    <span>P</span>
                    <span>W</span>
                    <span>D</span>
                    <span>L</span>
                    <span>Pts</span>
                </div>
                ${standings.map((team, i) => {
                    let rowClass = '';
                    if (i < 2) rowClass = 'qualified';
                    else if (i === 2) {
                        const isQualified = this.simulation.thirdPlaceTeams.some(t => t.code === team.code);
                        rowClass = isQualified ? 'third-qualified' : 'eliminated';
                    }
                    else rowClass = 'eliminated';

                    return `
                        <div class="standings-row ${rowClass}">
                            <span class="standings-pos">${i + 1}</span>
                            <div class="standings-team">
                                <span class="team-flag">${TEAMS[team.code].flag}</span>
                                <span class="team-name">${TEAMS[team.code].name}</span>
                            </div>
                            <span>${team.played}</span>
                            <span>${team.won}</span>
                            <span>${team.drawn}</span>
                            <span>${team.lost}</span>
                            <span class="standings-pts">${team.points}</span>
                        </div>
                    `;
                }).join('')}
            `;

            document.getElementById('standingsTable').innerHTML = standingsHtml;

            // Qualifiers display
            const first = standings[0];
            const second = standings[1];
            const third = standings[2];
            const thirdQualified = this.simulation.thirdPlaceTeams.some(t => t.code === third.code);

            let qualifiersHtml = `
                <div class="qualifier-label">Advancing to Knockout Stage</div>
                <div class="qualifier-teams">
                    <div class="qualifier-team">
                        <span class="team-flag">${TEAMS[first.code].flag}</span>
                        <span class="team-name">${TEAMS[first.code].name}</span>
                        <span class="position">Group Winner</span>
                    </div>
                    <div class="qualifier-team">
                        <span class="team-flag">${TEAMS[second.code].flag}</span>
                        <span class="team-name">${TEAMS[second.code].name}</span>
                        <span class="position">Runner-up</span>
                    </div>
                    ${thirdQualified ? `
                        <div class="qualifier-team third">
                            <span class="team-flag">${TEAMS[third.code].flag}</span>
                            <span class="team-name">${TEAMS[third.code].name}</span>
                            <span class="position">Best 3rd Place</span>
                        </div>
                    ` : ''}
                </div>
            `;

            document.getElementById('qualifiersDisplay').innerHTML = qualifiersHtml;

            this.transitionSlide('groupSlide', 'groupResultsSlide');
            this.currentState = 'groupResults';

        }, matches.length * 150 + 500);
    }

    nextGroup() {
        this.currentGroup++;
        if (this.currentGroup < 12) {
            this.showGroup(this.currentGroup);
        } else {
            this.showR32Intro();
        }
    }

    showR32Intro() {
        const slide = document.getElementById('r32IntroSlide');
        this.transitionSlide('groupResultsSlide', 'r32IntroSlide');
        this.currentState = 'r32Intro';
        this.currentKnockoutMatch = 0;
        this.updateProgress(45, 'Round of 32');
    }

    startR32() {
        this.simulation.simulateR32();
        this.showKnockoutMatchup('r32', 0);
    }

    showKnockoutMatchup(round, index) {
        const roundData = this.simulation.knockoutResults[round];
        const match = roundData[index];
        const home = TEAMS[match.home];
        const away = TEAMS[match.away];

        const roundNames = {
            'r32': 'ROUND OF 32',
            'r16': 'ROUND OF 16',
            'qf': 'QUARTER FINALS',
            'sf': 'SEMI FINALS',
            'final': 'THE FINAL'
        };

        document.getElementById('knockoutRoundName').textContent = roundNames[round];
        document.getElementById('matchNumber').textContent = `Match ${index + 1} of ${roundData.length}`;

        document.getElementById('koTeamHome').innerHTML = `
            <span class="team-flag">${home.flag}</span>
            <span class="team-name">${home.name}</span>
            <span class="team-score">-</span>
        `;

        document.getElementById('koTeamAway').innerHTML = `
            <span class="team-flag">${away.flag}</span>
            <span class="team-name">${away.name}</span>
            <span class="team-score">-</span>
        `;

        const fromSlide = this.getFromSlide(round, index);
        this.transitionSlide(fromSlide, 'knockoutMatchSlide');
        this.currentKnockoutRound = round;
        this.currentKnockoutMatch = index;
        this.knockoutPhase = 'matchup';
        this.currentState = `${round}Matchup`;

        this.updateKnockoutProgress(round, index);
    }

    getFromSlide(round, index) {
        if (index === 0) {
            const intros = {
                'r32': 'r32IntroSlide',
                'r16': 'r16IntroSlide',
                'qf': 'qfIntroSlide',
                'sf': 'sfIntroSlide'
            };
            return intros[round] || 'knockoutResultSlide';
        }
        return 'knockoutResultSlide';
    }

    showKnockoutResult(round, index) {
        const roundData = this.simulation.knockoutResults[round];
        const match = roundData[index];
        const home = TEAMS[match.home];
        const away = TEAMS[match.away];
        const winner = TEAMS[match.winner];

        const roundNames = {
            'r32': 'ROUND OF 32',
            'r16': 'ROUND OF 16',
            'qf': 'QUARTER FINALS',
            'sf': 'SEMI FINALS',
            'final': 'THE FINAL'
        };

        const isHomeWinner = match.winner === match.home;

        document.getElementById('resultRoundName').textContent = roundNames[round];

        document.getElementById('resultTeamHome').className = `ko-team home ${isHomeWinner ? 'winner' : 'loser'}`;
        document.getElementById('resultTeamHome').innerHTML = `
            <span class="team-flag">${home.flag}</span>
            <span class="team-name">${home.name}</span>
            <span class="team-score">${Math.floor(match.homeGoals)}</span>
        `;

        document.getElementById('resultTeamAway').className = `ko-team away ${!isHomeWinner ? 'winner' : 'loser'}`;
        document.getElementById('resultTeamAway').innerHTML = `
            <span class="team-flag">${away.flag}</span>
            <span class="team-name">${away.name}</span>
            <span class="team-score">${Math.floor(match.awayGoals)}</span>
        `;

        let suffix = '';
        if (match.penalties) suffix = ' (Penalties)';
        else if (match.extraTime) suffix = ' (After Extra Time)';

        document.getElementById('winnerBanner').innerHTML = `
            <span class="winner-flag">${winner.flag}</span>
            <span class="winner-text">${winner.name.toUpperCase()} ADVANCES${suffix}</span>
        `;

        this.transitionSlide('knockoutMatchSlide', 'knockoutResultSlide');
        this.knockoutPhase = 'result';
        this.currentState = `${round}Result`;
    }

    showR32Result() {
        this.showKnockoutResult('r32', this.currentKnockoutMatch);
    }

    nextR32Match() {
        this.currentKnockoutMatch++;
        if (this.currentKnockoutMatch < 16) {
            this.showKnockoutMatchup('r32', this.currentKnockoutMatch);
        } else {
            this.showR16Intro();
        }
    }

    showR16Intro() {
        const slide = document.getElementById('r32IntroSlide');
        document.querySelector('#r32IntroSlide .stage-header h2').textContent = 'ROUND OF 16';
        document.querySelector('#r32IntroSlide .stage-info').innerHTML = `
            <p>8 matches. The best 16 remain.</p>
            <p>Win or go home.</p>
        `;
        this.transitionSlide('knockoutResultSlide', 'r32IntroSlide');
        this.currentState = 'r16Intro';
        this.currentKnockoutMatch = 0;
        this.updateProgress(60, 'Round of 16');
    }

    startR16() {
        this.simulation.simulateR16();
        this.showKnockoutMatchup('r16', 0);
    }

    showR16Result() {
        this.showKnockoutResult('r16', this.currentKnockoutMatch);
    }

    nextR16Match() {
        this.currentKnockoutMatch++;
        if (this.currentKnockoutMatch < 8) {
            this.showKnockoutMatchup('r16', this.currentKnockoutMatch);
        } else {
            this.showQFIntro();
        }
    }

    showQFIntro() {
        document.querySelector('#r32IntroSlide .stage-header').className = 'stage-header semifinal';
        document.querySelector('#r32IntroSlide .stage-header h2').textContent = 'QUARTER FINALS';
        document.querySelector('#r32IntroSlide .stage-info').innerHTML = `
            <p>4 matches. 8 teams left.</p>
            <p>The road to glory narrows.</p>
        `;
        this.transitionSlide('knockoutResultSlide', 'r32IntroSlide');
        this.currentState = 'qfIntro';
        this.currentKnockoutMatch = 0;
        this.updateProgress(72, 'Quarter Finals');
    }

    startQF() {
        this.simulation.simulateQF();
        this.showKnockoutMatchup('qf', 0);
    }

    showQFResult() {
        this.showKnockoutResult('qf', this.currentKnockoutMatch);
    }

    nextQFMatch() {
        this.currentKnockoutMatch++;
        if (this.currentKnockoutMatch < 4) {
            this.showKnockoutMatchup('qf', this.currentKnockoutMatch);
        } else {
            this.showSFIntro();
        }
    }

    showSFIntro() {
        const sfTeams = this.simulation.sfTeams;

        document.getElementById('semiIntroSlide').innerHTML = `
            <div class="stage-header semifinal">
                <h2>SEMI FINALS</h2>
                <p>Four teams remain</p>
            </div>
            <div class="semifinal-bracket">
                <div class="semi-matchup">
                    <h3>Semi Final 1</h3>
                    <div class="semi-team">
                        <span class="team-flag">${TEAMS[sfTeams[0]].flag}</span>
                        <span class="team-name">${TEAMS[sfTeams[0]].name}</span>
                    </div>
                    <div class="semi-vs">VS</div>
                    <div class="semi-team">
                        <span class="team-flag">${TEAMS[sfTeams[1]].flag}</span>
                        <span class="team-name">${TEAMS[sfTeams[1]].name}</span>
                    </div>
                </div>
                <div class="semi-matchup">
                    <h3>Semi Final 2</h3>
                    <div class="semi-team">
                        <span class="team-flag">${TEAMS[sfTeams[2]].flag}</span>
                        <span class="team-name">${TEAMS[sfTeams[2]].name}</span>
                    </div>
                    <div class="semi-vs">VS</div>
                    <div class="semi-team">
                        <span class="team-flag">${TEAMS[sfTeams[3]].flag}</span>
                        <span class="team-name">${TEAMS[sfTeams[3]].name}</span>
                    </div>
                </div>
            </div>
            <div class="continue-prompt">Click to begin semi-finals →</div>
        `;

        this.transitionSlide('knockoutResultSlide', 'semiIntroSlide');
        this.currentState = 'sfIntro';
        this.currentKnockoutMatch = 0;
        this.updateProgress(82, 'Semi Finals');
    }

    startSF() {
        this.simulation.simulateSF();
        this.showKnockoutMatchup('sf', 0);
    }

    showSFResult() {
        this.showKnockoutResult('sf', this.currentKnockoutMatch);
    }

    nextSFMatch() {
        this.currentKnockoutMatch++;
        if (this.currentKnockoutMatch < 2) {
            this.showKnockoutMatchup('sf', this.currentKnockoutMatch);
        } else {
            this.showFinalIntro();
        }
    }

    showFinalIntro() {
        const finalists = this.simulation.finalists;

        document.getElementById('finalIntroSlide').innerHTML = `
            <div class="stage-header final">
                <h2>THE FINAL</h2>
                <p>MetLife Stadium, New Jersey</p>
                <p style="color: var(--wc-gold); margin-top: 10px;">July 19, 2026</p>
            </div>
            <div class="final-matchup">
                <div class="finalist">
                    <span class="team-flag">${TEAMS[finalists[0]].flag}</span>
                    <span class="team-name">${TEAMS[finalists[0]].name}</span>
                </div>
                <div class="final-vs">VS</div>
                <div class="finalist">
                    <span class="team-flag">${TEAMS[finalists[1]].flag}</span>
                    <span class="team-name">${TEAMS[finalists[1]].name}</span>
                </div>
            </div>
            <div class="continue-prompt">Click to reveal the World Cup Champion →</div>
        `;

        this.transitionSlide('knockoutResultSlide', 'finalIntroSlide');
        this.currentState = 'finalIntro';
        this.updateProgress(92, 'The Final');
    }

    showFinalMatchup() {
        this.currentState = 'finalMatchup';
        this.showChampion();
    }

    showChampion() {
        const result = this.simulation.simulateFinal();
        const champion = TEAMS[this.simulation.champion];
        const runnerUp = TEAMS[this.simulation.runnerUp];

        let scoreText = `${Math.floor(result.homeGoals)} - ${Math.floor(result.awayGoals)}`;
        if (result.penalties) scoreText += ' (Penalties)';
        else if (result.extraTime) scoreText += ' (AET)';

        document.getElementById('championFlag').textContent = champion.flag;
        document.getElementById('championName').textContent = champion.name.toUpperCase();
        document.getElementById('finalScoreDisplay').innerHTML = `
            Final: ${champion.name} ${scoreText} ${runnerUp.name}
        `;

        // Create confetti
        this.createConfetti();

        this.transitionSlide('finalIntroSlide', 'championSlide');
        this.currentState = 'champion';
        this.updateProgress(100, `${champion.name} - World Champions!`);
    }

    createConfetti() {
        const container = document.getElementById('confetti');
        container.innerHTML = '';

        const colors = ['#D4AF37', '#A4195C', '#00A5B5', '#E85D04', '#6B2D5B', '#00D4E4'];

        for (let i = 0; i < 100; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = Math.random() * 3 + 's';
            piece.style.animationDuration = (2 + Math.random() * 2) + 's';
            container.appendChild(piece);
        }
    }

    restart() {
        // Reset everything
        this.simulation = new WorldCupSimulation();
        this.currentGroup = 0;
        this.currentKnockoutMatch = 0;

        // Reset all slides
        document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('active', 'exit');
        });

        // Show title
        document.getElementById('titleSlide').classList.add('active');
        this.currentState = 'title';
        this.updateProgress(0, 'Welcome');

        // Clear confetti
        document.getElementById('confetti').innerHTML = '';
    }

    updateProgress(percent, label) {
        document.getElementById('progressFill').style.width = percent + '%';
        document.getElementById('progressLabel').textContent = label;
    }

    updateKnockoutProgress(round, index) {
        const roundProgress = {
            'r32': { base: 45, perMatch: 0.9 },
            'r16': { base: 60, perMatch: 1.5 },
            'qf': { base: 72, perMatch: 2.5 },
            'sf': { base: 82, perMatch: 5 }
        };

        const rp = roundProgress[round];
        if (rp) {
            const progress = rp.base + (index * rp.perMatch);
            const roundNames = {
                'r32': 'Round of 32',
                'r16': 'Round of 16',
                'qf': 'Quarter Finals',
                'sf': 'Semi Finals'
            };
            this.updateProgress(progress, `${roundNames[round]} - Match ${index + 1}`);
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.presentation = new PresentationController();
});
