<template>
  <q-page class="dark-page">
    <div v-if="player" class="profile-wrap">
      <!-- BACK -->
      <router-link to="/players" class="back-btn">← Back to Players</router-link>

      <!-- HERO -->
      <div class="profile-hero">
        <div class="hero-av" :style="{ background: roleGrad(player.role) }">
          <span class="av-em">{{ roleEm(player.role) }}</span>
          <div class="av-num">#{{ player.number }}</div>
        </div>
        <div class="hero-info">
          <div class="profile-role-badge" :class="`r-${safeRole(player.role)}`">{{ player.role }}</div>
          <h1 class="profile-name">{{ player.name }} <span class="nick">"{{ player.nickname }}"</span></h1>
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

      <!-- CAREER KEY STATS -->
      <div class="stats-section">
        <h2 class="sec-title">📊 Career Overview</h2>
        <div class="key-stats-grid">
          <div class="ks-card">
            <div class="ks-val">{{ player.stats.matches }}</div>
            <div class="ks-lbl">Matches</div>
          </div>
          <div class="ks-card" v-if="isBatter">
            <div class="ks-val cyan">{{ player.stats.runs }}</div>
            <div class="ks-lbl">Runs</div>
          </div>
          <div class="ks-card" v-if="isBatter">
            <div class="ks-val cyan">{{ avg }}</div>
            <div class="ks-lbl">Average</div>
          </div>
          <div class="ks-card" v-if="isBatter">
            <div class="ks-val">{{ sr }}</div>
            <div class="ks-lbl">Strike Rate</div>
          </div>
          <div class="ks-card" v-if="isBatter">
            <div class="ks-val gold">{{ player.stats.highScore }}</div>
            <div class="ks-lbl">High Score</div>
          </div>
          <div class="ks-card" v-if="isBowler">
            <div class="ks-val red">{{ player.stats.wickets }}</div>
            <div class="ks-lbl">Wickets</div>
          </div>
          <div class="ks-card" v-if="isBowler">
            <div class="ks-val">{{ economy }}</div>
            <div class="ks-lbl">Economy</div>
          </div>
          <div class="ks-card" v-if="isBowler">
            <div class="ks-val">{{ bowlAvg }}</div>
            <div class="ks-lbl">Bowl Avg</div>
          </div>
          <div class="ks-card" v-if="isBowler && player.stats.bestFigures !== '0/0'">
            <div class="ks-val purple">{{ player.stats.bestFigures }}</div>
            <div class="ks-lbl">Best Figures</div>
          </div>
          <div class="ks-card">
            <div class="ks-val green">{{ player.stats.catches }}</div>
            <div class="ks-lbl">Catches</div>
          </div>
          <div class="ks-card" v-if="player.role === 'Wicket-keeper' && player.stats.stumpings">
            <div class="ks-val green">{{ player.stats.stumpings }}</div>
            <div class="ks-lbl">Stumpings</div>
          </div>
        </div>
      </div>

      <div class="profile-cols">
        <!-- BATTING BREAKDOWN -->
        <div v-if="isBatter" class="breakdown-card">
          <h3 class="bc-title">🏏 Batting Breakdown</h3>
          <div class="bd-table">
            <div class="bd-row" v-for="row in battingRows" :key="row.l">
              <span class="bd-lbl">{{ row.l }}</span>
              <div v-if="row.bar" class="bd-bar-wrap">
                <div class="bd-bar" :style="{ width: `${row.pct}%`, background: row.color }" />
              </div>
              <span class="bd-val" :style="{ color: row.color || 'white' }">{{ row.v }}</span>
            </div>
          </div>
        </div>

        <!-- BOWLING BREAKDOWN -->
        <div v-if="isBowler" class="breakdown-card">
          <h3 class="bc-title">⚾ Bowling Breakdown</h3>
          <div class="bd-table">
            <div class="bd-row" v-for="row in bowlingRows" :key="row.l">
              <span class="bd-lbl">{{ row.l }}</span>
              <div v-if="row.bar" class="bd-bar-wrap">
                <div class="bd-bar" :style="{ width: `${row.pct}%`, background: row.color }" />
              </div>
              <span class="bd-val" :style="{ color: row.color || 'white' }">{{ row.v }}</span>
            </div>
          </div>
        </div>

        <!-- MATCH PERFORMANCE (auto-saved live stats) -->
        <div class="breakdown-card">
          <h3 class="bc-title">📡 Current Match Performance</h3>
          <div v-if="currentMatchEntry">
            <div class="live-perf-card">
              <div class="lpc-score">
                <span class="lpc-runs">{{ currentMatchEntry.runs }}</span>
                <span class="lpc-balls">({{ currentMatchEntry.balls }})</span>
              </div>
              <div class="lpc-detail">
                {{ currentMatchEntry.fours }}×4 · {{ currentMatchEntry.sixes }}×6 ·
                SR {{ currentMatchEntry.balls > 0 ? ((currentMatchEntry.runs / currentMatchEntry.balls) * 100).toFixed(1) : '0.0' }}
              </div>
              <div class="lpc-status" :class="`st-${currentMatchEntry.status}`">
                {{ currentMatchEntry.status === 'batting' ? '🏏 Currently Batting' : currentMatchEntry.status === 'out' ? '❌ ' + currentMatchEntry.dismissal : '⏳ Yet to bat' }}
              </div>
            </div>
          </div>
          <div v-else class="no-perf">No active match data for this player.</div>

          <!-- Fielding stats -->
          <div class="field-stats">
            <h4 class="field-title">🧤 Fielding Career</h4>
            <div class="field-row">
              <div class="field-item"><span>{{ player.stats.catches }}</span> Catches</div>
              <div v-if="player.stats.stumpings" class="field-item"><span>{{ player.stats.stumpings }}</span> Stumpings</div>
              <div v-if="player.stats.runOuts" class="field-item"><span>{{ player.stats.runOuts }}</span> Run Outs</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── RECENT MATCHES ──────────────────────────────────── -->
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
                <span class="rm-runs" :class="{ 'rm-milestone': rm.batting.runs >= 50 }">{{ rm.batting.runs }}</span>
                <span class="rm-balls">({{ rm.batting.balls }})</span>
                <span class="rm-extras">{{ rm.batting.fours }}×4 · {{ rm.batting.sixes }}×6</span>
                <span class="rm-dismissal" v-if="rm.batting.status === 'out'">{{ rm.batting.dismissal }}</span>
                <span class="rm-notout" v-else>not out</span>
              </div>
              <div class="rm-bowl" v-if="rm.bowling && rm.bowling.wickets > 0">
                <span class="rm-stat-lbl">BOWL</span>
                <span class="rm-wkts">{{ rm.bowling.wickets }}/{{ rm.bowling.runs }}</span>
                <span class="rm-overs">({{ rm.bowling.overs }} ov)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NOT FOUND -->
    <div v-else class="not-found">
      <div style="font-size:80px">🏏</div>
      <h2>Player Not Found</h2>
      <router-link to="/players" class="back-btn">← Back to Players</router-link>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCricketStore } from 'stores/cricket-store'

