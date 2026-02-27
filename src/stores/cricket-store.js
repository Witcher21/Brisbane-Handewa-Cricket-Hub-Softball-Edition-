import { defineStore } from 'pinia'
import { pushToFirestore, pullFromFirestore, subscribeFirestore, firebaseConfigured } from 'src/services/firebase'

// ── Helpers ────────────────────────────────────────────────────────
function emptyStats() {
  return {
    matches: 0, innings: 0, runs: 0, balls: 0, notOuts: 0,
    fours: 0, sixes: 0, highScore: 0, fifties: 0, hundreds: 0,
    oversBowled: 0, ballsBowled: 0, runsConceded: 0, wickets: 0,
    maidens: 0, bestFigures: '0/0',
    catches: 0, stumpings: 0, runOuts: 0,
  }
}
function calcAverage(runs, innings, notOuts) {
  const d = innings - notOuts
  return d > 0 ? (runs / d).toFixed(2) : runs > 0 ? '∞' : '0.00'
}
function calcSR(runs, balls) { return balls > 0 ? ((runs / balls) * 100).toFixed(2) : '0.00' }
function calcEconomy(runs, balls) { return balls > 0 ? ((runs / balls) * 6).toFixed(2) : '0.00' }
function calcAvgBowl(runs, wickets) { return wickets > 0 ? (runs / wickets).toFixed(2) : '-' }

// ── Seed data — one clean demo team ──────────────────────────────
function seedState() {
  return {
    players: [
      {
        id: 1, name: 'Ruwan Jayasinghe', nickname: 'The Captain',
        role: 'Batsman', teamId: 1, number: 1, age: 30,
        nationality: 'Sri Lankan', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm off-spin',
        description: 'Inspirational captain. Leads from the front with consistent performances.',
        achievements: ['Best Captain 2024', 'Most Runs 2023'],
        stats: { ...emptyStats(), matches: 12, innings: 12, runs: 580, balls: 490, notOuts: 1, fours: 55, sixes: 18, highScore: 76, fifties: 4, catches: 8, wickets: 2, runsConceded: 40, ballsBowled: 36, oversBowled: 6 },
      },
      {
        id: 2, name: 'Nawod Sanjana', nickname: 'The Wall',
        role: 'Batsman', teamId: 1, number: 7, age: 24,
        nationality: 'Sri Lankan', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm medium',
        description: 'Technically sound batsman known for elegant drives and solid defence.',
        achievements: ['Player of the Tournament 2024'],
        stats: { ...emptyStats(), matches: 12, innings: 11, runs: 420, balls: 355, notOuts: 2, fours: 38, sixes: 11, highScore: 65, fifties: 3, catches: 5 },
      },
      {
        id: 3, name: 'Kamal Perera', nickname: 'The Tornado',
        role: 'Bowler', teamId: 1, number: 11, age: 26,
        nationality: 'Sri Lankan', battingStyle: 'Right-hand bat', bowlingStyle: 'Right-arm fast-medium',
        description: 'Devastating pace bowler with ability to swing both ways.',
        achievements: ['Best Bowler 2024'],
        stats: { ...emptyStats(), matches: 12, innings: 6, runs: 45, balls: 60, highScore: 12, wickets: 18, runsConceded: 290, oversBowled: 46, ballsBowled: 276, maidens: 3, bestFigures: '3/22', catches: 4 },
      },
    ],
    teams: [
      {
        id: 1, name: 'Brisbane Handewa', shortName: 'BHW',
        color: '#00d4ff', secondaryColor: '#001a3a',
        captainId: 1, founded: 2018, venue: 'Handewa Ground, Brisbane',
        description: 'The defending champions.',
        stats: { matches: 12, won: 8, lost: 3, tied: 1, points: 17, nrr: '+1.24' },
        titles: ['2024 Champions'],
        playerIds: [1, 2, 3],
      },
    ],
    matches: [],
    nextPlayerId: 4,
    nextTeamId: 2,
    nextMatchId: 1,
    notifications: [],
    // Completed match history (full records preserved forever)
    matchHistory: [],
  }
}

// ── Internal flag to prevent Firebase feedback loops ──────────────
let _isSyncingFromCloud = false

