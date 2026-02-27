<template>
  <q-page class="dark-page">
    <div class="page-container">

      <!-- Header -->
      <div class="adm-header">
        <div>
          <div class="sec-chip">⚡ LIVE SCORER</div>
          <h1 class="page-title">Admin <span class="grad">Dashboard</span></h1>
        </div>
        <div class="adm-links">
          <router-link to="/broadcast" class="overlay-btn" target="_blank">📺 OBS Overlay</router-link>
          <router-link v-if="match" :to="`/matches/${match.id}`" class="overlay-btn">📋 Scorecard</router-link>
        </div>
      </div>

      <!-- No live match -->
      <div v-if="!match" class="no-match-state">
        <div class="nm-icon">🏏</div>
        <h2>No Live Match Running</h2>
        <p>Go to <router-link to="/manage">Manage → Matches</router-link>, then click <strong>▶ Start Match</strong>.</p>
      </div>

      <template v-else>
        <!-- ── SCOREBOARD ─────────────────────────────────────────── -->
        <div class="score-banner">
          <div class="sb-team">
            <div class="sb-badge" :style="{ background: store.getTeamById(match.teamAId)?.color }">
              {{ store.getTeamById(match.teamAId)?.shortName }}
            </div>
            <div class="sb-tname">{{ store.getTeamById(match.teamAId)?.name }}</div>
          </div>
          <div class="sb-center">
            <div class="sb-score">
              <span class="sc-runs">{{ inning.runs }}</span>
              <span class="sc-sep">/</span>
              <span class="sc-wkts">{{ inning.wickets }}</span>
            </div>
            <div class="sb-overs">
              {{ oversDisplay }}
              <span class="sb-max-ov">/ {{ match.overs }} ov</span>
              · {{ match.format }} · {{ match.date }} {{ match.time }}
            </div>
            <div class="sb-crr">CRR: {{ crr }}<span v-if="inning.target"> · Need {{ inning.target - inning.runs }} off {{ (match.overs - Math.floor((inning.legalBalls||0)/6)) }} ov</span></div>
            <!-- Overs progress bar -->
            <div class="overs-progress">
              <div class="op-bar" :style="{ width: oversBarPct + '%' }"></div>
            </div>
          </div>
          <div class="sb-team sb-right">
            <div class="sb-badge" :style="{ background: store.getTeamById(match.teamBId)?.color }">
              {{ store.getTeamById(match.teamBId)?.shortName }}
            </div>
            <div class="sb-tname">{{ store.getTeamById(match.teamBId)?.name }}</div>
          </div>
        </div>

        <!-- 2nd innings trigger -->
        <div v-if="showInnings2Btn" class="innings2-banner">
          <div class="i2b-text">
            <span class="i2b-icon">🏏</span>
            {{ match.currentInning === 1 ? '1st Innings Complete!' : '2nd Innings In Progress' }}
            <span v-if="match.innings[0]">Score: {{ match.innings[0].runs }}/{{ match.innings[0].wickets }}</span>
          </div>
          <button v-if="match.currentInning !== 2" class="i2b-btn" @click="store.startInnings2(match.id)">
            Start 2nd Innings →
          </button>
        </div>

        <!-- ── CURRENT OVER ──────────────────────────────────────── -->
        <div class="over-bar">
          <span class="ob-label">Over {{ completedOvers + 1 }} ({{ inning.currentOverBalls || 0 }}/6):</span>
          <div class="ob-balls">
            <span
              v-for="(b, i) in thisOverBalls"
              :key="i"
              class="ball"
              :class="ballClass(b)"
            >{{ b }}</span>
            <!-- Empty slots for this over -->
            <span
              v-for="i in Math.max(0, 6 - (inning.currentOverBalls || 0))"
              :key="`e${i}`"
              class="ball ball-empty"
            >·</span>
          </div>
        </div>

        <!-- ── BATSMEN ── STRIKER HIGHLIGHTED ───────────────────── -->
        <div class="crease-panel">
          <div class="crease-title">🏏 At the Crease</div>

          <!-- STRIKER -->
          <div class="batter-card striker-card" v-if="striker">
            <div class="bc-stripe striker-stripe"></div>
            <div class="bc-indicator">
              <span class="strike-arrow">▶</span>
              <span class="strike-lbl">ON STRIKE</span>
            </div>
            <div class="bc-body">
              <div class="bc-name">{{ store.getPlayerById(striker.playerId)?.name }}</div>
              <div class="bc-role">{{ store.getPlayerById(striker.playerId)?.role }}</div>
            </div>
            <div class="bc-runs">
              <span class="bc-r">{{ striker.runs }}</span>
              <span class="bc-b">({{ striker.balls }})</span>
            </div>
            <div class="bc-extras">{{ striker.fours }}×4 · {{ striker.sixes }}×6 · SR {{ striker.balls > 0 ? (striker.runs/striker.balls*100).toFixed(0) : 0 }}</div>
          </div>

          <!-- NON-STRIKER -->
          <div class="batter-card nonstriker-card" v-if="nonStriker">
            <div class="bc-stripe nonstrike-stripe"></div>
            <div class="bc-indicator nsi">
              <span class="nonstrike-dot">◦</span>
              <span class="nonstrike-lbl">NON-STRIKE</span>
            </div>
            <div class="bc-body">
              <div class="bc-name ns-name">{{ store.getPlayerById(nonStriker.playerId)?.name }}</div>
              <div class="bc-role">{{ store.getPlayerById(nonStriker.playerId)?.role }}</div>
            </div>
            <div class="bc-runs ns-runs">
              <span class="bc-r ns-r">{{ nonStriker.runs }}</span>
              <span class="bc-b">({{ nonStriker.balls }})</span>
            </div>
            <div class="bc-extras">{{ nonStriker.fours }}×4 · {{ nonStriker.sixes }}×6 · SR {{ nonStriker.balls > 0 ? (nonStriker.runs/nonStriker.balls*100).toFixed(0) : 0 }}</div>
          </div>

          <!-- Manual Swap + Next batsmen -->
          <div class="crease-footer">
            <button class="swap-btn" @click="store.swapStriker(match.id)" title="Manually swap striker">
              ⇄ Swap Strike
            </button>
            <div class="next-in" v-if="nextBatsmen.length">
              <span class="ni-lbl">Next:</span>
              <span v-for="nb in nextBatsmen" :key="nb.playerId" class="ni-name">
                {{ store.getPlayerById(nb.playerId)?.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- ── BOWLER & SELECT ────────────────────────────────────── -->
        <div class="bowl-panel">
          <div class="bowl-current" v-if="currentBowler">
            <span class="bowl-icon">🎯</span>
            <span class="bowl-name">{{ store.getPlayerById(currentBowler.playerId)?.name }}</span>
            <span class="bowl-fig">
              {{ currentBowler.overs }} ov ·
              <span class="bowl-r">{{ currentBowler.runs }} R</span> ·
              <span class="bowl-w">{{ currentBowler.wickets }} W</span>
            </span>
          </div>
          <div class="bowl-select-row">
            <span class="bowl-select-lbl">Change Bowler:</span>
            <button
              v-for="p in teamBPlayers"
              :key="p.id"
              class="bowl-pick"
              :class="{ 'bp-active': currentBowler?.playerId === p.id }"
              @click="store.setCurrentBowler(match.id, p.id)"
            >{{ p.name }}</button>
          </div>
        </div>

        <!-- ── SCORING BUTTONS ───────────────────────────────────── -->
        <div class="scoring-panel">
          <!-- RUNS -->
          <div class="sp-section">
            <div class="sp-label">RUNS</div>
            <div class="run-row">
              <button v-for="r in [0,1,2,3,4,5,6]" :key="r" class="run-btn" :class="`rb${r}`" @click="score(r)">
                {{ r }}
              </button>
            </div>
          </div>

          <!-- EXTRAS -->
          <div class="sp-section">
            <div class="sp-label">EXTRAS</div>
            <div class="extra-row">
              <button class="ex-btn ex-wide"   @click="scoreExtra('wide')">Wide +1</button>
              <button class="ex-btn ex-noball" @click="scoreExtra('noball')">No Ball +1</button>
              <button class="ex-btn ex-bye"    @click="scoreExtra('bye')">Bye +1</button>
              <button class="ex-btn ex-leg"    @click="scoreExtra('legbye')">Leg Bye +1</button>
              <button class="ex-btn ex-dead"   @click="deadBall">Dead Ball</button>
            </div>
          </div>

          <!-- WICKET -->
          <div class="sp-section">
            <div class="sp-label">WICKET</div>
            <div class="wkt-row">
              <select v-model="dismissalType" class="wkt-sel">
                <option>Bowled</option>
                <option>LBW</option>
                <option>Caught</option>
                <option>Run Out</option>
                <option>Stumped</option>
                <option>Hit Wicket</option>
                <option>Retired Hurt</option>
              </select>
              <select v-if="nextBatsmen.length" v-model="nextBatsmanSel" class="wkt-sel">
                <option :value="null">Auto (next in order)</option>
                <option v-for="b in nextBatsmen" :key="b.playerId" :value="b.playerId">
                  In: {{ store.getPlayerById(b.playerId)?.name }}
                </option>
              </select>
              <button class="wkt-btn" @click="scoreWicket">🔴 W I C K E T</button>
            </div>
          </div>
        </div>

        <!-- ── COMMENTARY ─────────────────────────────────────────── -->
        <div class="comment-panel">
          <input v-model="commentText" class="comment-input"
            placeholder="Add commentary… e.g. 'Sanjana pulls through midwicket for a boundary!'"
            @keyup.enter="sendComment" />
          <button class="comment-send" @click="sendComment">Send</button>
        </div>

        <!-- ── FULL BATTING ORDER ────────────────────────────────── -->
        <div class="bo-panel">
          <div class="bp-title">📋 Batting Order</div>
          <div class="bo-scroll">
            <div class="bo-head">
              <span class="bon-name">Batsman</span>
              <span class="bon">R</span><span class="bon">B</span>
              <span class="bon">4s</span><span class="bon">6s</span>
              <span class="bon sr-col">SR</span>
              <span class="bon-stat">Status</span>
            </div>
            <div
              v-for="b in match.battingOrder"
              :key="b.playerId"
              class="bo-row"
              :class="{
                'bor-strike':  b.status === 'batting' && b.isStriker,
                'bor-nonstr':  b.status === 'batting' && !b.isStriker,
                'bor-out':     b.status === 'out',
                'bor-yet':     b.status === 'yet',
              }"
            >
              <span class="bon-name">
                <span v-if="b.status==='batting' && b.isStriker"  class="ind ind-s">▶</span>
                <span v-else-if="b.status==='batting'"            class="ind ind-ns">◦</span>
                <span v-else                                       class="ind"></span>
                {{ store.getPlayerById(b.playerId)?.name }}
              </span>
              <span class="bon">{{ b.status==='yet' ? '-' : b.runs }}</span>
              <span class="bon">{{ b.status==='yet' ? '-' : b.balls }}</span>
              <span class="bon">{{ b.status==='yet' ? '-' : b.fours }}</span>
              <span class="bon">{{ b.status==='yet' ? '-' : b.sixes }}</span>
              <span class="bon sr-col">{{ b.status==='yet' ? '-' : b.balls>0 ? ((b.runs/b.balls)*100).toFixed(0) : 0 }}</span>
              <span class="bon-stat">
                <span v-if="b.status==='batting' && b.isStriker"  class="sb sb-s">On Strike</span>
                <span v-else-if="b.status==='batting'"            class="sb sb-ns">Non-strike</span>
                <span v-else-if="b.status==='out'"                class="sb sb-out">{{ b.dismissal }}</span>
                <span v-else                                       class="sb sb-yet">Yet to bat</span>
              </span>
            </div>
          </div>
        </div>

        <!-- ── RECENT BALLS + LOG ─────────────────────────────────── -->
        <div class="log-panel">
          <div class="lp-title">📜 Commentary Log</div>
          <div class="log-scroll">
            <div
              v-for="n in store.notifications.slice(0,30)"
              :key="n.id"
              class="log-row"
              :class="`lt-${n.type}`"
            >
              <span class="lt-time">{{ n.time }}</span>
              <span class="lt-text">{{ n.text }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCricketStore } from 'stores/cricket-store'

const store = useCricketStore()

const match  = computed(() => store.liveMatch)
const inning = computed(() => match.value?.innings?.[0] ?? { runs:0, wickets:0, overs:0, legalBalls:0, currentOverBalls:0 })

// ── Batsmen ──────────────────────────────────────────────────
const striker    = computed(() => match.value ? store.currentStriker(match.value.id) : null)
const nonStriker = computed(() => match.value ? store.currentNonStriker(match.value.id) : null)
const nextBatsmen = computed(() => match.value ? store.nextBatsmen(match.value.id) : [])
const currentBowler = computed(() => match.value ? store.currentBowler(match.value.id) : null)
const teamBPlayers  = computed(() => match.value ? store.getPlayersByTeam(match.value.teamBId) : [])

// ── Over display ─────────────────────────────────────────────
const oversDisplay = computed(() => {
  const lb = inning.value.legalBalls || 0
  const ov = Math.floor(lb / 6)
  const bl = lb % 6
  return `${ov}.${bl}`
})

const completedOvers = computed(() => Math.floor((inning.value.legalBalls || 0) / 6))

const oversBarPct = computed(() => {
  const maxOv = match.value?.overs || 20
  return Math.min((completedOvers.value / maxOv) * 100, 100)
})

const showInnings2Btn = computed(() => {
  if (!match.value) return false
  const maxOv = match.value.overs || 20
  const inn1Done = completedOvers.value >= maxOv || (inning.value.wickets >= 10 && inning.value.inningsNum === 1)
  return inn1Done || match.value.currentInning === 2
})

const crr = computed(() => {
  const lb = inning.value.legalBalls || 0
  return lb > 0 ? (inning.value.runs / (lb / 6)).toFixed(2) : '0.00'
})

// Only the balls bowled in this current over
const thisOverBalls = computed(() => {
  const cnt = inning.value.currentOverBalls || 0
  return (match.value?.recentBalls || []).slice(0, cnt)
})

// ── State ────────────────────────────────────────────────────
const dismissalType = ref('Bowled')
const nextBatsmanSel = ref(null)
const commentText = ref('')

// ── On mount: fix any legacy match data ──────────────────────
onMounted(() => {
  if (match.value) store.fixMatchInit(match.value.id)
})

// ── Actions ──────────────────────────────────────────────────
function score(runs) {
  store.addDelivery({ matchId: match.value.id, runs })
}

function scoreExtra(type) {
  store.addDelivery({
    matchId: match.value.id,
    runs: 0,
    extras: (type === 'wide' || type === 'noball') ? 1 : 1,
    extraType: type,
  })
}

function deadBall() {
  store.addNotification('Dead ball — not counted.', 'info')
}

function scoreWicket() {
  if (!striker.value) return
  store.addDelivery({
    matchId: match.value.id,
    runs: 0,
    wicket: true,
    dismissal: dismissalType.value,
    nextBatsmanId: nextBatsmanSel.value,
  })
  nextBatsmanSel.value = null
}

function sendComment() {
  if (!commentText.value.trim()) return
  store.addNotification(commentText.value.trim(), 'normal')
  commentText.value = ''
}

function ballClass(b) {
  if (b === 'W' || b === 'NBW')  return 'ball-wkt'
  if (b === '6')                  return 'ball-six'
  if (b === '4')                  return 'ball-four'
  if (b === '0')                  return 'ball-dot'
  if (/^(Wd|NB|B|LB)/.test(b))   return 'ball-extra'
  return 'ball-run'
}
</script>

<style scoped>
/* ── Base ────────────────────────────────────── */
.dark-page { background:transparent;min-height:100vh;color:#fff; }
.page-container { max-width:1080px;margin:0 auto;padding:24px 24px 80px; }

/* ── Header ─────────────────────────────────── */
.adm-header { display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px;flex-wrap:wrap;gap:12px; }
.sec-chip { display:inline-block;background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.22);color:#f97316;padding:3px 12px;border-radius:20px;font-size:10px;font-weight:800;letter-spacing:2px;margin-bottom:5px; }
.page-title { font-size:clamp(24px,4vw,38px);font-weight:900;letter-spacing:-1px;margin:0; }
.grad { background:linear-gradient(135deg,#f97316,#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
.adm-links { display:flex;gap:8px; }
.overlay-btn { padding:8px 15px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:9px;color:rgba(255,255,255,0.6);font-size:12px;font-weight:600;text-decoration:none;transition:all 0.2s; }
.overlay-btn:hover { background:rgba(255,255,255,0.1);color:#fff; }

/* ── No match ───────────────────────────────── */
.no-match-state { text-align:center;padding:80px 20px; }
.nm-icon { font-size:72px;margin-bottom:14px; }
.no-match-state h2 { font-size:22px;font-weight:800;color:rgba(255,255,255,0.4);margin:0 0 10px; }
.no-match-state p { color:rgba(255,255,255,0.3);font-size:14px; }
.no-match-state a { color:#00d4ff; }

/* ── Scoreboard ─────────────────────────────── */
/* Overs progress bar */
.overs-progress { height:3px;background:rgba(255,255,255,0.1);border-radius:3px;margin-top:5px;overflow:hidden;width:160px; }
.op-bar { height:100%;background:linear-gradient(90deg,#00d4ff,#a855f7);border-radius:3px;transition:width 0.4s ease; }
.sb-max-ov { color:rgba(255,255,255,0.3);font-size:11px; }

/* 2nd innings banner */
.innings2-banner { display:flex;align-items:center;justify-content:space-between;background:rgba(168,85,247,0.08);border:1.5px solid rgba(168,85,247,0.2);border-radius:12px;padding:14px 20px;margin-bottom:12px;flex-wrap:wrap;gap:10px; }
.i2b-text { display:flex;align-items:center;gap:10px;font-size:14px;font-weight:700;color:rgba(255,255,255,0.8); }
.i2b-icon { font-size:20px; }
.i2b-btn { padding:10px 24px;background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;font-weight:900;font-size:14px;border-radius:10px;border:none;cursor:pointer;transition:all 0.2s;font-family:inherit;box-shadow:0 4px 16px rgba(168,85,247,0.35); }
.i2b-btn:hover { transform:translateY(-2px);box-shadow:0 8px 24px rgba(168,85,247,0.5); }

/* Score banner extras */
.score-banner { display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px 24px;margin-bottom:12px;gap:12px; }
.sb-team { display:flex;flex-direction:column;align-items:center;gap:6px; }
.sb-badge { min-width:58px;padding:9px 14px;border-radius:10px;font-size:16px;font-weight:900;color:#fff;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,0.4); }
.sb-tname { font-size:11px;color:rgba(255,255,255,0.35);font-weight:700;text-align:center;max-width:110px; }
.sb-center { text-align:center; }
.sb-score { line-height:1;display:flex;align-items:baseline;justify-content:center;gap:2px; }
.sc-runs  { font-size:clamp(48px,7vw,80px);font-weight:900;color:#fff;letter-spacing:-3px; }
.sc-sep   { font-size:clamp(28px,4vw,48px);color:rgba(255,255,255,0.3);font-weight:300; }
.sc-wkts  { font-size:clamp(28px,4vw,48px);font-weight:900;color:rgba(255,255,255,0.6); }
.sb-overs { font-size:11px;color:rgba(255,255,255,0.3);margin-top:3px; }
.sb-crr   { font-size:12px;color:#00d4ff;font-weight:700;margin-top:1px; }

/* ── Over bar ───────────────────────────────── */
.over-bar { display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:11px 16px;margin-bottom:12px;flex-wrap:wrap; }
.ob-label { font-size:10px;color:rgba(255,255,255,0.3);font-weight:700;letter-spacing:1.5px;flex-shrink:0;text-transform:uppercase; }
.ob-balls { display:flex;gap:7px;flex-wrap:wrap; }
.ball { width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;flex-shrink:0;transition:all 0.2s; }
.ball-wkt   { background:#ff3d57;color:#fff;box-shadow:0 0 10px rgba(255,61,87,0.5); }
.ball-six   { background:#a855f7;color:#fff;box-shadow:0 0 10px rgba(168,85,247,0.4); }
.ball-four  { background:#00d4ff;color:#030b18;box-shadow:0 0 10px rgba(0,212,255,0.4); }
.ball-dot   { background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.4); }
.ball-extra { background:#ffd700;color:#030b18;box-shadow:0 0 8px rgba(255,215,0,0.3); }
.ball-run   { background:rgba(34,197,94,0.15);color:#22c55e;border:1px solid rgba(34,197,94,0.25); }
.ball-empty { background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.1);color:rgba(255,255,255,0.15); }

/* ── Crease panel ───────────────────────────── */
.crease-panel { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;margin-bottom:12px; }
.crease-title { font-size:13px;font-weight:800;color:#fff;margin-bottom:14px;letter-spacing:0.5px; }

.batter-card { display:flex;align-items:center;gap:14px;border-radius:12px;padding:14px 16px;margin-bottom:10px;position:relative;overflow:hidden;transition:all 0.3s; }
.bc-stripe { width:4px;height:100%;position:absolute;left:0;top:0;bottom:0;border-radius:2px 0 0 2px;}
.striker-stripe { background:linear-gradient(180deg,#00d4ff,#a855f7); }
.nonstrike-stripe { background:rgba(255,255,255,0.1); }

.striker-card { background:rgba(0,212,255,0.07);border:1.5px solid rgba(0,212,255,0.2);box-shadow:0 0 20px rgba(0,212,255,0.08); }
.nonstriker-card { background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07); }

.bc-indicator { display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0;width:44px; }
.strike-arrow { font-size:20px;color:#00d4ff;animation:pulse-arrow 1.2s ease infinite; }
@keyframes pulse-arrow { 0%,100%{opacity:1;transform:translateX(0)}50%{opacity:0.6;transform:translateX(3px)} }
.strike-lbl { font-size:7px;font-weight:800;color:#00d4ff;letter-spacing:1.5px;text-transform:uppercase; }
.nsi { opacity:0.35; }
.nonstrike-dot { font-size:20px;color:rgba(255,255,255,0.4); }
.nonstrike-lbl { font-size:7px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:1px; }

.bc-body { flex:1; }
.bc-name { font-size:17px;font-weight:900;color:#fff;letter-spacing:-0.5px; }
.ns-name { color:rgba(255,255,255,0.55); }
.bc-role { font-size:11px;color:rgba(255,255,255,0.3);margin-top:2px; }
.bc-runs { display:flex;align-items:baseline;gap:4px;flex-shrink:0; }
.bc-r   { font-size:32px;font-weight:900;color:#00d4ff;line-height:1; }
.ns-r   { color:rgba(255,255,255,0.4); }
.ns-runs .bc-r { color:rgba(255,255,255,0.4); }
.bc-b   { font-size:13px;color:rgba(255,255,255,0.3); }
.bc-extras { font-size:11px;color:rgba(255,255,255,0.25);position:absolute;bottom:10px;right:16px;font-weight:600; }

.crease-footer { display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding-top:8px;border-top:1px solid rgba(255,255,255,0.05); }
.swap-btn { padding:8px 18px;background:rgba(168,85,247,0.1);border:1.5px solid rgba(168,85,247,0.25);border-radius:9px;color:#a855f7;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;font-family:inherit; }
.swap-btn:hover { background:rgba(168,85,247,0.2);transform:scale(1.04); }
.next-in { display:flex;align-items:center;gap:8px;flex-wrap:wrap; }
.ni-lbl  { font-size:10px;color:rgba(255,255,255,0.25);font-weight:700;letter-spacing:1px; }
.ni-name { font-size:11px;color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.05);padding:3px 10px;border-radius:20px; }

/* ── Bowl panel ─────────────────────────────── */
.bowl-panel { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px;margin-bottom:12px; }
.bowl-current { display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05); }
.bowl-icon { font-size:14px; }
.bowl-name { font-size:15px;font-weight:800;color:#fff;flex:1; }
.bowl-fig  { font-size:12px;color:rgba(255,255,255,0.4); }
.bowl-r    { color:#00d4ff; }
.bowl-w    { color:#ff3d57;font-weight:800; }
.bowl-select-row { display:flex;align-items:center;gap:8px;flex-wrap:wrap; }
.bowl-select-lbl { font-size:10px;color:rgba(255,255,255,0.25);font-weight:700;letter-spacing:1px;flex-shrink:0; }
.bowl-pick { padding:6px 13px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:8px;color:rgba(255,255,255,0.5);font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit; }
.bowl-pick:hover { background:rgba(255,61,87,0.1);border-color:rgba(255,61,87,0.2);color:#ff3d57; }
.bp-active { background:rgba(255,61,87,0.12) !important;border-color:rgba(255,61,87,0.3) !important;color:#ff3d57 !important; }

/* ── Scoring panel ──────────────────────────── */
.scoring-panel { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px;margin-bottom:12px; }
.sp-section { margin-bottom:18px; }
.sp-section:last-child { margin-bottom:0; }
.sp-label { font-size:10px;font-weight:800;color:rgba(255,255,255,0.25);letter-spacing:2.5px;margin-bottom:10px;text-transform:uppercase; }
.run-row  { display:flex;gap:10px;flex-wrap:wrap; }
.extra-row { display:flex;gap:8px;flex-wrap:wrap; }
.wkt-row  { display:flex;gap:8px;flex-wrap:wrap;align-items:center; }

.run-btn { width:70px;height:70px;border-radius:14px;border:2px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#fff;font-size:28px;font-weight:900;cursor:pointer;transition:all 0.15s;font-family:inherit; }
.run-btn:hover { transform:translateY(-4px);box-shadow:0 10px 24px rgba(0,0,0,0.35); }
.rb0 { background:rgba(255,255,255,0.04); }

.rb0:hover { background:rgba(255,255,255,0.12); }
.rb1,.rb2,.rb3 { border-color:rgba(34,197,94,0.2);background:rgba(34,197,94,0.07); }
.rb1:hover,.rb2:hover,.rb3:hover { background:rgba(34,197,94,0.18);color:#22c55e; }
.rb4 { border-color:rgba(0,212,255,0.25);background:rgba(0,212,255,0.08);color:#00d4ff; }
.rb4:hover { background:rgba(0,212,255,0.2); }
.rb5 { border-color:rgba(168,85,247,0.2);background:rgba(168,85,247,0.07); }
.rb5:hover { background:rgba(168,85,247,0.18);color:#a855f7; }
.rb6 { border-color:rgba(168,85,247,0.35);background:rgba(168,85,247,0.15);color:#a855f7; }
.rb6:hover { background:rgba(168,85,247,0.28);box-shadow:0 0 20px rgba(168,85,247,0.3); }

.ex-btn { padding:11px 18px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.18s;border:1.5px solid;font-family:inherit; }
.ex-wide   { background:rgba(255,215,0,0.08);border-color:rgba(255,215,0,0.25);color:#ffd700; }
.ex-noball { background:rgba(249,115,22,0.08);border-color:rgba(249,115,22,0.25);color:#f97316; }
.ex-bye,.ex-leg { background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.1);color:rgba(255,255,255,0.55); }
.ex-dead   { background:rgba(255,255,255,0.02);border-color:rgba(255,255,255,0.07);color:rgba(255,255,255,0.25); }
.ex-btn:hover { filter:brightness(1.3); }

.wkt-sel { background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);border-radius:8px;padding:9px 12px;color:#fff;font-size:13px;font-family:inherit;outline:none; }
.wkt-sel option { background:#0d1f2d; }
.wkt-btn { padding:12px 28px;background:linear-gradient(135deg,#ff3d57,#dc2626);color:#fff;font-weight:900;font-size:14px;border-radius:11px;border:none;cursor:pointer;transition:all 0.18s;font-family:inherit;box-shadow:0 4px 18px rgba(255,61,87,0.35);letter-spacing:1px; }
.wkt-btn:hover { transform:translateY(-3px);box-shadow:0 8px 28px rgba(255,61,87,0.55); }

/* ── Commentary ─────────────────────────────── */
.comment-panel { display:flex;gap:10px;margin-bottom:12px; }
.comment-input { flex:1;background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.09);border-radius:9px;padding:10px 14px;color:#fff;font-size:13px;font-family:inherit;outline:none; }
.comment-input:focus { border-color:rgba(249,115,22,0.3); }
.comment-send { padding:10px 20px;background:rgba(249,115,22,0.12);border:1.5px solid rgba(249,115,22,0.25);border-radius:9px;color:#f97316;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit; }
.comment-send:hover { background:rgba(249,115,22,0.22); }

/* ── Batting Order ──────────────────────────── */
.bo-panel { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px;margin-bottom:12px; }
.bp-title  { font-size:13px;font-weight:800;color:#fff;margin-bottom:12px; }
.bo-scroll { overflow-x:auto; }
.bo-head,.bo-row { display:grid;grid-template-columns:1fr 36px 36px 32px 32px 42px 110px;gap:4px;align-items:center;min-width:480px; }
.bo-head { font-size:9px;color:rgba(255,255,255,0.2);font-weight:700;letter-spacing:2px;text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.05);margin-bottom:4px; }
.bo-row  { padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04); }
.bo-row:last-child { border-bottom:none; }
.bon-name { font-size:12px;font-weight:600;color:rgba(255,255,255,0.45);display:flex;align-items:center;gap:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
.bon      { font-size:12px;color:rgba(255,255,255,0.4);text-align:center; }
.sr-col   { color:#a855f7 !important; }
.bon-stat { overflow:hidden; }
.ind      { font-size:11px;flex-shrink:0;width:12px;display:inline-block; }
.ind-s    { color:#00d4ff; }
.ind-ns   { color:rgba(255,255,255,0.2); }

.bor-strike .bon-name { color:#fff;font-weight:800; }
.bor-strike .bon      { color:#00d4ff; }
.bor-nonstr .bon-name { color:rgba(255,255,255,0.65); }
.bor-out    .bon-name { color:rgba(255,255,255,0.25); }
.bor-yet    .bon-name { color:rgba(255,255,255,0.2);font-style:italic; }

.sb { font-size:9px;font-weight:700;padding:2px 7px;border-radius:5px;white-space:nowrap; }
.sb-s   { background:rgba(0,212,255,0.12);color:#00d4ff; }
.sb-ns  { background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.35); }
.sb-out { background:rgba(255,61,87,0.1);color:#ff3d57;max-width:100px;overflow:hidden;text-overflow:ellipsis;display:block; }
.sb-yet { background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.2); }

/* ── Log ────────────────────────────────────── */
.log-panel  { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px; }
.lp-title   { font-size:13px;font-weight:800;color:#fff;margin-bottom:10px; }
.log-scroll { max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:5px; }
.log-row    { display:flex;align-items:baseline;gap:10px;padding:5px 9px;border-radius:7px; }
.lt-wicket  { background:rgba(255,61,87,0.07); }
.lt-six     { background:rgba(168,85,247,0.07); }
.lt-four    { background:rgba(0,212,255,0.06); }
.lt-time    { font-size:10px;color:rgba(255,255,255,0.2);flex-shrink:0; }
.lt-text    { font-size:12px;color:rgba(255,255,255,0.6); }
</style>