const route  = useRoute()
const store  = useCricketStore()
const player = computed(() => store.getPlayerById(route.params.id))
const playerTeam = computed(() => player.value ? store.getTeamById(player.value.teamId) : null)

const isBatter = computed(() => player.value && player.value.role !== 'Bowler')
const isBowler = computed(() => player.value && (player.value.role === 'Bowler' || player.value.role === 'All-rounder'))

const avg      = computed(() => store.playerBattingAvg(player.value?.stats || {}))
const sr       = computed(() => store.playerBattingSR(player.value?.stats || {}))
const economy  = computed(() => store.playerBowlEconomy(player.value?.stats || {}))
const bowlAvg  = computed(() => store.playerBowlAvg(player.value?.stats || {}))

// Current match entry for this player
const currentMatchEntry = computed(() => {
  const lm = store.liveMatch
  if (!lm || !player.value) return null
  return lm.battingOrder.find((b) => b.playerId === player.value.id) || null
})

const battingRows = computed(() => {
  if (!player.value) return []
  const s = player.value.stats
  const maxRuns = 3000
  return [
    { l: 'Innings',     v: s.innings,  bar: false },
    { l: 'Runs',        v: s.runs,     bar: true,  pct: Math.min((s.runs / maxRuns) * 100, 100),  color: '#00d4ff' },
    { l: 'Average',     v: avg.value,  bar: false, color: '#00d4ff' },
    { l: 'Strike Rate', v: sr.value,   bar: true,  pct: Math.min(parseFloat(sr.value), 100), color: '#a855f7' },
    { l: 'High Score',  v: s.highScore,bar: true,  pct: Math.min((s.highScore / 150) * 100, 100), color: '#ffd700' },
    { l: 'Fifties',     v: s.fifties,  bar: false, color: '#22c55e' },
    { l: 'Hundreds',    v: s.hundreds, bar: false, color: '#22c55e' },
    { l: 'Fours',       v: s.fours,    bar: false },
    { l: 'Sixes',       v: s.sixes,    bar: false, color: '#ff3d57' },
    { l: 'Not Outs',    v: s.notOuts,  bar: false },
  ]
})

