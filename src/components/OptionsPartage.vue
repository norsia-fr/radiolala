<template>
    <div id="divShare" class="text-center text-share-emphasis animate__animated animate__fadeIn">
        <p class="bg-share-subtle border-bottom border-share-subtle fw-bold h5 mb-4 py-4 text-share-emphasis">Partage</p>

        <!-- Importer (en premier : action courante quand on découvre) -->
        <div class="px-3 mb-4 text-start">
            <h6 class="text-share-emphasis"><i class="bi bi-box-arrow-in-down me-1"></i>Importer</h6>
            <p class="small mb-2">Charger un fichier <code>.json</code> Radiolala (playlist, thème, palette, ou les trois) :</p>
            <button type="button" class="btn btn-share btn-sm w-100" @click="pickImportFile">
                <i class="bi bi-folder2-open me-1"></i>Choisir un fichier
            </button>

            <div v-if="importParsed" class="mt-3 p-2 bg-share-subtle rounded border border-share-subtle">
                <p class="fw-bold small mb-2">Contenu du fichier :</p>
                <template v-if="importParsed.playlists?.length">
                    <p class="small fw-semibold mb-1">Playlists :</p>
                    <div v-for="(pl, i) in importParsed.playlists" :key="i" class="form-check small ms-2">
                        <input :id="`importPL-${i}`" class="form-check-input" type="checkbox" v-model="importChoices.playlists[i]">
                        <label class="form-check-label" :for="`importPL-${i}`">
                            {{ pl.name }} <span class="opacity-75">— {{ pl.radios?.length ?? 0 }} radios</span>
                        </label>
                    </div>
                </template>
                <div v-if="importParsed.theme" class="form-check small mt-2">
                    <input id="importTheme" class="form-check-input" type="checkbox" v-model="importChoices.theme">
                    <label class="form-check-label" for="importTheme">
                        Thème <span class="opacity-75">— {{ importParsed.theme.name }}</span>
                    </label>
                </div>
                <template v-if="importParsed.palettes?.length">
                    <p class="small fw-semibold mb-1 mt-2">Palettes :</p>
                    <div v-for="(pa, i) in importParsed.palettes" :key="i" class="form-check small ms-2">
                        <input :id="`importPalette-${i}`" class="form-check-input" type="checkbox" v-model="importChoices.palettes[i]">
                        <label class="form-check-label" :for="`importPalette-${i}`">
                            {{ pa.name }} <span class="opacity-75">— {{ pa.colors?.length ?? 0 }} couleurs</span>
                        </label>
                    </div>
                </template>
                <button type="button" class="btn btn-success btn-sm w-100 mt-2" @click="doImport"
                    :disabled="!importHasContent">
                    <i class="bi bi-check-lg me-1"></i>Importer la sélection
                </button>
            </div>
        </div>

        <hr class="my-3 mx-3">

        <!-- Exporter -->
        <div class="px-3 text-start">
            <h6 class="text-share-emphasis"><i class="bi bi-box-arrow-up me-1"></i>Exporter</h6>
            <p class="small mb-2">Choisir ce que vous voulez partager :</p>

            <p class="small fw-semibold mb-1">Playlists :</p>
            <div v-for="(playlist, id) in store.playlistes" :key="id" class="form-check small ms-2">
                <input :id="`exportPL-${id}`" class="form-check-input" type="checkbox" v-model="exportPlaylists[id]">
                <label class="form-check-label" :for="`exportPL-${id}`">
                    {{ playlist.name }}
                    <span v-if="id === store.options.currentPlaylist" class="opacity-75">(courante)</span>
                    <span class="opacity-75">— {{ playlist.radios?.length ?? 0 }} radios</span>
                </label>
            </div>

            <div class="form-check small mt-2">
                <input id="exportTheme" class="form-check-input" type="checkbox" v-model="exportTheme">
                <label class="form-check-label" for="exportTheme">
                    Thème actuel <span class="opacity-75">— apparence du player et de la liste</span>
                </label>
            </div>

            <p class="small fw-semibold mb-1 mt-2">Palettes :</p>
            <div v-for="palette in store.palettesPersos" :key="palette.id" class="form-check small ms-2">
                <input :id="`exportPalette-${palette.id}`" class="form-check-input" type="checkbox" v-model="exportPalettesChoice[palette.id]">
                <label class="form-check-label" :for="`exportPalette-${palette.id}`">
                    {{ palette.name }} <span class="opacity-75">— {{ palette.colors?.length ?? 0 }} couleurs</span>
                </label>
            </div>
            <div class="form-check small ms-2">
                <input id="exportCurrentColors" class="form-check-input" type="checkbox" v-model="exportCurrentColors" :disabled="!currentListColors.length">
                <label class="form-check-label" for="exportCurrentColors" :class="{ 'opacity-50': !currentListColors.length }">
                    Couleurs actuelles de la liste <span class="opacity-75">— {{ currentListColors.length }} couleurs</span>
                </label>
            </div>

            <button type="button" class="btn btn-share btn-sm w-100 mt-3" @click="doExport"
                :disabled="!exportHasContent">
                <i class="bi bi-download me-1"></i>Télécharger
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGlobalStore, STYLE_KEYS, COLOR_KEYS } from '@/store/globalStore'
import { useToast } from '@/composables/useToast'

