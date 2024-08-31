import * as fs from 'fs'

type Team = {
  name: string
  country: string
}

type Fixture = {
  home: Team
  away: Team
}

type Pot = Team[]

const pot1: Pot = [
  { name: "Real Madrid", country: "Spain" },
  { name: "Manchester City", country: "England" },
  { name: "Bayern München", country: "Germany" },
  { name: "Paris Saint-Germain", country: "France" },
  { name: "Liverpool", country: "England" },
  { name: "Internazionale", country: "Italy" },
  { name: "Borussia Dortmund", country: "Germany" },
  { name: "RB Leipzig", country: "Germany" },
  { name: "Barcelona", country: "Spain" }
]

const pot2: Pot = [
  { name: "Bayer Leverkusen", country: "Germany" },
  { name: "Atlético de Madrid", country: "Spain" },
  { name: "Atalanta", country: "Italy" },
  { name: "Juventus", country: "Italy" },
  { name: "Benfica", country: "Portugal" },
  { name: "Arsenal", country: "England" },
  { name: "Club Brugge", country: "Belgium" },
  { name: "Shakhtar Donetsk", country: "Ukraine" },
  { name: "AC Milan", country: "Italy" }
]

const pot3: Pot = [
  { name: "Feyenoord", country: "Netherlands" },
  { name: "Sporting CP", country: "Portugal" },
  { name: "PSV Eindhoven", country: "Netherlands" },
  { name: "GNK Dinamo Zagreb", country: "Croatia" },
  { name: "RB Salzburg", country: "Austria" },
  { name: "Lille", country: "France" },
  { name: "Crvena Zvezda", country: "Serbia" },
  { name: "Young Boys", country: "Switzerland" },
  { name: "Celtic", country: "Scotland" }
]

const pot4: Pot = [
  { name: "Slovan Bratislava", country: "Slovakia" },
  { name: "AS Monaco", country: "France" },
  { name: "Sparta Praha", country: "Czech Republic" },
  { name: "Aston Villa", country: "England" },
  { name: "Bologna", country: "Italy" },
  { name: "Girona", country: "Spain" },
  { name: "Stuttgart", country: "Germany" },
  { name: "Sturm Graz", country: "Austria" },
  { name: "Brest", country: "France" }
]

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function generateFixtures(pots: Pot[]): Fixture[] {
  const fixtures: Fixture[] = []
  const maxMatches = 2
  const maxGames = 4
  const potCount = pots.length

  // Track team stats
  const teamStats: { [key: string]: { homeGames: number, awayGames: number, playedTeams: { [potIndex: number]: string[] }, playedTeamsFromPot: number[] } } = {}

  function initializeTeamStats(teams: Team[]): void {
    for (const team of teams) {
      teamStats[team.name] = {
        homeGames: 0,
        awayGames: 0,
        playedTeams: Array(potCount).fill(0).map(() => []),
        playedTeamsFromPot: Array(potCount).fill(0)
      }
    }
  }

  function getPotIndex(team: Team): number {
    for (let i = 0; i < pots.length; i++) {
      for (const t of pots[i]) {
        if (t.name === team.name) {
          return i
        }
      }
    }
    return -1 // Not found
  }

  function isValidFixture(home: Team, away: Team): boolean {
    const homePotIndex = getPotIndex(home)
    const awayPotIndex = getPotIndex(away)

    const homeStats = teamStats[home.name]
    const awayStats = teamStats[away.name]

    function arrayContains(array: string[], value: string): boolean {
      for (let i = 0; i < array.length; i++) {
        if (array[i] === value) {
          return true
        }
      }
      return false
    }

    return home.country !== away.country &&
      !fixtures.some(fixture =>
        (fixture.home === home && fixture.away === away) ||
        (fixture.home === away && fixture.away === home)
      ) &&
      homeStats.homeGames < maxGames &&
      awayStats.awayGames < maxGames &&
      !arrayContains(homeStats.playedTeams[awayPotIndex], away.name) &&
      !arrayContains(awayStats.playedTeams[homePotIndex], home.name) &&
      homeStats.playedTeamsFromPot[awayPotIndex] < maxMatches &&
      awayStats.playedTeamsFromPot[homePotIndex] < maxMatches
  }

  function createFixturesForTeam(team: Team, potIndex: number): void {
    const otherPots = pots.filter((_, index) => index !== potIndex)
    let homeGames = 0
    let awayGames = 0

    function getAvailableOpponents(pot: Pot, home: boolean): Team[] {
      const result: Team[] = []
      for (const awayTeam of pot) {
        if (
          isValidFixture(team, awayTeam) &&
          teamStats[team.name].playedTeamsFromPot[potIndex] < maxMatches &&
          teamStats[awayTeam.name].playedTeamsFromPot[potIndex] < maxMatches
        ) {
          result.push(awayTeam)
        }
      }
      return result
    }

    function addFixture(awayTeam: Team, home: boolean): void {
      if (home) {
        fixtures.push({ home: team, away: awayTeam })
        teamStats[team.name].homeGames++
      } else {
        fixtures.push({ home: awayTeam, away: team })
        teamStats[team.name].awayGames++
      }
      teamStats[team.name].playedTeams[potIndex].push(awayTeam.name)
      teamStats[awayTeam.name].playedTeams[potIndex].push(team.name)
      teamStats[team.name].playedTeamsFromPot[potIndex]++
      teamStats[awayTeam.name].playedTeamsFromPot[potIndex]++
    }

    function drawPot(pot: Pot, home: boolean): void {
      const opponents = shuffleArray(getAvailableOpponents(pot, home))
      let matchCount = 0

      while (opponents.length > 0 && matchCount < maxMatches) {
        const awayTeam = opponents.shift()!
        addFixture(awayTeam, home)
        matchCount++
      }
    }

    // Draw fixtures for each pot
    for (let i = 0; i < pots.length; i++) {
      if (i === potIndex) {
        drawPot(pots[i], true)  // Home games
        drawPot(pots[i], false) // Away games
      } else {
        drawPot(pots[i], true)  // Home games
        drawPot(pots[i], false) // Away games
      }
    }
  }

  // Initialize team stats for all teams
  initializeTeamStats(pot1.concat(pot2, pot3, pot4))

  // Generate fixtures for each team
  for (let i = 0; i < pots.length; i++) {
    for (const team of pots[i]) {
      createFixturesForTeam(team, i)
    }
  }

  return fixtures
}

const allPots = [pot1, pot2, pot3, pot4]
const fixtures = generateFixtures(allPots)

// Write the fixtures to a JSON file
fs.writeFileSync('fixtures.json', JSON.stringify(fixtures, null, 2))

console.log('Fixtures have been written to fixtures.json')