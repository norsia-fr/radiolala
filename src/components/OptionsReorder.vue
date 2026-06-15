<template>
    <div id="divReorder" class="text-center text-info animate__animated animate__fadeIn">
        <p class="bg-info-subtle border-bottom border-info-subtle fw-bold h5 mb-4 py-4 text-info-emphasis">Réordonnancement</p>
        <div class="px-3">
            <button class="btn btn-info my-3 w-100" :class="{ 'text-bg-info': store.isDragging }"
                @click="toggleDrag">
                {{ store.isDragging ? 'Désactiver le déplacement' : 'Activer le déplacement' }}
            </button>
            <div class="input-group mt-4">
                <label class="input-group-text" for="sortBy">Trier par</label>
                <select class="form-select" id="sortBy" v-model="selectedSortList">
                    <option value="nom" selected>Nom</option>
                    <option value="pays">Pays</option>
                    <option value="langue">Langue</option>
                    <option value="genre">Genre</option>
                </select>
                <button @click="sortList" class="btn btn-outline-secondary" type="button">OK</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGlobalStore } from '@/store/globalStore'
import { useToast } from '@/composables/useToast'

const store = useGlobalStore()
const { showToast } = useToast()

function toggleDrag() {
    store.isDragging = !store.isDragging
    showToast(`Mode drag <strong>${store.isDragging ? 'activé' : 'désactivé'}</strong>`, 'info')
}

const selectedSortList = ref('nom')
const sortList = () => {
    const key = selectedSortList.value
    const all = store.playlistes[store.options.currentPlaylist].radios
    const cmp = (a, b) => String(a[key] ?? '').localeCompare(String(b[key] ?? ''))

    const folders = all.filter(r => r.type === 'folder').sort(cmp)
    const orphans = all.filter(r => r.type !== 'folder' && r.folder == null).sort(cmp)
    const result = []
    for (const folder of folders) {
        result.push(folder)
        const children = all.filter(r => r.folder === folder.id).sort(cmp)
        result.push(...children)
    }
    result.push(...orphans)

    store.playlistes[store.options.currentPlaylist].radios = result
    showToast('La liste a été triée', 'info')
}
</script>
