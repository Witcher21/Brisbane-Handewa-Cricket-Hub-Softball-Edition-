<template>
  <q-page class="dark-page">
    <div v-if="team" class="page-container">
      <router-link to="/teams" class="back-link">← Back to Teams</router-link>

      <!-- Team Hero -->
      <div class="team-hero" :style="{ '--tcolor': team.color }">
        <div class="team-hero-bg" :style="{ background: `radial-gradient(circle at 20% 50%, ${team.color}18, transparent 60%)` }" />
        <div class="team-hero-content">
          <div class="team-hero-logo" :style="{ background: `${team.color}18`, border: `2px solid ${team.color}30` }">
            <span style="font-size:64px">🏏</span>
            <div class="team-short" :style="{ background: team.color }">{{ team.shortName }}</div>
          </div>
          <div>
            <h1 class="team-hero-name">{{ team.name }}</h1>
            <div class="team-hero-meta">
              <span>⭐ {{ team.captain }}</span>
              <span>📍 {{ team.venue }}</span>
              <span>📅 Est. {{ team.founded }}</span>
            </div>
            <p class="team-desc">{{ team.description }}</p>
            <div class="team-titles-row">
              <span v-for="t in team.titles" :key="t" class="title-chip">🏆 {{ t }}</span>
            </div>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="team-stats-bar">
          <div v-for="s in teamStatItems" :key="s.label" class="team-stat-item">
            <span class="tsi-val" :style="{ color: s.color || team.color }">{{ s.value }}</span>
            <span class="tsi-lbl">{{ s.label }}</span>
          </div>
        </div>
      </div>

      <!-- Squad -->
      <h2 class="squad-heading">Current Squad</h2>
      <div v-if="teamPlayers.length" class="squad-grid">
        <router-link
          v-for="player in teamPlayers"
          :key="player.id"
          :to="`/players/${player.id}`"
          class="squad-card"
        >
          <div class="sq-avatar" :style="{ background: getRoleGradient(player.role) }">
            <span style="font-size:24px">{{ getRoleEmoji(player.role) }}</span>
            <div class="sq-num">#{{ player.number }}</div>
          </div>
          <div class="sq-info">
            <div class="sq-role" :class="`role-${player.role.toLowerCase().replace('-','')}`">{{ player.role }}</div>
            <div class="sq-name">{{ player.name }}</div>
            <div class="sq-nick">"{{ player.nickname }}"</div>
          </div>
          <div class="sq-stats">
            <span v-if="player.role !== 'Bowler'">{{ player.stats.runs }} runs</span>
            <span v-if="player.role !== 'Batsman'">{{ player.stats.wickets }} wkts</span>
          </div>
        </router-link>
      </div>
      <div v-else class="no-squad">No players linked to this team yet.</div>
    </div>

    <div v-else class="not-found">
      <div style="font-size:64px">🏏</div>
      <h2 style="color:white">Team Not Found</h2>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCricketStore } from 'stores/cricket-store'

const route = useRoute()
const store = useCricketStore()
const team  = computed(() => store.getTeamById(route.params.id))
const teamPlayers = computed(() => store.getPlayersByTeam(route.params.id))
const teamStatItems = computed(() => {
  if (!team.value) return []
  const s = team.value.stats
  return [
    { label: 'Matches', value: s.matches },
    { label: 'Won',     value: s.won,    color: '#22c55e' },
    { label: 'Lost',    value: s.lost,   color: '#ff3d57' },
    { label: 'Tied',    value: s.tied },
    { label: 'Points',  value: s.points, color: '#ffd700' },
    { label: 'NRR',     value: s.nrr, color: s.nrr.startsWith('+') ? '#22c55e' : '#ff3d57' },
  ]
})
function getRoleGradient(role) {
  return { Batsman: 'linear-gradient(135deg,#00d4ff18,#0080ff18)', Bowler: 'linear-gradient(135deg,#ff450018,#ff000018)', 'All-rounder': 'linear-gradient(135deg,#a855f718,#6366f118)' }[role] || 'none'
}
function getRoleEmoji(role) {
  return { Batsman: '🏏', Bowler: '⚾', 'All-rounder': '⚡' }[role] || '🏏'
}
</script>

<style scoped>
.dark-page { background: #050d1a; min-height: 100vh; }
.page-container { max-width: 1000px; margin: 0 auto; padding: 40px 32px 80px; }
.back-link { color: rgba(255,255,255,0.4); text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block; margin-bottom: 28px; transition: color 0.2s; }
.back-link:hover { color: #00d4ff; }

.team-hero { border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 36px; margin-bottom: 40px; position: relative; overflow: hidden; }
.team-hero-bg { position: absolute; inset: 0; pointer-events: none; }
.team-hero-content { display: flex; gap: 32px; align-items: flex-start; flex-wrap: wrap; position: relative; z-index: 1; margin-bottom: 28px; }
.team-hero-logo { width: 120px; height: 120px; border-radius: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; }
.team-short { position: absolute; bottom: -8px; right: -8px; color: #050d1a; font-size: 12px; font-weight: 900; padding: 2px 9px; border-radius: 8px; }
.team-hero-name { font-size: clamp(28px,4vw,44px); font-weight: 900; color: white; letter-spacing: -1px; margin: 0 0 12px; }
.team-hero-meta { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
.team-hero-meta span { font-size: 13px; color: rgba(255,255,255,0.5); font-weight: 600; }
.team-desc { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.7; margin: 0 0 14px; }
.team-titles-row { display: flex; gap: 8px; flex-wrap: wrap; }
.title-chip { background: rgba(255,215,0,0.08); border: 1px solid rgba(255,215,0,0.2); color: #ffd700; font-size: 11px; font-weight: 700; padding: 3px 11px; border-radius: 20px; }

.team-stats-bar { display: flex; gap: 32px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap; position: relative; z-index: 1; }
.team-stat-item { text-align: center; }
.tsi-val { display: block; font-size: 28px; font-weight: 900; font-family: 'Outfit','Roboto',sans-serif; color: var(--tcolor); }
.tsi-lbl { font-size: 10px; color: rgba(255,255,255,0.35); font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }

.squad-heading { font-size: 20px; font-weight: 900; color: white; margin: 0 0 20px; }
.squad-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.squad-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; text-decoration: none; transition: all 0.3s; }
.squad-card:hover { border-color: rgba(0,212,255,0.2); transform: translateX(4px); background: rgba(255,255,255,0.05); }
.sq-avatar { width: 54px; height: 54px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; border: 1px solid rgba(255,255,255,0.1); }
.sq-num { position: absolute; bottom: -4px; right: -4px; background: #050d1a; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 5px; }
.sq-info { flex: 1; min-width: 0; }
.sq-role { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; padding: 2px 8px; border-radius: 5px; display: inline-block; margin-bottom: 4px; }
.role-batsman    { background: rgba(0,212,255,0.12); color: #00d4ff; }
.role-bowler     { background: rgba(255,61,87,0.12); color: #ff3d57; }
.role-allrounder { background: rgba(168,85,247,0.12); color: #a855f7; }
.sq-name { font-size: 14px; font-weight: 800; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sq-nick { font-size: 11px; color: rgba(255,255,255,0.3); font-style: italic; }
.sq-stats { font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 700; white-space: nowrap; }
.no-squad { text-align: center; padding: 60px; color: rgba(255,255,255,0.3); font-size: 15px; }
.not-found { text-align: center; padding: 120px 20px; }
</style>
