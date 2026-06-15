<template>
  <OptionsComponent ref="optionsComponentRef" />
  <HistoryComponent ref="historyComponentRef" />
  <RadioPlayer />
  <AppDialog />
  <AppToasts />
</template>

<script setup>
  import { computed, onMounted, provide, ref, watch } from 'vue'
  import { useEventListener } from '@vueuse/core'
  import { marked } from 'marked'
  import { useGlobalStore } from './store/globalStore'
  import { useSwipeDrawer } from './composables/useSwipeDrawer'
  import { useRadioPlayer } from './composables/useRadioPlayer'
  import { useDialog } from './composables/useDialog'
  import pkg from '../package.json'
  import nouveautesMd from '@/assets/nouveautes.md'

  import RadioPlayer from './components/RadioPlayer.vue'
  import OptionsComponent from './components/OptionsComponent.vue'
  import HistoryComponent from './components/HistoryComponent.vue'
  import AppDialog from './components/AppDialog.vue'
  import AppToasts from './components/AppToasts.vue'

  const store = useGlobalStore()
  store.initializeOptions()
  store.initializePlaylistes()

  const player = useRadioPlayer()
  provide('player', player)

  watch(player.currentRadio, (radio) => {
    if (radio && store.options.historiqueEnabled !== false) {
      store.addToHistorique(radio)
    }
  })

  const optionsComponentRef = ref(null)
  const historyComponentRef = ref(null)
  const offcanvasOptionsEl = computed(() => optionsComponentRef.value?.offcanvasOptionsRef ?? null)
  const offcanvasHistoryEl = computed(() => historyComponentRef.value?.offcanvasHistoryRef ?? null)
  const isOptionsOpen = ref(false)
  const isHistoryOpen = ref(false)
  let bsOffcanvasOptions = null
  let bsOffcanvasHistory = null

  useSwipeDrawer({
    side: 'left',
    isOpen: () => isOptionsOpen.value,
    canOpen: () => !isHistoryOpen.value,
    onOpen: () => bsOffcanvasOptions?.show(),
    onClose: () => bsOffcanvasOptions?.hide()
  })

  useSwipeDrawer({
    side: 'right',
    isOpen: () => isHistoryOpen.value,
    canOpen: () => !isOptionsOpen.value,
    onOpen: () => bsOffcanvasHistory?.show(),
    onClose: () => bsOffcanvasHistory?.hide()
  })

  useEventListener(offcanvasOptionsEl, 'shown.bs.offcanvas', () => { isOptionsOpen.value = true })
  useEventListener(offcanvasOptionsEl, 'hidden.bs.offcanvas', () => { isOptionsOpen.value = false })
  useEventListener(offcanvasHistoryEl, 'shown.bs.offcanvas', () => { isHistoryOpen.value = true })
  useEventListener(offcanvasHistoryEl, 'hidden.bs.offcanvas', () => { isHistoryOpen.value = false })

  // Modale « nouvelle version » : comparée à la dernière version vue (localStorage),
  // affichée une seule fois par version, avec le changelog de la version courante
  // extrait de nouveautes.md. Au tout premier lancement, on mémorise sans rien montrer.
  const { alertDialog } = useDialog()
  const showNewVersionDialog = () => {
    const lastSeen = store.options.lastSeenVersion
    store.options.lastSeenVersion = pkg.version
    if (!lastSeen || lastSeen === pkg.version) return
    const section = nouveautesMd.match(/### Version [^\n]+\n([\s\S]*?)(?=\n### Version |$)/)
    const aide = '<hr class="my-2"><p class="small mb-0 opacity-75">En cas de comportement étrange après cette mise à jour, ouvrez '
      + '<strong>Options → Nettoyage</strong> et réinitialisez le cache de l\'application (vos playlists sont conservées).</p>'
    alertDialog({
      title: `Nouvelle version ${pkg.version}`,
      message: marked.parse(section?.[1] ?? 'Voir le détail dans le panneau Options → Changelog.') + aide,
      html: true
    })
  }

  onMounted(() => {
    if (offcanvasOptionsEl.value) {
      bsOffcanvasOptions = new window.bootstrap.Offcanvas(offcanvasOptionsEl.value)
    }
    if (offcanvasHistoryEl.value) {
      bsOffcanvasHistory = new window.bootstrap.Offcanvas(offcanvasHistoryEl.value)
    }

    document.body.style.backgroundColor = store.options.bgColor
    showNewVersionDialog()
  })
</script>

<style>
</style>
