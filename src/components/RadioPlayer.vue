<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useNow } from '@vueuse/core'
import { useSleepTimer } from '../composables/useSleepTimer'
import { VueDraggableNext } from 'vue-draggable-next'
import { useGlobalStore } from '@/store/globalStore'
import { autoNameColor } from '@/utils/paletteGenerator'
import 'animate.css';
import UneRadio from './UneRadio.vue'

const store = useGlobalStore()
const options = computed(() => store.options)
const radios = computed(() => store.radios)
const isEditing = ref(false)
const isDragging = computed(() => store.isDragging)
const editedRadio = ref({})
const targetPlaylist = ref('')
const volume = computed(() => store.options.volume ?? 0.7)
const {
    isPlaying,
    isLoading,
    isPaused,
    isStopping,
    isError,
    isFiniteAudio,
    httpFallbackUrl,
    play,
    pause,
    stop,
    currentTime,
    currentRadio,
    audio
} = inject('player')

// 'play' = bouton play visible (démarrage, reprise de pause, ou annulation de fade-out)
// 'pause' = bouton pause visible (uniquement fichier en lecture)
// null = pas de bouton play/pause (flux live en lecture pure, seul stop reste)
const playPauseMode = computed(() => {
    if (isStopping.value || !isPlaying.value) return 'play'
    if (isFiniteAudio.value) return 'pause'
    return null
})
const stopVisible = computed(() => (isPlaying.value || isPaused.value) && !isStopping.value)
const onPlayPauseClick = () => {
    if (playPauseMode.value === 'play') play(currentRadio.value)
    else if (playPauseMode.value === 'pause') pause()
}

const findRadioById = (id) => {
  for (const playlist of Object.values(store.playlistes)) {
    if (playlist?.radios) {
      const found = playlist.radios.find(r => r.id === id)
      if (found) return found
    }
  }
  return null
}

onMounted(() => {
  const id = options.value.currentRadio
  if (id && !currentRadio.value) {
    currentRadio.value = findRadioById(id)
  }
  // Fermer la modale (clic dehors, Échap, bouton) revient à annuler l'édition :
  // sinon la modale rouvrirait en mode édition avec les données du précédent élément.
  document.getElementById('radioModal')?.addEventListener('hidden.bs.modal', () => {
    isEditing.value = false
  })
})

watch(currentRadio, (newRadio) => {
  store.options.currentRadio = newRadio?.id ?? null
})



const contrastColor = (hex) => {
  if (!hex || !hex.startsWith('#')) return '#ffffff'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const toLinear = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  return L > 0.35 ? '#000000' : '#ffffff'
}

const subtleHex = (hex) => {
  if (!hex || !hex.startsWith('#')) return '#f8f9fa'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const mix = c => Math.round(c * 0.15 + 255 * 0.85)
  const h = v => v.toString(16).padStart(2, '0')
  return `#${h(mix(r))}${h(mix(g))}${h(mix(b))}`
}

const cardColorStyle = (hex) => {
  const c = hex || '#6c757d'
  return { backgroundColor: c, color: contrastColor(c) }
}

// Couleurs des radios à l'intérieur d'un dossier, selon le mode du dossier :
// 'auto' (défaut) = rendu btn-outline-custom inchangé ; 'custom' = couleurs du
// dossier ; 'own' = couleurs propres de chaque radio.
const folderChildBg = (folder, child) => {
  if ((folder.childColorMode || 'auto') === 'own') return child.color || '#6c757d'
  return folder.childBgColor || '#ffffff'
}
const folderChildName = (folder, child) => {
  const mode = options.value.listNameAutoColorMode
  if ((folder.childColorMode || 'auto') === 'own') return child.nomColor || autoNameColor(child.color, mode)
  return folder.childNomColor || autoNameColor(folder.childBgColor || '#ffffff', mode)
}
// Fond de la liste d'un dossier : nuance auto de la couleur du dossier, ou
// couleur choisie manuellement.
const folderListBg = (folder) =>
  folder.listBgMode === 'manual' ? (folder.listBgColor || subtleHex(folder.color)) : subtleHex(folder.color)
// Pavé plein (custom/own avec childFilled non désactivé) ou contour (auto, ou
// custom/own avec childFilled === false).
const folderChildFilled = (folder) =>
  (folder.childColorMode || 'auto') !== 'auto' && folder.childFilled !== false
// En mode contour, on réutilise btn-outline-custom : --btn-color colore le
// bord + le texte inactif, --btn-color-contrast le texte de l'état actif.
const folderChildOutlineColor = (folder, child) =>
  (folder.childColorMode || 'auto') === 'auto' ? folder.color : folderChildName(folder, child)
const folderChildOutlineContrast = (folder, child) =>
  (folder.childColorMode || 'auto') === 'auto' ? contrastColor(folder.color) : folderChildBg(folder, child)

const isVolumeLocked = computed(() => {
  const id = currentRadio.value?.id
  return !!id && store.options.radioVolumes?.[id] !== undefined
})

const toggleVolumeLock = () => {
  const id = currentRadio.value?.id
  if (!id) return
  if (isVolumeLocked.value) {
    store.unsetRadioVolume(id)
  } else {
    store.setRadioVolume(id, Number(volume.value))
  }
}

