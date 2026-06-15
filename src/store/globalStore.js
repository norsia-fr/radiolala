import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useDebouncedStorage } from '@/composables/useDebouncedStorage'
import builtinThemes from '@/assets/themes.json'
import builtinPalettes from '@/assets/palettes.json'

export const THEME_KEYS = [
  'bgColor',
  'optionsDark',
  'optionsOpacity',
  'playerCoinsArrondis',
  'playerBgColor',
  'playerBgGradient',
  'playerElmtsColor',
  'playerFontFamily',
  'playerFontSize',
  'playerFontBold',
  'playerTitleColor',
  'playerBtnsBottom',
  'playerBtnsTopRounded',
  'playerBtnPlayAtEnd',
  'playerBtnsRounded',
  'playerBtnsHeight',
  'playerBtnsIconsSize',
  'playerBtnPlayColor',
  'playerBtnPlayIconColor',
  'playerBtnStopColor',
  'playerBtnStopColorInactif',
  'playerBtnStopIconColor',
  'playerBtnStopIconColorInactif',
  'listFullWidth',
  'listRadioRounded',
  'listRadioGradient',
  'listRadioNameCenter',
  'listRadioIMasked',
  'listRadioMargin',
  'listRadioPadding',
  'listRadioNameFont',
  'listRadioNameSize',
  'listRadioNameBold',
  'listFolderNameBold',
  'listRadioNameShadows',
  'listRadioNameLetterSpacing'
]

// Découpage couleurs / structure :
// - COLOR_KEYS = toutes les couleurs (page + player) → portées par une PALETTE
// - STYLE_KEYS = tout le reste (polices, tailles, layout…) → porté par un THÈME
// optionsDark / optionsOpacity restent globaux (sidebars), hors des deux.
export const COLOR_KEYS = [
  'bgColor',
  'playerBgColor',
  'playerElmtsColor',
  'playerTitleColor',
  'playerBtnPlayColor',
  'playerBtnPlayIconColor',
  'playerBtnStopColor',
  'playerBtnStopColorInactif',
  'playerBtnStopIconColor',
  'playerBtnStopIconColorInactif'
]
const GLOBAL_KEYS = ['optionsDark', 'optionsOpacity']
export const STYLE_KEYS = THEME_KEYS.filter(k => !COLOR_KEYS.includes(k) && !GLOBAL_KEYS.includes(k))

const DEFAULT_OPTIONS = {
  currentRadio: '003baf55-9ac9-4352-bceb-375ee4203133',
  currentPlaylist: 'l01',
  // Apparence (aligné sur le thème "Néon nuit")
  bgColor: '#04051a',
  optionsDark: true,
  optionsOpacity: 1,
  playerCoinsArrondis: true,
  playerBgColor: '#2e0264',
  playerBgGradient: false,
  playerElmtsColor: '#a3a3a3',
  playerFontFamily: 'Conthrax',
  playerFontSize: '1.8',
  playerFontBold: false,
  playerTitleColor: '#ceb40d',
  playerBtnsBottom: false,
  playerBtnsTopRounded: false,
  playerBtnPlayAtEnd: false,
  playerBtnsRounded: true,
  playerBtnsHeight: '2',
  playerBtnsIconsSize: '2',
  playerBtnPlayColor: '#55ace2',
  playerBtnPlayIconColor: '#942424',
  playerBtnStopColor: '#d11515',
  playerBtnStopColorInactif: '#540707',
  playerBtnStopIconColor: '#ffffff',
  playerBtnStopIconColorInactif: '#a3a3a3',
  listFullWidth: false,
  listHidden: false, // masquer toute la liste des radios (hors thèmes : état d'usage)
  listRadioRounded: true,
  listRadioGradient: false,
  listRadioNameCenter: false,
  listRadioIMasked: false,
  listRadioMargin: '1',
  listRadioPadding: '2',
  listRadioNameFont: 'SourceSans',
  listRadioNameSize: '1.3',
  listRadioNameBold: true,
  listFolderNameBold: false,
  listRadioNameShadows: false,
  listRadioNameLetterSpacing: '0',
  listNameAutoColorMode: 'adapted', // 'adapted' | 'bw' — couleur auto des noms sans nomColor manuel
  // Autres
  volume: '0.7',
  sleepTimerDuration: 30,
  sleepTimerFadeOut: 5,
  sleepTimerPresets: [5, 15, 30, 60, 120],
  historiqueEnabled: true,
  historiqueMax: 100,
  paletteApplyOrder: 'order', // 'order' | 'reverse' | 'random'
  radioVolumes: {},
  lastSeenVersion: null // dernière version vue (modale « nouvelle version »)
}

