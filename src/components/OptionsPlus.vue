<template>
    <div id="divPlus" class="text-center text-success animate__animated animate__fadeIn">
        <p class="bg-success-subtle border-bottom border-success-subtle fw-bold h5 mb-4 py-4 text-success-emphasis">Ajouter</p>

        <div class="px-3 mt-3">
            <!-- Ajouter une radio vierge -->
            <button class="btn btn-success me-2" @click="store.addRadio(radioVide())">
                <i class="bi bi-plus-circle me-2"></i>Radio vierge
            </button>

            <!-- Ajouter un dossier -->
            <button class="btn btn-success" @click="store.addNewFolder()">
                <i class="bi bi-plus-circle me-2"></i>Dossier
            </button>

            <!-- Recherche -->
            <div class="input-group mt-2">
                <RadioSearch />
            </div>
        </div>
    </div>
</template>

<script setup>
import RadioSearch from './RadioSearch.vue'
import { useGlobalStore } from '@/store/globalStore'

const store = useGlobalStore()

function radioVide() {
    const hash = Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    return {
        stationuuid: hash,
        name: 'Radio Lala',
        url_resolved: 'endless.mp3',
        homepage: '',
        favicon: '',
        descr: 'Vous pouvez maintenant ajouter les infos de flux etc...',
        tags: 'endless',
        country: '',
        codec: 'MP3',
        bitrate: '',
        color: 'danger',
        volume: 1,
        folder: null
    }
}
</script>