const setVolume = (event) => {
  const newVolume = event.target.value
  if (audio.value) audio.value.volume = newVolume
  store.options.volume = newVolume
  // Si le volume est verrouillé pour cette radio, on met à jour la valeur enregistrée
  if (isVolumeLocked.value && currentRadio.value?.id) {
    store.setRadioVolume(currentRadio.value.id, Number(newVolume))
  }
}

const startEditing = () => {
    editedRadio.value = { ...store.selectedRadio }
    if (editedRadio.value.type === 'folder') {
        editedRadio.value.childColorMode = editedRadio.value.childColorMode || 'auto'
        editedRadio.value.childBgColor = editedRadio.value.childBgColor || '#ffffff'
        editedRadio.value.childNomColor = editedRadio.value.childNomColor || '#000000'
        if (editedRadio.value.childFilled === undefined) editedRadio.value.childFilled = true
        editedRadio.value.listBgMode = editedRadio.value.listBgMode || 'auto'
        editedRadio.value.listBgColor = editedRadio.value.listBgColor || subtleHex(editedRadio.value.color)
    }
    targetPlaylist.value = store.options.currentPlaylist
    isEditing.value = true
}

// Nom : 'auto' = pas de nomColor (couleur calculée, toujours lisible) ;
// 'manual' = on amorce le sélecteur avec la couleur auto actuelle.
const setNomColorMode = (mode) => {
    editedRadio.value.nomColor = mode === 'manual'
        ? autoNameColor(editedRadio.value.color, options.value.listNameAutoColorMode)
        : ''
}

const saveChanges = () => {
    store.selectedRadio = { ...editedRadio.value }
    if (targetPlaylist.value !== store.options.currentPlaylist) {
        const isFolder = store.selectedRadio.type === 'folder'
        const children = isFolder ? radios.value.filter(r => r.folder === store.selectedRadio.id) : []
        const remaining = radios.value.filter(r => r.id !== store.selectedRadio.id && r.folder !== store.selectedRadio.id)
        store.updateRadios(remaining)
        store.playlistes[targetPlaylist.value].radios.push(store.selectedRadio, ...children)
    } else {
        const index = radios.value.findIndex(radio => radio.id === store.selectedRadio.id)
        if (index !== -1) {
            const updatedRadios = [...radios.value]
            updatedRadios[index] = store.selectedRadio
            store.updateRadios(updatedRadios)
        }
    }
    isEditing.value = false
}

const formatTime = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const hDisplay = h > 0 ? h.toString().padStart(2, '0') + ':' : '';
      const mDisplay = m.toString().padStart(2, '0') + ':';
      const sDisplay = s.toString().padStart(2, '0');
      return hDisplay + mDisplay + sDisplay;
    };

const visibleRadios = computed(() => radios.value)
const getChildRadios = (folderId) => {
  return radios.value.filter(rad => rad.folder === folderId)
}
const clickRadio = (radio) => {
  if (isDragging.value) return
  if (isPlaying.value && currentRadio.value?.id === radio.id) {
    pause()
  } else {
    play(radio)
  }
}

const onDragEnd = () => {
    store.updateRadios(radios.value);
};

// Réordonnancement d'une radio à l'intérieur d'un dossier.
// On permute uniquement les "slots" enfants de ce dossier dans la liste plate,
// en préservant la position absolue de tous les autres items.
const onChildDragEnd = (folderId, evt) => {
    const moved = evt?.moved;
    if (!moved) return;
    const all = [...radios.value];
    const childIndexes = [];
    all.forEach((item, idx) => {
        if (item.type !== 'folder' && item.folder === folderId) childIndexes.push(idx);
    });
    const children = childIndexes.map(idx => all[idx]);
    const [m] = children.splice(moved.oldIndex, 1);
    children.splice(moved.newIndex, 0, m);
    childIndexes.forEach((idx, i) => { all[idx] = children[i]; });
    store.updateRadios(all);
};

const deleteRadio = (undossier) => {
    let tempRadios;
    if (undossier && store.selectedRadio.type === 'folder' ) {
        // supprimer toutes les radios ayant pour id de folder l'id de la radio sélectionnée
        tempRadios = radios.value.filter(radio => radio.folder !== store.selectedRadio.id);
        tempRadios= tempRadios.filter(radio => radio.id !== store.selectedRadio.id);
    } else {
        tempRadios = radios.value.filter(radio => radio.id !== store.selectedRadio?.id);
    }

    store.updateRadios(tempRadios);
}

const scrollToCurrentRadio = () => {
    if (!currentRadio.value) return
    const stickyEl = document.querySelector('.sticky-top .card')
    const offset = stickyEl ? stickyEl.offsetHeight : 0

    const scrollToEl = (el) => {
        if (!el) return
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset - 3, behavior: 'smooth' })
    }

    const folderId = currentRadio.value.folder
    if (!folderId) {
        scrollToEl(document.getElementById(currentRadio.value.id))
        return
    }

    // La radio est dans un dossier : on l'ouvre si besoin, puis on scrolle dessus.
    const radioEl = () => document.getElementById('in-' + currentRadio.value.id)
    const collapseEl = document.getElementById('collapse-' + folderId)
    if (!collapseEl) {
        scrollToEl(document.getElementById(folderId))
        return
    }

    if (collapseEl.classList.contains('show')) {
        scrollToEl(radioEl() ?? document.getElementById(folderId))
        return
    }

    // Dossier fermé : tourner le chevron, déplier, puis scroller à la fin de l'animation.
    document.querySelector(`#${folderId} i.bi-chevron-down`)?.classList.add('tourne180')
    collapseEl.addEventListener('shown.bs.collapse', () => {
        scrollToEl(radioEl() ?? document.getElementById(folderId))
    }, { once: true })
    window.bootstrap.Collapse.getOrCreateInstance(collapseEl).show()
}

