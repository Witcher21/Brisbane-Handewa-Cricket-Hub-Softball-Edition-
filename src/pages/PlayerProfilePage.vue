<template>
  <q-page class="dark-page">
    <div v-if="player" class="profile-wrap">
      <!-- BACK -->
      <router-link to="/players" class="back-btn">← Back to Players</router-link>

      <!-- ═══ HERO ════════════════════════════════════════════════════════ -->
      <div class="profile-hero">
        <div class="hero-av" :style="{ background: roleGrad(player.role) }">
          <span class="av-em">{{ roleEm(player.role) }}</span>
          <div class="av-num">#{{ player.number }}</div>
        </div>
        <div class="hero-info">
          <div class="profile-role-badge" :class="`r-${safeRole(player.role)}`">
            {{ player.role }}
          </div>
          <h1 class="profile-name">
            {{ player.name }} <span class="nick">"{{ player.nickname }}"</span>
          </h1>
          <div class="profile-meta-row">
            <span>🏏 {{ player.battingStyle }}</span>
            <span>⚾ {{ player.bowlingStyle }}</span>
            <span>🌍 {{ player.nationality }}</span>
            <span>🎂 Age {{ player.age }}</span>
          </div>
          <p class="profile-desc">{{ player.description }}</p>
          <div class="achievements-row">
            <span v-for="a in player.achievements" :key="a" class="ach-chip">🏆 {{ a }}</span>
          </div>
          <div class="team-line" v-if="playerTeam">
            Playing for: <strong>{{ playerTeam.name }}</strong>
            <span class="team-dot" :style="{ background: playerTeam.color }" />
          </div>
        </div>
      </div>

      <!-- ═══ CRICBUZZ-STYLE CAREER OVERVIEW TABS ════════════════════════ -->
      <div class="stats-section">
        <h2 class="sec-title">📊 Career Overview</h2>

        <!-- Tab selector -->
        <div class="career-tabs">
          <button
            v-for="tab in careerTabs"
            :key="tab.v"
            class="ct-btn"
            :class="{ 'ct-active': careerTab === tab.v }"
            @click="careerTab = tab.v"
          >
            {{ tab.icon }} {{ tab.l }}
          </button>
        </div>

        <!-- ── BATTING STATS TAB ────────────────────────────── -->
        <div v-show="careerTab === 'bat'" class="cricbuzz-card">
          <div class="cbz-header">
            <div class="cbz-team-badge" :style="{ background: playerTeam?.color || '#00d4ff' }">
              {{ playerTeam?.shortName || 'N/A' }}
            </div>
            <div class="cbz-player-name">{{ player.name }}</div>
            <div class="cbz-role-tag" :class="`r-${safeRole(player.role)}`">{{ player.role }}</div>
          </div>

          <!-- Cricbuzz-style stats table -->
          <div class="cbz-table-wrap">
            <table class="cbz-table">
              <thead>
                <tr>
                  <th>Mat</th>
                  <th>Inn</th>
                  <th>NO</th>
                  <th class="cbz-highlight">Runs</th>
                  <th>HS</th>
                  <th class="cbz-highlight">Avg</th>
                  <th>BF</th>
                  <th class="cbz-highlight">SR</th>
                  <th>100s</th>
                  <th>50s</th>
                  <th>4s</th>
                  <th>6s</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ s.matches }}</td>
                  <td>{{ s.innings }}</td>
                  <td>{{ s.notOuts }}</td>
                  <td class="cbz-highlight cbz-big">{{ s.runs }}</td>
                  <td class="cbz-gold">{{ s.highScore }}</td>
                  <td class="cbz-highlight cbz-big">{{ avg }}</td>
                  <td>{{ s.balls }}</td>
                  <td class="cbz-highlight">{{ sr }}</td>
                  <td class="cbz-green">{{ s.hundreds }}</td>
                  <td class="cbz-green">{{ s.fifties }}</td>
                  <td>{{ s.fours }}</td>
                  <td class="cbz-purple">{{ s.sixes }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Visual highlight bars -->
          <div class="cbz-bars">
            <div class="cbz-bar-item">
              <span class="cbz-bar-lbl">Runs</span>
              <div class="cbz-bar-track">
                <div
                  class="cbz-bar-fill cbz-bar-cyan"
                  :style="{ width: `${Math.min((s.runs / 2000) * 100, 100)}%` }"
                />
              </div>
              <span class="cbz-bar-val cyan">{{ s.runs }}</span>
            </div>
            <div class="cbz-bar-item">
              <span class="cbz-bar-lbl">Avg</span>
              <div class="cbz-bar-track">
                <div
                  class="cbz-bar-fill cbz-bar-blue"
                  :style="{ width: `${Math.min((parseFloat(avg) / 80) * 100, 100)}%` }"
                />
              </div>
              <span class="cbz-bar-val">{{ avg }}</span>
            </div>
            <div class="cbz-bar-item">
              <span class="cbz-bar-lbl">Strike Rate</span>
              <div class="cbz-bar-track">
                <div
                  class="cbz-bar-fill cbz-bar-purple"
                  :style="{ width: `${Math.min(parseFloat(sr), 100)}%` }"
                />
              </div>
              <span class="cbz-bar-val purple">{{ sr }}</span>
            </div>
            <div class="cbz-bar-item">
              <span class="cbz-bar-lbl">High Score</span>
              <div class="cbz-bar-track">
                <div
                  class="cbz-bar-fill cbz-bar-gold"
                  :style="{ width: `${Math.min((s.highScore / 200) * 100, 100)}%` }"
                />
              </div>
              <span class="cbz-bar-val gold">{{ s.highScore }}</span>
            </div>
          </div>

          <!-- Milestone badges -->
          <div class="cbz-milestones">
            <div class="cbz-milestone" v-if="s.hundreds > 0">
              <span class="cm-num gold">{{ s.hundreds }}</span>
              <span class="cm-lbl">Centuries</span>
            </div>
            <div class="cbz-milestone">
              <span class="cm-num green">{{ s.fifties }}</span>
              <span class="cm-lbl">Half Centuries</span>
            </div>
            <div class="cbz-milestone">
              <span class="cm-num red">{{ s.sixes }}</span>
              <span class="cm-lbl">Sixes Hit</span>
            </div>
            <div class="cbz-milestone">
              <span class="cm-num">{{ s.fours }}</span>
              <span class="cm-lbl">Fours Hit</span>
            </div>
          </div>
        </div>

        <!-- ── BOWLING STATS TAB ────────────────────────────── -->
        <div v-show="careerTab === 'bowl'" class="cricbuzz-card">
          <div class="cbz-header">
            <div class="cbz-team-badge" :style="{ background: playerTeam?.color || '#ff3d57' }">
              {{ playerTeam?.shortName || 'N/A' }}
            </div>
            <div class="cbz-player-name">{{ player.name }}</div>
            <div class="cbz-role-tag" :class="`r-${safeRole(player.role)}`">{{ player.role }}</div>
          </div>

          <div class="cbz-table-wrap">
            <table class="cbz-table">
              <thead>
                <tr>
                  <th>Mat</th>
                  <th>Inn</th>
                  <th>Ovs</th>
                  <th>Mdns</th>
                  <th>Runs</th>
                  <th class="cbz-highlight">Wkts</th>
                  <th class="cbz-highlight">Avg</th>
                  <th class="cbz-highlight">Eco</th>
                  <th>SR</th>
                  <th>BBI</th>
                  <th>5W</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ s.matches }}</td>
                  <td>{{ s.innings }}</td>
                  <td>{{ s.oversBowled }}</td>
                  <td>{{ s.maidens }}</td>
                  <td>{{ s.runsConceded }}</td>
                  <td class="cbz-highlight cbz-big red">{{ s.wickets }}</td>
                  <td class="cbz-highlight cbz-big">{{ bowlAvg }}</td>
                  <td class="cbz-highlight cbz-big green">{{ economy }}</td>
                  <td>{{ bowlingSR }}</td>
                  <td class="cbz-purple">{{ s.bestFigures }}</td>
                  <td>{{ s.fiveWickets || 0 }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Visual bars -->
          <div class="cbz-bars">
            <div class="cbz-bar-item">
              <span class="cbz-bar-lbl">Wickets</span>
              <div class="cbz-bar-track">
                <div
                  class="cbz-bar-fill cbz-bar-red"
                  :style="{ width: `${Math.min((s.wickets / 100) * 100, 100)}%` }"
                />
              </div>
              <span class="cbz-bar-val red">{{ s.wickets }}</span>
            </div>
            <div class="cbz-bar-item">
              <span class="cbz-bar-lbl">Economy</span>
              <div class="cbz-bar-track">
                <div
                  class="cbz-bar-fill cbz-bar-green"
                  :style="{
                    width: `${Math.max(0, Math.min(((12 - parseFloat(economy)) / 12) * 100, 100))}%`,
                  }"
                />
              </div>
              <span class="cbz-bar-val green">{{ economy }}</span>
            </div>
            <div class="cbz-bar-item">
              <span class="cbz-bar-lbl">Bowling Avg</span>
              <div class="cbz-bar-track">
                <div
                  class="cbz-bar-fill cbz-bar-blue"
                  :style="{
                    width: `${Math.max(0, Math.min(((50 - parseFloat(bowlAvg)) / 50) * 100, 100))}%`,
                  }"
                />
              </div>
              <span class="cbz-bar-val">{{ bowlAvg }}</span>
            </div>
            <div class="cbz-bar-item">
              <span class="cbz-bar-lbl">Overs Bowled</span>
              <div class="cbz-bar-track">
                <div
                  class="cbz-bar-fill cbz-bar-purple"
                  :style="{ width: `${Math.min((s.oversBowled / 200) * 100, 100)}%` }"
                />
              </div>
              <span class="cbz-bar-val purple">{{ s.oversBowled }}</span>
            </div>
          </div>

          <!-- Bowling milestones -->
          <div class="cbz-milestones">
            <div class="cbz-milestone">
              <span class="cm-num red">{{ s.wickets }}</span>
              <span class="cm-lbl">Total Wickets</span>
            </div>
            <div class="cbz-milestone">
              <span class="cm-num purple">{{ s.bestFigures }}</span>
              <span class="cm-lbl">Best Figures</span>
            </div>
            <div class="cbz-milestone">
              <span class="cm-num">{{ s.maidens }}</span>
              <span class="cm-lbl">Maiden Overs</span>
            </div>
            <div class="cbz-milestone">
              <span class="cm-num cyan">{{ s.oversBowled }}</span>
              <span class="cm-lbl">Overs Bowled</span>
            </div>
          </div>
        </div>

        <!-- ── FIELDING / OVERVIEW TAB ─────────────────────── -->
        <div v-show="careerTab === 'field'" class="cricbuzz-card">
          <!-- Summary grid for ALL roles -->
          <div class="overview-grid">
            <div class="ovg-item">
              <span class="ovg-val">{{ s.matches }}</span>
              <span class="ovg-lbl">Matches</span>
            </div>
            <div class="ovg-item cyan">
              <span class="ovg-val cyan">{{ s.runs }}</span>
              <span class="ovg-lbl">Runs scored</span>
            </div>
            <div class="ovg-item red">
              <span class="ovg-val red">{{ s.wickets }}</span>
              <span class="ovg-lbl">Wickets taken</span>
            </div>
            <div class="ovg-item gold">
              <span class="ovg-val gold">{{ s.highScore }}</span>
              <span class="ovg-lbl">Best Score</span>
            </div>
            <div class="ovg-item green">
              <span class="ovg-val green">{{ s.catches }}</span>
              <span class="ovg-lbl">Catches</span>
            </div>
            <div class="ovg-item green" v-if="player.role === 'Wicket-keeper'">
              <span class="ovg-val green">{{ s.stumpings }}</span>
              <span class="ovg-lbl">Stumpings</span>
            </div>
            <div class="ovg-item">
              <span class="ovg-val">{{ s.runOuts || 0 }}</span>
              <span class="ovg-lbl">Run Outs</span>
            </div>
            <div class="ovg-item purple">
              <span class="ovg-val purple">{{ s.sixes }}</span>
              <span class="ovg-lbl">Sixes hit</span>
            </div>
            <div class="ovg-item">
              <span class="ovg-val">{{ s.fours }}</span>
              <span class="ovg-lbl">Fours hit</span>
            </div>
            <div class="ovg-item">
              <span class="ovg-val">{{ s.fifties }}</span>
              <span class="ovg-lbl">Fifties</span>
            </div>
            <div class="ovg-item gold">
              <span class="ovg-val gold">{{ s.hundreds }}</span>
              <span class="ovg-lbl">Centuries</span>
            </div>
            <div class="ovg-item">
              <span class="ovg-val">{{ s.bestFigures }}</span>
              <span class="ovg-lbl">Best bowling</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ CURRENT MATCH PERFORMANCE ══════════════════════════════════ -->
      <div class="stats-section" v-if="currentMatchEntry">
        <h2 class="sec-title">📡 Current Match Performance</h2>
        <div class="live-perf-card">
          <div class="lpc-left">
            <div class="lpc-score">
              <span class="lpc-runs">{{ currentMatchEntry.runs }}</span>
              <span class="lpc-balls">({{ currentMatchEntry.balls }})</span>
            </div>
            <div class="lpc-detail">
              {{ currentMatchEntry.fours }}×4 · {{ currentMatchEntry.sixes }}×6 · SR
              {{
                currentMatchEntry.balls > 0
                  ? ((currentMatchEntry.runs / currentMatchEntry.balls) * 100).toFixed(1)
                  : '0.0'
              }}
            </div>
            <div class="lpc-status" :class="`st-${currentMatchEntry.status}`">
              {{
                currentMatchEntry.status === 'batting'
                  ? '🏏 Currently Batting'
                  : currentMatchEntry.status === 'out'
                    ? '❌ ' + currentMatchEntry.dismissal
                    : '⏳ Yet to bat'
              }}
            </div>
          </div>
          <div class="lpc-right" v-if="currentBowlingEntry">
            <div class="lpc-bowl-title">🎯 Bowling this match</div>
            <div class="lpc-bowl-fig">
              {{ currentBowlingEntry.overs }}-{{ currentBowlingEntry.maidens }}-{{
                currentBowlingEntry.runs
              }}-{{ currentBowlingEntry.wickets }}
            </div>
            <div class="lpc-bowl-eco">
              Eco: {{ liveEconomy || calcEco(currentBowlingEntry.runs, currentBowlingEntry.overs) }}
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ RECENT MATCHES ══════════════════════════════════════════════ -->
      <div class="stats-section" v-if="recentMatches.length">
        <h2 class="sec-title">🗓️ Recent Match Performances</h2>
        <div class="recent-matches-list">
          <div v-for="rm in recentMatches" :key="rm.matchId" class="rm-card">
            <div class="rm-header">
              <span class="rm-date">{{ formatDate(rm.date) }}</span>
              <span class="rm-vs">vs {{ rm.opponent }}</span>
              <span class="rm-venue">{{ rm.venue }}</span>
              <span class="rm-result" :class="rm.won ? 'rm-won' : 'rm-lost'">{{ rm.result }}</span>
            </div>
            <div class="rm-stats">
              <div class="rm-bat" v-if="rm.batting && rm.batting.status !== 'yet'">
                <span class="rm-stat-lbl">BAT</span>
                <span class="rm-runs" :class="{ 'rm-milestone': rm.batting.runs >= 50 }">{{
                  rm.batting.runs
                }}</span>
                <span class="rm-balls">({{ rm.batting.balls }})</span>
                <span class="rm-extras">{{ rm.batting.fours }}×4 · {{ rm.batting.sixes }}×6</span>
                <span class="rm-dismissal" v-if="rm.batting.status === 'out'">{{
                  rm.batting.dismissal
                }}</span>
                <span class="rm-notout" v-else>not out</span>
              </div>
              <div class="rm-bowl" v-if="rm.bowling && rm.bowling.overs > 0">
                <span class="rm-stat-lbl">BOWL</span>
                <span class="rm-wkts">{{ rm.bowling.wickets }}/{{ rm.bowling.runs }}</span>
                <span class="rm-overs">({{ rm.bowling.overs }} ov)</span>
                <span class="rm-eco">Eco: {{ calcEco(rm.bowling.runs, rm.bowling.overs) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NOT FOUND -->
    <div v-else class="not-found">
      <div style="font-size: 80px">🏏</div>
      <h2>Player Not Found</h2>
      <router-link to="/players" class="back-btn">← Back to Players</router-link>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCricketStore } from 'stores/cricket-store'

const route = useRoute()
const store = useCricketStore()
const player = computed(() => store.getPlayerById(route.params.id))
const playerTeam = computed(() => (player.value ? store.getTeamById(player.value.teamId) : null))
// ✅ s is fully reactive — updates live on every ball via Pinia
const s = computed(() => player.value?.stats || {})

// Career tab — show all stats, default to overview
const careerTab = ref('field')
const careerTabs = [
  { v: 'field', l: 'Overview', icon: '🏅' },
  { v: 'bat', l: 'Batting', icon: '🏏' },
  { v: 'bowl', l: 'Bowling', icon: '⚾' },
]

// Computed career stats (all reactive, update ball-by-ball)
const avg = computed(() => store.playerBattingAvg(s.value))
const sr = computed(() => store.playerBattingSR(s.value))
const economy = computed(() => s.value?.economy || store.playerBowlEconomy(s.value))
const bowlAvg = computed(() => store.playerBowlAvg(s.value))
const bowlingSR = computed(() => {
  const balls = s.value?.ballsBowled || 0
  const wkts = s.value?.wickets || 0
  return wkts > 0 ? (balls / wkts).toFixed(1) : '-'
})

// ✅ Live match batting performance — reads from liveMatch.battingOrder (real-time)
const currentMatchEntry = computed(() => {
  const lm = store.liveMatch
  if (!lm || !player.value) return null
  return lm.battingOrder.find((b) => b.playerId === player.value.id) || null
})

// ✅ Live match bowling performance — reads from liveMatch.bowlingCard (real-time)
const currentBowlingEntry = computed(() => {
  const lm = store.liveMatch
  if (!lm || !player.value) return null
  return lm.bowlingCard.find((b) => b.playerId === player.value.id) || null
})

// Live economy from current spell
const liveEconomy = computed(() => {
  const be = currentBowlingEntry.value
  if (!be) return null
  return be.economy || (be.legalBalls > 0 ? ((be.runs / be.legalBalls) * 6).toFixed(2) : '0.00')
})

// Recent matches
const recentMatches = computed(() => {
  if (!player.value) return []
  const pid = player.value.id
  const results = []
  const allMatches = [
    ...store.matches.filter((m) => m.status === 'completed'),
    ...(store.matchHistory || []),
  ]
  const seen = new Set()
  allMatches.forEach((m) => {
    if (seen.has(m.id)) return
    seen.add(m.id)
    // Check both innings batting orders
    const batting =
      m.battingOrderA?.find((b) => b.playerId === pid) ||
      m.battingOrderB?.find((b) => b.playerId === pid) ||
      m.battingOrder?.find((b) => b.playerId === pid)
    // Check both innings bowling cards
    const bowling =
      m.bowlingCardInn1?.find((b) => b.playerId === pid) ||
      m.bowlingCardInn2?.find((b) => b.playerId === pid) ||
      m.bowlingCard?.find((b) => b.playerId === pid)
    if (!batting && !bowling) return
    const isTeamA = m.teamAId === player.value?.teamId
    const opponentId = isTeamA ? m.teamBId : m.teamAId
    const resultLower = (m.result || '').toLowerCase()
    const myTeamName = (store.getTeamById(player.value?.teamId)?.name || '').toLowerCase()
    const won = resultLower.includes(myTeamName) && resultLower.includes('won')
    results.push({
      matchId: m.id,
      date: m.date,
      opponent: store.getTeamById(opponentId)?.name || 'Unknown',
      venue: m.venue,
      result: m.result || 'Completed',
      won,
      batting,
      bowling,
    })
  })
  return results.reverse().slice(0, 10)
})

function calcEco(r, o) {
  return o > 0 ? (r / o).toFixed(2) : '0.00'
}
function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return d || ''
  }
}
function safeRole(r) {
  return (r || '').toLowerCase().replace(/[^a-z]/g, '')
}
function roleGrad(r) {
  return (
    {
      Batsman: '#00d4ff15',
      Bowler: '#ff3d5715',
      'All-rounder': '#a855f715',
      'Wicket-keeper': '#22c55e15',
    }[r] || '#ffffff10'
  )
}
function roleEm(r) {
  return { Batsman: '🏏', Bowler: '⚾', 'All-rounder': '⚡', 'Wicket-keeper': '🧤' }[r] || '🏏'
}
</script>

