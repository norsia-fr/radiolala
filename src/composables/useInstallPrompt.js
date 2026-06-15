import { ref, computed } from 'vue'

const deferredPrompt = ref(null)

const isStandalone = ref(
  window.matchMedia('(display-mode: standalone)').matches ||
  window.matchMedia('(display-mode: minimal-ui)').matches ||
  window.navigator.standalone === true
)

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt.value = e
})

window.addEventListener('appinstalled', () => {
  deferredPrompt.value = null
  isStandalone.value = true
})

const canInstall = computed(() => deferredPrompt.value !== null)

const install = async () => {
  if (!deferredPrompt.value) return null
  deferredPrompt.value.prompt()
  const choice = await deferredPrompt.value.userChoice
  deferredPrompt.value = null
  return choice.outcome
}

export function useInstallPrompt() {
  return { canInstall, isIOS, isStandalone, install }
}
