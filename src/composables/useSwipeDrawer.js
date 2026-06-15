import { useEventListener } from '@vueuse/core'

const IGNORED_TARGETS = 'input[type=range], input[type=color], select, textarea'

// edgeStart : zone réservée au navigateur (gesture "retour" sur Chrome Android / Safari iOS)
// edgeWidth : limite extérieure de la zone d'ouverture (number en px, ou function retournant un number)
// → un swipe d'ouverture doit démarrer dans [edgeStart, edgeWidth] (symétrique à droite)
export function useSwipeDrawer({
  side = 'left',
  edgeStart = 50,
  edgeWidth = () => window.innerWidth / 2,
  threshold = 60,
  velocity = 0.4,
  isOpen,
  canOpen = () => true,
  onOpen,
  onClose
}) {
  const resolveEdgeWidth = () =>
    typeof edgeWidth === 'function' ? edgeWidth() : edgeWidth
  let startX = 0
  let startY = 0
  let startT = 0
  let mode = 'idle'
  let fired = false

  const onTouchStart = (e) => {
    const t = e.touches[0]
    startX = t.clientX
    startY = t.clientY
    startT = e.timeStamp
    mode = 'idle'
    fired = false

    if (e.target.closest?.(IGNORED_TARGETS)) {
      mode = 'ignored'
      return
    }

    if (!isOpen()) {
      const w = window.innerWidth
      const edge = resolveEdgeWidth()
      const fromEdge = side === 'left'
        ? startX >= edgeStart && startX <= edge
        : startX <= w - edgeStart && startX >= w - edge
      if (!fromEdge) mode = 'ignored'
    }
  }

  const onTouchMove = (e) => {
    if (mode === 'ignored' || fired) return
    const t = e.touches[0]
    const dx = t.clientX - startX
    const dy = t.clientY - startY

    if (mode === 'idle') {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
      if (Math.abs(dx) < Math.abs(dy) * 1.5) {
        mode = 'ignored'
        return
      }
      mode = 'horizontal'
    }

    const dt = Math.max(1, e.timeStamp - startT)
    const v = Math.abs(dx) / dt
    if (Math.abs(dx) < threshold && v < velocity) return

    const opening = (side === 'left' && dx > 0) || (side === 'right' && dx < 0)
    if (opening && !isOpen() && canOpen()) {
      onOpen()
      fired = true
    } else if (!opening && isOpen()) {
      onClose()
      fired = true
    }
  }

  const onTouchEnd = () => {
    mode = 'idle'
    fired = false
  }

  useEventListener(document, 'touchstart', onTouchStart, { passive: true })
  useEventListener(document, 'touchmove', onTouchMove, { passive: true })
  useEventListener(document, 'touchend', onTouchEnd, { passive: true })
}
