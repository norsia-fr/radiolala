<template>
    <div id="offcanvasHistory" ref="offcanvasHistoryRef" class="offcanvas offcanvas-end" data-bs-scroll="true" data-bs-backdrop="false"
        tabindex="-1" aria-labelledby="offcanvasHistoryLabel"
        :data-bs-theme="store.options.optionsDark ? 'dark' : 'light'">

        <!-- Header -->
        <div class="offcanvas-header bg-secondary-subtle border-bottom border-dark-subtle">
            <h5 class="offcanvas-title" id="offcanvasHistoryLabel">
                <i class="bi bi-clock-history me-2"></i>Historique
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Fermer"></button>
        </div>

        <!-- Body -->
        <div class="offcanvas-body p-0">
            <p v-if="!historique.length" class="text-center text-muted py-4 px-3">
                <i class="bi bi-clock-history fs-1 d-block mb-2 opacity-50"></i>
                Aucune radio écoutée pour l'instant.
            </p>

            <ul v-else class="list-group list-group-flush">
                <li v-for="entry in historique" :key="entry.id"
                    class="list-group-item d-flex align-items-center gap-2 py-2">

                    <!-- Bloc nom + date -->
                    <div class="flex-grow-1 min-w-0">
                        <div class="fw-semibold text-truncate" :title="entry.nom">{{ entry.nom }}</div>
                        <div class="small text-muted">{{ formatRelative(entry.playedAt) }}</div>
                    </div>

                    <!-- Btn lecture -->
                    <button type="button" class="btn btn-sm btn-outline-success"
                        :class="{ 'active': currentRadio?.id === entry.id && isPlaying }"
                        @click="playFromHistory(entry)"
                        :title="currentRadio?.id === entry.id && isPlaying ? 'En cours' : 'Écouter'">
                        <i :class="['bi', currentRadio?.id === entry.id && isPlaying ? 'bi-soundwave' : 'bi-play-fill']"></i>
                    </button>

                    <!-- Btn ajouter à la playlist courante -->
                    <button v-if="!isInCurrentPlaylist(entry.id)" type="button"
                        class="btn btn-sm btn-outline-primary"
                        @click="addToCurrent(entry)"
                        title="Ajouter à la playlist courante">
                        <i class="bi bi-plus-lg"></i>
                    </button>
                    <span v-else class="btn btn-sm btn-outline-secondary disabled" title="Déjà dans la playlist courante">
                        <i class="bi bi-check2"></i>
                    </span>

                    <!-- Btn supprimer (confirmation rapide à 2 clics) -->
                    <button type="button" class="btn btn-sm"
                        :class="pendingDeleteId === entry.id ? 'btn-danger' : 'btn-outline-secondary'"
                        @click="confirmDelete(entry.id)"
                        :title="pendingDeleteId === entry.id ? 'Cliquez à nouveau pour confirmer' : 'Supprimer de l\'historique'">
                        <i :class="['bi', pendingDeleteId === entry.id ? 'bi-exclamation-triangle-fill' : 'bi-x-lg']"></i>
                    </button>
                </li>
            </ul>
        </div>

        <!-- Footer -->
        <div class="offcanvas-footer bg-body-secondary border-top border-dark-subtle p-2">
            <!-- Toggle activation -->
            <div class="form-check form-switch mb-2 ps-5 ms-1">
                <input id="historiqueEnabled" class="form-check-input" type="checkbox" role="switch"
                    :checked="store.options.historiqueEnabled !== false"
                    @change="store.options.historiqueEnabled = $event.target.checked">
                <label class="form-check-label small" for="historiqueEnabled">
                    Enregistrer l'historique
                </label>
            </div>

            <!-- Vider l'historique (confirmation collapse) -->
            <div v-if="historique.length" class="card border-0">
                <button class="btn btn-outline-danger btn-sm w-100" type="button" data-bs-toggle="collapse"
                    data-bs-target="#confirmClearHistory" aria-expanded="false" aria-controls="confirmClearHistory">
                    <i class="bi bi-trash me-1"></i>Vider l'historique
                </button>
                <div id="confirmClearHistory" class="collapse bg-danger-subtle rounded-bottom mt-1">
                    <div class="card-body text-center text-danger-emphasis py-2">
                        <p class="small mb-2">Supprimer toutes les entrées ?</p>
                        <button type="button" class="btn btn-danger btn-sm" @click="clearAll" data-bs-toggle="collapse" data-bs-target="#confirmClearHistory">
                            Oui, vider
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, inject, defineExpose } from 'vue'
import { useGlobalStore } from '@/store/globalStore'

const store = useGlobalStore()
const historique = computed(() => store.historique)
const { play, currentRadio, isPlaying } = inject('player')

const offcanvasHistoryRef = ref(null)
defineExpose({ offcanvasHistoryRef })

const isInCurrentPlaylist = (id) => {
    return store.radios.some(r => r.id === id)
}

const playFromHistory = (entry) => {
    // playedAt + Object.keys que l'on garde pas
    const { playedAt: _ignored, ...radio } = entry
    play(radio)
}

const addToCurrent = (entry) => {
    const { playedAt: _ignored, ...radio } = entry
    const currentList = store.options.currentPlaylist
    if (!currentList || !store.playlistes[currentList]) return
    store.playlistes[currentList].radios.push(radio)
}

const pendingDeleteId = ref(null)
let pendingTimer = null

const confirmDelete = (id) => {
    if (pendingDeleteId.value === id) {
        store.removeFromHistorique(id)
        pendingDeleteId.value = null
        clearTimeout(pendingTimer)
        return
    }
    pendingDeleteId.value = id
    clearTimeout(pendingTimer)
    pendingTimer = setTimeout(() => { pendingDeleteId.value = null }, 3000)
}

const clearAll = () => {
    store.clearHistorique()
}

const formatRelative = (ts) => {
    const now = Date.now()
    const diff = now - ts
    const min = Math.floor(diff / 60000)
    if (min < 1) return "à l'instant"
    if (min < 60) return `il y a ${min} min`

    const d = new Date(ts)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 6)

    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

    if (d >= today) return `aujourd'hui ${time}`
    if (d >= yesterday) return `hier ${time}`
    if (d >= weekAgo) {
        const dayName = d.toLocaleDateString('fr-FR', { weekday: 'long' })
        return `${dayName} ${time}`
    }
    const thisYear = d.getFullYear() === new Date().getFullYear()
    const dateStr = thisYear
        ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
        : d.toLocaleDateString('fr-FR')
    return `${dateStr} ${time}`
}
</script>

<style scoped>
.min-w-0 { min-width: 0; }
</style>
