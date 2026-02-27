<template>
  <q-page class="players-page">
    <div class="page-wrap">

      <!-- Header -->
      <div class="ph-header">
        <div>
          <div class="sec-chip">👥 SQUAD</div>
          <h1 class="page-title">All <span class="grad">Players</span></h1>
          <p class="page-sub">{{ allPlayers.length }} registered players across {{ store.teams.length }} teams</p>
        </div>
        <div class="ph-search">
          <input v-model="search" class="search-input" placeholder="Search by name, team, role…" />
          <div class="filter-row">
            <button v-for="r in roles" :key="r" class="role-filter" :class="{ 'rf-active': roleFilter === r }" @click="roleFilter = roleFilter === r ? '' : r">
              {{ r }}
            </button>
          </div>
        </div>
      </div>

      <!-- No players -->
      <div v-if="!filtered.length" class="empty-state">
        <div class="es-icon">🏏</div>
        <p>No players found. Add players in <router-link to="/manage">Manage</router-link>.</p>
      </div>

      <!-- Player grid -->
      <div v-else class="players-grid">
        <router-link
          v-for="p in filtered"
          :key="p.id"
          :to="`/players/${p.id}`"
          class="player-card"
        >
          <!-- Card glow accent -->
          <div class="pc-accent" :style="{ background: teamColor(p.teamId) }" />

          <!-- Avatar -->
          <div class="pc-avatar" :style="{ background: roleGrad(p.role) }">
            <span class="pc-av-em">{{ roleEm(p.role) }}</span>
            <div class="pc-number">#{{ p.number }}</div>
          </div>

          <!-- Info -->
          <div class="pc-info">
            <div class="pc-role-badge" :class="`pr-${safeRole(p.role)}`">{{ p.role }}</div>
            <div class="pc-name">{{ p.name }}</div>
            <div class="pc-nick" v-if="p.nickname && p.nickname !== p.name">"{{ p.nickname }}"</div>
            <div class="pc-team" v-if="getTeam(p.teamId)">
              <span class="pc-team-dot" :style="{ background: teamColor(p.teamId) }" />
              {{ getTeam(p.teamId)?.name }}
            </div>
          </div>

          <!-- Key stats -->
          <div class="pc-stats">
            <div class="pc-stat">
              <span class="pcs-val">{{ p.stats.matches }}</span>
              <span class="pcs-lbl">M</span>
            </div>
            <div class="pc-stat">
              <span class="pcs-val cyan">{{ p.stats.runs }}</span>
              <span class="pcs-lbl">R</span>
            </div>
            <div class="pc-stat" v-if="p.stats.wickets > 0">
              <span class="pcs-val red">{{ p.stats.wickets }}</span>
              <span class="pcs-lbl">W</span>
            </div>
            <div class="pc-stat" v-if="p.stats.highScore > 0">
              <span class="pcs-val gold">{{ p.stats.highScore }}</span>
              <span class="pcs-lbl">HS</span>
            </div>
          </div>

          <div class="pc-arrow">→</div>
        </router-link>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCricketStore } from 'stores/cricket-store'

const store = useCricketStore()
const search     = ref('')
const roleFilter = ref('')
const roles      = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper']

const allPlayers = computed(() => store.players)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return allPlayers.value.filter((p) => {
    const team = store.getTeamById(p.teamId)
    const matchesSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      (p.nickname || '').toLowerCase().includes(q) ||
      (p.role || '').toLowerCase().includes(q) ||
      (team?.name || '').toLowerCase().includes(q) ||
      (p.nationality || '').toLowerCase().includes(q)
    const matchesRole = !roleFilter.value || p.role === roleFilter.value
    return matchesSearch && matchesRole
  })
})

function getTeam(id)      { return store.getTeamById(id) }
function teamColor(teamId) { return store.getTeamById(teamId)?.color || 'rgba(0,212,255,0.3)' }

function safeRole(r) { return (r || '').toLowerCase().replace(/[^a-z]/g, '') }
function roleGrad(r) {
  return {
    Batsman: 'rgba(0,212,255,0.12)',
    Bowler:  'rgba(255,61,87,0.12)',
    'All-rounder': 'rgba(168,85,247,0.12)',
    'Wicket-keeper': 'rgba(34,197,94,0.12)',
  }[r] || 'rgba(255,255,255,0.07)'
}
function roleEm(r) {
  return { Batsman:'🏏', Bowler:'⚾', 'All-rounder':'⚡', 'Wicket-keeper':'🧤' }[r] || '🏏'
}
</script>

<style scoped>
.players-page { min-height:100vh; }
.page-wrap    { max-width:1200px;margin:0 auto;padding:32px 28px 80px; }

