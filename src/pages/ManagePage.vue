<template>
  <q-page class="dark-page">
    <div class="page-container">
      <!-- HEADER -->
      <div class="page-header">
        <div class="sec-chip">⚙️ MANAGEMENT</div>
        <h1 class="page-title">Squad <span class="grad">Manager</span></h1>
        <p class="page-sub">Add teams · Register players · Create matches · Start live scoring</p>
        <button class="reset-demo-btn" @click="confirmReset">🔄 Reset to Demo</button>
      </div>

      <!-- TABS -->
      <div class="tabs-row">
        <button v-for="t in tabs" :key="t.v" class="tab-btn" :class="{ 'tab-active': activeTab === t.v }" @click="activeTab = t.v">
          {{ t.icon }} {{ t.l }}
          <span v-if="t.v === 'matches' && store.matches.length" class="tab-count">{{ store.matches.length }}</span>
        </button>
      </div>

      <!-- ── TEAMS TAB ── -->
      <div v-if="activeTab === 'teams'">
        <div class="action-bar">
          <h2 class="sub-title">Teams ({{ store.teams.length }})</h2>
          <button class="btn-add" @click="showAddTeam = !showAddTeam">+ Add Team</button>
        </div>

        <div v-if="showAddTeam" class="form-card">
          <h3 class="form-title">➕ New Team</h3>
          <div class="form-grid">
            <div class="form-field">
              <label>Team Name *</label>
              <input v-model="newTeam.name" placeholder="e.g. Galle Gladiators" />
            </div>
            <div class="form-field">
              <label>Short Name *</label>
              <input v-model="newTeam.shortName" maxlength="4" placeholder="e.g. GGL" />
            </div>
            <div class="form-field">
              <label>Primary Color</label>
              <div class="color-row">
                <input type="color" v-model="newTeam.color" class="color-input" />
                <span class="color-preview" :style="{ background: newTeam.color }">{{ newTeam.color }}</span>
              </div>
            </div>
            <div class="form-field">
              <label>Venue</label>
              <input v-model="newTeam.venue" placeholder="e.g. Galle Stadium" />
            </div>
            <div class="form-field">
              <label>Founded Year</label>
              <input v-model.number="newTeam.founded" type="number" placeholder="2024" />
            </div>
            <div class="form-field full-width">
              <label>Description</label>
              <textarea v-model="newTeam.description" rows="2" placeholder="Team description..." />
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-submit" @click="submitTeam" :disabled="!newTeam.name || !newTeam.shortName">Create Team</button>
            <button class="btn-cancel" @click="showAddTeam = false">Cancel</button>
          </div>
        </div>

        <div class="teams-list">
          <div v-if="!store.teams.length" class="empty-state">No teams yet. Add your first team above!</div>
          <div v-for="team in store.teams" :key="team.id" class="team-manage-card" :style="{ '--tc': team.color }">
            <div class="tmc-left">
              <div class="tmc-badge" :style="{ background: team.color }">{{ team.shortName }}</div>
              <div>
                <div class="tmc-name">{{ team.name }}</div>
                <div class="tmc-meta">{{ team.playerIds.length }}/15 players · {{ team.venue }}</div>
                <div class="tmc-wl">W{{ team.stats.won }} L{{ team.stats.lost }} · {{ team.stats.points }}pts</div>
              </div>
            </div>
            <div class="tmc-right">
              <div class="player-count-bar">
                <div class="pcb-fill" :style="{ width: `${(team.playerIds.length / 15) * 100}%`, background: team.color }" />
              </div>
              <span class="pcb-label">{{ team.playerIds.length }}/15</span>
              <button class="btn-sm" @click="selectTeam(team.id)">Manage Squad</button>
              <button class="btn-sm btn-danger" @click="confirmDeleteTeam(team.id)">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── PLAYERS TAB ── -->
      <div v-if="activeTab === 'players'">
        <div class="action-bar">
          <div class="filter-team-row">
            <h2 class="sub-title">Players ({{ filteredPlayers.length }})</h2>
            <select v-model="filterTeamId" class="team-select">
              <option :value="null">All Teams</option>
              <option v-for="t in store.teams" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <button class="btn-add" @click="showAddPlayer = !showAddPlayer">+ Add Player</button>
        </div>

        <div v-if="showAddPlayer" class="form-card">
          <h3 class="form-title">➕ New Player</h3>
          <div class="form-grid">
            <div class="form-field">
              <label>Full Name *</label>
              <input v-model="newPlayer.name" placeholder="e.g. Sachin Mendis" />
            </div>
            <div class="form-field">
              <label>Nickname</label>
              <input v-model="newPlayer.nickname" placeholder="e.g. The Legend" />
            </div>
            <div class="form-field">
              <label>Team *</label>
              <select v-model="newPlayer.teamId" class="form-select">
                <option :value="null" disabled>Select team</option>
                <option v-for="t in store.teams" :key="t.id" :value="t.id" :disabled="t.playerIds.length >= 15">
                  {{ t.name }} ({{ t.playerIds.length }}/15){{ t.playerIds.length >= 15 ? ' — FULL' : '' }}
                </option>
              </select>
            </div>
            <div class="form-field">
              <label>Role *</label>
              <select v-model="newPlayer.role" class="form-select">
                <option>Batsman</option>
                <option>Bowler</option>
                <option>All-rounder</option>
                <option>Wicket-keeper</option>
              </select>
            </div>
            <div class="form-field">
              <label>Jersey #</label>
              <input v-model.number="newPlayer.number" type="number" min="1" max="99" placeholder="e.g. 12" />
            </div>
            <div class="form-field">
              <label>Age</label>
              <input v-model.number="newPlayer.age" type="number" min="14" max="60" placeholder="e.g. 22" />
            </div>
            <div class="form-field">
              <label>Nationality</label>
              <input v-model="newPlayer.nationality" placeholder="e.g. Sri Lankan" />
            </div>
            <div class="form-field">
              <label>Batting Style</label>
              <select v-model="newPlayer.battingStyle" class="form-select">
                <option>Right-hand bat</option>
                <option>Left-hand bat</option>
              </select>
            </div>
            <div class="form-field">
              <label>Bowling Style</label>
              <select v-model="newPlayer.bowlingStyle" class="form-select">
                <option>Right-arm fast</option>
                <option>Right-arm fast-medium</option>
                <option>Right-arm medium</option>
                <option>Right-arm off-spin</option>
                <option>Left-arm fast</option>
                <option>Left-arm medium</option>
                <option>Slow left-arm orthodox</option>
                <option>Left-arm spin</option>
                <option>None</option>
              </select>
            </div>
            <div class="form-field full-width">
              <label>About Player</label>
              <textarea v-model="newPlayer.description" rows="2" placeholder="Brief description..." />
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-submit" @click="submitPlayer" :disabled="!newPlayer.name || !newPlayer.teamId">Add Player</button>
            <button class="btn-cancel" @click="showAddPlayer = false">Cancel</button>
          </div>
          <div v-if="addPlayerErr" class="form-err">⚠️ {{ addPlayerErr }}</div>
        </div>

        <div class="players-manage-list">
          <div v-if="!filteredPlayers.length" class="empty-state">No players found.</div>
          <div v-for="player in filteredPlayers" :key="player.id" class="pm-row">
            <div class="pm-av" :style="{ background: roleGrad(player.role) }">
              <span>{{ roleEm(player.role) }}</span>
              <span class="pm-num">#{{ player.number }}</span>
            </div>
            <div class="pm-info">
              <div class="pm-role" :class="`r-${safeRole(player.role)}`">{{ player.role }}</div>
              <div class="pm-name">{{ player.name }}</div>
              <div class="pm-team-tag">{{ getTeamName(player.teamId) }}</div>
            </div>
            <div class="pm-stats">
              <span v-if="player.role !== 'Bowler'"><strong>{{ player.stats.runs }}</strong> R</span>
              <span v-if="player.role !== 'Batsman'"><strong>{{ player.stats.wickets }}</strong> W</span>
              <span><strong>{{ player.stats.matches }}</strong> M</span>
            </div>
            <div class="pm-actions">
              <router-link :to="`/players/${player.id}`" class="btn-sm">Profile</router-link>
              <button class="btn-sm" @click="store.setCaptain(player.teamId, player.id)">★ Captain</button>
              <button class="btn-sm btn-danger" @click="confirmDeletePlayer(player.id)">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── MATCHES TAB ── -->
      <div v-if="activeTab === 'matches'">
        <div class="action-bar">
          <h2 class="sub-title">Matches ({{ store.matches.length }})</h2>
          <button class="btn-add" @click="showCreateMatch = !showCreateMatch" :disabled="store.teams.length < 2">
            + Schedule Match
          </button>
        </div>

        <div v-if="store.teams.length < 2" class="warn-banner">
          ⚠️ You need at least 2 teams to create a match. Add more teams first.
        </div>

        <!-- Create Match Form -->
        <div v-if="showCreateMatch" class="form-card">
          <h3 class="form-title">📅 Schedule New Match</h3>
          <div class="form-grid">
            <div class="form-field">
              <label>Team A (Batting First) *</label>
              <select v-model="newMatch.teamAId" class="form-select">
                <option :value="null" disabled>Select team</option>
                <option v-for="t in store.teams" :key="t.id" :value="t.id" :disabled="t.id === newMatch.teamBId">
                  {{ t.name }}
                </option>
              </select>
            </div>
            <div class="form-field">
              <label>Team B (Fielding First) *</label>
              <select v-model="newMatch.teamBId" class="form-select">
                <option :value="null" disabled>Select team</option>
                <option v-for="t in store.teams" :key="t.id" :value="t.id" :disabled="t.id === newMatch.teamAId">
                  {{ t.name }}
                </option>
              </select>
            </div>
            <div class="form-field">
              <label>Date *</label>
              <input type="date" v-model="newMatch.date" />
            </div>
            <div class="form-field">
              <label>Time</label>
              <input type="time" v-model="newMatch.time" />
            </div>
            <div class="form-field">
              <label>Venue</label>
              <input v-model="newMatch.venue" placeholder="e.g. Handewa Ground" />
            </div>
            <div class="form-field">
              <label>Format</label>
              <select v-model="newMatch.format" class="form-select">
                <option>T20</option>
                <option>ODI</option>
                <option>T10</option>
                <option>Test</option>
              </select>
            </div>
            <div class="form-field">
              <label>Overs</label>
              <input v-model.number="newMatch.overs" type="number" min="5" max="50" placeholder="20" />
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-submit" @click="submitMatch" :disabled="!newMatch.teamAId || !newMatch.teamBId || !newMatch.date">
              Schedule Match
            </button>
            <button class="btn-cancel" @click="showCreateMatch = false">Cancel</button>
          </div>
        </div>

        <!-- Matches List -->
        <div class="matches-manage-list">
          <div v-if="!store.matches.length" class="empty-state">No matches scheduled yet.</div>

          <!-- LIVE match -->
          <div v-if="store.liveMatch" class="match-manage-card live-card">
            <div class="mm-status live-badge"><span class="live-dot" />LIVE</div>
            <div class="mm-teams">
              <div class="mm-team-badge" :style="{ background: store.getTeamById(store.liveMatch.teamAId)?.color }">
                {{ store.getTeamById(store.liveMatch.teamAId)?.shortName }}
              </div>
              <div class="mm-score" v-if="store.liveMatch.innings[0]">
                {{ store.liveMatch.innings[0].runs }}/{{ store.liveMatch.innings[0].wickets }}
                <span>({{ store.liveMatch.innings[0].overs }} ov)</span>
              </div>
              <span class="mm-vs">vs</span>
              <div class="mm-team-badge" :style="{ background: store.getTeamById(store.liveMatch.teamBId)?.color }">
                {{ store.getTeamById(store.liveMatch.teamBId)?.shortName }}
              </div>
            </div>
            <div class="mm-info">
              {{ store.getTeamById(store.liveMatch.teamAId)?.name }} vs
              {{ store.getTeamById(store.liveMatch.teamBId)?.name }}
            </div>
            <div class="mm-actions">
              <router-link :to="`/matches/${store.liveMatch.id}`" class="btn-sm">View Scorecard</router-link>
              <router-link to="/admin" class="btn-sm btn-orange">⚡ Scorer</router-link>
              <button class="btn-sm btn-danger" @click="confirmEndMatch(store.liveMatch.id)">End Match</button>
            </div>
          </div>

          <!-- Upcoming matches -->
          <div v-for="m in store.upcomingMatches" :key="m.id" class="match-manage-card upcoming-card">
            <div class="mm-status upcoming-badge">📅 UPCOMING</div>
            <div class="mm-teams">
              <div class="mm-team-badge sm" :style="{ background: store.getTeamById(m.teamAId)?.color }">
                {{ store.getTeamById(m.teamAId)?.shortName }}
              </div>
              <span class="mm-vs">vs</span>
              <div class="mm-team-badge sm" :style="{ background: store.getTeamById(m.teamBId)?.color }">
                {{ store.getTeamById(m.teamBId)?.shortName }}
              </div>
            </div>
            <div class="mm-info">
              {{ store.getTeamById(m.teamAId)?.name }} vs {{ store.getTeamById(m.teamBId)?.name }}
            </div>
            <div class="mm-date">{{ formatDate(m.date) }} · {{ m.time }} · {{ m.venue }} · {{ m.format }}</div>
            <div class="mm-actions">
              <button class="btn-sm btn-green" @click="confirmStartMatch(m.id)">▶ Start Match</button>
              <button class="btn-sm btn-danger" @click="store.deleteMatch(m.id)">Delete</button>
            </div>
          </div>

          <!-- Completed matches -->
          <div v-for="m in store.completedMatches" :key="m.id" class="match-manage-card completed-card">
            <div class="mm-status completed-badge">✅ COMPLETED</div>
            <div class="mm-teams">
              <div class="mm-team-badge sm" :style="{ background: store.getTeamById(m.teamAId)?.color }">
                {{ store.getTeamById(m.teamAId)?.shortName }}
              </div>
              <span class="mm-vs">vs</span>
              <div class="mm-team-badge sm" :style="{ background: store.getTeamById(m.teamBId)?.color }">
                {{ store.getTeamById(m.teamBId)?.shortName }}
              </div>
            </div>
            <div class="mm-info">{{ m.result || 'Match complete' }}</div>
            <div class="mm-actions">
              <router-link :to="`/matches/${m.id}`" class="btn-sm">View Scorecard</router-link>
              <button class="btn-sm btn-danger" @click="store.deleteMatch(m.id)">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TEAM DETAIL DRAWER ── -->
      <div v-if="selectedTeamId" class="team-detail-overlay" @click.self="selectedTeamId = null">
        <div class="team-detail-panel">
          <button class="panel-close" @click="selectedTeamId = null">✕</button>
          <div v-if="selectedTeam">
            <div class="panel-header">
              <div class="panel-badge" :style="{ background: selectedTeam.color }">{{ selectedTeam.shortName }}</div>
              <div>
                <h3 class="panel-title-text">{{ selectedTeam.name }}</h3>
                <div class="panel-sub">{{ selectedTeam.playerIds.length }}/15 players</div>
              </div>
            </div>

            <div class="panel-section">
              <div class="panel-sec-title">⭐ Captain</div>
              <select v-model="tempCaptainId" class="form-select" @change="store.setCaptain(selectedTeam.id, tempCaptainId)">
                <option :value="null">No captain selected</option>
                <option v-for="p in teamPlayersList" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>

            <div class="panel-section">
              <div class="panel-sec-title">Squad ({{ teamPlayersList.length }}/15)</div>
              <div class="panel-players">
                <div v-if="!teamPlayersList.length" class="empty-state-sm">No players in this team yet.</div>
                <div v-for="p in teamPlayersList" :key="p.id" class="pp-row">
                  <span class="pp-em">{{ roleEm(p.role) }}</span>
                  <span class="pp-name">{{ p.name }}</span>
                  <span v-if="p.id === selectedTeam.captainId" class="pp-cap">⭐</span>
                  <span class="pp-role" :class="`r-${safeRole(p.role)}`">{{ p.role }}</span>
                  <button class="pp-del" @click="confirmDeletePlayer(p.id)">✕</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── CONFIRM DIALOG (Vue-native, no window.confirm) ── -->
      <teleport to="body">
        <div v-if="confirmDialog.show" class="cdialog-back" @click.self="confirmDialog.show=false">
          <div class="cdialog">
            <div class="cdialog-icon">{{ confirmDialog.icon }}</div>
            <div class="cdialog-title">{{ confirmDialog.title }}</div>
            <div class="cdialog-text">{{ confirmDialog.text }}</div>
            <div class="cdialog-actions">
              <button class="cdb-cancel" @click="confirmDialog.show=false">Cancel</button>
              <button class="cdb-ok" :class="confirmDialog.danger?'cdb-danger':''" @click="runConfirm">{{ confirmDialog.okLabel }}</button>
            </div>
          </div>
        </div>
      </teleport>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCricketStore } from 'stores/cricket-store'

