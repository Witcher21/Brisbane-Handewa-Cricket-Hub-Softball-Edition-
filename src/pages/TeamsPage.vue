<template>
  <q-page class="dark-page">
    <div class="page-container">
      <div class="page-header">
        <div class="section-chip">🏆 TEAMS</div>
        <h1 class="page-title">Team <span class="grad">Hub</span></h1>
        <p class="page-sub">All franchises competing in the Softball Cricket League 2026</p>
      </div>

      <!-- Standings Table -->
      <div class="standings-card">
        <h2 class="standings-title">📊 Points Table</h2>
        <div class="standings-table">
          <div class="standings-header">
            <span class="col-pos">POS</span>
            <span class="col-team">TEAM</span>
            <span class="col-num">M</span>
            <span class="col-num">W</span>
            <span class="col-num">L</span>
            <span class="col-num">T</span>
            <span class="col-num">PTS</span>
            <span class="col-num">NRR</span>
          </div>
          <div
            v-for="(team, idx) in sortedTeams"
            :key="team.id"
            class="standings-row"
            :class="{ 'row-top': idx === 0 }"
          >
            <span class="col-pos pos-num">{{ idx + 1 }}</span>
            <span class="col-team team-name-col">
              <div class="team-dot" :style="{ background: team.color }" />
              {{ team.name }}
            </span>
            <span class="col-num">{{ team.stats.matches }}</span>
            <span class="col-num won">{{ team.stats.won }}</span>
            <span class="col-num lost">{{ team.stats.lost }}</span>
            <span class="col-num">{{ team.stats.tied }}</span>
            <span class="col-num pts">{{ team.stats.points }}</span>
            <span class="col-num" :class="team.stats.nrr.startsWith('+') ? 'pos-nrr' : 'neg-nrr'">
              {{ team.stats.nrr }}
            </span>
          </div>
        </div>
      </div>

      <!-- Team Cards -->
      <div class="teams-grid">
        <router-link
          v-for="team in store.teams"
          :key="team.id"
          :to="`/teams/${team.id}`"
          class="team-card"
          :style="{ '--team-color': team.color }"
        >
          <!-- Card Top Strip -->
          <div class="team-card-strip" :style="{ background: `linear-gradient(135deg, ${team.color}30, transparent)`, borderTopColor: team.color + '50' }" />

          <!-- Logo & Badge -->
          <div class="team-logo-wrap" :style="{ background: `${team.color}18`, border: `2px solid ${team.color}30` }">
            <span class="team-logo-emoji">🏏</span>
            <div class="team-short-badge" :style="{ background: team.color }">{{ team.shortName }}</div>
          </div>

          <h3 class="team-card-name">{{ team.name }}</h3>
          <div class="team-captain">⭐ Captain: {{ team.captain }}</div>
          <div class="team-founded">Est. {{ team.founded }} · {{ team.venue }}</div>

          <div class="team-card-stats">
            <div class="tc-stat">
              <span class="tc-stat-val" :style="{ color: team.color }">{{ team.stats.won }}</span>
              <span class="tc-stat-lbl">Wins</span>
            </div>
            <div class="tc-stat">
              <span class="tc-stat-val">{{ team.stats.points }}</span>
              <span class="tc-stat-lbl">Points</span>
            </div>
            <div class="tc-stat">
              <span class="tc-stat-val">{{ team.stats.nrr }}</span>
              <span class="tc-stat-lbl">NRR</span>
            </div>
          </div>

          <div class="team-titles">
            <span v-for="title in team.titles" :key="title" class="title-chip">🏆 {{ title }}</span>
          </div>

          <div class="team-card-arrow">View Squad →</div>
        </router-link>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useCricketStore } from 'stores/cricket-store'

const store = useCricketStore()
const sortedTeams = computed(() => [...store.teams].sort((a, b) => b.stats.points - a.stats.points))
</script>