/* Header */
.ph-header   { display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:20px;margin-bottom:32px; }
.sec-chip    { display:inline-block;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.22);color:#22c55e;padding:3px 12px;border-radius:20px;font-size:10px;font-weight:800;letter-spacing:2px;margin-bottom:6px; }
.page-title  { font-size:clamp(28px,5vw,46px);font-weight:900;color:#fff;letter-spacing:-1.5px;margin:0 0 6px;line-height:1; }
.grad        { background:linear-gradient(135deg,#22c55e,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
.page-sub    { font-size:13px;color:rgba(255,255,255,0.3);margin:0; }

/* Search + filter */
.ph-search   { display:flex;flex-direction:column;gap:10px;min-width:280px;max-width:380px; }
.search-input { background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 16px;color:#fff;font-size:13px;font-family:inherit;outline:none;width:100%;transition:border 0.2s; }
.search-input:focus { border-color:rgba(0,212,255,0.3); }
.search-input::placeholder { color:rgba(255,255,255,0.25); }
.filter-row  { display:flex;gap:6px;flex-wrap:wrap; }
.role-filter { padding:5px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:20px;color:rgba(255,255,255,0.45);font-size:11px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit; }
.role-filter:hover { background:rgba(255,255,255,0.1);color:#fff; }
.rf-active   { background:rgba(0,212,255,0.12) !important;border-color:rgba(0,212,255,0.3) !important;color:#00d4ff !important; }

/* Empty */
.empty-state { text-align:center;padding:80px 20px; }
.es-icon     { font-size:70px;margin-bottom:16px; }
.empty-state p { font-size:14px;color:rgba(255,255,255,0.3); }
.empty-state a { color:#00d4ff; }

/* Grid */
.players-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px; }

/* Card */
.player-card {
  position:relative;overflow:hidden;
  background:rgba(255,255,255,0.03);
  border:1px solid rgba(255,255,255,0.08);
  border-radius:16px;
  padding:20px;
  text-decoration:none;
  display:flex;flex-direction:column;gap:12px;
  transition:all 0.25s;
  cursor:pointer;
}
.player-card:hover {
  background:rgba(255,255,255,0.06);
  border-color:rgba(0,212,255,0.2);
  transform:translateY(-4px);
  box-shadow:0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.08);
}
.pc-accent {
  position:absolute;top:0;left:0;right:0;height:2px;
  opacity:0.8;
}

/* Avatar */
.pc-avatar {
  width:62px;height:62px;border-radius:14px;
  display:flex;align-items:center;justify-content:center;
  font-size:26px;border:1.5px solid rgba(255,255,255,0.1);
  position:relative;flex-shrink:0;
}
.pc-av-em  { line-height:1; }
.pc-number {
  position:absolute;bottom:-8px;right:-8px;
  background:rgba(3,11,24,0.9);border:1px solid rgba(255,255,255,0.12);
  color:rgba(255,255,255,0.55);font-size:10px;font-weight:900;
  padding:1px 6px;border-radius:6px;
}

/* Info */
.pc-info    { flex:1; }
.pc-role-badge { display:inline-block;font-size:9px;font-weight:800;letter-spacing:1.5px;padding:2px 8px;border-radius:5px;margin-bottom:6px;text-transform:uppercase; }
.pr-batsman      { background:rgba(0,212,255,0.1);color:#00d4ff; }
.pr-bowler       { background:rgba(255,61,87,0.1);color:#ff3d57; }
.pr-allrounder   { background:rgba(168,85,247,0.1);color:#a855f7; }
.pr-wicketkeeper { background:rgba(34,197,94,0.1);color:#22c55e; }
.pc-name   { font-size:16px;font-weight:800;color:#fff;letter-spacing:-0.3px;margin-bottom:2px; }
.pc-nick   { font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:5px; }
.pc-team   { display:flex;align-items:center;gap:6px;font-size:11px;color:rgba(255,255,255,0.4);font-weight:600; }
.pc-team-dot { width:8px;height:8px;border-radius:50%;flex-shrink:0; }

/* Stats row */
.pc-stats  { display:flex;gap:12px;flex-wrap:wrap;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05); }
.pc-stat   { display:flex;flex-direction:column;align-items:center;gap:1px; }
.pcs-val   { font-size:18px;font-weight:900;color:#fff;line-height:1; }
.pcs-val.cyan { color:#00d4ff; }
.pcs-val.red  { color:#ff3d57; }
.pcs-val.gold { color:#ffd700; }
.pcs-lbl   { font-size:9px;color:rgba(255,255,255,0.25);font-weight:700;letter-spacing:1px; }

/* Arrow */
.pc-arrow {
  position:absolute;bottom:16px;right:18px;
  font-size:16px;color:rgba(255,255,255,0.15);
  transition:all 0.2s;
}
.player-card:hover .pc-arrow { color:#00d4ff;transform:translateX(4px); }
</style>