const store = useCricketStore()
const tabs = [
  { v: 'teams',   l: 'Teams',   icon: '🏆' },
  { v: 'players', l: 'Players', icon: '👤' },
  { v: 'matches', l: 'Matches', icon: '📅' },
]
const activeTab       = ref('teams')
const showAddTeam     = ref(false)
const showAddPlayer   = ref(false)
const showCreateMatch = ref(false)
const filterTeamId    = ref(null)
const selectedTeamId  = ref(null)
const addPlayerErr    = ref('')
const tempCaptainId   = ref(null)

const newTeam = ref({ name: '', shortName: '', color: '#00d4ff', venue: '', founded: 2024, description: '' })

const newPlayer = ref({
  name: '', nickname: '', role: 'Batsman', teamId: null,
  number: 0, age: 20, nationality: 'Sri Lankan',
  battingStyle: 'Right-hand bat', bowlingStyle: 'None', description: '',
})

const today = new Date().toISOString().split('T')[0]
const newMatch = ref({
  teamAId: null, teamBId: null,
  date: today, time: '14:00',
  venue: '', format: 'T20', overs: 20,
})

const selectedTeam    = computed(() => store.getTeamById(selectedTeamId.value))
const teamPlayersList = computed(() => selectedTeam.value ? store.getPlayersByTeam(selectedTeam.value.id) : [])
const filteredPlayers = computed(() =>
  filterTeamId.value ? store.players.filter((p) => p.teamId === filterTeamId.value) : store.players
)