const store = useGlobalStore()
const { showToast } = useToast()

const SHARE_FORMAT = 'radiolala-share'
const SHARE_VERSION = 1

const exportTheme = ref(true)
const exportPlaylists = ref({})
const exportPalettesChoice = ref({}) // id palette perso -> bool
const exportCurrentColors = ref(false)
const importParsed = ref(null)
const importChoices = ref({ playlists: [], theme: false, palettes: [] })

// Couleurs distinctes utilisées dans la playlist courante (la « palette » de la liste).
const currentListColors = computed(() => {
    const list = store.playlistes[store.options.currentPlaylist]?.radios || []
    return [...new Set(list.map(r => r.color).filter(Boolean))]
})

watch(() => store.options.currentPlaylist, (id) => {
    if (id && !(id in exportPlaylists.value)) {
        exportPlaylists.value[id] = true
    }
}, { immediate: true })

const exportHasContent = computed(() => {
    const anyPlaylist = Object.entries(exportPlaylists.value).some(([id, v]) => v && store.playlistes[id])
    const anyPalette = store.palettesPersos.some(p => exportPalettesChoice.value[p.id])
    return anyPlaylist || exportTheme.value || anyPalette || (exportCurrentColors.value && currentListColors.value.length > 0)
})

const importHasContent = computed(() => {
    const anyPlaylist = (importChoices.value.playlists || []).some(v => v)
    const anyPalette = (importChoices.value.palettes || []).some(v => v)
    return anyPlaylist || importChoices.value.theme || anyPalette
})

const buildShareData = () => {
    const data = {
        format: SHARE_FORMAT,
        version: SHARE_VERSION,
        createdAt: Date.now(),
        contents: {}
    }
    const selectedPlaylists = []
    for (const [id, checked] of Object.entries(exportPlaylists.value)) {
        if (!checked) continue
        const playlist = store.playlistes[id]
        if (!playlist) continue
        selectedPlaylists.push({
            name: playlist.name,
            radios: JSON.parse(JSON.stringify(playlist.radios ?? []))
        })
    }
    if (selectedPlaylists.length) {
        data.contents.playlists = selectedPlaylists
    }
    if (exportTheme.value) {
        const themeOptions = {}
        for (const k of STYLE_KEYS) {
            if (store.options[k] !== undefined) themeOptions[k] = store.options[k]
        }
        data.contents.theme = { name: 'Thème exporté', options: themeOptions }
    }
    const palettesToExport = []
    for (const palette of store.palettesPersos) {
        if (exportPalettesChoice.value[palette.id]) {
            palettesToExport.push({ name: palette.name, colors: [...palette.colors], ...(palette.player ? { player: { ...palette.player } } : {}) })
        }
    }
    if (exportCurrentColors.value && currentListColors.value.length) {
        const plName = store.playlistes[store.options.currentPlaylist]?.name || 'liste'
        const player = {}
        for (const k of COLOR_KEYS) player[k] = store.options[k]
        palettesToExport.push({ name: `Couleurs — ${plName}`, colors: [...currentListColors.value], player })
    }
    if (palettesToExport.length) {
        data.contents.palettes = palettesToExport
    }
    return data
}