<style scoped>
.dark-page {
  background: transparent;
  min-height: 100vh;
}
.profile-wrap {
  max-width: 1000px;
  margin: 0 auto;
  padding: 36px 32px 80px;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 28px;
  transition: color 0.2s;
}
.back-btn:hover {
  color: #00d4ff;
}

/* ══ HERO ════════════════════════════════════════════ */
.profile-hero {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  margin-bottom: 44px;
  flex-wrap: wrap;
}
.hero-av {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  position: relative;
}
.av-num {
  position: absolute;
  bottom: -10px;
  right: -10px;
  background: #030b18;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 7px;
}
.hero-info {
  flex: 1;
  min-width: 200px;
}
.profile-role-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 3px 11px;
  border-radius: 6px;
  margin-bottom: 10px;
  text-transform: uppercase;
}
.r-batsman {
  background: rgba(0, 212, 255, 0.12);
  color: #00d4ff;
}
.r-bowler {
  background: rgba(255, 61, 87, 0.12);
  color: #ff3d57;
}
.r-allrounder {
  background: rgba(168, 85, 247, 0.12);
  color: #a855f7;
}
.r-wicketkeeper {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}
.profile-name {
  font-size: clamp(22px, 4vw, 38px);
  font-weight: 900;
  color: #fff;
  letter-spacing: -1px;
  margin: 0 0 10px;
  line-height: 1.1;
}
.nick {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 400;
}
.profile-meta-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.profile-meta-row span {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 600;
}
.profile-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.7;
  margin: 0 0 14px;
  max-width: 550px;
}
.achievements-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.ach-chip {
  padding: 5px 12px;
  background: rgba(255, 215, 0, 0.08);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 20px;
  font-size: 11px;
  color: #ffd700;
  font-weight: 600;
}
.team-line {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  gap: 8px;
}
.team-line strong {
  color: #fff;
}
.team-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ══ CAREER SECTION ══════════════════════════════════ */
.stats-section {
  margin-bottom: 36px;
}
.sec-title {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 18px;
}