watch(selectedTeam, (t) => { if (t) tempCaptainId.value = t.captainId })

function selectTeam(id) { selectedTeamId.value = id }
function getTeamName(id) { return store.getTeamById(id)?.name || 'Unassigned' }

function submitTeam() {
  if (!newTeam.value.name || !newTeam.value.shortName) return
  store.addTeam({ ...newTeam.value })
  newTeam.value = { name: '', shortName: '', color: '#00d4ff', venue: '', founded: 2024, description: '' }
  showAddTeam.value = false
}

function submitPlayer() {
  addPlayerErr.value = ''
  const team = store.getTeamById(newPlayer.value.teamId)
  if (team && team.playerIds.length >= 15) {
    addPlayerErr.value = `${team.name} already has 15 players.`
    return
  }
  const result = store.addPlayer({ ...newPlayer.value })
  if (result !== false) {
    newPlayer.value = { name: '', nickname: '', role: 'Batsman', teamId: null, number: 0, age: 20, nationality: 'Sri Lankan', battingStyle: 'Right-hand bat', bowlingStyle: 'None', description: '' }
    showAddPlayer.value = false
  }
}

function submitMatch() {
  if (!newMatch.value.teamAId || !newMatch.value.teamBId) return
  store.createMatch({ ...newMatch.value })
  newMatch.value = { teamAId: null, teamBId: null, date: today, time: '14:00', venue: '', format: 'T20', overs: 20 }
  showCreateMatch.value = false
  activeTab.value = 'matches'
}

