<template>
  <q-page class="dark-page">
    <div class="page-container" v-if="match">
      <router-link to="/matches" class="back-btn">← Back to Matches</router-link>

      <!-- ═══ MATCH HEADER ═══════════════════════════════════════════════ -->
      <div class="match-hero">
        <div class="mh-top-row">
          <div class="mh-status" :class="match.status">
            <span v-if="match.status === 'live'" class="live-dot" />
            {{
              match.status === 'live' ? 'LIVE' : match.status === 'upcoming' ? 'UPCOMING' : 'RESULT'
            }}
          </div>
          <div class="mh-meta">
            {{ match.venue }} · {{ match.format }} · {{ match.overs }} overs
          </div>
          <router-link to="/admin" v-if="match.status === 'live'" class="admin-shortcut"
            >⚡ Scorer →</router-link
          >
        </div>

        <!-- Team Scores Row -->
        <div class="mh-teams">
          <!-- Team A -->
          <div class="mht" :class="{ 'mht-batting': isBatting(match.teamAId) }">
            <div class="mht-badge" :style="{ background: store.getTeamById(match.teamAId)?.color }">
              {{ store.getTeamById(match.teamAId)?.shortName }}
            </div>
            <div class="mht-name">{{ store.getTeamById(match.teamAId)?.name }}</div>
            <div v-if="innings1" class="mht-score">
              {{ innings1.runs }}/{{ innings1.wickets }}
              <span class="mht-ov">({{ innings1.overs }} ov)</span>
            </div>
            <div v-if="innings3" class="mht-score mht-score2">
              {{ innings3.runs }}/{{ innings3.wickets }}
              <span class="mht-ov">({{ innings3.overs }} ov)</span>
            </div>
          </div>

          <!-- VS + Match Context -->
          <div class="mh-center">
            <div class="mh-vs">VS</div>
            <div v-if="activeInning?.target" class="mh-target-badge">
              🎯 Target: {{ activeInning.target }}
            </div>
            <div v-if="match.result" class="mh-result">{{ match.result }}</div>
          </div>

          <!-- Team B -->
          <div class="mht mht-right" :class="{ 'mht-batting': isBatting(match.teamBId) }">
            <div class="mht-badge" :style="{ background: store.getTeamById(match.teamBId)?.color }">
              {{ store.getTeamById(match.teamBId)?.shortName }}
            </div>
            <div class="mht-name">{{ store.getTeamById(match.teamBId)?.name }}</div>
            <div v-if="innings2" class="mht-score">
              {{ innings2.runs }}/{{ innings2.wickets }}
              <span class="mht-ov">({{ innings2.overs }} ov)</span>
            </div>
            <div v-else-if="innings1?.target" class="mht-target">Target: {{ innings1.target }}</div>
          </div>
        </div>

        <!-- ── LIVE INFO BAR ─────────────────────────────────────────── -->
        <div v-if="match.status === 'live'" class="live-info-bar">
          <!-- Context line: CRR / RRR / need X -->
          <div class="lib-context">
            <span class="lib-crr">CRR: {{ crr }}</span>
            <span v-if="activeInning?.target" class="lib-need">
              Need <strong>{{ Math.max(0, activeInning.target - activeInning.runs) }}</strong> off
              <strong>{{ oversRemaining }}</strong> ov
            </span>
            <span v-if="activeInning?.target" class="lib-rrr">· RRR: {{ rrr }}</span>
            <span class="lib-batting-team" :style="{ background: battingTeamColor }">
              {{ battingTeamName }} batting
            </span>
          </div>

          <!-- Batsmen table -->
          <div class="lib-title">🏏 At the Crease</div>
          <div class="lib-table">
            <div class="lib-th">
              <span class="lt-name">Batter</span>
              <span class="lt-num">R</span>
              <span class="lt-num">B</span>
              <span class="lt-num">4s</span>
              <span class="lt-num">6s</span>
              <span class="lt-num">SR</span>
            </div>
            <div v-for="b in currentBatsmen" :key="b.playerId" class="lib-tr">
              <span class="lt-name">
                <span v-if="b.isStriker" class="striker-star">★</span>
                {{ getPlayer(b.playerId)?.name }}
                <span v-if="!b.isStriker" class="nonstriker-marker"></span>
              </span>
              <span class="lt-num lt-runs">{{ b.runs }}</span>
              <span class="lt-num">{{ b.balls }}</span>
              <span class="lt-num">{{ b.fours }}</span>
              <span class="lt-num">{{ b.sixes }}</span>
              <span class="lt-num lt-sr">{{
                b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0'
              }}</span>
            </div>
          </div>

          <!-- Bowler table -->
          <div class="lib-title lib-title-mt">🎯 Bowling</div>
          <div class="lib-table" v-if="currentBowler">
            <div class="lib-th">
              <span class="lt-name">Bowler</span>
              <span class="lt-num">O</span>
              <span class="lt-num">M</span>
              <span class="lt-num">R</span>
              <span class="lt-num">W</span>
              <span class="lt-num">ECO</span>
            </div>
            <div class="lib-tr lib-tr-bowl">
              <span class="lt-name">
                <span class="striker-star">★</span>
                {{ getPlayer(currentBowler.playerId)?.name }}
              </span>
              <span class="lt-num">{{ currentBowler.overs }}</span>
              <span class="lt-num">{{ currentBowler.maidens }}</span>
              <span class="lt-num">{{ currentBowler.runs }}</span>
              <span class="lt-num lt-wkts">{{ currentBowler.wickets }}</span>
              <span class="lt-num lt-eco">{{
                calcEco(currentBowler.runs, currentBowler.overs)
              }}</span>
            </div>
          </div>

          <!-- Recent balls + overs info -->
          <div class="lib-footer">
            <div class="lib-balls-row">
              <span class="lb-lbl">This over:</span>
              <span
                v-for="(b, i) in match.recentBalls.slice(0, 6)"
                :key="i"
                class="bc"
                :class="`bc-${bc(b)}`"
                >{{ b }}</span
              >
            </div>
            <div class="lib-ovs-row">
              <span class="ov-chip">Ov {{ activeInning?.overs || 0 }} / {{ match.overs }}</span>
              <span class="ov-chip ov-rem">Ovs Left: {{ oversRemaining }}</span>
              <span v-if="nextBatsmen.length" class="ov-chip ov-next">
                Next: {{ nextBatsmen.map((b) => getPlayer(b.playerId)?.name).join(', ') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ TABS ══════════════════════════════════════════════════════ -->
      <div class="sc-tabs">
        <button
          v-for="t in scoreTabs"
          :key="t.v"
          class="sc-tab"
          :class="{ 'st-active': scoreTab === t.v }"
          @click="scoreTab = t.v"
        >
          {{ t.l }}
        </button>
      </div>

      <!-- ═══ SCORECARD TAB ═══════════════════════════════════════════= -->
      <div v-if="scoreTab === 'card'">
        <!-- ── 1st INNINGS ───────────────────────────────────── -->
        <div class="sc-section" v-if="innings1BattingOrder.length || innings1">
          <div
            class="sc-inn-header"
            :style="{
              borderColor: store.getTeamById(innings1?.battingTeamId || match.teamAId)?.color,
            }"
          >
            <div
              class="sc-inn-badge"
              :style="{
                background: store.getTeamById(innings1?.battingTeamId || match.teamAId)?.color,
              }"
            >
              1st Inn
            </div>
            <div class="sc-inn-team">
              {{ store.getTeamById(innings1?.battingTeamId || match.teamAId)?.name }}
            </div>
            <div class="sc-inn-score" v-if="innings1">
              {{ innings1.runs }}/{{ innings1.wickets }}
              <span>({{ innings1.overs }} Ov)</span>
            </div>
          </div>

          <!-- Batting Card -->
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
            <div
              v-for="entry in innings1BattingOrder"
              :key="entry.playerId"
              class="bt-row"
              :class="{
                'bt-out': entry.status === 'out',
                'bt-batting': entry.status === 'batting',
                'bt-yet': entry.status === 'yet',
              }"
            >
              <span class="bt-name">
                <span v-if="entry.status === 'batting'" class="bat-sprite">🏏</span>
                {{ getPlayer(entry.playerId)?.name }}
                <span
                  v-if="
                    entry.playerId ===
                    store.getTeamById(innings1?.battingTeamId || match.teamAId)?.captainId
                  "
                  class="cap-tag"
                  >(c)</span
                >
                <span v-if="getPlayer(entry.playerId)?.role === 'Wicket-keeper'" class="wk-tag"
                  >(wk)</span
                >
              </span>
              <span class="bt-dis">{{
                entry.dismissal ||
                (entry.status === 'batting'
                  ? 'not out*'
                  : entry.status === 'yet'
                    ? 'yet to bat'
                    : 'not out')
              }}</span>
              <span class="bnum" :class="{ 'bnum-runs': entry.runs >= 50 }">{{
                entry.status === 'yet' ? '-' : entry.runs
              }}</span>
              <span class="bnum">{{ entry.status === 'yet' ? '-' : entry.balls }}</span>
              <span class="bnum">{{ entry.status === 'yet' ? '-' : entry.fours }}</span>
              <span class="bnum">{{ entry.status === 'yet' ? '-' : entry.sixes }}</span>
              <span class="bnum sv-sr">{{
                entry.status === 'yet' ? '-' : sr(entry.runs, entry.balls)
              }}</span>
            </div>
          </div>

          <!-- Extras + Total -->
          <div class="innings-footer" v-if="innings1">
            <div class="if-extras">Extras: {{ innings1.extras || 0 }}</div>
            <div class="if-total">
              Total: <strong>{{ innings1.runs }}/{{ innings1.wickets }}</strong>
              <span>({{ innings1.overs }} Ov, RR: {{ crr1 }})</span>
            </div>
          </div>

          <!-- Bowling Card — this innings' bowlers are the OTHER team -->
          <div class="bowl-title">🎯 Bowling — {{ store.getTeamById(match.teamBId)?.name }}</div>
          <div class="table-wrap">
            <div class="bwl-header">
              <span class="bwl-name">Bowler</span>
              <span class="bnum">O</span>
              <span class="bnum">M</span>
              <span class="bnum">R</span>
              <span class="bnum">W</span>
              <span class="bnum">ECO</span>
            </div>
            <div
              v-for="entry in innings1BowlingCard"
              :key="entry.playerId"
              class="bwl-row"
              :class="{ 'bwl-current': entry.status === 'current' && match.currentInning === 1 }"
            >
              <span class="bwl-name">
                <span v-if="entry.status === 'current' && match.currentInning === 1">🎯 </span>
                {{ getPlayer(entry.playerId)?.name }}
              </span>
              <span class="bnum">{{ entry.overs }}</span>
              <span class="bnum">{{ entry.maidens }}</span>
              <span class="bnum">{{ entry.runs }}</span>
              <span class="bnum red-val">{{ entry.wickets }}</span>
              <span class="bnum blue-val">{{ calcEco(entry.runs, entry.overs) }}</span>
            </div>
            <div v-if="!innings1BowlingCard.length" class="bwl-empty">No bowlers yet</div>
          </div>

          <!-- Fall of Wickets -->
          <div v-if="innings1?.fallOfWickets?.length" class="fow-section">
            <div class="fow-title">📉 Fall of Wickets</div>
            <div class="fow-list">
              <span v-for="fw in innings1.fallOfWickets" :key="fw.wicket" class="fow-chip">
                {{ fw.wicket }}-{{ fw.runs }} ({{ fw.playerName }}, {{ fw.over }} ov)
              </span>
            </div>
          </div>
        </div>

        <!-- ── 2nd INNINGS ───────────────────────────────────── -->
        <div class="sc-section sc-section-2nd" v-if="innings2 || match.currentInning === 2">
          <div
            class="sc-inn-header"
            :style="{
              borderColor: store.getTeamById(innings2?.battingTeamId || match.teamBId)?.color,
            }"
          >
            <div
              class="sc-inn-badge sc-inn-2nd"
              :style="{
                background: store.getTeamById(innings2?.battingTeamId || match.teamBId)?.color,
              }"
            >
              2nd Inn
            </div>
            <div class="sc-inn-team">
              {{ store.getTeamById(innings2?.battingTeamId || match.teamBId)?.name }}
            </div>
            <div class="sc-inn-target" v-if="innings2?.target">
              🎯 Target: {{ innings2.target }} |
              <span v-if="match.status === 'live'">
                Need: <strong>{{ Math.max(0, innings2.target - (innings2.runs || 0)) }}</strong>
              </span>
            </div>
            <div class="sc-inn-score" v-if="innings2">
              {{ innings2.runs }}/{{ innings2.wickets }}
              <span>({{ innings2.overs }} Ov)</span>
            </div>
            <div v-else class="sc-inn-score sc-inn-yet">Not started yet</div>
          </div>

          <template v-if="innings2 && innings2BattingOrder.length">
            <!-- Batting Card -->
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
              <div
                v-for="entry in innings2BattingOrder"
                :key="entry.playerId"
                class="bt-row"
                :class="{
                  'bt-out': entry.status === 'out',
                  'bt-batting': entry.status === 'batting',
                  'bt-yet': entry.status === 'yet',
                }"
              >
                <span class="bt-name">
                  <span v-if="entry.status === 'batting'" class="bat-sprite">🏏</span>
                  {{ getPlayer(entry.playerId)?.name }}
                  <span
                    v-if="
                      entry.playerId ===
                      store.getTeamById(innings2?.battingTeamId || match.teamBId)?.captainId
                    "
                    class="cap-tag"
                    >(c)</span
                  >
                  <span v-if="getPlayer(entry.playerId)?.role === 'Wicket-keeper'" class="wk-tag"
                    >(wk)</span
                  >
                </span>
                <span class="bt-dis">{{
                  entry.dismissal ||
                  (entry.status === 'batting'
                    ? 'not out*'
                    : entry.status === 'yet'
                      ? 'yet to bat'
                      : 'not out')
                }}</span>
                <span class="bnum" :class="{ 'bnum-runs': entry.runs >= 50 }">{{
                  entry.status === 'yet' ? '-' : entry.runs
                }}</span>
                <span class="bnum">{{ entry.status === 'yet' ? '-' : entry.balls }}</span>
                <span class="bnum">{{ entry.status === 'yet' ? '-' : entry.fours }}</span>
                <span class="bnum">{{ entry.status === 'yet' ? '-' : entry.sixes }}</span>
                <span class="bnum sv-sr">{{
                  entry.status === 'yet' ? '-' : sr(entry.runs, entry.balls)
                }}</span>
              </div>
            </div>

            <!-- Extras + Total -->
            <div class="innings-footer">
              <div class="if-extras">Extras: {{ innings2.extras || 0 }}</div>
              <div class="if-total">
                Total: <strong>{{ innings2.runs }}/{{ innings2.wickets }}</strong>
                <span>({{ innings2.overs }} Ov, RR: {{ crr2 }})</span>
              </div>
            </div>

            <!-- Bowling Card — Team A bowling in 2nd innings -->
            <div class="bowl-title">🎯 Bowling — {{ store.getTeamById(match.teamAId)?.name }}</div>
            <div class="table-wrap">
              <div class="bwl-header">
                <span class="bwl-name">Bowler</span>
                <span class="bnum">O</span>
                <span class="bnum">M</span>
                <span class="bnum">R</span>
                <span class="bnum">W</span>
                <span class="bnum">ECO</span>
              </div>
              <div
                v-for="entry in innings2BowlingCard"
                :key="entry.playerId"
                class="bwl-row"
                :class="{ 'bwl-current': entry.status === 'current' && match.currentInning === 2 }"
              >
                <span class="bwl-name">
                  <span v-if="entry.status === 'current' && match.currentInning === 2">🎯 </span>
                  {{ getPlayer(entry.playerId)?.name }}
                </span>
                <span class="bnum">{{ entry.overs }}</span>
                <span class="bnum">{{ entry.maidens }}</span>
                <span class="bnum">{{ entry.runs }}</span>
                <span class="bnum red-val">{{ entry.wickets }}</span>
                <span class="bnum blue-val">{{ calcEco(entry.runs, entry.overs) }}</span>
              </div>
              <div v-if="!innings2BowlingCard.length" class="bwl-empty">No bowlers yet</div>
            </div>

            <!-- Fall of Wickets -->
            <div v-if="innings2?.fallOfWickets?.length" class="fow-section">
              <div class="fow-title">📉 Fall of Wickets</div>
              <div class="fow-list">
                <span v-for="fw in innings2.fallOfWickets" :key="fw.wicket" class="fow-chip">
                  {{ fw.wicket }}-{{ fw.runs }} ({{ fw.playerName }}, {{ fw.over }} ov)
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- ═══ OVER BY OVER TAB ══════════════════════════════════════════ -->
      <div v-if="scoreTab === 'overs'">
        <div class="sc-section">
          <div class="sc-sec-title">📊 Over by Over</div>
          <div class="over-bars">
            <div v-for="ov in match.overTimeline" :key="ov.over" class="ov-col">
              <div class="ov-bar-wrap">
                <div
                  class="ov-bar"
                  :style="{
                    height: `${Math.min((ov.runs / 24) * 100, 100)}%`,
                    background: ovBarColor(ov.runs),
                  }"
                />
              </div>
              <div class="ov-runs">{{ ov.runs }}</div>
              <div class="ov-num">{{ ov.over }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ SQUADS TAB ══════════════════════════════════════════════== -->
      <div v-if="scoreTab === 'squads'">
        <div class="squads-grid">
          <div v-for="teamId in [match.teamAId, match.teamBId]" :key="teamId" class="squad-panel">
            <div class="squad-h">
              <div class="sq-badge" :style="{ background: store.getTeamById(teamId)?.color }">
                {{ store.getTeamById(teamId)?.shortName }}
              </div>
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
      <div style="font-size: 80px">🏏</div>
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

const scoreTab = ref('card')
const scoreTabs = [
  { l: '📋 Scorecard', v: 'card' },
  { l: '📊 Over Chart', v: 'overs' },
  { l: '👥 Squads', v: 'squads' },
]

// ── Innings refs ──────────────────────────────────────────────
const innings1 = computed(() => match.value?.innings?.[0] ?? null)
const innings2 = computed(() => match.value?.innings?.[1] ?? null)
const innings3 = computed(() => match.value?.innings?.[2] ?? null)

// The currently active innings (used for live stats)
const activeInning = computed(() => {
  if (!match.value) return null
  return match.value.innings?.[match.value.innings.length - 1] ?? null
})

// ── Batting cards: which batting order belongs to which innings ──
// 1st innings: team A bats → battingOrderA; 2nd innings: team B bats → current battingOrder
const innings1BattingOrder = computed(() => {
  if (!match.value) return []
  // 1st innings batting order is preserved in battingOrderA
  return match.value.battingOrderA ?? match.value.battingOrder ?? []
})

const innings2BattingOrder = computed(() => {
  if (!match.value || !innings2.value) return []
  // Completed match: use the end-state snapshot saved in endMatch()
  if (match.value.status === 'completed') {
    return match.value.battingOrderB ?? match.value.battingOrder ?? []
  }
  // Live 2nd innings: use the live battingOrder
  return match.value.battingOrder ?? []
})

// ── Bowling cards: preserved snapshots per innings ──────────────
const innings1BowlingCard = computed(() => {
  if (!match.value) return []
  // If currently in 1st innings, use live bowlingCard
  if (match.value.currentInning === 1) return match.value.bowlingCard ?? []
  // If in 2nd innings, use preserved 1st innings bowling card
  return match.value.bowlingCardInn1 ?? match.value.bowlingCard ?? []
})

const innings2BowlingCard = computed(() => {
  if (!match.value || !innings2.value) return []
  // If currently in 2nd innings, use live bowlingCard
  if (match.value.currentInning === 2) return match.value.bowlingCard ?? []
  return match.value.bowlingCardInn2 ?? []
})

// ── Current live state ────────────────────────────────────────
const currentBatsmen = computed(() => (match.value ? store.currentBatsmen(match.value.id) : []))
const currentBowler = computed(() => (match.value ? store.currentBowler(match.value.id) : null))
const nextBatsmen = computed(() => (match.value ? store.nextBatsmen(match.value.id) : []))

// ── Which team is currently batting ───────────────────────────
function isBatting(teamId) {
  if (!match.value || match.value.status !== 'live') return false
  return activeInning.value?.battingTeamId === teamId
}
const battingTeamName = computed(() => {
  if (!match.value || !activeInning.value) return ''
  return store.getTeamById(activeInning.value.battingTeamId)?.name ?? ''
})
const battingTeamColor = computed(() => {
  if (!match.value || !activeInning.value) return '#333'
  return store.getTeamById(activeInning.value.battingTeamId)?.color ?? '#333'
})

// ── Run rates & overs ─────────────────────────────────────────
const crr = computed(() => {
  const inn = activeInning.value
  if (!inn || !inn.overs) return '0.00'
  return (inn.runs / inn.overs).toFixed(2)
})
const crr1 = computed(() => {
  const inn = innings1.value
  if (!inn || !inn.overs) return '0.00'
  return (inn.runs / inn.overs).toFixed(2)
})
const crr2 = computed(() => {
  const inn = innings2.value
  if (!inn || !inn.overs) return '0.00'
  return (inn.runs / inn.overs).toFixed(2)
})
const oversRemaining = computed(() => {
  if (!match.value || !activeInning.value) return match.value?.overs ?? 0
  const done = activeInning.value.overs ?? 0
  return Math.max(0, match.value.overs - done).toFixed(1)
})
const rrr = computed(() => {
  const inn = activeInning.value
  if (!inn?.target) return '0.00'
  const ballsLeft = match.value.overs * 6 - (inn.legalBalls ?? 0)
  if (ballsLeft <= 0) return '∞'
  const runsNeeded = inn.target - inn.runs
  return ((runsNeeded / ballsLeft) * 6).toFixed(2)
})

// ── Helpers ───────────────────────────────────────────────────
function getPlayer(id) {
  return store.getPlayerById(id)
}
function sr(r, b) {
  return b > 0 ? ((r / b) * 100).toFixed(1) : '0.0'
}
function calcEco(r, o) {
  return o > 0 ? (r / o).toFixed(2) : '0.00'
}
function bc(ball) {
  if (ball === 'W') return 'wkt'
  if (ball === '6') return 'six'
  if (ball === '4') return 'four'
  if (ball === '0') return 'dot'
  if (ball === 'Wd' || ball === 'Nb') return 'extra'
  return 'run'
}
function ovBarColor(runs) {
  if (runs >= 18) return '#ff3d57'
  if (runs >= 12) return '#a855f7'
  if (runs >= 8) return '#00d4ff'
  return '#22c55e'
}
function safeRole(r) {
  return (r || '').toLowerCase().replace(/[^a-z]/g, '')
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
.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 36px 28px 80px;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 24px;
  transition: color 0.2s;
}
.back-btn:hover {
  color: #00d4ff;
}

/* ══ MATCH HERO ══════════════════════════════════════ */
.match-hero {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 24px;
}
.mh-top-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.mh-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2px;
  padding: 5px 14px;
  border-radius: 20px;
}
.mh-status.live {
  background: rgba(255, 61, 87, 0.12);
  border: 1px solid rgba(255, 61, 87, 0.25);
  color: #ff3d57;
}
.mh-status.upcoming {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
  color: #00d4ff;
}
.mh-status.completed {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: #22c55e;
}
.live-dot {
  width: 7px;
  height: 7px;
  background: #ff3d57;
  border-radius: 50%;
  animation: blink 1s infinite;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}