const tourner = (id) => {
    const element= document.querySelector(`#${id} i.bi-chevron-down`);
    element.classList.toggle('tourne180');
}

// ============================================================
// Sleep timer
// ============================================================
const onSleepTrigger = (fadeOutMs) => {
  if (isPlaying.value || isPaused.value) stop(fadeOutMs)
}

const {
  isActive: sleepIsActive,
  endTime: sleepEndTime,
  remaining: sleepRemaining,
  start: startSleepRaw,
  cancel: cancelSleep
} = useSleepTimer(onSleepTrigger)

const sleepDuration = ref(options.value.sleepTimerDuration ?? 30)
const sleepFadeOut = ref(options.value.sleepTimerFadeOut ?? 5)
const sleepPresets = computed(() => options.value.sleepTimerPresets ?? [5, 15, 30, 60, 120])

watch(sleepDuration, (v) => { store.options.sleepTimerDuration = v })
watch(sleepFadeOut, (v) => { store.options.sleepTimerFadeOut = v })

const now = useNow({ interval: 30000 })
const projectedEndTimeStr = computed(() => {
  const ts = now.value.getTime() + sleepDuration.value * 60 * 1000
  return formatTimeOfDay(ts)
})

const canStartSleep = computed(() => isPlaying.value || isPaused.value || isLoading.value)

const startSleep = () => {
  if (!canStartSleep.value) return
  startSleepRaw(sleepDuration.value * 60 * 1000, sleepFadeOut.value * 1000)
}

