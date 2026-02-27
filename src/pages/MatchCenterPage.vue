<template>
  <q-page class="dark-page">
    <div class="page-container" v-if="match">
      <router-link to="/matches" class="back-btn">← Back to Matches</router-link>

      <!-- Match Header -->
      <div class="match-hero">
        <div class="mh-status" :class="match.status">
          <span v-if="match.status === 'live'" class="live-dot" />
          {{ match.status === 'live' ? 'LIVE' : match.status === 'upcoming' ? 'UPCOMING' : 'RESULT' }}
        </div>
        <div class="mh-meta">{{ match.venue }} · {{ match.format }}</div>

        <div class="mh-teams">
          <div class="mht">
            <div class="mht-badge" :style="{ background: store.getTeamById(match.teamAId)?.color }">
              {{ store.getTeamById(match.teamAId)?.shortName }}
            </div>
            <div class="mht-name">{{ store.getTeamById(match.teamAId)?.name }}</div>
            <div v-if="match.innings[0]" class="mht-score">
              {{ match.innings[0].runs }}/{{ match.innings[0].wickets }}
              <span class="mht-ov">({{ match.innings[0].overs }} ov)</span>
            </div>
          </div>
          <div class="mh-vs">VS</div>
          <div class="mht mht-right">
            <div class="mht-badge" :style="{ background: store.getTeamById(match.teamBId)?.color }">
              {{ store.getTeamById(match.teamBId)?.shortName }}
            </div>
            <div class="mht-name">{{ store.getTeamById(match.teamBId)?.name }}</div>
            <div v-if="match.innings[1]" class="mht-score">
              {{ match.innings[1].runs }}/{{ match.innings[1].wickets }}
              <span class="mht-ov">({{ match.innings[1].overs }} ov)</span>
            </div>
            <div v-else-if="match.innings[0]?.target" class="mht-target">
              Target: {{ match.innings[0].target }}
            </div>
          </div>
        </div>

        <!-- Live Info Bar -->
        <div v-if="match.status === 'live'" class="live-info-bar">
          <div class="lib-batters">
            <div v-for="b in currentBatsmen" :key="b.playerId" class="lib-batter">
              <span class="lib-bat-icon">🏏</span>
              <span class="lib-bat-name">{{ getPlayer(b.playerId)?.name }}</span>
              <span class="lib-bat-score">{{ b.runs }}<small>({{ b.balls }})</small></span>
              <span class="lib-bat-extras">{{ b.fours }}×4 · {{ b.sixes }}×6</span>
            </div>
          </div>
          <div v-if="currentBowler" class="lib-bowler">
            🎯 {{ getPlayer(currentBowler.playerId)?.name }}
            — {{ currentBowler.overs }}ov · {{ currentBowler.runs }}R · {{ currentBowler.wickets }}W
          </div>
          <!-- Next Batsmen -->
          <div v-if="nextBatsmen.length" class="next-in">
            <span class="ni-lbl">Next in:</span>
            <span v-for="nb in nextBatsmen" :key="nb.playerId" class="ni-name">
              {{ getPlayer(nb.playerId)?.name }}
            </span>
          </div>
          <!-- Recent Balls -->
          <div class="lib-balls">
            <span class="lb-lbl">This over:</span>
            <span v-for="(b,i) in match.recentBalls.slice(0,6)" :key="i" class="bc" :class="`bc-${bc(b)}`">{{ b }}</span>
          </div>
        </div>

        <!-- Admin link -->
        <router-link to="/admin" v-if="match.status === 'live'" class="admin-shortcut">⚡ Open Scorer Dashboard →</router-link>
      </div>

      <!-- TABS -->
      <div class="sc-tabs">
        <button v-for="t in scoreTabs" :key="t.v" class="sc-tab" :class="{ 'st-active': scoreTab === t.v }" @click="scoreTab = t.v">{{ t.l }}</button>
      </div>

      <!-- ── SCORECARD TAB ── -->
      <div v-if="scoreTab === 'card'">
        <div class="sc-section">
          <div class="sc-sec-title">
            🏏 {{ store.getTeamById(match.teamAId)?.name }} Innings
            <span v-if="match.innings[0]">— {{ match.innings[0].runs }}/{{ match.innings[0].wickets }} ({{ match.innings[0].overs }} ov)</span>
          </div>

          <!-- Batting Table -->
          <div class="table-wrap">
            <div class="bt-header">
              <span class="bt-name">Batsman</span>
              <span class="bt-dis">How Out</span>
              <span class="bnum">R</span>
              <span class="bnum">B</span>
              <span class="bnum">4s</span>
              <span class="bnum">6s</span>
              <span class="bnum">SR</span>
            </div>
            <div v-for="entry in match.battingOrder" :key="entry.playerId"
              class="bt-row"
              :class="{ 'bt-out': entry.status === 'out', 'bt-batting': entry.status === 'batting', 'bt-yet': entry.status === 'yet' }">
              <span class="bt-name">
                <span v-if="entry.status === 'batting'" class="bat-sprite">🏏</span>
                {{ getPlayer(entry.playerId)?.name }}
                <span v-if="entry.playerId === store.getTeamById(match.teamAId)?.captainId" class="cap-tag">(c)</span>
                <span v-if="getPlayer(entry.playerId)?.role === 'Wicket-keeper'" class="wk-tag">(wk)</span>
              </span>
              <span class="bt-dis">{{ entry.dismissal || (entry.status === 'batting' ? 'not out*' : 'yet to bat') }}</span>
              <span class="bnum">{{ entry.status === 'yet' ? '-' : entry.runs }}</span>
              <span class="bnum">{{ entry.status === 'yet' ? '-' : entry.balls }}</span>
              <span class="bnum">{{ entry.status === 'yet' ? '-' : entry.fours }}</span>
              <span class="bnum">{{ entry.status === 'yet' ? '-' : entry.sixes }}</span>
              <span class="bnum sv-sr">{{ entry.status === 'yet' ? '-' : sr(entry.runs, entry.balls) }}</span>
            </div>
          </div>

          <!-- Extras + Total bar -->
          <div class="innings-footer">
            <div class="if-total">
              <strong>Total:</strong> {{ match.innings[0]?.runs }}/{{ match.innings[0]?.wickets }}
              <span>({{ match.innings[0]?.overs }} overs, T20)</span>
            </div>
          </div>

          <!-- Bowling Table -->
          <div class="bowl-title">🎯 Bowling</div>
          <div class="table-wrap">
            <div class="bwl-header">
              <span class="bwl-name">Bowler</span>
              <span class="bnum">O</span>
              <span class="bnum">M</span>
              <span class="bnum">R</span>
              <span class="bnum">W</span>
              <span class="bnum">Eco</span>
            </div>
            <div v-for="entry in match.bowlingCard" :key="entry.playerId"
              class="bwl-row" :class="{ 'bwl-current': entry.status === 'current' }">
              <span class="bwl-name">
                <span v-if="entry.status === 'current'">🎯 </span>
                {{ getPlayer(entry.playerId)?.name }}
              </span>
              <span class="bnum">{{ entry.overs }}</span>
              <span class="bnum">{{ entry.maidens }}</span>
              <span class="bnum">{{ entry.runs }}</span>
              <span class="bnum red-val">{{ entry.wickets }}</span>
              <span class="bnum blue-val">{{ calcEco(entry.runs, entry.overs) }}</span>
            </div>
          </div>

          <!-- Fall of Wickets -->
          <div v-if="match.innings[0]?.fallOfWickets?.length" class="fow-section">
            <div class="fow-title">📉 Fall of Wickets</div>
            <div class="fow-list">
              <span v-for="fw in match.innings[0].fallOfWickets" :key="fw.wicket" class="fow-chip">
                {{ fw.wicket }}-{{ fw.runs }} ({{ fw.playerName }}, {{ fw.over }} ov)
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── OVER BY OVER TAB ── -->
      <div v-if="scoreTab === 'overs'">
        <div class="sc-section">
          <div class="sc-sec-title">📊 Over by Over</div>
          <div class="over-bars">
            <div v-for="ov in match.overTimeline" :key="ov.over" class="ov-col">
              <div class="ov-bar-wrap">
                <div class="ov-bar" :style="{ height: `${Math.min((ov.runs / 24) * 100, 100)}%`, background: ovBarColor(ov.runs) }" />
              </div>
              <div class="ov-runs">{{ ov.runs }}</div>
              <div class="ov-num">{{ ov.over }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── SQUADS TAB ── -->
      <div v-if="scoreTab === 'squads'">
        <div class="squads-grid">
          <div v-for="teamId in [match.teamAId, match.teamBId]" :key="teamId" class="squad-panel">
            <div class="squad-h">
              <div class="sq-badge" :style="{ background: store.getTeamById(teamId)?.color }">{{ store.getTeamById(teamId)?.shortName }}</div>
              <span>{{ store.getTeamById(teamId)?.name }}</span>
            </div>
            <div v-for="p in store.getPlayersByTeam(teamId)" :key="p.id" class="sq-row">
              <span class="sq-em">{{ roleEm(p.role) }}</span>
              <span class="sq-name">{{ p.name }}</span>
              <span v-if="p.id === store.getTeamById(teamId)?.captainId" class="sq-cap">c</span>
              <span class="sq-role" :class="`r-${safeRole(p.role)}`">{{ p.role }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="not-found">
      <div style="font-size:80px">🏏</div>
      <h2>Match Not Found</h2>
      <router-link to="/matches" class="back-btn">← Back to Matches</router-link>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCricketStore } from 'stores/cricket-store'

const route = useRoute()
const store = useCricketStore()
const match = computed(() => store.getMatchById(route.params.id))

const scoreTab  = ref('card')
const scoreTabs = [
  { l: '📋 Scorecard', v: 'card' },
  { l: '📊 Over Chart', v: 'overs' },
  { l: '👥 Squads',    v: 'squads' },
]

const currentBatsmen = computed(() =>
  match.value ? store.currentBatsmen(match.value.id) : []
)
const currentBowler = computed(() =>
  match.value ? store.currentBowler(match.value.id) : null
)
const nextBatsmen = computed(() =>
  match.value ? store.nextBatsmen(match.value.id) : []
)

function getPlayer(id) { return store.getPlayerById(id) }
function sr(r, b) { return b > 0 ? ((r / b) * 100).toFixed(1) : '0.0' }
function calcEco(r, o) { return o > 0 ? (r / o).toFixed(2) : '0.00' }
function bc(ball) {
  if (ball === 'W')  return 'wkt'
  if (ball === '6')  return 'six'
  if (ball === '4')  return 'four'
  if (ball === '0')  return 'dot'
  if (ball === 'Wd' || ball === 'Nb') return 'extra'
  return 'run'
}
function ovBarColor(runs) {
  if (runs >= 18) return '#ff3d57'
  if (runs >= 12) return '#a855f7'
  if (runs >= 8)  return '#00d4ff'
  return '#22c55e'
}
function safeRole(r) { return (r || '').toLowerCase().replace(/[^a-z]/g, '') }
function roleEm(r) {
  return { Batsman: '🏏', Bowler: '⚾', 'All-rounder': '⚡', 'Wicket-keeper': '🧤' }[r] || '🏏'
}
</script>

<style scoped>
.dark-page { background:transparent;min-height:100vh; }
.page-container { max-width:1000px;margin:0 auto;padding:36px 28px 80px; }
.back-btn { display:inline-flex;align-items:center;gap:6px;color:rgba(255,255,255,0.4);text-decoration:none;font-size:13px;font-weight:600;margin-bottom:24px;transition:color 0.2s; }
.back-btn:hover { color:#00d4ff; }

/* Hero */
.match-hero { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;margin-bottom:24px; }
.mh-status { display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:800;letter-spacing:2px;padding:5px 14px;border-radius:20px;margin-bottom:8px; }
.mh-status.live { background:rgba(255,61,87,0.12);border:1px solid rgba(255,61,87,0.25);color:#ff3d57; }
.mh-status.upcoming { background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.2);color:#00d4ff; }
.mh-status.completed { background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);color:#22c55e; }
.live-dot { width:7px;height:7px;background:#ff3d57;border-radius:50%;animation:blink 1s infinite; }
@keyframes blink { 0%,100%{opacity:1}50%{opacity:0.2} }
.mh-meta { font-size:12px;color:rgba(255,255,255,0.3);font-weight:600;margin-bottom:22px; }
.mh-teams { display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:20px; }
.mht { display:flex;flex-direction:column;align-items:center;gap:8px; }
.mht-badge { min-width:70px;padding:12px 16px;border-radius:12px;font-size:18px;font-weight:900;color:#fff;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,0.4); }
.mht-name { font-size:13px;color:rgba(255,255,255,0.55);font-weight:700;text-align:center; }
.mht-score { font-size:clamp(32px,5vw,58px);font-weight:900;color:#fff;letter-spacing:-2px;line-height:1; }
.mht-ov { font-size:12px;color:rgba(255,255,255,0.35);font-weight:400; }
.mht-target { font-size:15px;color:#ffd700;font-weight:700; }
.mh-vs { font-size:14px;font-weight:900;color:rgba(255,255,255,0.2); }

/* Live info bar */
.live-info-bar { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px;margin-top:12px; }
.lib-batters { display:flex;flex-direction:column;gap:9px;margin-bottom:10px; }
.lib-batter { display:flex;align-items:center;gap:10px; }
.lib-bat-icon { font-size:13px; }
.lib-bat-name { flex:1;font-size:13px;font-weight:700;color:#fff; }
.lib-bat-score { font-size:20px;font-weight:900;color:#00d4ff; }
.lib-bat-score small { font-size:12px;color:rgba(255,255,255,0.35); }
.lib-bat-extras { font-size:11px;color:rgba(255,255,255,0.35);white-space:nowrap; }
.lib-bowler { font-size:12px;color:rgba(255,255,255,0.45);padding:8px 0;border-top:1px solid rgba(255,255,255,0.06);margin-bottom:8px; }
.next-in { display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px; }
.ni-lbl { font-size:10px;color:rgba(255,255,255,0.3);font-weight:700;letter-spacing:1.5px; }
.ni-name { font-size:12px;color:rgba(255,255,255,0.6);font-weight:600;background:rgba(255,255,255,0.06);padding:3px 10px;border-radius:20px; }
.lib-balls { display:flex;align-items:center;gap:7px;flex-wrap:wrap; }
.lb-lbl { font-size:10px;color:rgba(255,255,255,0.3);font-weight:600;letter-spacing:1px; }
.bc { width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900; }
.bc-wkt   { background:#ff3d57;color:#fff; }
.bc-six   { background:#a855f7;color:#fff; }
.bc-four  { background:#00d4ff;color:#030b18; }
.bc-dot   { background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.4); }
.bc-extra { background:#ffd700;color:#030b18; }
.bc-run   { background:rgba(255,255,255,0.12);color:#fff; }
.admin-shortcut { display:inline-flex;align-items:center;gap:7px;margin-top:16px;padding:9px 18px;background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.2);border-radius:9px;font-size:13px;font-weight:700;color:#f97316;text-decoration:none;transition:all 0.2s; }
.admin-shortcut:hover { background:rgba(249,115,22,0.18); }

/* Score Tabs */
.sc-tabs { display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap; }
.sc-tab { padding:9px 20px;background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.09);border-radius:10px;color:rgba(255,255,255,0.5);font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit; }
.sc-tab:hover { background:rgba(255,255,255,0.08);color:#fff; }
.st-active { background:rgba(0,212,255,0.1) !important;border-color:rgba(0,212,255,0.3) !important;color:#00d4ff !important; }

/* Scorecard */
.sc-section { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:22px;margin-bottom:18px; }
.sc-sec-title { font-size:15px;font-weight:800;color:#fff;margin-bottom:18px; }
.table-wrap { overflow-x:auto; }
.bt-header,.bt-row { display:grid;grid-template-columns:1fr 1.4fr 38px 38px 38px 38px 50px;gap:4px;align-items:center;min-width:550px; }
.bt-header { font-size:9px;color:rgba(255,255,255,0.25);font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:9px;border-bottom:1px solid rgba(255,255,255,0.05);margin-bottom:4px; }
.bt-row { padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.04); }
.bt-row:last-child { border-bottom:none; }
.bt-name { font-size:13px;color:rgba(255,255,255,0.6);font-weight:600;display:flex;align-items:center;gap:5px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
.bt-dis  { font-size:11px;color:rgba(255,255,255,0.28);overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
.bnum { font-size:12px;color:rgba(255,255,255,0.5);font-weight:700;text-align:center; }
.bt-batting .bt-name { color:#fff;font-weight:800; }
.bt-batting .bnum { color:#00d4ff; }
.bt-out .bt-name { color:rgba(255,255,255,0.4); }
.bt-yet .bt-name { color:rgba(255,255,255,0.3);font-style:italic; }
.bat-sprite { font-size:12px; }
.cap-tag { font-size:10px;color:#ffd700;margin-left:3px; }
.wk-tag  { font-size:10px;color:#22c55e;margin-left:3px; }
.sv-sr { color:#a855f7 !important; }
.innings-footer { display:flex;justify-content:flex-end;padding:12px 0 6px;border-top:1px solid rgba(255,255,255,0.07);font-size:14px;font-weight:700;color:rgba(255,255,255,0.7);gap:10px; }
.innings-footer strong { color:#fff; }
.bowl-title { font-size:14px;font-weight:800;color:#fff;margin:20px 0 12px; }
.bwl-header,.bwl-row { display:grid;grid-template-columns:1fr 40px 40px 40px 44px 52px;gap:4px;align-items:center;min-width:450px; }
.bwl-header { font-size:9px;color:rgba(255,255,255,0.25);font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.05);margin-bottom:4px; }
.bwl-row { padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04); }
.bwl-row:last-child { border-bottom:none; }
.bwl-name { font-size:13px;color:rgba(255,255,255,0.6);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.bwl-current .bwl-name { color:#ff3d57;font-weight:800; }
.red-val  { color:#ff3d57 !important; }
.blue-val { color:#00d4ff !important; }
.fow-section { margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06); }
.fow-title { font-size:13px;font-weight:800;color:#fff;margin-bottom:10px; }
.fow-list { display:flex;flex-wrap:wrap;gap:7px; }
.fow-chip { padding:5px 12px;background:rgba(255,61,87,0.07);border:1px solid rgba(255,61,87,0.15);border-radius:7px;font-size:11px;color:rgba(255,255,255,0.55);font-weight:600; }

/* Over chart */
.over-bars { display:flex;gap:8px;align-items:flex-end;padding:20px 0;overflow-x:auto;min-height:160px; }
.ov-col { display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;width:36px; }
.ov-bar-wrap { width:26px;height:100px;background:rgba(255,255,255,0.05);border-radius:4px;display:flex;align-items:flex-end;overflow:hidden; }
.ov-bar { width:100%;border-radius:4px;transition:height 0.6s ease; }
.ov-runs { font-size:11px;font-weight:800;color:#fff; }
.ov-num  { font-size:9px;color:rgba(255,255,255,0.25);font-weight:700; }

/* Squads */
.squads-grid { display:grid;grid-template-columns:1fr 1fr;gap:18px; }
@media(max-width:640px) { .squads-grid { grid-template-columns:1fr; } }
.squad-panel { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px; }
.squad-h { display:flex;align-items:center;gap:12px;margin-bottom:16px;font-size:15px;font-weight:800;color:#fff; }
.sq-badge { padding:7px 12px;border-radius:9px;font-size:14px;font-weight:900;color:#fff; }
.sq-row { display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04); }
.sq-row:last-child { border-bottom:none; }
.sq-em { font-size:14px; }
.sq-name { flex:1;font-size:13px;font-weight:700;color:rgba(255,255,255,0.75); }
.sq-cap { font-size:10px;color:#ffd700;font-weight:700; }
.sq-role { font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px; }
.r-batsman       { background:rgba(0,212,255,0.12);color:#00d4ff; }
.r-bowler        { background:rgba(255,61,87,0.12);color:#ff3d57; }
.r-allrounder    { background:rgba(168,85,247,0.12);color:#a855f7; }
.r-wicketkeeper  { background:rgba(34,197,94,0.12);color:#22c55e; }

/* Not Found */
.not-found { text-align:center;padding:120px 20px; }
.not-found h2 { font-size:26px;font-weight:800;color:rgba(255,255,255,0.4);margin:16px 0 24px; }
</style>
