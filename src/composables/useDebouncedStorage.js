import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

// Combine ref réactif + persistance localStorage avec debounce.
// Évite l'écriture à chaque mutation (sliders en mouvement = 60 changements/sec).
export function useDebouncedStorage(key, defaults, delay = 500) {
  let initial
  try {
    const raw = localStorage.getItem(key)
    initial = raw ? JSON.parse(raw) : defaults
  } catch {
    initial = defaults
  }
  const data = ref(initial)

  const persist = useDebounceFn(() => {
    localStorage.setItem(key, JSON.stringify(data.value))
  }, delay)

  watch(data, persist, { deep: true })

  return data
}