/* Career tabs */
.career-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.ct-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid rgba(255, 255, 255, 0.09);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.ct-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.ct-active {
  background: rgba(0, 212, 255, 0.1) !important;
  border-color: rgba(0, 212, 255, 0.3) !important;
  color: #00d4ff !important;
}

/* Cricbuzz-style card */
.cricbuzz-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 24px;
  overflow: hidden;
}

/* Header row */
.cbz-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}
.cbz-team-badge {
  padding: 7px 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 900;
  color: #fff;
}
.cbz-player-name {
  flex: 1;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}
.cbz-role-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 3px 10px;
  border-radius: 6px;
  text-transform: uppercase;
}

/* Cricbuzz table */
.cbz-table-wrap {
  overflow-x: auto;
  margin-bottom: 24px;
}
.cbz-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 540px;
}
.cbz-table thead tr {
  background: rgba(255, 255, 255, 0.04);
}
.cbz-table th {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 10px 12px;
  text-align: center;
  white-space: nowrap;
}
.cbz-table td {
  font-size: 15px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  padding: 14px 12px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}
.cbz-highlight {
  background: rgba(0, 212, 255, 0.04) !important;
}
.cbz-big {
  font-size: 22px !important;
  font-weight: 900 !important;
  color: #fff !important;
}
.cbz-gold {
  color: #ffd700 !important;
}
.cbz-green {
  color: #22c55e !important;
}
.cbz-purple {
  color: #a855f7 !important;
}
.red {
  color: #ff3d57 !important;
}
.green {
  color: #22c55e !important;
}
.cyan {
  color: #00d4ff !important;
}
.gold {
  color: #ffd700 !important;
}
.purple {
  color: #a855f7 !important;
}

