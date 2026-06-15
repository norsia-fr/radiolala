import { ref } from 'vue'

const MAX = 3
const DEFAULT_DURATION = 4000

const toasts = ref([])
let counter = 0

const dismiss = (id) => {
  const i = toasts.value.findIndex(t => t.id === id)
  if (i === -1) return
  const t = toasts.value[i]
  if (t.timeoutId) clearTimeout(t.timeoutId)
  toasts.value.splice(i, 1)
}

const freeze = (id) => {
  const t = toasts.value.find(t => t.id === id)
  if (t && t.timeoutId) {
    clearTimeout(t.timeoutId)
    t.timeoutId = null
    t.frozen = true
  }
}

const show = (options) => {
  const id = ++counter
  const t = {
    id,
    message: options.message ?? '',
    variant: options.variant ?? 'info',
    html: options.html ?? true,
    frozen: false,
    timeoutId: null
  }
  toasts.value.push(t)
  if (toasts.value.length > MAX) toasts.value.shift()
  const duration = options.duration ?? DEFAULT_DURATION
  if (duration > 0) {
    t.timeoutId = setTimeout(() => dismiss(id), duration)
  }
  return id
}

const toast = (opts) => show(typeof opts === 'string' ? { message: opts } : opts)
toast.info    = (m, opts = {}) => show({ message: m, ...opts, variant: 'info' })
toast.success = (m, opts = {}) => show({ message: m, ...opts, variant: 'success' })
toast.warning = (m, opts = {}) => show({ message: m, ...opts, variant: 'warning' })
toast.danger  = (m, opts = {}) => show({ message: m, ...opts, variant: 'danger' })

const TOAST_VARIANTS = ['info', 'success', 'warning', 'danger']

// Helper partagé compatible avec les anciens appels showToast(message, variant).
// Affiche du HTML, fallback sur 'info' si la variante est inconnue.
const showToast = (message, variant = 'info') => {
  show({ message, variant: TOAST_VARIANTS.includes(variant) ? variant : 'info', html: true })
}

export function useToast() {
  return { toasts, toast, dismiss, freeze, showToast }
}
