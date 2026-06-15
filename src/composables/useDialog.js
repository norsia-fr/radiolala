import { ref } from 'vue'

const dialog = ref(null)

const open = (payload) => {
  return new Promise((resolve) => {
    dialog.value = { ...payload, resolve }
  })
}

const resolveAndClose = (value) => {
  const cb = dialog.value?.resolve
  dialog.value = null
  cb?.(value)
}

const confirm = ({
  title = 'Confirmer',
  message = '',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'primary',
  html = false
}) => open({ type: 'confirm', title, message, confirmLabel, cancelLabel, variant, html })

const promptDialog = ({
  title = 'Saisir une valeur',
  message = '',
  defaultValue = '',
  placeholder = '',
  confirmLabel = 'Valider',
  cancelLabel = 'Annuler',
  html = false
}) => open({ type: 'prompt', title, message, defaultValue, placeholder, confirmLabel, cancelLabel, html })

const alertDialog = ({
  title = 'Information',
  message = '',
  confirmLabel = 'OK',
  variant = 'primary',
  html = false
}) => open({ type: 'alert', title, message, confirmLabel, variant, html })

export function useDialog() {
  return { dialog, confirm, promptDialog, alertDialog, resolveAndClose }
}