const formatRemaining = (s) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const formatTimeOfDay = (ts) => {
  return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const editingPresets = ref(false)
const newPreset = ref(null)

const addPreset = () => {
  const v = Number(newPreset.value)
  if (v > 0 && !sleepPresets.value.includes(v)) {
    store.options.sleepTimerPresets = [...sleepPresets.value, v].sort((a, b) => a - b)
    newPreset.value = null
  }
}

const removePreset = (p) => {
  store.options.sleepTimerPresets = sleepPresets.value.filter(x => x !== p)
}

</script>


<template>
    <div class="h-100">

        <!-- Colonne -->
        <div class="d-flex flex-column min-vh-100" :class="{ 'col-sm-8 col-md-6 col-lg-4 col-xxl-3 mx-auto': !options.listFullWidth, 'w-100': options.listFullWidth }">

            <!-- **************************************************** -->
            <!-- ************** Bloc radio en cours ***************** -->
            <!-- **************************************************** -->
             <div class="sticky-top mb-3">
                <div class="card border-0" :class="{'rounded-0': !options.playerCoinsArrondis, 'bg-gradient': options.playerBgGradient }" :style="{ backgroundColor: options.playerBgColor, color: options.playerElmtsColor  }">

                    <!-- icones -->
                    <div class=" d-flex justify-content-between align-items-center" >

                        <button type="button" class="btn border-0 lh-1 px-3 py-2" style="color: inherit; background: transparent;"
                            data-bs-toggle="offcanvas" data-bs-target="#offcanvasOptions"
                            aria-controls="offcanvasOptions" aria-label="Ouvrir les options" title="Options">
                            <i class="bi bi-gear fs-5"></i>
                        </button>
                        <!-- Status + sablier sleep timer -->
                        <div class="d-flex align-items-center gap-2" :class="{'animate__animated animate__pulse animate__infinite': isPaused }">

                            <span v-if="isError" class="text-danger small">
                                <i class="bi bi-exclamation-triangle-fill"></i> Flux indisponible
                            </span>
                            <span v-else-if="isLoading || isPlaying || isPaused">
                                <i :class="isLoading ? 'spinner-border spinner-border-sm' : (isPlaying ? 'bi-play-fill' : (isPaused ? 'bi-pause-fill' : 'bi-star'))"></i>
                                {{ formatTime(currentTime) }}
                            </span>

                            <!-- Sablier sleep timer (visible uniquement si lecture en cours ou timer actif) -->
                            <button v-if="canStartSleep || sleepIsActive" type="button"
                                class="btn p-0 border-0 bg-transparent lh-1 d-flex align-items-center"
                                :style="{ color: sleepIsActive ? options.playerTitleColor : 'inherit' }"
                                data-bs-toggle="collapse" data-bs-target="#collapseSleepTimer"
                                aria-controls="collapseSleepTimer"
                                title="Sleep timer">
                                <i :class="['bi', sleepIsActive ? 'bi-hourglass-split' : 'bi-hourglass']"></i>
                                <span v-if="sleepIsActive" class="ms-1 small">{{ formatRemaining(sleepRemaining) }}</span>
                            </button>
                        </div>

                        <!-- Btn volume + historique -->
                        <div class="d-flex align-items-center">
                            <button type="button" class="btn border-0 lh-1 px-2 py-2" style="color: inherit; background: transparent;"
                                data-bs-toggle="collapse" data-bs-target="#collapseVolume" aria-expanded="false" aria-controls="collapseVolume"
                                aria-label="Volume" title="Volume">
                                <i class="bi bi-volume-down-fill" style="font-size: 2rem;"></i>
                            </button>
                            <button type="button" class="btn border-0 lh-1 px-2 py-2 pe-3" style="color: inherit; background: transparent;"
                                data-bs-toggle="offcanvas" data-bs-target="#offcanvasHistory" aria-controls="offcanvasHistory"
                                aria-label="Historique" title="Historique">
                                <i class="bi bi-clock-history fs-5"></i>
                            </button>
                        </div>

                    </div>

                    <!-- Nom de la radio en cours-->
                    <h2 v-if="currentRadio" class="current-radio text-center text-break px-1" :class="[{ 'fw-bold': options.playerFontBold }, isError ? 'pb-1' : 'pb-3']" style="cursor: pointer" :style="{ color: options.playerTitleColor, fontSize: options.playerFontSize + 'rem', fontFamily: options.playerFontFamily }" @click="scrollToCurrentRadio" title="Aller à la radio en cours">
                        {{ currentRadio.nom }}
                    </h2>
                    <h2 v-else class="current-radio text-center text-break pb-2 px-1">Aucune radio en cours</h2>

                    <!-- Lien de secours pour flux HTTP en contexte HTTPS -->
                    <div v-if="isError && httpFallbackUrl" class="text-center pb-2">
                        <a :href="httpFallbackUrl" target="_blank" rel="noopener" class="btn btn-sm btn-outline-warning">
                            <i class="bi bi-box-arrow-up-right me-1"></i>Ouvrir le flux dans un nouvel onglet
                        </a>
                    </div>


                    <!-- Boutons en haut -->
                     <div v-if="!options.playerBtnsBottom && currentRadio">
                        <div class="btn-group w-100">
                            <!-- play/pause (gauche) -->
                            <button v-if="playPauseMode && !options.playerBtnPlayAtEnd"
                                class="btn p-0 border-0 lh-1"
                                :style="{ backgroundColor: options.playerBtnPlayColor }"
                                :class="[
                                    { 'rounded-0': !options.playerBtnsRounded, 'rounded-top-circle': options.playerBtnsTopRounded },
                                    'py-' + options.playerBtnsHeight,
                                    'fs-' + (6 - options.playerBtnsIconsSize)
                                ]"
                                @click="onPlayPauseClick"
                            >
                                <i :class="playPauseMode === 'pause' ? 'bi-pause-fill' : 'bi-play-fill'" :style="{ color: options.playerBtnPlayIconColor }"></i>
                            </button>
                            <!-- Stop -->
                            <button v-if="stopVisible"
                                class="btn p-0 border-0 lh-1 opacity-100 ms-0"
                                :class="[{ 'rounded-0': !options.playerBtnsRounded, 'rounded-top-circle': options.playerBtnsTopRounded }, 'fs-' + (6 - options.playerBtnsIconsSize), 'py-' + options.playerBtnsHeight]"
                                :style="{ backgroundColor: options.playerBtnStopColor }"
                                @click="stop()">
                                <i class="bi bi-stop-fill" :style="{ color: options.playerBtnStopIconColor }"></i>
                            </button>
                            <!-- play/pause (droite) -->
                            <button v-if="playPauseMode && options.playerBtnPlayAtEnd"
                                class="btn p-0 border-0 lh-1"
                                :style="{ backgroundColor: options.playerBtnPlayColor }"
                                :class="[
                                    { 'rounded-0': !options.playerBtnsRounded, 'rounded-top-circle': options.playerBtnsTopRounded },
                                    'py-' + options.playerBtnsHeight,
                                    'fs-' + (6 - options.playerBtnsIconsSize)
                                ]"
                                @click="onPlayPauseClick"
                            >
                                <i :class="playPauseMode === 'pause' ? 'bi-pause-fill' : 'bi-play-fill'" :style="{ color: options.playerBtnPlayIconColor }"></i>
                            </button>
                        </div>
                     </div>

                </div>

                <!-- collapse slider volume -->
                <div id="collapseVolume" class="collapse mx-3">
                    <div class="d-flex align-items-center mx-auto py-2 px-2" :class="{ 'rounded-bottom': options.playerCoinsArrondis }" :style="{ backgroundColor: options.playerBgColor, color: options.playerElmtsColor }">
                        <i class="bi bi-volume-down-fill fs-2 lh-1" title="Moins fort"></i>
                        <input type="range" id="volumeInput" class="bg-info ms-1 me-2 flex-grow-1" min="0" max="1" step="0.05"
                        :value="volume" @input="setVolume">
                        <i class="bi bi-volume-up-fill fs-2 lh-1" title="Plus fort"></i>
                        <span class="ms-2">{{ (Number(volume) * 100).toFixed(0) }} %</span>
                        <i v-if="currentRadio" class="bi ms-3 me-1 fs-5 cursor-pointer"
                            :class="isVolumeLocked ? 'bi-lock-fill' : 'bi-unlock'"
                            :title="isVolumeLocked ? 'Volume enregistré pour cette radio (cliquez pour oublier)' : 'Cliquez pour enregistrer le volume de cette radio'"
                            @click="toggleVolumeLock"></i>
                    </div>
                </div>

                <!-- collapse sleep timer -->
                <div id="collapseSleepTimer" class="collapse mx-3">
                    <div class="p-3" :class="{ 'rounded-bottom': options.playerCoinsArrondis }" :style="{ backgroundColor: options.playerBgColor, color: options.playerElmtsColor }">

                        <!-- Sleep timer actif : décompte + bouton annuler -->
                        <template v-if="sleepIsActive">
                            <p class="text-center mb-1 small">
                                <i class="bi bi-hourglass-split me-1"></i>
                                Arrêt prévu à <strong>{{ formatTimeOfDay(sleepEndTime) }}</strong>
                            </p>
                            <p class="text-center fs-3 mb-3" :style="{ color: options.playerTitleColor }">
                                {{ formatRemaining(sleepRemaining) }}
                            </p>
                            <button type="button" class="btn btn-outline-warning w-100" @click="cancelSleep">
                                <i class="bi bi-x-circle me-1"></i>Annuler le sleep timer
                            </button>
                        </template>

                        <!-- Sleep timer inactif : réglages -->
                        <template v-else>
                            <!-- Slider durée -->
                            <div class="mb-2">
                                <label for="sleepDuration" class="form-label small mb-1 d-flex justify-content-between">
                                    <span>Durée</span>
                                    <strong>{{ sleepDuration }} min</strong>
                                </label>
                                <input id="sleepDuration" type="range" class="form-range" min="1" max="180" step="1" v-model.number="sleepDuration">
                            </div>

                            <!-- Slider fade out -->
                            <div class="mb-2">
                                <label for="sleepFadeOut" class="form-label small mb-1 d-flex justify-content-between">
                                    <span>Fondu sonore</span>
                                    <strong>{{ sleepFadeOut }} s</strong>
                                </label>
                                <input id="sleepFadeOut" type="range" class="form-range" min="0" max="60" step="1" v-model.number="sleepFadeOut">
                            </div>

                            <!-- Heure projetée -->
                            <p class="text-center small mb-3">
                                Arrêt à <strong>{{ projectedEndTimeStr }}</strong>
                            </p>

                            <!-- Presets -->
                            <div class="d-flex flex-wrap gap-1 align-items-center mb-3">
                                <button v-for="p in sleepPresets" :key="p"
                                    type="button"
                                    class="btn btn-sm btn-outline-light position-relative"
                                    :class="{ 'active': sleepDuration === p }"
                                    @click="sleepDuration = p">
                                    {{ p }} min
                                    <i v-if="editingPresets"
                                        class="bi bi-x-circle-fill position-absolute top-0 start-100 translate-middle text-danger"
                                        style="cursor: pointer; font-size: 0.8rem"
                                        @click.stop="removePreset(p)"></i>
                                </button>

                                <button v-if="!editingPresets" type="button" class="btn btn-sm btn-outline-secondary ms-auto"
                                    @click="editingPresets = true" title="Modifier les presets">
                                    <i class="bi bi-pencil"></i>
                                </button>

                                <template v-else>
                                    <input type="number" v-model.number="newPreset" min="1" max="180"
                                        class="form-control form-control-sm ms-auto" style="width: 70px" placeholder="min"
                                        @keyup.enter="addPreset">
                                    <button type="button" class="btn btn-sm btn-success" @click="addPreset" :disabled="!newPreset">
                                        <i class="bi bi-plus-lg"></i>
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-light" @click="editingPresets = false">
                                        <i class="bi bi-check"></i>
                                    </button>
                                </template>
                            </div>

                            <!-- Démarrer -->
                            <button type="button" class="btn btn-warning w-100" @click="startSleep" :disabled="!canStartSleep">
                                <i class="bi bi-hourglass me-1"></i>Démarrer
                            </button>
                        </template>
                    </div>
                </div>

                <div v-if="store.isDragging" class="mx-4 alert alert-info alert-dismissible fade show p-1 text-center rounded-top-0" role="alert">
                    <button type="button" class="btn-close p-2" data-bs-dismiss="alert" aria-label="Close" @click="store.isDragging = false"></button>
                    <span class="ms-2"><i class="bi bi-arrows-expand"></i> Glisser pour réordonner</span>
                </div>


            </div>


            <!-- **************************************************** -->
            <!-- ***************** Liste des radios ***************** -->
            <!-- **************************************************** -->

            <div class="px-3 flex-grow-1">

            <VueDraggableNext
              v-show="!options.listHidden"
              :list="radios"
              :disabled="!store.isDragging"
              @change="onDragEnd"
              class="zeListe"
              tag="transition-group"
              ghost-class="ghost"
              animation= "300"
              easing= "cubic-bezier(0,0.8,0.5,0.2)"

              >

                <div v-for="radio in visibleRadios" :key="radio.id" :id="radio.id" >

                    <!--  DOSSIER -->
                    <div v-if="radio.type==='folder'" :id="'accordion-'+radio.id"
                        class=" activable accordion"
                        :class="[
                            {
                                'active': currentRadio?.id === radio.id,
                                'rounded': options.listRadioRounded,
                                'bg-gradient': options.listRadioGradient,
                            },
                            `mb-${options.listRadioMargin}`, `py-${options.listRadioPadding}`
                        ]"
                        :style="{ ...cardColorStyle(radio.color), cursor: store.isDragging ? 'grab' : 'inherit' }"
                    >
                        <div class="d-flex align-items-center">
                            <i v-show="!store.isDragging"
                              type="button"
                              class="bi bi-folder-fill ps-2 me-2"
                              :class="{ 'opacity-0': options.listRadioIMasked, 'opacity-25': !options.listRadioIMasked }"
                              data-bs-toggle="modal"
                              data-bs-target="#radioModal"
                              @click.stop="store.openInfoModal(radio)"
                            >
                            </i>

                        <button class="border-0 d-flex ms-2 p-0 pb-1 pe-4 w-100 collapsed align-items-center bg-transparent" type="button" style="color: inherit" data-bs-toggle="collapse" :data-bs-target="'#collapse-'+radio.id" aria-expanded="false" :aria-controls="'collapse-'+radio.id" @click.stop="tourner(radio.id)">



                            <span class="text-break" :class="{ 'fw-bold': options.listFolderNameBold }" :style="{ fontSize: store.options.listRadioNameSize + 'rem', fontFamily: options.listRadioNameFont, letterSpacing: (store.options.listRadioNameLetterSpacing || 0) + 'em', color: radio.nomColor || autoNameColor(radio.color, options.listNameAutoColorMode) }">{{ radio.nom }}</span>

                            <i class="bi bi-chevron-down ms-auto flex-shrink-0 fs-5"></i>

                        </button>
                        </div>


                        <!--  collapse -->
                        <div :id="'collapse-'+radio.id"
                            class="accordion-collapse collapse"
                            :data-bs-parent="'accordion-'+radio.id">
                            <div class="accordion-body" :style="{ backgroundColor: folderListBg(radio) }">

                                <VueDraggableNext
                                    :list="getChildRadios(radio.id)"
                                    :disabled="!store.isDragging"
                                    @change="(evt) => onChildDragEnd(radio.id, evt)"
                                    tag="div"
                                    ghost-class="ghost"
                                    animation="300"
                                    easing="cubic-bezier(0,0.8,0.5,0.2)">
                                    <div v-for="rad in getChildRadios(radio.id)" :key="rad.id" :id="'in-'+rad.id" @click.stop="clickRadio(rad)">
                                        <!-- Contour : mode auto, ou custom/own avec « pavé plein » désactivé -->
                                        <div v-if="!folderChildFilled(radio)" class="btn w-100 text-start mt-2 p-1 btn-outline-custom" :class="{'active': currentRadio?.id === rad.id}" :style="{ '--btn-color': folderChildOutlineColor(radio, rad), '--btn-color-contrast': folderChildOutlineContrast(radio, rad) }">
                                            <UneRadio :radio="rad" :name-color="null" />
                                        </div>
                                        <!-- Pavé plein : custom/own avec fond + nom explicites -->
                                        <div v-else class="w-100 text-start mt-2 p-1 rounded" :class="{'bg-gradient': options.listRadioGradient}" :style="{ backgroundColor: folderChildBg(radio, rad), cursor: 'pointer' }">
                                            <UneRadio :radio="rad" :name-color="folderChildName(radio, rad)" />
                                        </div>
                                    </div>
                                </VueDraggableNext>

                            </div>
                        </div>

                    </div>

                    <!--  RADIO -->
                    <div v-else-if="radio.folder == null || store.radios.every(rad => rad.id !== radio.folder)"
                        class="radio-item activable px-2"
                        :class="[
                            {
                                'active': currentRadio?.id === radio.id,
                                'rounded': options.listRadioRounded,
                                'bg-gradient': options.listRadioGradient,
                            },
                            `mb-${options.listRadioMargin}`, `py-${options.listRadioPadding}`
                        ]"
                        :style="{ ...cardColorStyle(radio.color), cursor: store.isDragging ? 'grab' : 'pointer' }"
                        @click="clickRadio(radio)"
                        >
                        <UneRadio :radio="radio" />
                    </div>

                </div>

            </VueDraggableNext>

            </div>


            <!-- **************************************************** -->
            <!-- ********************* Modal ************************ -->
            <!-- **************************************************** -->
            <div id="radioModal" class="modal fade" tabindex="-1" aria-labelledby="radioInfoModalLabel" aria-hidden="true"
                :data-bs-theme="options.optionsDark ? 'dark' : 'light'">
                <div class="modal-dialog">
                    <div class="modal-content" :data-bs-theme="options.optionsDark ? 'dark' : 'light'">
                        <!-- Modal Header -->
                        <div class="modal-header align-items-start">
                            <div id="radioInfoModalLabel" class="modal-title fw-bold h5 w-100 text-break">
                                <input v-if="isEditing" v-model="editedRadio.nom" class="form-control form-control-sm" placeholder="Nom" />
                                <span v-else>{{ store.selectedRadio?.nom }}</span>
                            </div>

                            <!-- bouton suppression  -->
                            <button type="button"
                              class="btn btn-danger bi-trash3-fill ms-3"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapseDeleteRadio"
                              aria-expanded="false"
                              aria-controls="collapseDeleteRadio"
                              aria-label="Close"
                            ></button>
                        </div>

                        <div class="modal-body">
                            <!-- collapse suppression -->
                            <div class="collapse" id="collapseDeleteRadio">
                                 <button v-if="store.selectedRadio?.type !='folder'" type="button" class="btn btn-danger w-100 mb-3" data-bs-dismiss="modal" @click="deleteRadio">
                                    Supprimer cette radio
                                </button>
                                 <button v-if="store.selectedRadio?.type ==='folder'" type="button" class="btn btn-danger w-100 mb-3" data-bs-dismiss="modal" @click="deleteRadio">
                                    Supprimer ce dossier
                                </button>
                                 <button v-if="store.selectedRadio?.type ==='folder'" type="button" class="btn btn-danger w-100 mb-3" data-bs-dismiss="modal" @click="deleteRadio(true)">
                                    Supprimer ce dossier et toutes ses radios
                                </button>
                            </div>

                            <!-- ===== Mode lecture ===== -->
                            <template v-if="!isEditing">
                                <p v-if="store.selectedRadio?.desc" class="mb-0 text-break">{{ store.selectedRadio?.desc }}</p>
                                <hr v-if="store.selectedRadio?.desc" class="w-75">

                                <p v-if="store.selectedRadio?.tags" class="mb-1"><span class="fw-bold">Genre : </span>{{ store.selectedRadio?.tags }}</p>
                                <p v-if="store.selectedRadio?.pays" class="mb-1"><span class="fw-bold">Pays : </span>{{ store.selectedRadio?.pays }}</p>
                                <p v-if="store.selectedRadio?.codec" class="mb-1"><span class="fw-bold">Codec : </span>{{ store.selectedRadio?.codec }}{{ store.selectedRadio?.bitrate ? ', ' + store.selectedRadio?.bitrate : '' }}</p>
                                <p v-if="store.selectedRadio?.site" class="mb-1 d-flex text-break align-items-center"><span class="fw-bold me-2 text-nowrap">Site : </span><a :href="store.selectedRadio?.site" target="_blank" class="text-decoration-none link-info">{{ store.selectedRadio.site }}</a></p>
                                <div v-if="store.selectedRadio?.flux" class="mb-1 d-flex text-break align-items-center"><div class="fw-bold me-2 text-nowrap">Flux : </div><a :href="store.selectedRadio?.flux" target="_blank" class="text-decoration-none link-info">{{ store.selectedRadio?.flux }}</a></div>
                                <p v-if="store.selectedRadio?.type != 'folder' && store.selectedRadio?.folder" class="mb-1"><span class="fw-bold">Dossier : </span>{{ store.radios.find(rad => rad.id === store.selectedRadio?.folder)?.nom || 'Dans aucun dossier' }}</p>
                                <p v-if="store.selectedRadio?.type === 'folder'" class="mb-1"><span class="fw-bold">Radios : </span>{{ getChildRadios(store.selectedRadio.id).length }}</p>
                                <p class="mb-1"><span class="fw-bold">Liste : </span>{{ store.playlistes[store.options.currentPlaylist]?.name }}</p>
                            </template>

                            <!-- ===== Mode édition ===== -->
                            <div v-else>
                                <!-- Description -->
                                <div class="input-group input-group-sm mb-2">
                                    <span class="input-group-text">Description</span>
                                    <input v-model="editedRadio.desc" class="form-control" />
                                </div>
                                <!-- Site -->
                                <div class="input-group input-group-sm mb-2">
                                    <span class="input-group-text">Site</span>
                                    <input v-model="editedRadio.site" class="form-control" />
                                </div>
                                <!-- Flux (radio uniquement) -->
                                <div v-if="store.selectedRadio?.type !== 'folder'" class="input-group input-group-sm mb-2">
                                    <span class="input-group-text">Flux</span>
                                    <input v-model="editedRadio.flux" class="form-control" />
                                </div>

                                <!-- Couleurs de l'élément -->
                                <div class="border rounded p-2 mb-2 bg-body-tertiary">
                                    <div class="row g-2 align-items-center mb-2">
                                        <label class="col-auto col-form-label col-form-label-sm fw-bold py-0">Couleur</label>
                                        <div class="col-auto">
                                            <input type="color" v-model="editedRadio.color" class="form-control form-control-color form-control-sm" />
                                        </div>
                                    </div>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text">Nom</span>
                                        <select class="form-select" :value="editedRadio.nomColor ? 'manual' : 'auto'" @change="setNomColorMode($event.target.value)">
                                            <option value="auto">Couleur automatique</option>
                                            <option value="manual">Couleur personnalisée</option>
                                        </select>
                                        <input v-if="editedRadio.nomColor" type="color" v-model="editedRadio.nomColor" class="form-control form-control-color flex-grow-0" style="width: 3rem" />
                                    </div>
                                </div>

                                <!-- Dossier : couleurs des radios + fond de liste -->
                                <div v-if="store.selectedRadio?.type === 'folder'" class="border rounded p-2 mb-2 bg-body-tertiary">
                                    <div class="input-group input-group-sm mb-2">
                                        <span class="input-group-text">Radios</span>
                                        <select v-model="editedRadio.childColorMode" class="form-select">
                                            <option value="auto">Couleurs automatiques (contraste)</option>
                                            <option value="custom">Couleurs personnalisées</option>
                                            <option value="own">Couleurs propres des radios</option>
                                        </select>
                                    </div>
                                    <div v-if="editedRadio.childColorMode === 'custom'" class="row g-2 align-items-center mb-2">
                                        <label class="col-auto col-form-label col-form-label-sm py-0">Fond</label>
                                        <div class="col-auto"><input type="color" v-model="editedRadio.childBgColor" class="form-control form-control-color form-control-sm" /></div>
                                        <label class="col-auto col-form-label col-form-label-sm py-0">Nom</label>
                                        <div class="col-auto"><input type="color" v-model="editedRadio.childNomColor" class="form-control form-control-color form-control-sm" /></div>
                                    </div>
                                    <div v-if="editedRadio.childColorMode !== 'auto'" class="form-check form-switch mb-2">
                                        <input id="childFilledSwitch" class="form-check-input" type="checkbox" role="switch" v-model="editedRadio.childFilled" />
                                        <label class="form-check-label" for="childFilledSwitch">Pavé plein (sinon contour)</label>
                                    </div>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text">Fond de la liste</span>
                                        <select v-model="editedRadio.listBgMode" class="form-select">
                                            <option value="auto">Automatique</option>
                                            <option value="manual">Manuel</option>
                                        </select>
                                        <input v-if="editedRadio.listBgMode === 'manual'" type="color" v-model="editedRadio.listBgColor" class="form-control form-control-color flex-grow-0" style="width: 3rem" />
                                    </div>
                                </div>

                                <!-- Dossier (radio uniquement) -->
                                <div v-if="store.selectedRadio?.type !== 'folder'" class="input-group input-group-sm mb-2">
                                    <span class="input-group-text">Dossier</span>
                                    <select v-model="editedRadio.folder" class="form-select">
                                        <option value="">Dans aucun dossier</option>
                                        <option v-for="dossier in store.radios.filter(rad => rad.type === 'folder')" :key="dossier.id" :value="dossier.id">{{ dossier.nom }}</option>
                                    </select>
                                </div>

                                <!-- Liste (playlist) -->
                                <div class="input-group input-group-sm mb-2">
                                    <span class="input-group-text">Liste</span>
                                    <select v-model="targetPlaylist" class="form-select">
                                        <option v-for="(playlist, id) in store.playlistes" :key="id" :value="id">{{ playlist.name }}</option>
                                    </select>
                                </div>
                            </div>

                        </div>

                        <div class="modal-footer justify-content-between">
                            <button v-if="!isEditing" type="button" class="btn btn-warning" @click="startEditing()">
                                Éditer
                            </button>
                            <button v-if="isEditing" type="button" class="btn btn-success" @click="saveChanges()">
                                Enregistrer
                            </button>

                            <button v-if="isEditing" type="button" class="btn btn-secondary" @click="isEditing = false">
                                Annuler
                            </button>
                            <button v-if="!isEditing" id="fermerModale" type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Fermer
                            </button>

                        </div>
                    </div>
                </div>
            </div>


            <!-- ************** Boutons en bas ************** -->
                    <div v-if="options.playerBtnsBottom && currentRadio" class="sticky-bottom">
                        <div class="btn-group w-100">
                            <!-- play/pause (gauche) -->
                            <button v-if="playPauseMode && !options.playerBtnPlayAtEnd"
                                class="btn p-0 border-0 lh-1"
                                :style="{ backgroundColor: options.playerBtnPlayColor }"
                                :class="[
                                    { 'rounded-0': !options.playerBtnsRounded, 'rounded-top-circle': options.playerBtnsTopRounded },
                                    'py-' + options.playerBtnsHeight,
                                    'fs-' + (6 - options.playerBtnsIconsSize)
                                ]"
                                @click="onPlayPauseClick"
                            >
                                <i :class="playPauseMode === 'pause' ? 'bi-pause-fill' : 'bi-play-fill'" :style="{ color: options.playerBtnPlayIconColor }"></i>
                            </button>
                            <!-- Stop -->
                            <button v-if="stopVisible"
                                class="btn p-0 border-0 lh-1 opacity-100 ms-0"
                                :class="[{ 'rounded-0': !options.playerBtnsRounded, 'rounded-top-circle': options.playerBtnsTopRounded }, 'fs-' + (6 - options.playerBtnsIconsSize), 'py-' + options.playerBtnsHeight]"
                                :style="{ backgroundColor: options.playerBtnStopColor }"
                                @click="stop()">
                                <i class="bi bi-stop-fill" :style="{ color: options.playerBtnStopIconColor }"></i>
                            </button>
                            <!-- play/pause (droite) -->
                            <button v-if="playPauseMode && options.playerBtnPlayAtEnd"
                                class="btn p-0 border-0 lh-1"
                                :style="{ backgroundColor: options.playerBtnPlayColor }"
                                :class="[
                                    { 'rounded-0': !options.playerBtnsRounded, 'rounded-top-circle': options.playerBtnsTopRounded },
                                    'py-' + options.playerBtnsHeight,
                                    'fs-' + (6 - options.playerBtnsIconsSize)
                                ]"
                                @click="onPlayPauseClick"
                            >
                                <i :class="playPauseMode === 'pause' ? 'bi-pause-fill' : 'bi-play-fill'" :style="{ color: options.playerBtnPlayIconColor }"></i>
                            </button>
                        </div>
                     </div>


        </div>


    </div>
</template>

<style scoped>


.radio-item:hover {
    filter: invert(100%);
    transition: 0.3s;
}
.radio-item.active,
.radio-item.active:hover {
    filter: none;
}


.bi-chevron-down {
    transition: 0.3s;
}
.tourne180 {
  transform: rotate(180deg);
}

</style>