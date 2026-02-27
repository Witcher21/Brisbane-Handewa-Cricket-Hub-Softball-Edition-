<template>
  <q-page class="dark-page">
    <div class="page-container">
      <div class="page-header">
        <div class="sec-chip">📅 FIXTURES</div>
        <h1 class="page-title">Match <span class="grad">Center</span></h1>
        <p class="page-sub">Live scores · Schedules · Full scorecards</p>
      </div>

      <!-- Tab Filters -->
      <div class="tabs-row">
        <button v-for="t in tabs" :key="t.v" class="tab-btn" :class="{ 'tab-active': activeTab === t.v }" @click="activeTab = t.v">
          <span v-if="t.v === 'live'" class="live-dot-sm" />{{ t.l }}
          <span v-if="t.v === 'live' && store.liveMatch" class="live-count">1</span>
        </button>
      </div>

      <!-- LIVE MATCHES -->
      <div v-if="activeTab === 'all' || activeTab === 'live'">
        <div v-if="store.liveMatch">
          <div class="section-label live-lbl">🔴 LIVE</div>
          <router-link :to="`/matches/${store.liveMatch.id}`" class="match-card live-match-card">
            <div class="mc-live-badge"><span class="live-dot-sm" />LIVE</div>
            <div class="mc-venue">📍 {{ store.liveMatch.venue }}</div>
            <div class="mc-teams-row">
              <div class="mc-team">
                <div class="mc-badge" :style="{ background: teamColor(store.liveMatch.teamAId) }">
                  {{ store.getTeamById(store.liveMatch.teamAId)?.shortName }}
                </div>
                <span class="mc-tname">{{ store.getTeamById(store.liveMatch.teamAId)?.name }}</span>
              </div>
              <div class="mc-score-col">
                <div v-if="store.liveMatch.innings[0]" class="mc-main-score">
                  {{ store.liveMatch.innings[0].runs }}/{{ store.liveMatch.innings[0].wickets }}
                </div>
                <div v-if="store.liveMatch.innings[0]" class="mc-overs">{{ store.liveMatch.innings[0].overs }} ov</div>
              </div>
              <div class="mc-team mc-team-right">
                <div class="mc-badge" :style="{ background: teamColor(store.liveMatch.teamBId) }">
                  {{ store.getTeamById(store.liveMatch.teamBId)?.shortName }}
                </div>
                <span class="mc-tname">{{ store.getTeamById(store.liveMatch.teamBId)?.name }}</span>
              </div>
            </div>

            <!-- Current Batsmen -->
            <div class="mc-live-detail">
              <div class="mc-batters">
                <div v-for="b in currentBatsmen" :key="b.playerId" class="mc-batter">
                  <span class="mc-batter-icon">🏏</span>
                  <span class="mc-batter-name">{{ getPlayer(b.playerId)?.name }}</span>
                  <span class="mc-batter-score">{{ b.runs }}<small>({{ b.balls }})</small></span>
                </div>
              </div>
              <div v-if="currentBowler" class="mc-bowler-line">
                🎯 <strong>{{ getPlayer(currentBowler.playerId)?.name }}</strong>
                — {{ currentBowler.overs }}ov · {{ currentBowler.runs }}R · {{ currentBowler.wickets }}W
              </div>
            </div>

            <!-- Recent Balls -->
            <div class="mc-balls-row">
              <span class="mc-balls-lbl">This over:</span>
              <span v-for="(b,i) in store.liveMatch.recentBalls.slice(0,6)" :key="i" class="bc" :class="`bc-${bc(b)}`">{{ b }}</span>
            </div>

            <div class="mc-cta">View Full Scorecard →</div>
          </router-link>
        </div>
        <div v-else-if="activeTab === 'live'" class="empty-state">No live matches right now.</div>
      </div>

      <!-- UPCOMING -->
      <div v-if="activeTab === 'all' || activeTab === 'upcoming'">
        <div v-if="store.upcomingMatches.length">
          <div class="section-label">📅 UPCOMING</div>
          <div class="matches-list">
            <router-link v-for="m in store.upcomingMatches" :key="m.id" :to="`/matches/${m.id}`" class="match-card upcoming-card">
              <div class="uc-date">{{ formatDate(m.date) }} · {{ m.time }}</div>
              <div class="mc-teams-row simple">
                <div class="mc-team">
                  <div class="mc-badge sm-badge" :style="{ background: teamColor(m.teamAId) }">{{ store.getTeamById(m.teamAId)?.shortName }}</div>
                  <span class="mc-tname">{{ store.getTeamById(m.teamAId)?.name }}</span>
                </div>
                <span class="vs-text">VS</span>
                <div class="mc-team mc-team-right">
                  <div class="mc-badge sm-badge" :style="{ background: teamColor(m.teamBId) }">{{ store.getTeamById(m.teamBId)?.shortName }}</div>
                  <span class="mc-tname">{{ store.getTeamById(m.teamBId)?.name }}</span>
                </div>
              </div>
              <div class="uc-venue">📍 {{ m.venue }}</div>
            </router-link>
          </div>
        </div>
        <div v-else-if="activeTab === 'upcoming'" class="empty-state">No upcoming matches scheduled.</div>
      </div>

      <!-- RESULTS -->
      <div v-if="activeTab === 'all' || activeTab === 'results'">
        <div v-if="store.completedMatches.length">
          <div class="section-label">✅ RESULTS</div>
          <div class="matches-list">
            <router-link v-for="m in store.completedMatches" :key="m.id" :to="`/matches/${m.id}`" class="match-card result-card">
              <div class="mc-teams-row simple">
                <div class="mc-team">
                  <div class="mc-badge sm-badge" :style="{ background: teamColor(m.teamAId) }">{{ store.getTeamById(m.teamAId)?.shortName }}</div>
                  <span class="mc-tname">{{ store.getTeamById(m.teamAId)?.name }}</span>
                </div>
                <span class="vs-text">VS</span>
                <div class="mc-team mc-team-right">
                  <div class="mc-badge sm-badge" :style="{ background: teamColor(m.teamBId) }">{{ store.getTeamById(m.teamBId)?.shortName }}</div>
                  <span class="mc-tname">{{ store.getTeamById(m.teamBId)?.name }}</span>
                </div>
              </div>
              <div v-if="m.result" class="result-text">🏆 {{ m.result }}</div>
            </router-link>
          </div>
        </div>
        <div v-else-if="activeTab === 'results'" class="empty-state">No completed matches yet.</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCricketStore } from 'stores/cricket-store'