export const useGlobalStore = defineStore('global', () => {
  const options = useDebouncedStorage('options', { ...DEFAULT_OPTIONS })
  const playlistes = useDebouncedStorage('playlistes', {})
  const historique = useDebouncedStorage('historique', [])
  const themesPersos = useDebouncedStorage('themesPersos', [])
  const palettesPersos = useDebouncedStorage('palettesPersos', [])
  const isDragging = ref(false)
  const selectedRadio = ref(null)

  const themes = computed(() => [...builtinThemes, ...themesPersos.value])
  const palettes = computed(() => [...builtinPalettes, ...palettesPersos.value])

  // Couleurs du dernier élément de premier niveau de la liste (radio hors
  // dossier, ou dossier) : les nouveaux ajouts reprennent ses couleurs.
  const lastListColors = () => {
    const list = playlistes.value[options.value.currentPlaylist]?.radios ?? []
    for (let i = list.length - 1; i >= 0; i--) {
      const r = list[i]
      const isChild = r.type !== 'folder' && r.folder && list.some(p => p.id === r.folder && p.type === 'folder')
      if (!isChild) return { color: r.color, nomColor: r.nomColor || '' }
    }
    return {}
  }

  const radios = computed(() => {
    const currentList = options.value.currentPlaylist
    return (playlistes.value && currentList && playlistes.value[currentList]
      ? playlistes.value[currentList].radios
      : [])
  })

  const scrollToFolder = (folderId) => {
    const folder = document.getElementById(folderId)
    if (folder) folder.scrollIntoView({ behavior: 'smooth' })
  }

  const updateOption = (key, value) => {
    options.value[key] = value
  }

  const updateRadios = (newRadios) => {
    playlistes.value[options.value.currentPlaylist].radios = newRadios
    cleanupOrphanRadioData()
  }

  const addRadio = (newRadio) => {
    const lastColors = lastListColors()
    const nouvelleRadio = {
      id: newRadio.stationuuid ?? crypto.randomUUID(),
      nom: newRadio.name || 'nouvelle',
      flux: newRadio.url_resolved,
      site: newRadio.homepage,
      logo: newRadio.favicon,
      descr: newRadio.description,
      genre: newRadio.tags,
      pays: newRadio.country,
      codec: newRadio.codec,
      bitrate: newRadio.bitrate,
      favicon: newRadio.favicon,
      color: lastColors.color ?? '#f8f9fa',
      nomColor: lastColors.nomColor ?? '',
      folder: null
    }
    playlistes.value[options.value.currentPlaylist].radios.push(nouvelleRadio)
    setTimeout(() => scrollToFolder(nouvelleRadio.id), 200)
  }

  const addNewFolder = () => {
    const lastColors = lastListColors()
    const newFolder = {
      id: `d${Date.now()}`,
      type: 'folder',
      nom: 'Nouveau dossier',
      descr: '',
      color: lastColors.color ?? '#ffc107',
      nomColor: lastColors.nomColor ?? ''
    }
    playlistes.value[options.value.currentPlaylist].radios.push(newFolder)
    setTimeout(() => scrollToFolder(newFolder.id), 200)
  }

  const initializePlaylistes = async (force = false) => {
    if (force) playlistes.value = {}
    if (Object.keys(playlistes.value).length === 0) {
      try {
        const module = await import('@/assets/listeInitiale.json')
        playlistes.value = { ...module.default }
      } catch (e) {
        console.error('Erreur lors du chargement de listeInitiale.json:', e)
      }
    }
    cleanupOrphanRadioData()
  }

  const initializeOptions = (tout = false) => {
    if (tout) {
      options.value = { ...DEFAULT_OPTIONS }
    } else {
      options.value = { ...DEFAULT_OPTIONS, ...options.value }
    }
    document.body.style.backgroundColor = options.value.bgColor
  }

  const toggleClasses = (classes, event) => {
    const element = event.delegateTarget
    for (const classe of classes) {
      element.classList.toggle(classe)
    }
    const sibligs = element.parentElement.children
    for (let i = 0; i < sibligs.length; i++) {
      if (sibligs[i] !== element) {
        for (const classe of classes) {
          sibligs[i].classList.remove(classe)
        }
      }
    }
  }

  const openInfoModal = (radio) => {
    selectedRadio.value = radio
    document.getElementById('collapseDeleteRadio')?.classList.remove('show')
  }

  const addToHistorique = (radio) => {
    if (!radio?.id) return
    const { playedAt: _ignored, ...snapshot } = radio
    const existingIndex = historique.value.findIndex(e => e.id === radio.id)
    if (existingIndex !== -1) historique.value.splice(existingIndex, 1)
    historique.value.unshift({ ...snapshot, playedAt: Date.now() })
    const max = options.value.historiqueMax ?? 100
    if (historique.value.length > max) historique.value.length = max
  }

  const removeFromHistorique = (id) => {
    const i = historique.value.findIndex(e => e.id === id)
    if (i !== -1) historique.value.splice(i, 1)
    cleanupOrphanRadioData()
  }

  const clearHistorique = () => {
    historique.value = []
    cleanupOrphanRadioData()
  }

  const applyTheme = (themeId) => {
    const theme = themes.value.find(t => t.id === themeId)
    if (!theme?.options) return
    for (const key of STYLE_KEYS) {
      if (theme.options[key] !== undefined) options.value[key] = theme.options[key]
    }
  }

  const addTheme = ({ name, options: themeOptions }) => {
    const trimmed = (name ?? '').trim()
    if (!trimmed || !themeOptions) return null
    const cleaned = {}
    for (const key of STYLE_KEYS) {
      if (themeOptions[key] !== undefined) cleaned[key] = themeOptions[key]
    }
    const newTheme = {
      id: `tp${Date.now()}`,
      name: trimmed,
      builtin: false,
      options: cleaned
    }
    themesPersos.value.push(newTheme)
    return newTheme
  }

  const saveCurrentAsTheme = (name) => {
    return addTheme({ name, options: options.value })
  }

  const renameTheme = (id, newName) => {
    const trimmed = (newName ?? '').trim()
    if (!trimmed) return
    const theme = themesPersos.value.find(t => t.id === id)
    if (theme) theme.name = trimmed
  }

  const deleteTheme = (id) => {
    const i = themesPersos.value.findIndex(t => t.id === id)
    if (i !== -1) themesPersos.value.splice(i, 1)
  }

  // Colorie les radios de la liste courante avec un tableau de couleurs, selon
  // le mode (ordre/inverse/aléatoire), sans jamais répéter une couleur d'affilée.
  const applyListColors = (colors) => {
    if (!colors?.length) return
    const list = playlistes.value[options.value.currentPlaylist]?.radios
    if (!list?.length) return
    const mode = options.value.paletteApplyOrder ?? 'order'
    const ordered = mode === 'reverse' ? [...colors].reverse() : colors
    const n = ordered.length
    // On colore par séquence visuelle pour ne jamais répéter une couleur d'affilée :
    // les éléments de premier niveau (dossiers + radios hors dossier) cyclent
    // ensemble, et les enfants de chaque dossier cyclent dans leur dossier.
    const isChild = (radio) => radio.folder && list.some(r => r.id === radio.folder && r.type === 'folder')
    const pickRandom = (avoid) => {
      let c = ordered[Math.floor(Math.random() * n)]
      if (n > 1) while (c === avoid) c = ordered[Math.floor(Math.random() * n)]
      return c
    }
    let topIdx = 0
    let topPrev = null
    const childIdx = {}
    list.forEach((radio) => {
      if (isChild(radio)) {
        radio.color = mode === 'random'
          ? ordered[Math.floor(Math.random() * n)]
          : ordered[(childIdx[radio.folder] = (childIdx[radio.folder] ?? -1) + 1) % n]
      } else if (mode === 'random') {
        radio.color = topPrev = pickRandom(topPrev)
      } else {
        radio.color = ordered[topIdx++ % n]
      }
    })
  }

  const applyPaletteToPlaylist = (paletteId) => {
    const palette = palettes.value.find(p => p.id === paletteId)
    if (palette) applyListColors(palette.colors)
  }

  // Applique des données de palette (objet, pas forcément sauvegardé) :
  // couleurs du player (COLOR_KEYS) + couleurs de la liste sur les radios.
  const applyPaletteData = ({ player, colors }) => {
    if (player) {
      for (const k of COLOR_KEYS) {
        if (player[k] !== undefined) options.value[k] = player[k]
      }
      if (player.bgColor !== undefined) {
        document.body.style.backgroundColor = player.bgColor
      }
    }
    applyListColors(colors)
  }

  // Applique une palette « complète » par son id.
  const applyPalette = (paletteId) => {
    const palette = palettes.value.find(p => p.id === paletteId)
    if (palette) applyPaletteData({ player: palette.player, colors: palette.colors })
  }

  const setRadioVolume = (radioId, value) => {
    if (!radioId) return
    if (!options.value.radioVolumes) options.value.radioVolumes = {}
    options.value.radioVolumes[radioId] = value
  }

  const unsetRadioVolume = (radioId) => {
    if (!radioId || !options.value.radioVolumes) return
    delete options.value.radioVolumes[radioId]
  }

  // Supprime les données par radio (radioVolumes, etc.) pour les radios
  // qui ne sont plus référencées par une playlist ni par l'historique.
  const cleanupOrphanRadioData = () => {
    const referenced = new Set()
    for (const playlist of Object.values(playlistes.value ?? {})) {
      playlist?.radios?.forEach(r => { if (r?.id) referenced.add(r.id) })
    }
    historique.value?.forEach(e => { if (e?.id) referenced.add(e.id) })

    const volumes = options.value.radioVolumes ?? {}
    for (const id of Object.keys(volumes)) {
      if (!referenced.has(id)) delete volumes[id]
    }
  }

  const savePalette = ({ name, colors, player }) => {
    const trimmed = (name ?? '').trim()
    if (!trimmed || !Array.isArray(colors) || !colors.length) return null
    const newPalette = {
      id: `pp${Date.now()}`,
      name: trimmed,
      builtin: false,
      colors: [...colors]
    }
    if (player && typeof player === 'object') newPalette.player = { ...player }
    palettesPersos.value.push(newPalette)
    return newPalette
  }

  // Capture l'état couleur courant en palette : couleurs du player (COLOR_KEYS)
  // + couleurs distinctes utilisées dans la liste courante.
  const saveCurrentAsPalette = (name) => {
    const player = {}
    for (const k of COLOR_KEYS) player[k] = options.value[k]
    const list = playlistes.value[options.value.currentPlaylist]?.radios || []
    const colors = [...new Set(list.map(r => r.color).filter(Boolean))]
    return savePalette({ name, colors: colors.length ? colors : [player.playerBgColor || '#888888'], player })
  }

  const renamePalette = (id, newName) => {
    const trimmed = (newName ?? '').trim()
    if (!trimmed) return
    const palette = palettesPersos.value.find(p => p.id === id)
    if (palette) palette.name = trimmed
  }

  const updatePaletteColor = (id, index, color) => {
    const palette = palettesPersos.value.find(p => p.id === id)
    if (palette && index >= 0 && index < palette.colors.length) {
      palette.colors[index] = color
    }
  }

  const updatePalettePlayerColor = (id, key, color) => {
    const palette = palettesPersos.value.find(p => p.id === id)
    if (palette?.player && COLOR_KEYS.includes(key)) {
      palette.player[key] = color
    }
  }

  const deletePalette = (id) => {
    const i = palettesPersos.value.findIndex(p => p.id === id)
    if (i !== -1) palettesPersos.value.splice(i, 1)
  }

  const $reset = () => {
    options.value = { ...DEFAULT_OPTIONS }
    playlistes.value = {}
    historique.value = []
    themesPersos.value = []
    palettesPersos.value = []
    isDragging.value = false
    selectedRadio.value = null
  }

  return {
    options,
    playlistes,
    historique,
    themesPersos,
    palettesPersos,
    themes,
    palettes,
    isDragging,
    selectedRadio,
    radios,
    updateOption,
    updateRadios,
    addRadio,
    addNewFolder,
    scrollToFolder,
    initializePlaylistes,
    initializeOptions,
    toggleClasses,
    openInfoModal,
    addToHistorique,
    removeFromHistorique,
    clearHistorique,
    applyTheme,
    addTheme,
    saveCurrentAsTheme,
    renameTheme,
    deleteTheme,
    applyPaletteToPlaylist,
    applyPalette,
    applyPaletteData,
    savePalette,
    saveCurrentAsPalette,
    renamePalette,
    updatePaletteColor,
    updatePalettePlayerColor,
    deletePalette,
    setRadioVolume,
    unsetRadioVolume,
    cleanupOrphanRadioData,
    $reset
  }
})