const makeShareFile = () => {
    const data = buildShareData()
    if (!Object.keys(data.contents).length) return null
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const date = new Date().toISOString().slice(0, 10)
    const filename = `radiolala-share-${date}.json`
    return { blob, filename, data }
}

const doExport = () => {
    const made = makeShareFile()
    if (!made) {
        showToast('Rien à exporter', 'warning')
        return
    }
    const url = URL.createObjectURL(made.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = made.filename
    a.click()
    URL.revokeObjectURL(url)
    showToast('Fichier de partage téléchargé', 'success')
}

const parseImportContent = (raw) => {
    // Format Radiolala strict (pas de rétrocompatibilité) : tout fichier qui n'est
    // pas exactement ce format/version est rejeté avec une alerte côté appelant.
    if (raw?.format !== SHARE_FORMAT || raw.version !== SHARE_VERSION || !raw.contents) {
        return null
    }
    return {
        playlists: Array.isArray(raw.contents.playlists) ? raw.contents.playlists : [],
        theme: raw.contents.theme ?? null,
        palettes: Array.isArray(raw.contents.palettes) ? raw.contents.palettes : []
    }
}

const pickImportFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            const text = await file.text()
            const raw = JSON.parse(text)
            const parsed = parseImportContent(raw)
            if (!parsed) {
                showToast(`Fichier incompatible avec Radiolala`, 'danger')
                return
            }
            importParsed.value = parsed
            importChoices.value = {
                playlists: (parsed.playlists ?? []).map(() => true),
                theme: !!parsed.theme,
                palettes: (parsed.palettes ?? []).map(() => true)
            }
        } catch (err) {
            console.error(err)
            showToast(`Fichier invalide : ${err.message}`, 'danger')
        }
    }
    input.click()
}

const doImport = () => {
    if (!importParsed.value) return
    const messages = []
    const playlists = importParsed.value.playlists ?? []
    let imported = 0
    playlists.forEach((pl, i) => {
        if (!importChoices.value.playlists?.[i]) return
        const newId = `l${Date.now()}-${i}`
        store.playlistes[newId] = {
            name: pl.name ?? 'Liste importée',
            date: Date.now(),
            radios: JSON.parse(JSON.stringify(pl.radios ?? []))
        }
        imported++
    })
    if (imported) messages.push(`${imported} playlist${imported > 1 ? 's' : ''}`)
    if (importChoices.value.theme && importParsed.value.theme) {
        const th = importParsed.value.theme
        const created = store.addTheme({ name: th.name, options: th.options })
        if (created) messages.push(`thème "${created.name}"`)
    }
    let importedPalettes = 0
    ;(importParsed.value.palettes ?? []).forEach((pa, i) => {
        if (!importChoices.value.palettes?.[i]) return
        const created = store.savePalette({ name: pa.name, colors: pa.colors, player: pa.player })
        if (created) importedPalettes++
    })
    if (importedPalettes) messages.push(`${importedPalettes} palette${importedPalettes > 1 ? 's' : ''}`)
    if (messages.length) {
        showToast(`Importé : ${messages.join(', ')}`, 'success')
        importParsed.value = null
    } else {
        showToast('Rien à importer', 'warning')
    }
}
</script>