.mh-meta {
  flex: 1;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 600;
}
.admin-shortcut {
  padding: 7px 14px;
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 9px;
  font-size: 12px;
  font-weight: 700;
  color: #f97316;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
}
.admin-shortcut:hover {
  background: rgba(249, 115, 22, 0.2);
}

/* Teams row */
.mh-teams {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}
.mht {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.mht-right {
  align-items: flex-end;
}
.mht-batting .mht-badge {
  box-shadow:
    0 0 20px currentColor,
    0 0 40px rgba(0, 212, 255, 0.3);
  animation: pulse-badge 2s infinite;
}
@keyframes pulse-badge {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.75;
  }
}
.mht-badge {
  min-width: 70px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 900;
  color: #fff;
  text-align: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
  transition: all 0.4s;
}
.mht-name {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 700;
  text-align: center;
}
.mht-score {
  font-size: clamp(28px, 4vw, 54px);
  font-weight: 900;
  color: #fff;
  letter-spacing: -2px;
  line-height: 1;
}
.mht-score2 {
  font-size: 14px;
  color: #00d4ff;
}
.mht-ov {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 400;
}
.mht-target {
  font-size: 15px;
  color: #ffd700;
  font-weight: 700;
}
.mh-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.mh-vs {
  font-size: 14px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.2);
}
.mh-target-badge {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.05));
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 800;
  color: #ffd700;
  text-align: center;
}
.mh-result {
  font-size: 12px;
  color: #22c55e;
  font-weight: 700;
  text-align: center;
  padding: 4px 12px;
  background: rgba(34, 197, 94, 0.08);
  border-radius: 8px;
}