const bowlingRows = computed(() => {
  if (!player.value) return []
  const s = player.value.stats
  return [
    { l: 'Overs Bowled', v: s.oversBowled,   bar: false },
    { l: 'Wickets',      v: s.wickets,        bar: true, pct: Math.min((s.wickets / 80) * 100, 100), color: '#ff3d57' },
    { l: 'Runs Conceded',v: s.runsConceded,   bar: false },
    { l: 'Economy',      v: economy.value,    bar: true, pct: Math.min(((12 - parseFloat(economy.value)) / 12) * 100, 100), color: '#22c55e' },
    { l: 'Bowl Average', v: bowlAvg.value,    bar: false, color: '#00d4ff' },
    { l: 'Maidens',      v: s.maidens,        bar: false },
    { l: 'Best Figures', v: s.bestFigures,    bar: false, color: '#a855f7' },
  ]
})

// Recent matches for this player (from completed matches)
const recentMatches = computed(() => {
  if (!player.value) return []
  const pid = player.value.id
  const results = []
  const allMatches = [
    ...store.matches.filter((m) => m.status === 'completed'),
    ...(store.matchHistory || []),
  ]
  // Deduplicate by id
  const seen = new Set()
  allMatches.forEach((m) => {
    if (seen.has(m.id)) return
    seen.add(m.id)
    const batting = m.battingOrder?.find((b) => b.playerId === pid)
    const bowling = m.bowlingCard?.find((b) => b.playerId === pid)
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

function formatDate(d) {
  try { return new Date(d).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' }) }
  catch { return d || '' }
}

function safeRole(r) {
  return (r || '').toLowerCase().replace(/[^a-z]/g, '')
}

function roleGrad(r) {
  return { Batsman: '#00d4ff15', Bowler: '#ff3d5715', 'All-rounder': '#a855f715', 'Wicket-keeper': '#22c55e15' }[r] || '#ffffff10'
}
function roleEm(r) {
  return { Batsman: '🏏', Bowler: '⚾', 'All-rounder': '⚡', 'Wicket-keeper': '🧤' }[r] || '🏏'
}
</script>

<style scoped>
.dark-page { background:transparent;min-height:100vh; }
.profile-wrap { max-width:1000px;margin:0 auto;padding:36px 32px 80px; }
.back-btn { display:inline-flex;align-items:center;gap:6px;color:rgba(255,255,255,0.4);text-decoration:none;font-size:13px;font-weight:600;margin-bottom:28px;transition:color 0.2s; }
.back-btn:hover { color:#00d4ff; }

/* HERO */
.profile-hero { display:flex;align-items:flex-start;gap:32px;margin-bottom:44px;flex-wrap:wrap; }
.hero-av { width:120px;height:120px;flex-shrink:0;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:50px;border:2px solid rgba(255,255,255,0.1);position:relative; }
.av-em { line-height:1; }
.av-num { position:absolute;bottom:-10px;right:-10px;background:#030b18;border:1.5px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);font-size:11px;font-weight:900;padding:2px 8px;border-radius:7px; }
.hero-info { flex:1;min-width:200px; }
.profile-role-badge { display:inline-block;font-size:10px;font-weight:700;letter-spacing:1px;padding:3px 11px;border-radius:6px;margin-bottom:10px;text-transform:uppercase; }
.r-batsman      { background:rgba(0,212,255,0.12);color:#00d4ff; }
.r-bowler       { background:rgba(255,61,87,0.12);color:#ff3d57; }
.r-allrounder   { background:rgba(168,85,247,0.12);color:#a855f7; }
.r-wicketkeeper { background:rgba(34,197,94,0.12);color:#22c55e; }
.profile-name { font-size:clamp(24px,4vw,40px);font-weight:900;color:#fff;letter-spacing:-1px;margin:0 0 10px;line-height:1.1; }
.nick { font-size:16px;color:rgba(255,255,255,0.35);font-weight:400; }
.profile-meta-row { display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px; }
.profile-meta-row span { font-size:13px;color:rgba(255,255,255,0.45);font-weight:600; }
.profile-desc { font-size:14px;color:rgba(255,255,255,0.45);line-height:1.7;margin:0 0 14px;max-width:550px; }
.achievements-row { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px; }
.ach-chip { padding:5px 12px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);border-radius:20px;font-size:11px;color:#ffd700;font-weight:600; }
.team-line { font-size:13px;color:rgba(255,255,255,0.45);display:flex;align-items:center;gap:8px; }
.team-line strong { color:#fff; }
.team-dot { width:10px;height:10px;border-radius:50%;flex-shrink:0; }

/* STATS SECTION */
.stats-section { margin-bottom:36px; }
.sec-title { font-size:18px;font-weight:800;color:#fff;margin:0 0 20px; }
.key-stats-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px; }
.ks-card { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px 16px;text-align:center;transition:all 0.2s; }
.ks-card:hover { border-color:rgba(0,212,255,0.15);transform:translateY(-2px); }
.ks-val { font-size:28px;font-weight:900;color:#fff;line-height:1;margin-bottom:6px;font-family:'Outfit','Roboto',sans-serif; }
.ks-val.cyan   { color:#00d4ff; }
.ks-val.gold   { color:#ffd700; }
.ks-val.red    { color:#ff3d57; }
.ks-val.purple { color:#a855f7; }
.ks-val.green  { color:#22c55e; }
.ks-lbl { font-size:10px;color:rgba(255,255,255,0.3);font-weight:700;letter-spacing:1.5px;text-transform:uppercase; }

/* PROFILE COLS */
.profile-cols { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px; }
.breakdown-card { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:22px; }
.bc-title { font-size:15px;font-weight:800;color:#fff;margin:0 0 18px; }

/* Breakdown Table */
.bd-table { display:flex;flex-direction:column;gap:10px; }
.bd-row { display:flex;align-items:center;gap:10px; }
.bd-lbl { font-size:12px;color:rgba(255,255,255,0.4);font-weight:600;width:105px;flex-shrink:0; }
.bd-bar-wrap { flex:1;height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden; }
.bd-bar { height:100%;border-radius:3px;transition:width 0.8s ease; }
.bd-val { font-size:14px;font-weight:800;color:#fff;text-align:right;min-width:48px; }

/* Live Perf */
.live-perf-card { background:rgba(0,212,255,0.04);border:1px solid rgba(0,212,255,0.15);border-radius:12px;padding:16px;margin-bottom:18px; }
.lpc-score { display:flex;align-items:baseline;gap:6px;margin-bottom:4px; }
.lpc-runs { font-size:42px;font-weight:900;color:#00d4ff;line-height:1; }
.lpc-balls { font-size:20px;color:rgba(255,255,255,0.35); }
.lpc-detail { font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:8px; }
.lpc-status { font-size:12px;font-weight:700;padding:4px 10px;border-radius:6px;width:fit-content; }
.st-batting { background:rgba(0,212,255,0.1);color:#00d4ff; }
.st-out     { background:rgba(255,61,87,0.08);color:#ff3d57; }
.st-yet     { background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.4); }
.no-perf { font-size:13px;color:rgba(255,255,255,0.25);font-style:italic;padding:12px 0;margin-bottom:18px; }

/* Fielding */
.field-title { font-size:13px;font-weight:800;color:#fff;margin:0 0 12px; }
.field-row { display:flex;gap:14px;flex-wrap:wrap; }
.field-item { display:flex;flex-direction:column;align-items:center;gap:2px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.15);border-radius:10px;padding:10px 16px; }
.field-item span { font-size:22px;font-weight:900;color:#22c55e; }
.field-item { font-size:11px;color:rgba(255,255,255,0.4); }

/* Not Found */
.not-found { text-align:center;padding:120px 20px; }
.not-found h2 { font-size:28px;font-weight:800;color:rgba(255,255,255,0.5);margin:16px 0 24px; }

/* Recent Matches */
.recent-matches-list { display:flex;flex-direction:column;gap:11px; }
.rm-card { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px 20px;transition:all 0.2s; }
.rm-card:hover { border-color:rgba(0,212,255,0.12);transform:translateY(-1px); }
.rm-header { display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:10px; }
.rm-date   { font-size:12px;font-weight:700;color:rgba(255,255,255,0.5); }
.rm-vs     { font-size:13px;font-weight:800;color:#fff; }
.rm-venue  { font-size:11px;color:rgba(255,255,255,0.25); }
.rm-result { font-size:10px;font-weight:800;padding:3px 10px;border-radius:20px;margin-left:auto; }
.rm-won    { background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2); }
.rm-lost   { background:rgba(255,61,87,0.08);color:#ff3d57;border:1px solid rgba(255,61,87,0.18); }
.rm-stats  { display:flex;gap:24px;flex-wrap:wrap; }
.rm-bat,.rm-bowl { display:flex;align-items:center;gap:8px;flex-wrap:wrap; }
.rm-stat-lbl { font-size:8px;font-weight:800;color:rgba(255,255,255,0.25);letter-spacing:1.5px;background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:4px; }
.rm-runs   { font-size:22px;font-weight:900;color:#00d4ff;line-height:1; }
.rm-milestone { color:#ffd700 !important; }
.rm-balls  { font-size:13px;color:rgba(255,255,255,0.3); }
.rm-extras { font-size:11px;color:rgba(255,255,255,0.3); }
.rm-dismissal { font-size:11px;color:#ff3d57;font-weight:600; }
.rm-notout { font-size:11px;color:#22c55e;font-weight:700; }
.rm-wkts   { font-size:20px;font-weight:900;color:#ff3d57;line-height:1; }
.rm-overs  { font-size:11px;color:rgba(255,255,255,0.3); }
</style>
