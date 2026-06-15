<template>
    <div ref="modalEl" id="appDialog" class="modal fade" tabindex="-1" aria-labelledby="appDialogLabel" aria-hidden="true"
        :data-bs-theme="store.options.optionsDark ? 'dark' : 'light'">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" :data-bs-theme="store.options.optionsDark ? 'dark' : 'light'">
                <div v-if="dialog" class="modal-header">
                    <h5 id="appDialogLabel" class="modal-title">{{ dialog.title }}</h5>
                    <button type="button" class="btn-close" aria-label="Fermer" @click="onCancel"></button>
                </div>
                <div v-if="dialog" class="modal-body">
                    <p v-if="dialog.message && !dialog.html" class="mb-3 text-break">{{ dialog.message }}</p>
                    <div v-else-if="dialog.message" class="mb-3 text-break" v-html="dialog.message"></div>
                    <input v-if="dialog.type === 'prompt'" ref="inputEl" type="text" class="form-control"
                        v-model="inputValue" :placeholder="dialog.placeholder ?? ''" @keyup.enter="onConfirm">
                </div>
                <div v-if="dialog" class="modal-footer">
                    <button v-if="dialog.type !== 'alert'" type="button" class="btn btn-secondary" @click="onCancel">
                        {{ dialog.cancelLabel ?? 'Annuler' }}
                    </button>
                    <button type="button" class="btn" :class="`btn-${dialog.variant ?? 'primary'}`" @click="onConfirm">
                        {{ dialog.confirmLabel ?? 'OK' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { useGlobalStore } from '@/store/globalStore'
import { useDialog } from '@/composables/useDialog'

const store = useGlobalStore()
const { dialog, resolveAndClose } = useDialog()

const modalEl = ref(null)
const inputEl = ref(null)
const inputValue = ref('')
let bsModal = null

onMounted(() => {
    if (modalEl.value) {
        bsModal = new window.bootstrap.Modal(modalEl.value)
        modalEl.value.addEventListener('hidden.bs.modal', () => {
            if (dialog.value) resolveAndClose(dialog.value.type === 'prompt' ? null : dialog.value.type === 'confirm' ? false : undefined)
        })
    }
})

watch(dialog, (d) => {
    if (d) {
        inputValue.value = d.defaultValue ?? ''
        bsModal?.show()
        if (d.type === 'prompt') nextTick(() => inputEl.value?.focus())
    } else {
        bsModal?.hide()
    }
})

const onConfirm = () => {
    const d = dialog.value
    if (!d) return
    if (d.type === 'prompt') resolveAndClose(inputValue.value)
    else if (d.type === 'confirm') resolveAndClose(true)
    else resolveAndClose(undefined)
}

const onCancel = () => {
    const d = dialog.value
    if (!d) return
    if (d.type === 'prompt') resolveAndClose(null)
    else if (d.type === 'confirm') resolveAndClose(false)
    else resolveAndClose(undefined)
}
</script>