<style scoped>
.dark-page { background: #050d1a; min-height: 100vh; }
.page-container { max-width: 1100px; margin: 0 auto; padding: 60px 32px; }
.page-header { text-align: center; margin-bottom: 40px; }
.section-chip {
  display: inline-block; background: rgba(255,215,0,0.08); border: 1px solid rgba(255,215,0,0.2);
  color: #ffd700; padding: 4px 14px; border-radius: 20px;
  font-size: 11px; font-weight: 700; letter-spacing: 2px; margin-bottom: 14px;
}
.page-title { font-size: clamp(32px,5vw,52px); font-weight: 900; color: white; letter-spacing: -1.5px; margin: 0 0 10px; }
.grad { background: linear-gradient(135deg,#ffd700,#ff8c00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.page-sub { color: rgba(255,255,255,0.4); font-size: 15px; margin: 0; }

/* Standings */
.standings-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 28px; margin-bottom: 40px; }
.standings-title { font-size: 17px; font-weight: 800; color: white; margin: 0 0 20px; }
.standings-table { display: flex; flex-direction: column; gap: 0; }
.standings-header, .standings-row { display: grid; grid-template-columns: 48px 1fr 40px 40px 40px 40px 48px 56px; gap: 0; align-items: center; }
.standings-header {
  padding: 8px 12px; font-size: 10px; color: rgba(255,255,255,0.3); font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
}
.standings-row { padding: 14px 12px; border-top: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; }
.standings-row:hover { background: rgba(255,255,255,0.03); }
.row-top { background: rgba(255,215,0,0.04); border-top-color: rgba(255,215,0,0.1); }
.col-pos { font-size: 14px; font-weight: 800; color: rgba(255,255,255,0.4); }
.col-team { font-size: 13px; color: rgba(255,255,255,0.7); font-weight: 600; display: flex; align-items: center; gap: 8px; }
.col-num { font-size: 13px; color: rgba(255,255,255,0.6); font-weight: 700; text-align: center; }
.pos-num { color: rgba(255,255,255,0.7); }
.won { color: #22c55e; }
.lost { color: #ff3d57; }
.pts { color: #ffd700; font-size: 15px; }
.pos-nrr { color: #22c55e; }
.neg-nrr { color: #ff3d57; }
.team-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

/* Team Cards */
.teams-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.team-card {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px; padding: 28px; display: flex; flex-direction: column; gap: 12px;
  text-decoration: none; transition: all 0.3s; position: relative; overflow: hidden;
}
.team-card:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(0,0,0,0.4); border-color: var(--team-color, rgba(255,255,255,0.2)); }
.team-card-strip { position: absolute; top: 0; left: 0; right: 0; height: 4px; border-top-width: 1px; border-top-style: solid; }

.team-logo-wrap { width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center; position: relative; }
.team-logo-emoji { font-size: 36px; }
.team-short-badge {
  position: absolute; bottom: -6px; right: -6px;
  color: #050d1a; font-size: 11px; font-weight: 900; letter-spacing: 0.5px;
  padding: 2px 8px; border-radius: 8px;
}

.team-card-name { font-size: 20px; font-weight: 900; color: white; margin: 0; }
.team-captain  { font-size: 12px; color: rgba(255,255,255,0.5); font-weight: 600; }
.team-founded  { font-size: 11px; color: rgba(255,255,255,0.3); }

.team-card-stats { display: flex; gap: 24px; padding: 16px 0; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); }
.tc-stat { text-align: center; }
.tc-stat-val { display: block; font-size: 22px; font-weight: 900; color: white; font-family: 'Outfit','Roboto',sans-serif; }
.tc-stat-lbl { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 1px; text-transform: uppercase; font-weight: 600; }

.team-titles { display: flex; flex-wrap: wrap; gap: 6px; }
.title-chip { background: rgba(255,215,0,0.08); border: 1px solid rgba(255,215,0,0.2); color: #ffd700; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }

.team-card-arrow { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.3); margin-top: 4px; transition: all 0.2s; }
.team-card:hover .team-card-arrow { color: var(--team-color); }
</style>