/* ══ LIVE INFO BAR ═══════════════════════════════════ */
.live-info-bar {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 18px;
  margin-top: 8px;
}
.lib-context {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.lib-crr {
  font-size: 12px;
  font-weight: 800;
  color: #00d4ff;
}
.lib-need {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}
.lib-need strong {
  color: #ffd700;
}
.lib-rrr {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}
.lib-batting-team {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 3px 10px;
  border-radius: 20px;
  color: #fff;
  opacity: 0.9;
  margin-left: auto;
}

.lib-title {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.lib-title-mt {
  margin-top: 16px;
}

/* Cricbuzz-style live table */
.lib-table {
  width: 100%;
  margin-bottom: 4px;
}
.lib-th,
.lib-tr {
  display: grid;
  grid-template-columns: 1fr 36px 36px 36px 36px 52px;
  align-items: center;
  gap: 4px;
  min-width: 320px;
}
.lib-th {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.2);
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 2px;
}
.lib-tr {
  padding: 7px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.lib-tr:last-child {
  border-bottom: none;
}
.lib-tr-bowl .lt-name {
  color: rgba(255, 100, 100, 0.9);
}
.lt-name {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lt-num {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}
.lt-runs {
  color: #00d4ff;
  font-size: 18px;
  font-weight: 900;
}
.lt-wkts {
  color: #ff3d57;
  font-weight: 900;
}
.lt-eco {
  color: #a855f7;
}
.lt-sr {
  color: #a855f7;
}
.striker-star {
  color: #ffd700;
  font-size: 11px;
  margin-right: 4px;
}
.nonstriker-marker {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  margin-left: 4px;
}

/* Footer: balls + overs */
.lib-footer {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lib-balls-row {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}
.lb-lbl {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 700;
  letter-spacing: 1px;
}
.bc {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
}
.bc-wkt {
  background: #ff3d57;
  color: #fff;
}
.bc-six {
  background: #a855f7;
  color: #fff;
}
.bc-four {
  background: #00d4ff;
  color: #030b18;
}
.bc-dot {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.4);
}
.bc-extra {
  background: #ffd700;
  color: #030b18;
}
.bc-run {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
.lib-ovs-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.ov-chip {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.55);
}
.ov-rem {
  background: rgba(0, 212, 255, 0.08);
  color: #00d4ff;
}
.ov-next {
  background: rgba(168, 85, 247, 0.08);
  color: #a855f7;
}

/* ══ TABS ════════════════════════════════════════════ */
.sc-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.sc-tab {
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
.sc-tab:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.st-active {
  background: rgba(0, 212, 255, 0.1) !important;
  border-color: rgba(0, 212, 255, 0.3) !important;
  color: #00d4ff !important;
}

/* ══ SCORECARD SECTIONS ══════════════════════════════ */
.sc-section {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 22px;
  margin-bottom: 18px;
}
.sc-section-2nd {
  border-color: rgba(255, 215, 0, 0.12);
}
.sc-sec-title {
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 18px;
}
.sc-inn-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid;
  flex-wrap: wrap;
}
.sc-inn-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.sc-inn-team {
  flex: 1;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
}
.sc-inn-target {
  font-size: 13px;
  font-weight: 700;
  color: #ffd700;
  padding: 4px 12px;
  background: rgba(255, 215, 0, 0.08);
  border-radius: 8px;
}
.sc-inn-score {
  font-size: 22px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -1px;
  white-space: nowrap;
}
.sc-inn-score span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 400;
  margin-left: 4px;
}
.sc-inn-yet {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

/* Batting table */
.table-wrap {
  overflow-x: auto;
}
.bt-header,
.bt-row {
  display: grid;
  grid-template-columns: 1fr 1.4fr 38px 38px 38px 38px 50px;
  gap: 4px;
  align-items: center;
  min-width: 550px;
}
.bt-header {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.25);
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding-bottom: 9px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 4px;
}
.bt-row {
  padding: 9px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.bt-row:last-child {
  border-bottom: none;
}
.bt-name {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bt-dis {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.28);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bnum {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 700;
  text-align: center;
}
.bnum-runs {
  color: #ffd700 !important;
  font-size: 14px;
}
.bt-batting .bt-name {
  color: #fff;
  font-weight: 800;
}
.bt-batting .bnum {
  color: #00d4ff;
}
.bt-out .bt-name {
  color: rgba(255, 255, 255, 0.4);
}
.bt-yet .bt-name {
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}
.bat-sprite {
  font-size: 12px;
}
.cap-tag {
  font-size: 10px;
  color: #ffd700;
  margin-left: 3px;
}
.wk-tag {
  font-size: 10px;
  color: #22c55e;
  margin-left: 3px;
}
.sv-sr {
  color: #a855f7 !important;
}

/* Innings footer */
.innings-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  gap: 10px;
  flex-wrap: wrap;
}
.if-extras {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}
.if-total strong {
  color: #fff;
  font-size: 15px;
}
.if-total span {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  margin-left: 6px;
}

/* Bowling table */
.bowl-title {
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  margin: 20px 0 12px;
}
.bwl-header,
.bwl-row {
  display: grid;
  grid-template-columns: 1fr 40px 40px 40px 44px 52px;
  gap: 4px;
  align-items: center;
  min-width: 420px;
}
.bwl-header {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.25);
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 4px;
}
.bwl-row {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.bwl-row:last-child {
  border-bottom: none;
}
.bwl-name {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bwl-current .bwl-name {
  color: #ff3d57;
  font-weight: 800;
}
.red-val {
  color: #ff3d57 !important;
}
.blue-val {
  color: #00d4ff !important;
}
.bwl-empty {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.2);
  padding: 12px 0;
  font-style: italic;
}

/* Fall of Wickets */
.fow-section {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.fow-title {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 10px;
}
.fow-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.fow-chip {
  padding: 5px 12px;
  background: rgba(255, 61, 87, 0.07);
  border: 1px solid rgba(255, 61, 87, 0.15);
  border-radius: 7px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 600;
}

/* Over chart */
.over-bars {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding: 20px 0;
  overflow-x: auto;
  min-height: 160px;
}
.ov-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  width: 36px;
}
.ov-bar-wrap {
  width: 26px;
  height: 100px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.ov-bar {
  width: 100%;
  border-radius: 4px;
  transition: height 0.6s ease;
}
.ov-runs {
  font-size: 11px;
  font-weight: 800;
  color: #fff;
}
.ov-num {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.25);
  font-weight: 700;
}

/* Squads */
.squads-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
@media (max-width: 640px) {
  .squads-grid {
    grid-template-columns: 1fr;
  }
}
.squad-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 20px;
}
.squad-h {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 800;
  color: #fff;
}
.sq-badge {
  padding: 7px 12px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 900;
  color: #fff;
}
.sq-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.sq-row:last-child {
  border-bottom: none;
}
.sq-em {
  font-size: 14px;
}
.sq-name {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
}
.sq-cap {
  font-size: 10px;
  color: #ffd700;
  font-weight: 700;
}
.sq-role {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
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

/* Not Found */
.not-found {
  text-align: center;
  padding: 120px 20px;
}
.not-found h2 {
  font-size: 26px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.4);
  margin: 16px 0 24px;
}
</style>