const store = useCricketStore()
const tabs = [
  { l: 'All',      v: 'all' },
  { l: 'Live',     v: 'live' },
  { l: 'Upcoming', v: 'upcoming' },
  { l: 'Results',  v: 'results' },
]
const activeTab = ref('all')

const currentBatsmen = computed(() =>
  store.liveMatch ? store.currentBatsmen(store.liveMatch.id) : []
)
const currentBowler = computed(() =>
  store.liveMatch ? store.currentBowler(store.liveMatch.id) : null
)

function getPlayer(id) { return store.getPlayerById(id) }
function bc(ball) {
  if (ball === 'W')  return 'wkt'
  if (ball === '6')  return 'six'
  if (ball === '4')  return 'four'
  if (ball === '0')  return 'dot'
  if (ball === 'Wd' || ball === 'Nb') return 'extra'
  return 'run'
}
function teamColor(id) {
  const t = store.getTeamById(id)
  return t?.color ? `linear-gradient(135deg, ${t.color}, ${t.color}aa)` : '#333'
}
function formatDate(d) {
  try { return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return d }
}
</script>

<style scoped>
.dark-page { background:transparent;min-height:100vh; }
.page-container { max-width:860px;margin:0 auto;padding:56px 32px 80px; }
.page-header { text-align:center;margin-bottom:32px; }
.sec-chip { display:inline-block;background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.2);color:#00d4ff;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:14px; }
.page-title { font-size:clamp(30px,5vw,52px);font-weight:900;color:#fff;letter-spacing:-1.5px;margin:0 0 8px; }
.grad { background:linear-gradient(135deg,#00d4ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
.page-sub { color:rgba(255,255,255,0.38);font-size:14px;margin:0; }

.tabs-row { display:flex;gap:8px;margin-bottom:32px;justify-content:center;flex-wrap:wrap; }
.tab-btn { display:flex;align-items:center;gap:6px;padding:9px 22px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:30px;color:rgba(255,255,255,0.5);font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit; }
.tab-btn:hover { background:rgba(255,255,255,0.08);color:#fff; }
.tab-active { background:rgba(0,212,255,0.1) !important;border-color:rgba(0,212,255,0.3) !important;color:#00d4ff !important; }
.live-dot-sm { width:6px;height:6px;background:#ff3d57;border-radius:50%;animation:blink 1s infinite;flex-shrink:0; }
@keyframes blink { 0%,100%{opacity:1}50%{opacity:0.2} }
.live-count { background:#ff3d57;color:#fff;border-radius:20px;font-size:10px;font-weight:800;padding:1px 6px;margin-left:2px; }

.section-label { font-size:11px;font-weight:800;color:rgba(255,255,255,0.3);letter-spacing:2px;text-transform:uppercase;margin:28px 0 14px; }
.live-lbl { color:#ff3d57; }

/* Match Cards */
.match-card { display:block;text-decoration:none;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:24px;transition:all 0.25s;margin-bottom:14px; }
.match-card:hover { transform:translateY(-3px);box-shadow:0 14px 36px rgba(0,0,0,0.3); }

.live-match-card { border-color:rgba(255,61,87,0.2);box-shadow:0 0 30px rgba(255,61,87,0.06); }
.live-match-card:hover { border-color:rgba(255,61,87,0.4); }
.mc-live-badge { display:inline-flex;align-items:center;gap:6px;background:rgba(255,61,87,0.12);border:1px solid rgba(255,61,87,0.25);color:#ff3d57;font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;letter-spacing:1.5px;margin-bottom:8px; }
.mc-venue { font-size:11px;color:rgba(255,255,255,0.3);font-weight:600;margin-bottom:18px; }

.mc-teams-row { display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:16px; }
.mc-teams-row.simple { margin-bottom:12px; }
.mc-team { display:flex;flex-direction:column;align-items:center;gap:8px; }
.mc-team-right { }
.mc-badge { min-width:60px;padding:10px 14px;border-radius:12px;font-size:16px;font-weight:900;color:#fff;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,0.35); }
.sm-badge { min-width:44px;padding:7px 10px;font-size:13px;border-radius:9px; }
.mc-tname { font-size:12px;color:rgba(255,255,255,0.5);font-weight:700;text-align:center; }
.mc-score-col { text-align:center; }
.mc-main-score { font-size:clamp(36px,5vw,62px);font-weight:900;color:#fff;line-height:1;letter-spacing:-2px; }
.mc-overs { font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px; }
.vs-text { font-size:14px;font-weight:900;color:rgba(255,255,255,0.2); }

.mc-live-detail { background:rgba(255,255,255,0.03);border-radius:10px;padding:14px;margin-bottom:14px; }
.mc-batters { display:flex;flex-direction:column;gap:8px;margin-bottom:10px; }
.mc-batter { display:flex;align-items:center;gap:10px; }
.mc-batter-icon { font-size:13px; }
.mc-batter-name { flex:1;font-size:13px;font-weight:700;color:#fff; }
.mc-batter-score { font-size:18px;font-weight:900;color:#00d4ff; }
.mc-batter-score small { font-size:12px;color:rgba(255,255,255,0.35); }
.mc-bowler-line { font-size:12px;color:rgba(255,255,255,0.45);padding-top:8px;border-top:1px solid rgba(255,255,255,0.06); }

.mc-balls-row { display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap; }
.mc-balls-lbl { font-size:10px;color:rgba(255,255,255,0.3);font-weight:600;letter-spacing:1px;text-transform:uppercase; }
.bc { width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900; }
.bc-wkt   { background:#ff3d57;color:#fff; }
.bc-six   { background:#a855f7;color:#fff; }
.bc-four  { background:#00d4ff;color:#030b18; }
.bc-dot   { background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.4); }
.bc-extra { background:#ffd700;color:#030b18; }
.bc-run   { background:rgba(255,255,255,0.12);color:#fff; }

.mc-cta { font-size:13px;font-weight:700;color:#00d4ff;text-align:right; }

/* Upcoming / Results */
.matches-list { display:flex;flex-direction:column;gap:11px; }
.upcoming-card { border-color:rgba(0,212,255,0.1); }
.upcoming-card:hover { border-color:rgba(0,212,255,0.25); }
.uc-date { font-size:12px;color:rgba(0,212,255,0.7);font-weight:700;margin-bottom:14px; }
.uc-venue { font-size:11px;color:rgba(255,255,255,0.3);margin-top:10px; }
.result-card { border-color:rgba(34,197,94,0.1); }
.result-card:hover { border-color:rgba(34,197,94,0.25); }
.result-text { font-size:13px;font-weight:700;color:#22c55e;margin-top:12px;padding-top:12px;border-top:1px solid rgba(34,197,94,0.1); }

.empty-state { text-align:center;padding:60px;color:rgba(255,255,255,0.25);font-size:15px;font-weight:600; }
</style>
