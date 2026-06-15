import { ref, computed, watch, onScopeDispose } from 'vue'
import { useDocumentVisibility } from '@vueuse/core'

// Sleep timer basé sur Date.now() (résiste au throttling onglet caché).
// onTrigger(fadeOutMs) est appelé quand le temps est écoulé.
export function useSleepTimer(onTrigger) {
  const endTime = ref(null)
  const remaining = ref(0)
  let intervalId = null
  let timeoutId = null

  const isActive = computed(() => endTime.value !== null)

  const tick = () => {
    if (!endTime.value) return
    remaining.value = Math.max(0, Math.ceil((endTime.value - Date.now()) / 1000))
  }

  const cancel = () => {
    if (intervalId) { clearInterval(intervalId); intervalId = null }
    if (timeoutId) { clearTimeout(timeoutId); timeoutId = null }
    endTime.value = null
    remaining.value = 0
  }

  const start = (durationMs, fadeOutMs) => {
    cancel()
    endTime.value = Date.now() + durationMs
    tick()
    intervalId = setInterval(tick, 1000)
    timeoutId = setTimeout(() => {
      const cb = onTrigger
      cancel()
      cb?.(fadeOutMs)
    }, durationMs)
  }

  const visibility = useDocumentVisibility()
  watch(visibility, (v) => {
    if (v === 'visible' && isActive.value) tick()
  })

  onScopeDispose(cancel)

  return { isActive, endTime, remaining, start, cancel }
}