// ─ Custom confirm dialog ──────────────────────────────────────────
const confirmDialog = ref({
  show: false, title: '', text: '', icon: '⚠️', okLabel: 'Confirm', danger: true, action: null,
})

function showConfirm({ title, text, icon='⚠️', okLabel='Confirm', danger=true, action }) {
  confirmDialog.value = { show:true, title, text, icon, okLabel, danger, action }
}

function runConfirm() {
  confirmDialog.value.action?.()
  confirmDialog.value.show = false
}

function confirmStartMatch(id) {
  const m  = store.getMatchById(id)
  const tA = store.getTeamById(m?.teamAId)
  const tB = store.getTeamById(m?.teamBId)
  showConfirm({
    title: 'Start Live Match',
    text:  `Start ${tA?.name} vs ${tB?.name}? This will mark it live and update player stats.`,
    icon:  '▶️', okLabel: 'Start', danger: false,
    action: () => store.startMatch(id),
  })
}

function confirmEndMatch(id) {
  showConfirm({
    title: 'End Match',
    text:  'Enter the result in the Admin page first, then end the match.',
    icon:  '🏁', okLabel: 'End Match', danger: true,
    action: () => store.endMatch(id, 'Match ended'),
  })
}

function confirmDeleteTeam(id) {
  const t = store.getTeamById(id)
  showConfirm({
    title: `Delete Team`,
    text:  `Delete "${t?.name}"? All their players will be unassigned. This cannot be undone.`,
    icon:  '🔴', okLabel: 'Delete', danger: true,
    action: () => store.deleteTeam(id),
  })
}