export const useCricketStore = defineStore('cricket', {
  state: () => seedState(),

  // localStorage persistence (offline / same device)
  // notifications excluded so they don't reappear on reload
  persist: {
    key: 'gns-cricket-hub-v2',
    storage: localStorage,
    paths: ['players','teams','matches','matchHistory','nextPlayerId','nextTeamId','nextMatchId'],
  },

  // ─── GETTERS ─────────────────────────────────────────────────
  getters: {
    getPlayerById:    (s) => (id) => s.players.find((p) => p.id === Number(id)),
    getTeamById:      (s) => (id) => s.teams.find((t) => t.id === Number(id)),
    getMatchById:     (s) => (id) => s.matches.find((m) => m.id === Number(id)),
    liveMatch:        (s) => s.matches.find((m) => m.status === 'live'),
    upcomingMatches:  (s) => s.matches.filter((m) => m.status === 'upcoming').sort((a, b) => new Date(a.date) - new Date(b.date)),
    completedMatches: (s) => s.matches.filter((m) => m.status === 'completed'),
    getPlayersByTeam: (s) => (teamId) => s.players.filter((p) => p.teamId === Number(teamId)),

    playerBattingAvg:  () => (stats) => calcAverage(stats.runs, stats.innings, stats.notOuts),
    playerBattingSR:   () => (stats) => calcSR(stats.runs, stats.balls),
    playerBowlEconomy: () => (stats) => calcEconomy(stats.runsConceded, stats.ballsBowled),
    playerBowlAvg:     () => (stats) => calcAvgBowl(stats.runsConceded, stats.wickets),

    currentBatsmen: (s) => (matchId) => {
      const m = s.matches.find((x) => x.id === matchId)
      return m ? m.battingOrder.filter((b) => b.status === 'batting') : []
    },
    currentStriker: (s) => (matchId) => {
      const m = s.matches.find((x) => x.id === matchId)
      if (!m) return null
      const batting = m.battingOrder.filter((b) => b.status === 'batting')
      return batting.find((b) => b.isStriker === true) || batting[0] || null
    },
    currentNonStriker: (s) => (matchId) => {
      const m = s.matches.find((x) => x.id === matchId)
      if (!m) return null
      const batting = m.battingOrder.filter((b) => b.status === 'batting')
      return batting.find((b) => b.isStriker !== true) || batting[1] || null
    },
    nextBatsmen: (s) => (matchId) => {
      const m = s.matches.find((x) => x.id === matchId)
      return m ? m.battingOrder.filter((b) => b.status === 'yet').slice(0, 3) : []
    },
    currentBowler: (s) => (matchId) => {
      const m = s.matches.find((x) => x.id === matchId)
      return m ? (m.bowlingCard.find((b) => b.status === 'current') || null) : null
    },
  },

  // ─── ACTIONS ─────────────────────────────────────────────────
  actions: {
    // ── Cloud sync ─────────────────────────────────────────────
    async initCloudSync() {
      if (!firebaseConfigured) return

      // 1. Pull latest data from cloud on startup
      const cloudData = await pullFromFirestore()
      if (cloudData) {
        _isSyncingFromCloud = true
        this.players      = cloudData.players      ?? this.players
        this.teams        = cloudData.teams        ?? this.teams
        this.matches      = cloudData.matches      ?? this.matches
        this.matchHistory = cloudData.matchHistory ?? this.matchHistory ?? []
        this.nextPlayerId = cloudData.nextPlayerId ?? this.nextPlayerId
        this.nextTeamId   = cloudData.nextTeamId   ?? this.nextTeamId
        this.nextMatchId  = cloudData.nextMatchId  ?? this.nextMatchId
        _isSyncingFromCloud = false
      }

      // 2. Subscribe to real-time updates (other devices)
      subscribeFirestore((data) => {
        _isSyncingFromCloud = true
        this.players      = data.players      ?? this.players
        this.teams        = data.teams        ?? this.teams
        this.matches      = data.matches      ?? this.matches
        this.matchHistory = data.matchHistory ?? this.matchHistory ?? []
        this.nextPlayerId = data.nextPlayerId ?? this.nextPlayerId
        this.nextTeamId   = data.nextTeamId   ?? this.nextTeamId
        this.nextMatchId  = data.nextMatchId  ?? this.nextMatchId
        _isSyncingFromCloud = false
      })
    },

    async _sync() {
      if (_isSyncingFromCloud) return
      await pushToFirestore({
        players:      this.players,
        teams:        this.teams,
        matches:      this.matches,
        matchHistory: this.matchHistory ?? [],
        nextPlayerId: this.nextPlayerId,
        nextTeamId:   this.nextTeamId,
        nextMatchId:  this.nextMatchId,
      })
    },

    // ─ Reset ───────────────────────────────────────────────────
    async resetToDemo() {
      const s = seedState()
      this.players      = s.players
      this.teams        = s.teams
      this.matches      = s.matches
      this.matchHistory = []
      this.nextPlayerId = s.nextPlayerId
      this.nextTeamId   = s.nextTeamId
      this.nextMatchId  = s.nextMatchId
      this.notifications = []
      this.addNotification('App reset to demo data.', 'info')
      await this._sync()
    },

    // ─ Fix existing match data (backward compat) ──────────────
    // Called on AdminPage mount to ensure isStriker and legalBalls
    // exist on matches created before those fields were added.
    fixMatchInit(matchId) {
      const match = this.matches.find((m) => m.id === matchId)
      if (!match) return
      const inning = match.innings?.[0]
      // Ensure innings has legalBalls + currentOverBalls
      if (inning) {
        if (inning.legalBalls === undefined) inning.legalBalls = Math.floor(inning.overs) * 6 + Math.round((inning.overs % 1) * 10)
        if (inning.currentOverBalls === undefined) inning.currentOverBalls = Math.round((inning.overs % 1) * 10)
      }
      // Ensure battingOrder entries have isStriker
      const batting = match.battingOrder.filter((b) => b.status === 'batting')
      const hasStriker = batting.some((b) => b.isStriker === true)
      if (!hasStriker && batting.length >= 1) {
        batting[0].isStriker = true
        if (batting.length >= 2) batting[1].isStriker = false
      }
      // Ensure battingOrder entries have legalBalls field
      if (!match.overTimeline?.length && inning?.overs > 0) {
        match.overTimeline = [{ over: Math.floor(inning.overs) + 1, runs: 0 }]
      }
    },

    // ─ Manual striker swap ─────────────────────────────────────
    async swapStriker(matchId) {
      const match = this.matches.find((m) => m.id === matchId)
      if (!match) return
      const batting = match.battingOrder.filter((b) => b.status === 'batting')
      if (batting.length < 2) return
      const s  = batting.find((b) => b.isStriker === true) || batting[0]
      const ns = batting.find((b) => b.isStriker !== true) || batting[1]
      s.isStriker  = false
      ns.isStriker = true
      this.addNotification(`Strike swapped → ${this.getPlayerById(ns.playerId)?.name} now facing`, 'info')
      await this._sync()
    },



    // ─ Team CRUD ───────────────────────────────────────────────
    async addTeam({ name, shortName, color, secondaryColor, venue, founded, description }) {
      this.teams.push({
        id: this.nextTeamId++,
        name, shortName,
        color: color || '#00d4ff',
        secondaryColor: secondaryColor || '#001a3a',
        captainId: null,
        founded: founded || 2024,
        venue: venue || 'TBD',
        description: description || '',
        stats: { matches: 0, won: 0, lost: 0, tied: 0, points: 0, nrr: '0.00' },
        titles: [],
        playerIds: [],
      })
      this.addNotification(`Team "${name}" created!`)
      await this._sync()
    },

    async updateTeam(teamId, updates) {
      const team = this.teams.find((t) => t.id === teamId)
      if (team) { Object.assign(team, updates); await this._sync() }
    },

    async deleteTeam(teamId) {
      const idx = this.teams.findIndex((t) => t.id === teamId)
      if (idx !== -1) {
        const name = this.teams[idx].name
        this.teams.splice(idx, 1)
        this.players.forEach((p) => { if (p.teamId === teamId) p.teamId = null })
        this.addNotification(`Team "${name}" deleted.`)
        await this._sync()
      }
    },

    async setCaptain(teamId, playerId) {
      const team = this.teams.find((t) => t.id === teamId)
      if (team) { team.captainId = playerId; this.addNotification('Captain updated.'); await this._sync() }
    },

    // ─ Player CRUD ─────────────────────────────────────────────
    async addPlayer({ name, nickname, role, teamId, number, age, nationality, battingStyle, bowlingStyle, description }) {
      const team = this.teams.find((t) => t.id === teamId)
      if (team && team.playerIds.length >= 15) {
        this.addNotification(`"${team.name}" already has 15 players.`, 'error')
        return false
      }
      const id = this.nextPlayerId++
      this.players.push({
        id, name,
        nickname: nickname || name,
        role: role || 'Batsman',
        teamId: teamId || null,
        number: number || 0,
        age: age || 18,
        nationality: nationality || 'Sri Lankan',
        battingStyle: battingStyle || 'Right-hand bat',
        bowlingStyle: bowlingStyle || 'None',
        description: description || '',
        achievements: [],
        stats: emptyStats(),
      })
      if (team) team.playerIds.push(id)
      this.addNotification(`Player "${name}" added!`)
      await this._sync()
      return id
    },

    async deletePlayer(playerId) {
      const idx = this.players.findIndex((p) => p.id === playerId)
      if (idx !== -1) {
        const { name, teamId } = this.players[idx]
        this.players.splice(idx, 1)
        const team = this.teams.find((t) => t.id === teamId)
        if (team) team.playerIds = team.playerIds.filter((id) => id !== playerId)
        this.addNotification(`Player "${name}" removed.`)
        await this._sync()
      }
    },

    // ─ Match CRUD ──────────────────────────────────────────────
    async createMatch({ teamAId, teamBId, date, time, venue, format, overs }) {
      // Helper to build a fresh batting order for a team
      const makeBattingOrder = (teamId) => {
        const players = this.players.filter((p) => p.teamId === Number(teamId))
        return players.map((p, i) => ({
          playerId: p.id, runs: 0, balls: 0, fours: 0, sixes: 0,
          status: i < 2 ? 'batting' : 'yet',
          dismissal: null,
          isStriker: i === 0,
        }))
      }

      const match = {
        id: this.nextMatchId++,
        teamAId: Number(teamAId),
        teamBId: Number(teamBId),
        date: date || new Date().toISOString().split('T')[0],
        time: time || '14:00',
        venue: venue || 'TBD',
        format: format || 'T20',
        overs: Number(overs) || 20,
        status: 'upcoming',
        result: null,
        createdAt: Date.now(),
        currentInning: 1,         // 1 = 1st innings, 2 = 2nd innings
        innings: [],
        battingOrderA: makeBattingOrder(teamAId),  // Team A's batting order (persistent)
        battingOrderB: makeBattingOrder(teamBId),  // Team B's batting order (persistent)
        battingOrder:  makeBattingOrder(teamAId),  // active batting order (changes per inning)
        bowlingCard: [],
        currentBowlerId: null,
        recentBalls: [],
        overTimeline: [],
      }
      this.matches.push(match)
      this.addNotification(`Match scheduled: ${this.getTeamById(teamAId)?.name} vs ${this.getTeamById(teamBId)?.name}`)
      await this._sync()
      return match.id
    },

    async startMatch(matchId) {
      const match = this.matches.find((m) => m.id === matchId)
      if (!match) return
      // End any other live match
      this.matches.forEach((m) => { if (m.status === 'live') m.status = 'completed' })
      match.status = 'live'
      match.currentInning = 1

      // Fresh copy of Team A's batting order for 1st innings
      const makeFreshOrder = (teamId) => {
        const players = this.players.filter((p) => p.teamId === teamId)
        return players.map((p, i) => ({
          playerId: p.id, runs: 0, balls: 0, fours: 0, sixes: 0,
          status: i < 2 ? 'batting' : 'yet',
          dismissal: null,
          isStriker: i === 0,
        }))
      }
      match.battingOrderA = makeFreshOrder(match.teamAId)
      match.battingOrderB = makeFreshOrder(match.teamBId)
      match.battingOrder  = match.battingOrderA.map((b) => ({ ...b }))

      match.innings = [{
        battingTeamId: match.teamAId,
        runs: 0, wickets: 0, overs: 0,
        legalBalls: 0, currentOverBalls: 0,
        target: null, fallOfWickets: [],
        inningsNum: 1,
      }]
      match.bowlingCard  = []
      match.recentBalls  = []
      match.overTimeline = [{ over: 1, runs: 0 }]

      // Increment match count for players in both teams
      const allMatchPlayers = [
        ...this.players.filter((p) => p.teamId === match.teamAId),
        ...this.players.filter((p) => p.teamId === match.teamBId),
      ]
      allMatchPlayers.forEach((p) => { p.stats.matches++ })


      this.addNotification(`🔴 LIVE: ${this.getTeamById(match.teamAId)?.name} vs ${this.getTeamById(match.teamBId)?.name}`, 'live')
      await this._sync()
    },

    async endMatch(matchId, result) {
      const match = this.matches.find((m) => m.id === matchId)
      if (!match) return

      // ── Finalise player batting stats ─────────────────────────
      match.battingOrder.forEach((entry) => {
        const player = this.players.find((p) => p.id === entry.playerId)
        if (!player || entry.status === 'yet') return

        if (entry.status === 'batting') {
          // Batsman not out at end of innings — count innings + notOut
          player.stats.innings++
          player.stats.notOuts++
        }
        // Update highScore correctly using this match's innings runs
        if (entry.runs > player.stats.highScore) {
          player.stats.highScore = entry.runs
        }
      })

      // ── Finalise bowling stats ────────────────────────────────
      match.bowlingCard.forEach((entry) => {
        const player = this.players.find((p) => p.id === entry.playerId)
        if (!player) return
        // Update best bowling figures if this was better
        if (entry.wickets > 0) {
          const [bW] = player.stats.bestFigures.split('/').map(Number)
          if (entry.wickets > bW) {
            player.stats.bestFigures = `${entry.wickets}/${entry.runs}`
          }
        }
      })

      // ── Update team stats ─────────────────────────────────────
      const teamA = this.teams.find((t) => t.id === match.teamAId)
      const teamB = this.teams.find((t) => t.id === match.teamBId)
      if (teamA) teamA.stats.matches++
      if (teamB) teamB.stats.matches++

      // Determine winner from result string (simple check)
      const resultLower = (result || '').toLowerCase()
      const teamAName   = (this.getTeamById(match.teamAId)?.name || '').toLowerCase()
      const teamBName   = (this.getTeamById(match.teamBId)?.name || '').toLowerCase()
      if (resultLower.includes(teamAName) && resultLower.includes('won')) {
        if (teamA) { teamA.stats.won++; teamA.stats.points += 2 }
        if (teamB) teamB.stats.lost++
      } else if (resultLower.includes(teamBName) && resultLower.includes('won')) {
        if (teamB) { teamB.stats.won++; teamB.stats.points += 2 }
        if (teamA) teamA.stats.lost++
      } else {
        // Tie
        if (teamA) { teamA.stats.tied++; teamA.stats.points += 1 }
        if (teamB) { teamB.stats.tied++; teamB.stats.points += 1 }
      }

      match.status = 'completed'
      match.result = result || 'Match completed'
      match.completedAt = Date.now()

      // ── Archive match to history ──────────────────────────────
      if (!this.matchHistory) this.matchHistory = []
      this.matchHistory.unshift({
        id: match.id,
        teamAId: match.teamAId, teamBId: match.teamBId,
        teamAName: this.getTeamById(match.teamAId)?.name,
        teamBName: this.getTeamById(match.teamBId)?.name,
        result: match.result,
        date: match.date,
        venue: match.venue,
        format: match.format,
        innings: match.innings,
        completedAt: match.completedAt,
      })

      this.addNotification(`Match ended: ${result || 'Complete'}`, 'info')
      await this._sync()
    },

    // ─ Start 2nd Innings ───────────────────────────────────────
    async startInnings2(matchId) {
      const match = this.matches.find((m) => m.id === matchId)
      if (!match || match.innings.length < 1) return

      const inn1 = match.innings[0]
      const target = inn1.runs + 1

      // Finalise 1st innings not-outs for batting team
      match.battingOrder.forEach((entry) => {
        const player = this.players.find((p) => p.id === entry.playerId)
        if (player && entry.status === 'batting') {
          player.stats.innings++
          player.stats.notOuts++
          if (entry.runs > player.stats.highScore) player.stats.highScore = entry.runs
        }
      })

      // Team B now bats — fresh batting order from battingOrderB
      const makeFreshOrder = (players) => players.map((p, i) => ({
        playerId: p.id, runs: 0, balls: 0, fours: 0, sixes: 0,
        status: i < 2 ? 'batting' : 'yet',
        dismissal: null,
        isStriker: i === 0,
      }))
      const teamBPlayers = this.players.filter((p) => p.teamId === match.teamBId)
      match.battingOrder = makeFreshOrder(teamBPlayers)
      match.bowlingCard  = []   // reset bowlers — Team A will now bowl
      match.currentBowlerId = null
      match.recentBalls  = []
      match.overTimeline = [{ over: 1, runs: 0 }]
      match.currentInning = 2

      match.innings.push({
        battingTeamId: match.teamBId,
        runs: 0, wickets: 0, overs: 0,
        legalBalls: 0, currentOverBalls: 0,
        target,
        fallOfWickets: [],
        inningsNum: 2,
      })

      this.addNotification(`2nd Innings started! 🎯 Target: ${target} runs`, 'live')
      await this._sync()
    },


    async deleteMatch(matchId) {
      const idx = this.matches.findIndex((m) => m.id === matchId)
      if (idx !== -1) {
        this.matches.splice(idx, 1)
        this.addNotification('Match deleted.', 'info')
        await this._sync()
      }
    },


    // ─ Delivery — Cricket Engine ───────────────────────────────
    async addDelivery({
      matchId,
      runs       = 0,    // runs off the bat
      extras     = 0,    // extra runs (penalty/wide/noball value)
      extraType  = null, // 'wide' | 'noball' | 'bye' | 'legbye' | null
      wicket     = false,
      dismissal  = '',
      comment    = '',
      nextBatsmanId = null,
    }) {
      const match = this.matches.find((m) => m.id === matchId)
      if (!match || !match.innings.length) return

      // Always use the LATEST inning (supports both 1st and 2nd innings)
      const inning = match.innings[match.innings.length - 1]

      // ── Over limit guard ───────────────────────────────────────────
      const maxOvers = match.overs || 20
      const completedOversNow = Math.floor((inning.legalBalls || 0) / 6)
      if (completedOversNow >= maxOvers) {
        this.addNotification(`⏹️ Innings closed — ${maxOvers} overs completed.`, 'info')
        return
      }


      // ── 1. Determine ball type ────────────────────────────────
      // isWide   = no bat contact, no ball count, no striker runs (extra run only)
      // isNoBall = no ball count, but batsman runs DO count
      // isBye/LB = ball counts, but runs go as extras (NOT to batsman)
      // isLegal  = counts toward the over
      const isWide   = extraType === 'wide'
      const isNoBall = extraType === 'noball'
      const isBye    = extraType === 'bye' || extraType === 'legbye'
      const isLegal  = !isWide && !isNoBall   // legal = wide/noball excluded

      // Runs the BATSMAN gets credit for (not byes, not wide extras)
      const batsmanRuns = (isWide || isBye) ? 0 : runs

      // Total runs added to the score
      const totalRuns = runs + extras
      inning.runs += totalRuns

      // ── 2. Ball label for display ─────────────────────────────
      let ballLabel
      if (wicket && isNoBall)   ballLabel = 'NBW'
      else if (wicket)          ballLabel = 'W'
      else if (isWide)          ballLabel = extras > 1 ? `Wd+${extras - 1}` : 'Wd'
      else if (isNoBall)        ballLabel = runs > 0 ? `NB+${runs}` : 'NB'
      else if (isBye)           ballLabel = extras > 0 ? `B${extras}` : '0'
      else                      ballLabel = String(runs)

      match.recentBalls.unshift(ballLabel)
      if (match.recentBalls.length > 36) match.recentBalls.pop()

      // ── 3. Identify striker and non-striker ───────────────────
      const battingNow = match.battingOrder.filter((b) => b.status === 'batting')
      const striker    = battingNow.find((b) => b.isStriker === true) || battingNow[0]

      // ── 4. Legal ball count + over tracking ───────────────────
      let overCompleted = false
      if (isLegal) {
        inning.legalBalls = (inning.legalBalls || 0) + 1
        inning.currentOverBalls = (inning.currentOverBalls || 0) + 1

        // Update over display (e.g. 3.4 means 3 complete overs + 4 balls)
        const completedOvers  = Math.floor(inning.legalBalls / 6)
        const ballsThisOver   = inning.legalBalls % 6
        inning.overs = completedOvers + ballsThisOver / 10

        // Add to current over's run tally in timeline
        if (match.overTimeline.length === 0) {
          match.overTimeline.push({ over: 1, runs: totalRuns })
        } else {
          match.overTimeline[match.overTimeline.length - 1].runs += totalRuns
        }

        // Check if this ball completes the over
        if (inning.currentOverBalls >= 6) {
          overCompleted = true
          inning.currentOverBalls = 0
          // Push a new over entry for next over
          const nextOver = completedOvers + 1
          match.overTimeline.push({ over: nextOver, runs: 0 })
        }
      } else {
        // Wide / no-ball: add runs to current over timeline but no ball count
        if (match.overTimeline.length > 0) {
          match.overTimeline[match.overTimeline.length - 1].runs += totalRuns
        }
      }

      // ── 5. Striker batting stats update ──────────────────────
      if (striker && !isWide && !isBye) {
        const prevRuns = striker.runs
        striker.runs  += batsmanRuns
        striker.balls += isLegal ? 1 : 0  // no ball doesn't add to faced count
        if (batsmanRuns === 4) striker.fours++
        if (batsmanRuns === 6) striker.sixes++

        // ── Career stats auto-save ────────────────────────────
        const strikerPlayer = this.players.find((p) => p.id === striker.playerId)
        if (strikerPlayer && batsmanRuns > 0) {
          strikerPlayer.stats.runs  += batsmanRuns
          strikerPlayer.stats.balls += isLegal ? 1 : 0
          if (batsmanRuns === 4) strikerPlayer.stats.fours++
          if (batsmanRuns === 6) strikerPlayer.stats.sixes++
          if (striker.runs > strikerPlayer.stats.highScore) {
            strikerPlayer.stats.highScore = striker.runs
          }
          // Milestones
          if (prevRuns < 50  && striker.runs >= 50)  strikerPlayer.stats.fifties++
          if (prevRuns < 100 && striker.runs >= 100) {
            strikerPlayer.stats.hundreds++
            if (strikerPlayer.stats.fifties > 0) strikerPlayer.stats.fifties--
          }
        } else if (strikerPlayer && isLegal) {
          strikerPlayer.stats.balls += 1  // dot ball — ball still faced
        }
      }

      // ── 6. Bowler stats update ────────────────────────────────
      const bowlerEntry = match.bowlingCard.find((b) => b.status === 'current')
      if (bowlerEntry) {
        bowlerEntry.runs += totalRuns
        if (wicket && !isWide) bowlerEntry.wickets++  // wide wickets don't credit bowler
        if (isLegal) {
          bowlerEntry.legalBalls = (bowlerEntry.legalBalls || 0) + 1
          const bOvers = Math.floor(bowlerEntry.legalBalls / 6)
          const bBalls = bowlerEntry.legalBalls % 6
          bowlerEntry.overs = bOvers + bBalls / 10
        }

        const bowlerPlayer = this.players.find((p) => p.id === bowlerEntry.playerId)
        if (bowlerPlayer) {
          bowlerPlayer.stats.runsConceded += totalRuns
          if (isLegal) bowlerPlayer.stats.ballsBowled += 1
          bowlerPlayer.stats.oversBowled = Math.floor(bowlerPlayer.stats.ballsBowled / 6)
          if (wicket && !isWide) bowlerPlayer.stats.wickets++
        }
      }

      // ── 7. Wicket handling ────────────────────────────────────
      if (wicket) {
        inning.wickets++
        if (striker) {
          striker.status    = 'out'
          striker.dismissal = dismissal || 'Out'
          striker.isStriker = false

          const outPlayer = this.players.find((p) => p.id === striker.playerId)
          if (outPlayer) outPlayer.stats.innings++

          if (!inning.fallOfWickets) inning.fallOfWickets = []
          inning.fallOfWickets.push({
            wicket: inning.wickets,
            runs: inning.runs,
            over: String(inning.overs),
            playerName: outPlayer?.name || '?',
            runs_scored: striker.runs,
          })

          // Bring next batsman in as new striker
          const incoming = nextBatsmanId
            ? match.battingOrder.find((b) => b.playerId === nextBatsmanId && b.status === 'yet')
            : match.battingOrder.find((b) => b.status === 'yet')
          if (incoming) {
            incoming.status   = 'batting'
            incoming.isStriker = true  // new batsman always faces first ball
          }
        }
      }

      // ── 8. Striker rotation (run-based) ──────────────────────
      // Cricket rule: after ODD runs scored, batsmen swap ends
      // ● Wides: NO rotation (batsmen don't run off wides in recreational play)
      // ● No-ball: rotate based on batsman's runs
      // ● Bye/Leg-bye: rotate based on bye extras
      // ● Legal + bat: rotate based on batsman runs
      if (!wicket) {
        let runsForRotation = 0
        if (isWide)        runsForRotation = 0           // never rotate on wide
        else if (isBye)    runsForRotation = extras      // rotate on bye count
        else               runsForRotation = batsmanRuns // rotate on bat runs

        const shouldSwapForRuns = runsForRotation % 2 === 1

        // End-of-over: batsmen ALWAYS change ends (new bowler, other end)
        // XOR: if runs already swapped them, end-of-over swaps back, net = they're at correct end
        const shouldSwapForOver = overCompleted

        // Apply rotation: if exactly one trigger fired (XOR), swap ends
        if (shouldSwapForRuns || shouldSwapForOver) {
          if (!shouldSwapForRuns || !shouldSwapForOver) {
            // Only one trigger fired → swap
            const newStriker = battingNow.find((b) => b.status === 'batting' && !b.isStriker)
            const newNon     = battingNow.find((b) => b.status === 'batting' && b.isStriker)
            if (newStriker && newNon) {
              newStriker.isStriker = true
              newNon.isStriker     = false
            }
          }
          // if both triggered: runs-swap + over-swap cancel each other → no change
        }
      } else if (overCompleted) {
        // Wicket on last ball of over → new batsman is already striker,
        // but they should swap for the over change
        const newBattingNow = match.battingOrder.filter((b) => b.status === 'batting')
        const s  = newBattingNow.find((b) => b.isStriker)
        const ns = newBattingNow.find((b) => !b.isStriker)
        if (s && ns) { s.isStriker = false; ns.isStriker = true }
      }

      // ── 9. Commentary notification ────────────────────────────
      const overStr  = String(inning.overs)
      const scoreStr = `${inning.runs}/${inning.wickets} (${overStr} ov)`
      const typeTag  = wicket ? 'wicket' : runs === 6 ? 'six' : runs === 4 ? 'four' : 'normal'
      this.notifications.unshift({
        id: Date.now(),
        type: typeTag,
        text: comment || `${ballLabel} · ${scoreStr}`,
        time: new Date().toLocaleTimeString(),
      })
      if (this.notifications.length > 80) this.notifications.pop()

      // Sync to cloud
      await this._sync()
    },


    async setCurrentBowler(matchId, playerId) {
      const match = this.matches.find((m) => m.id === matchId)
      if (!match) return
      match.bowlingCard.forEach((b) => { if (b.status === 'current') b.status = 'done' })
      let entry = match.bowlingCard.find((b) => b.playerId === playerId)
      if (!entry) {
        entry = { playerId, overs: 0, runs: 0, wickets: 0, maidens: 0, economy: 0, status: 'current' }
        match.bowlingCard.push(entry)
      } else {
        entry.status = 'current'
      }
      match.currentBowlerId = playerId
      await this._sync()
    },

    // ─ Notifications ───────────────────────────────────────────
    addNotification(text, type = 'info') {
      const id = Date.now()
      this.notifications.unshift({ id, text, type, time: new Date().toLocaleTimeString() })
      if (this.notifications.length > 80) this.notifications.pop()
      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        const idx = this.notifications.findIndex((n) => n.id === id)
        if (idx !== -1) this.notifications.splice(idx, 1)
      }, 4000)
    },
  },
})