/* Bar chart rows */
.cbz-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.cbz-bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cbz-bar-lbl {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
  width: 100px;
  flex-shrink: 0;
}
.cbz-bar-track {
  flex: 1;
  height: 7px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
}
.cbz-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.cbz-bar-val {
  font-size: 14px;
  font-weight: 800;
  min-width: 56px;
  text-align: right;
}
.cbz-bar-cyan {
  background: linear-gradient(90deg, #00d4ff, #0088cc);
}
.cbz-bar-blue {
  background: linear-gradient(90deg, #4488ff, #0044bb);
}
.cbz-bar-purple {
  background: linear-gradient(90deg, #a855f7, #7722cc);
}
.cbz-bar-gold {
  background: linear-gradient(90deg, #ffd700, #cc9900);
}
.cbz-bar-red {
  background: linear-gradient(90deg, #ff3d57, #cc1133);
}
.cbz-bar-green {
  background: linear-gradient(90deg, #22c55e, #118833);
}

/* Milestone badges */
.cbz-milestones {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.cbz-milestone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 14px 20px;
  flex: 1;
  min-width: 90px;
}
.cm-num {
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  line-height: 1;
}
.cm-lbl {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 700;
  letter-spacing: 1px;
  text-align: center;
}

/* Overview grid */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}
.ovg-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 18px 12px;
  transition: all 0.2s;
  text-align: center;
}
.ovg-item:hover {
  border-color: rgba(0, 212, 255, 0.15);
  transform: translateY(-2px);
}
.ovg-val {
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  line-height: 1;
}
.ovg-lbl {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

/* Live Perf */
.live-perf-card {
  background: rgba(0, 212, 255, 0.04);
  border: 1px solid rgba(0, 212, 255, 0.15);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}
.lpc-left {
  flex: 1;
}
.lpc-score {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}
.lpc-runs {
  font-size: 52px;
  font-weight: 900;
  color: #00d4ff;
  line-height: 1;
}
.lpc-balls {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.3);
}
.lpc-detail {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 8px;
}
.lpc-status {
  font-size: 12px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 8px;
  width: fit-content;
}
.st-batting {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
}
.st-out {
  background: rgba(255, 61, 87, 0.08);
  color: #ff3d57;
}
.st-yet {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.4);
}
.lpc-right {
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  padding-left: 32px;
  min-width: 160px;
}
.lpc-bowl-title {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.lpc-bowl-fig {
  font-size: 32px;
  font-weight: 900;
  color: #ff3d57;
  line-height: 1;
  letter-spacing: -1px;
}
.lpc-bowl-eco {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
}

/* Recent Matches */
.recent-matches-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.rm-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 16px 20px;
  transition: all 0.2s;
}
.rm-card:hover {
  border-color: rgba(0, 212, 255, 0.12);
  transform: translateY(-1px);
}
.rm-header {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.rm-date {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
}
.rm-vs {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
}
.rm-venue {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.25);
}
.rm-result {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  margin-left: auto;
}
.rm-won {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}
.rm-lost {
  background: rgba(255, 61, 87, 0.08);
  color: #ff3d57;
  border: 1px solid rgba(255, 61, 87, 0.18);
}
.rm-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.rm-bat,
.rm-bowl {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.rm-stat-lbl {
  font-size: 8px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: 1.5px;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
}
.rm-runs {
  font-size: 22px;
  font-weight: 900;
  color: #00d4ff;
  line-height: 1;
}
.rm-milestone {
  color: #ffd700 !important;
}
.rm-balls {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
}
.rm-extras {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}
.rm-dismissal {
  font-size: 11px;
  color: #ff3d57;
  font-weight: 600;
}
.rm-notout {
  font-size: 11px;
  color: #22c55e;
  font-weight: 700;
}
.rm-wkts {
  font-size: 22px;
  font-weight: 900;
  color: #ff3d57;
  line-height: 1;
}
.rm-overs {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}
.rm-eco {
  font-size: 11px;
  color: #a855f7;
  font-weight: 600;
}

/* Not Found */
.not-found {
  text-align: center;
  padding: 120px 20px;
}
.not-found h2 {
  font-size: 28px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.5);
  margin: 16px 0 24px;
}
</style>