function confirmDeletePlayer(id) {
  const p = store.getPlayerById(id)
  showConfirm({
    title: 'Remove Player',
    text:  `Remove "${p?.name}" from the roster? This cannot be undone.`,
    icon:  '🚫', okLabel: 'Remove', danger: true,
    action: () => {
      store.deletePlayer(id)
      selectedTeamId.value = null
    },
  })
}

function confirmReset() {
  showConfirm({
    title: 'Reset to Demo Data',
    text:  'This will DELETE all your custom teams, players and matches and restore the default demo. This cannot be undone!',
    icon:  '🔄', okLabel: 'Reset Everything', danger: true,
    action: () => store.resetToDemo(),
  })
}


function formatDate(d) {
  try { return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return d }
}

function safeRole(r) { return (r || '').toLowerCase().replace(/[^a-z]/g, '') }
function roleGrad(r) {
  return { Batsman: '#00d4ff15', Bowler: '#ff3d5715', 'All-rounder': '#a855f715', 'Wicket-keeper': '#22c55e15' }[r] || '#ffffff10'
}
function roleEm(r) {
  return { Batsman: '🏏', Bowler: '⚾', 'All-rounder': '⚡', 'Wicket-keeper': '🧤' }[r] || '🏏'
}
</script>

<style scoped>
.dark-page { background:transparent;min-height:100vh; }
.page-container { max-width:1100px;margin:0 auto;padding:56px 32px 80px;position:relative; }
.page-header { text-align:center;margin-bottom:36px;position:relative; }
.sec-chip { display:inline-block;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);color:#22c55e;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:14px; }
.page-title { font-size:clamp(30px,5vw,52px);font-weight:900;color:#fff;letter-spacing:-1.5px;margin:0 0 8px; }
.grad { background:linear-gradient(135deg,#22c55e,#16a34a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
.page-sub { color:rgba(255,255,255,0.38);font-size:14px;margin:0 0 16px; }
.reset-demo-btn { background:rgba(255,61,87,0.08);border:1px solid rgba(255,61,87,0.2);color:#ff3d57;font-size:12px;font-weight:700;padding:7px 16px;border-radius:8px;cursor:pointer;transition:all 0.2s; }
.reset-demo-btn:hover { background:rgba(255,61,87,0.16); }

/* TABS */
.tabs-row { display:flex;gap:8px;margin-bottom:32px;justify-content:center;flex-wrap:wrap; }
.tab-btn { display:flex;align-items:center;gap:6px;padding:9px 24px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:30px;color:rgba(255,255,255,0.5);font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit; }
.tab-btn:hover { background:rgba(255,255,255,0.08);color:#fff; }
.tab-active { background:rgba(34,197,94,0.12) !important;border-color:rgba(34,197,94,0.3) !important;color:#22c55e !important; }
.tab-count { background:#22c55e;color:#030b18;border-radius:10px;font-size:10px;font-weight:900;padding:1px 6px; }

/* ACTION BAR */
.action-bar { display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px; }
.sub-title { font-size:18px;font-weight:900;color:#fff;margin:0; }
.filter-team-row { display:flex;align-items:center;gap:14px;flex-wrap:wrap; }
.btn-add { background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;font-weight:800;font-size:13px;padding:10px 22px;border-radius:10px;border:none;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 16px rgba(34,197,94,0.25);font-family:inherit; }
.btn-add:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 8px 24px rgba(34,197,94,0.4); }
.btn-add:disabled { opacity:0.35;cursor:not-allowed; }
.warn-banner { background:rgba(255,215,0,0.07);border:1px solid rgba(255,215,0,0.2);border-radius:10px;padding:12px 18px;font-size:13px;font-weight:600;color:#ffd700;margin-bottom:20px; }

/* FORM */
.form-card { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.09);border-radius:16px;padding:28px;margin-bottom:24px; }
.form-title { font-size:16px;font-weight:800;color:#fff;margin:0 0 20px; }
.form-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-bottom:20px; }
.form-field { display:flex;flex-direction:column;gap:5px; }
.form-field.full-width { grid-column:1/-1; }
.form-field label { font-size:11px;color:rgba(255,255,255,0.4);font-weight:700;letter-spacing:1px;text-transform:uppercase; }
.form-field input,.form-field textarea,.form-select,.team-select {
  background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);
  border-radius:8px;padding:10px 12px;color:#fff;font-size:13px;font-family:inherit;
  outline:none;transition:border-color 0.2s;width:100%;box-sizing:border-box;
}
.form-field input:focus,.form-field textarea:focus,.form-select:focus,.team-select:focus { border-color:rgba(34,197,94,0.4); }
.form-field input::placeholder,.form-field textarea::placeholder { color:rgba(255,255,255,0.2); }
.form-select option,.team-select option { background:#0d1f2d;color:#fff; }
.color-row { display:flex;align-items:center;gap:10px; }
.color-input { width:48px;height:36px;border:none;background:none;padding:0;cursor:pointer;border-radius:6px; }
.color-preview { flex:1;padding:8px 12px;border-radius:8px;color:#fff;font-size:12px;font-weight:700; }
.form-actions { display:flex;gap:10px;flex-wrap:wrap; }
.btn-submit { background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;font-weight:800;font-size:13px;padding:10px 22px;border-radius:9px;border:none;cursor:pointer;transition:all 0.2s;font-family:inherit; }
.btn-submit:hover:not(:disabled) { transform:translateY(-2px); }
.btn-submit:disabled { opacity:0.4;cursor:not-allowed; }
.btn-cancel { background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.55);font-size:13px;font-weight:600;padding:10px 20px;border-radius:9px;cursor:pointer;transition:all 0.2s;font-family:inherit; }
.btn-cancel:hover { background:rgba(255,255,255,0.1); }
.form-err { margin-top:12px;padding:10px 14px;background:rgba(255,61,87,0.1);border:1px solid rgba(255,61,87,0.25);border-radius:8px;font-size:13px;color:#ff3d57;font-weight:600; }

/* TEAMS LIST */
.teams-list { display:flex;flex-direction:column;gap:12px; }
.team-manage-card { display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px 22px;gap:16px;flex-wrap:wrap;border-left:3px solid var(--tc); }
.tmc-left { display:flex;align-items:center;gap:14px; }
.tmc-badge { min-width:56px;padding:8px 12px;border-radius:10px;font-size:15px;font-weight:900;color:#fff;text-align:center; }
.tmc-name { font-size:16px;font-weight:800;color:#fff; }
.tmc-meta { font-size:12px;color:rgba(255,255,255,0.35);margin-top:2px; }
.tmc-wl { font-size:11px;color:rgba(255,255,255,0.25);margin-top:2px; }
.tmc-right { display:flex;align-items:center;gap:10px;flex-wrap:wrap; }
.player-count-bar { width:80px;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden; }
.pcb-fill { height:100%;border-radius:3px;transition:width 0.5s; }
.pcb-label { font-size:11px;color:rgba(255,255,255,0.4);font-weight:700;white-space:nowrap; }

/* PLAYERS LIST */
.players-manage-list { display:flex;flex-direction:column;gap:11px; }
.pm-row { display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:14px 18px;flex-wrap:wrap; }
.pm-av { width:48px;height:48px;flex-shrink:0;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:20px;position:relative;border:1.5px solid rgba(255,255,255,0.08); }
.pm-num { position:absolute;bottom:-4px;right:-4px;background:#030b18;border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.55);font-size:9px;font-weight:800;padding:1px 4px;border-radius:4px; }
.pm-info { flex:1;min-width:120px; }
.pm-role { font-size:9px;font-weight:700;letter-spacing:0.8px;padding:2px 7px;border-radius:4px;display:inline-block;margin-bottom:4px; }
.r-batsman       { background:rgba(0,212,255,0.12);color:#00d4ff; }
.r-bowler        { background:rgba(255,61,87,0.12);color:#ff3d57; }
.r-allrounder    { background:rgba(168,85,247,0.12);color:#a855f7; }
.r-wicketkeeper  { background:rgba(34,197,94,0.12);color:#22c55e; }
.pm-name { font-size:14px;font-weight:800;color:#fff;margin-bottom:2px; }
.pm-team-tag { font-size:11px;color:rgba(255,255,255,0.35); }
.pm-stats { display:flex;gap:14px;flex-shrink:0; }
.pm-stats span { font-size:12px;color:rgba(255,255,255,0.45); }
.pm-actions { display:flex;gap:7px;flex-wrap:wrap; }

/* Match Cards */
.matches-manage-list { display:flex;flex-direction:column;gap:14px; }
.match-manage-card { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px 24px; }
.live-card { border-color:rgba(255,61,87,0.2);box-shadow:0 0 24px rgba(255,61,87,0.07); }
.upcoming-card { border-color:rgba(0,212,255,0.1); }
.completed-card { border-color:rgba(34,197,94,0.1);opacity:0.75; }
.mm-status { font-size:10px;font-weight:800;letter-spacing:1.5px;padding:4px 12px;border-radius:20px;display:inline-flex;align-items:center;gap:6px;margin-bottom:12px; }
.live-badge { background:rgba(255,61,87,0.12);border:1px solid rgba(255,61,87,0.25);color:#ff3d57; }
.upcoming-badge { background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.2);color:#00d4ff; }
.completed-badge { background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);color:#22c55e; }
.live-dot { width:6px;height:6px;background:#ff3d57;border-radius:50%;animation:blink 1s infinite;flex-shrink:0; }
@keyframes blink { 0%,100%{opacity:1}50%{opacity:0.2} }
.mm-teams { display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap; }
.mm-team-badge { padding:8px 14px;border-radius:10px;font-size:16px;font-weight:900;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,0.3); }
.mm-team-badge.sm { padding:6px 10px;font-size:13px;border-radius:8px; }
.mm-vs { font-size:11px;color:rgba(255,255,255,0.25);font-weight:700; }
.mm-score { font-size:26px;font-weight:900;color:#fff;letter-spacing:-1px; }
.mm-score span { font-size:12px;color:rgba(255,255,255,0.4);font-weight:400; }
.mm-info { font-size:14px;font-weight:700;color:rgba(255,255,255,0.65);margin-bottom:4px; }
.mm-date { font-size:12px;color:rgba(255,255,255,0.3);margin-bottom:12px; }
.mm-actions { display:flex;gap:8px;flex-wrap:wrap;margin-top:12px; }

/* Buttons */
.btn-sm { display:inline-flex;align-items:center;padding:7px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:rgba(255,255,255,0.65);font-size:12px;font-weight:600;cursor:pointer;text-decoration:none;transition:all 0.2s;font-family:inherit; }
.btn-sm:hover { background:rgba(255,255,255,0.12);color:#fff; }
.btn-danger { background:rgba(255,61,87,0.07) !important;border-color:rgba(255,61,87,0.2) !important;color:#ff3d57 !important; }
.btn-danger:hover { background:rgba(255,61,87,0.14) !important; }
.btn-green { background:rgba(34,197,94,0.1) !important;border-color:rgba(34,197,94,0.25) !important;color:#22c55e !important; }
.btn-green:hover { background:rgba(34,197,94,0.18) !important; }
.btn-orange { background:rgba(249,115,22,0.1) !important;border-color:rgba(249,115,22,0.25) !important;color:#f97316 !important; }
.btn-orange:hover { background:rgba(249,115,22,0.18) !important; }

/* Panel */
.team-detail-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:100;display:flex;align-items:flex-end;justify-content:flex-end; }
.team-detail-panel { width:420px;max-width:100%;height:100%;background:#0a1828;border-left:1px solid rgba(255,255,255,0.08);padding:32px 28px;overflow-y:auto;position:relative; }
.panel-close { position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.08);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:14px; }
.panel-header { display:flex;align-items:center;gap:14px;margin-bottom:28px; }
.panel-badge { padding:10px 14px;border-radius:12px;font-size:17px;font-weight:900;color:#fff; }
.panel-title-text { font-size:18px;font-weight:900;color:#fff;margin:0; }
.panel-sub { font-size:12px;color:rgba(255,255,255,0.4); }
.panel-section { margin-bottom:24px; }
.panel-sec-title { font-size:11px;color:rgba(255,255,255,0.35);font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px; }
.panel-players { display:flex;flex-direction:column;gap:8px; }
.pp-row { display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px; }
.pp-em { font-size:16px; }
.pp-name { flex:1;font-size:13px;font-weight:700;color:#fff; }
.pp-role { font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px; }
.pp-cap { font-size:14px; }
.pp-del { background:rgba(255,61,87,0.07);border:1px solid rgba(255,61,87,0.18);color:#ff3d57;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;font-family:inherit; }
.pp-del:hover { background:rgba(255,61,87,0.15); }

/* Empty */
.empty-state { text-align:center;padding:40px;color:rgba(255,255,255,0.25);font-size:14px;font-weight:600; }
.empty-state-sm { padding:16px;color:rgba(255,255,255,0.25);font-size:13px; }

/* Notifications */
.notif-stack { position:fixed;bottom:24px;right:24px;display:flex;flex-direction:column;gap:8px;z-index:200;max-width:300px; }
.notif-item { background:rgba(3,11,24,0.95);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 16px;font-size:13px;font-weight:600;color:#fff;backdrop-filter:blur(10px); }
.notif-info  { border-color:rgba(0,212,255,0.3);color:#00d4ff; }
.notif-error { border-color:rgba(255,61,87,0.3);color:#ff3d57; }
.notif-live  { border-color:rgba(255,61,87,0.4);color:#ff3d57;background:rgba(255,61,87,0.08); }
.notif-enter-active,.notif-leave-active { transition:all 0.3s; }
.notif-enter-from { opacity:0;transform:translateX(30px); }
.notif-leave-to   { opacity:0;transform:translateX(30px); }
/* \u2500\u2500 Custom Confirm Dialog \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.cdialog-back {
  position:fixed;inset:0;background:rgba(0,0,0,0.65);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;
}
.cdialog {
  background:rgba(10,20,40,0.98);
  border:1px solid rgba(255,255,255,0.12);
  border-radius:20px;padding:32px 28px;max-width:420px;width:100%;
  box-shadow:0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
  text-align:center;
}
.cdialog-icon  { font-size:40px;margin-bottom:12px; }
.cdialog-title { font-size:18px;font-weight:900;color:#fff;margin-bottom:8px; }
.cdialog-text  { font-size:13px;color:rgba(255,255,255,0.55);line-height:1.6;margin-bottom:24px; }
.cdialog-actions { display:flex;gap:10px;justify-content:center; }
.cdb-cancel {
  padding:10px 24px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);
  border-radius:10px;color:rgba(255,255,255,0.55);font-size:13px;font-weight:600;
  cursor:pointer;font-family:inherit;transition:all 0.2s;
}
.cdb-cancel:hover { background:rgba(255,255,255,0.1);color:#fff; }
.cdb-ok {
  padding:10px 24px;background:rgba(0,212,255,0.15);border:1.5px solid rgba(0,212,255,0.3);
  border-radius:10px;color:#00d4ff;font-size:13px;font-weight:700;
  cursor:pointer;font-family:inherit;transition:all 0.2s;
}
.cdb-ok:hover { background:rgba(0,212,255,0.25); }
.cdb-danger {
  background:rgba(255,61,87,0.12) !important;border-color:rgba(255,61,87,0.3) !important;
  color:#ff3d57 !important;
}
.cdb-danger:hover { background:rgba(255,61,87,0.22) !important; }
</style>
