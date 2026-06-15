<template>
    <div class="app-toast-container">
        <TransitionGroup name="toast" tag="div" class="app-toast-stack">
            <div v-for="t in toasts" :key="t.id"
                class="app-toast"
                :class="[`app-toast-${t.variant}`, { 'app-toast-frozen': t.frozen }]"
                :data-toast-id="t.id"
                role="status">
                <i class="app-toast-icon bi" :class="iconFor(t.variant)" aria-hidden="true"></i>
                <div v-if="t.html" class="app-toast-body" v-html="t.message"></div>
                <div v-else class="app-toast-body">{{ t.message }}</div>
                <button type="button" class="app-toast-close" @click.stop="dismiss(t.id)" aria-label="Fermer">
                    <i class="bi bi-x-lg" aria-hidden="true"></i>
                </button>
            </div>
        </TransitionGroup>
    </div>
</template>

<script setup>
import { useEventListener } from '@vueuse/core'
import { useToast } from '@/composables/useToast'

const { toasts, dismiss, freeze } = useToast()

const iconFor = (variant) => {
    switch (variant) {
        case 'success': return 'bi-check-circle-fill'
        case 'warning': return 'bi-exclamation-triangle-fill'
        case 'danger': return 'bi-x-circle-fill'
        default: return 'bi-info-circle-fill'
    }
}

// Clic sur un toast → on l'épingle (annule l'auto-dismiss).
// Clic ailleurs → on ferme les toasts épinglés.
useEventListener(document, 'click', (e) => {
    const el = e.target.closest?.('.app-toast')
    if (el) {
        const id = Number(el.dataset.toastId)
        if (Number.isFinite(id)) freeze(id)
    } else {
        toasts.value.slice().forEach(t => { if (t.frozen) dismiss(t.id) })
    }
})
</script>

<style scoped>
.app-toast-container {
    position: fixed;
    left: 50%;
    bottom: 1rem;
    transform: translateX(-50%);
    z-index: 1100;
    pointer-events: none;
    width: min(480px, calc(100vw - 2rem));
}
.app-toast-stack {
    display: flex;
    flex-direction: column-reverse;
    gap: 0.5rem;
    align-items: center;
}
.app-toast {
    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    width: 100%;
    padding: 0.625rem 0.75rem;
    border-radius: 0.5rem;
    color: #fff;
    background: var(--toast-bg);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    font-size: 0.9rem;
    line-height: 1.35;
    cursor: pointer;
}
.app-toast-icon {
    font-size: 1.2rem;
    line-height: 1.2;
    flex-shrink: 0;
}
.app-toast-body {
    flex: 1;
    word-break: break-word;
    min-width: 0;
}
.app-toast-body :deep(strong),
.app-toast-body :deep(b) {
    font-weight: 700;
}
.app-toast-close {
    background: transparent;
    border: none;
    color: inherit;
    padding: 0;
    margin: 0;
    font-size: 0.95rem;
    line-height: 1;
    opacity: 0.75;
    flex-shrink: 0;
    align-self: flex-start;
    margin-top: 0.15rem;
}
.app-toast-close:hover,
.app-toast-close:focus {
    opacity: 1;
    outline: none;
}

.app-toast-info    { --toast-bg: #0d6efd; }
.app-toast-success { --toast-bg: #198754; }
.app-toast-warning { --toast-bg: #c47b1c; }
.app-toast-danger  { --toast-bg: #dc3545; }

.toast-enter-active,
.toast-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}
.toast-enter-from {
    opacity: 0;
    transform: translateY(20px);
}
.toast-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
.toast-move {
    transition: transform 0.25s ease;
}
</style>
