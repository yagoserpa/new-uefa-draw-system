"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var pot1 = [
    { name: "Real Madrid", country: "Spain" },
    { name: "Manchester City", country: "England" },
    { name: "Bayern München", country: "Germany" },
    { name: "Paris Saint-Germain", country: "France" },
    { name: "Liverpool", country: "England" },
    { name: "Internazionale", country: "Italy" },
    { name: "Borussia Dortmund", country: "Germany" },
    { name: "RB Leipzig", country: "Germany" },
    { name: "Barcelona", country: "Spain" }
];
var pot2 = [
    { name: "Bayer Leverkusen", country: "Germany" },
    { name: "Atlético de Madrid", country: "Spain" },
    { name: "Atalanta", country: "Italy" },
    { name: "Juventus", country: "Italy" },
    { name: "Benfica", country: "Portugal" },
    { name: "Arsenal", country: "England" },
    { name: "Club Brugge", country: "Belgium" },
    { name: "Shakhtar Donetsk", country: "Ukraine" },
    { name: "AC Milan", country: "Italy" }
];
var pot3 = [
    { name: "Feyenoord", country: "Netherlands" },
    { name: "Sporting CP", country: "Portugal" },
    { name: "PSV Eindhoven", country: "Netherlands" },
    { name: "GNK Dinamo Zagreb", country: "Croatia" },
    { name: "RB Salzburg", country: "Austria" },
    { name: "Lille", country: "France" },
    { name: "Crvena Zvezda", country: "Serbia" },
    { name: "Young Boys", country: "Switzerland" },
    { name: "Celtic", country: "Scotland" }
];
var pot4 = [
    { name: "Slovan Bratislava", country: "Slovakia" },
    { name: "AS Monaco", country: "France" },
    { name: "Sparta Praha", country: "Czech Republic" },
    { name: "Aston Villa", country: "England" },
    { name: "Bologna", country: "Italy" },
    { name: "Girona", country: "Spain" },
    { name: "Stuttgart", country: "Germany" },
    { name: "Sturm Graz", country: "Austria" },
    { name: "Brest", country: "France" }
];
function shuffleArray(array) {
    var _a;
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [array[j], array[i]], array[i] = _a[0], array[j] = _a[1];
    }
    return array;
}
function generateFixtures(pots) {
    var fixtures = [];
    var maxMatches = 2;
    var maxGames = 4;
    var potCount = pots.length;
    // Track team stats
    var teamStats = {};
    function initializeTeamStats(teams) {
        for (var _i = 0, teams_1 = teams; _i < teams_1.length; _i++) {
            var team = teams_1[_i];
            teamStats[team.name] = {
                homeGames: 0,
                awayGames: 0,
                playedTeams: Array(potCount).fill(0).map(function () { return []; }),
                playedTeamsFromPot: Array(potCount).fill(0)
            };
        }
    }
    function getPotIndex(team) {
        for (var i = 0; i < pots.length; i++) {
            for (var _i = 0, _a = pots[i]; _i < _a.length; _i++) {
                var t = _a[_i];
                if (t.name === team.name) {
                    return i;
                }
            }
        }
        return -1; // Not found
    }
    function isValidFixture(home, away) {
        var homePotIndex = getPotIndex(home);
        var awayPotIndex = getPotIndex(away);
        var homeStats = teamStats[home.name];
        var awayStats = teamStats[away.name];
        function arrayContains(array, value) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === value) {
                    return true;
                }
            }
            return false;
        }
        return home.country !== away.country &&
            !fixtures.some(function (fixture) {
                return (fixture.home === home && fixture.away === away) ||
                    (fixture.home === away && fixture.away === home);
            }) &&
            homeStats.homeGames < maxGames &&
            awayStats.awayGames < maxGames &&
            !arrayContains(homeStats.playedTeams[awayPotIndex], away.name) &&
            !arrayContains(awayStats.playedTeams[homePotIndex], home.name) &&
            homeStats.playedTeamsFromPot[awayPotIndex] < maxMatches &&
            awayStats.playedTeamsFromPot[homePotIndex] < maxMatches;
    }
    function createFixturesForTeam(team, potIndex) {
        var otherPots = pots.filter(function (_, index) { return index !== potIndex; });
        var homeGames = 0;
        var awayGames = 0;
        function getAvailableOpponents(pot, home) {
            var result = [];
            for (var _i = 0, pot_1 = pot; _i < pot_1.length; _i++) {
                var awayTeam = pot_1[_i];
                if (isValidFixture(team, awayTeam) &&
                    teamStats[team.name].playedTeamsFromPot[potIndex] < maxMatches &&
                    teamStats[awayTeam.name].playedTeamsFromPot[potIndex] < maxMatches) {
                    result.push(awayTeam);
                }
            }
            return result;
        }
        function addFixture(awayTeam, home) {
            if (home) {
                fixtures.push({ home: team, away: awayTeam });
                teamStats[team.name].homeGames++;
            }
            else {
                fixtures.push({ home: awayTeam, away: team });
                teamStats[team.name].awayGames++;
            }
            teamStats[team.name].playedTeams[potIndex].push(awayTeam.name);
            teamStats[awayTeam.name].playedTeams[potIndex].push(team.name);
            teamStats[team.name].playedTeamsFromPot[potIndex]++;
            teamStats[awayTeam.name].playedTeamsFromPot[potIndex]++;
        }
        function drawPot(pot, home) {
            var opponents = shuffleArray(getAvailableOpponents(pot, home));
            var matchCount = 0;
            while (opponents.length > 0 && matchCount < maxMatches) {
                var awayTeam = opponents.shift();
                addFixture(awayTeam, home);
                matchCount++;
            }
        }
        // Draw fixtures for each pot
        for (var i = 0; i < pots.length; i++) {
            if (i === potIndex) {
                drawPot(pots[i], true); // Home games
                drawPot(pots[i], false); // Away games
            }
            else {
                drawPot(pots[i], true); // Home games
                drawPot(pots[i], false); // Away games
            }
        }
    }
    // Initialize team stats for all teams
    initializeTeamStats(pot1.concat(pot2, pot3, pot4));
    // Generate fixtures for each team
    for (var i = 0; i < pots.length; i++) {
        for (var _i = 0, _a = pots[i]; _i < _a.length; _i++) {
            var team = _a[_i];
            createFixturesForTeam(team, i);
        }
    }
    return fixtures;
}
var allPots = [pot1, pot2, pot3, pot4];
var fixtures = generateFixtures(allPots);
// Write the fixtures to a JSON file
fs.writeFileSync('fixtures.json', JSON.stringify(fixtures, null, 2));
console.log('Fixtures have been written to fixtures.json');
