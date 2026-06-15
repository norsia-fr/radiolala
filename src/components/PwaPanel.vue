<template>
    <div class="border-bottom border-secondary">
        <!-- Bouton déclencheur -->
        <button class="btn btn-sm btn-outline-info w-100 rounded-0" type="button"
            data-bs-toggle="collapse" data-bs-target="#collapsePwa" aria-expanded="false" aria-controls="collapsePwa">
            <i class="bi me-1" :class="isStandalone ? 'bi-info-circle' : 'bi-download'"></i>
            {{ isStandalone ? 'Application installée (PWA)' : 'Installer Radiolala (PWA)' }}
        </button>

        <!-- Collapse : explication + actions -->
        <div id="collapsePwa" class="collapse">
            <div class="p-3 small text-start text-secondary">
                <p class="mb-2">
                    Radiolala est une application web (<abbr title="Progressive Web App">PWA</abbr>) :
                    vous pouvez l'installer sur votre appareil pour l'utiliser comme une application classique —
                    icône dédiée, plein écran, lancement rapide, et interface disponible même hors connexion.
                </p>

                <button v-if="!isStandalone" type="button" class="btn btn-sm btn-info w-100 mb-2" @click="handleInstallClick">
                    <i class="bi bi-download me-1"></i>Installer Radiolala
                </button>
                <p v-else class="fst-italic mb-2">
                    <i class="bi bi-check-circle me-1"></i>Vous utilisez actuellement la version installée.
                </p>

                <button type="button" class="btn btn-link btn-sm p-0 text-secondary text-decoration-none" @click="diagnostiquerPwa">
                    <i class="bi bi-clipboard-pulse me-1"></i>Diagnostic technique
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
import { useDialog } from '@/composables/useDialog'
import { useInstallPrompt } from '@/composables/useInstallPrompt'

const { showToast } = useToast()
const { alertDialog } = useDialog()
const { canInstall, isIOS, isStandalone, install } = useInstallPrompt()

const handleInstallClick = async () => {
    if (isStandalone.value) {
        showToast(`Radiolala est déjà installée sur cet appareil.`, 'success')
        return
    }
    if (isIOS) {
        showToast(`Pour installer sur iOS : appuyez sur <i class="bi bi-box-arrow-up"></i> Partager, puis "Sur l'écran d'accueil".`, 'info')
        return
    }
    if (canInstall.value) {
        await install()
        return
    }
    showToast(`L'installation n'est pas proposée par votre navigateur. Cherchez "Installer" ou "Ajouter à l'écran d'accueil" dans son menu. Si rien ne fonctionne, essayez de <strong>réinitialiser le cache</strong> depuis le panneau Nettoyage.`, 'info')
}

const diagnostiquerPwa = async () => {
    const lines = ['Diagnostic PWA', '']
    lines.push(`HTTPS : ${location.protocol === 'https:' ? 'oui' : 'non (requis pour PWA)'}`)
    try {
        const r = await fetch('./manifest.json', { cache: 'no-store' })
        lines.push(`manifest.json : ${r.ok ? 'OK' : 'erreur ' + r.status}`)
    } catch (e) {
        lines.push(`manifest.json : erreur (${e.message})`)
    }
    for (const size of [192, 512]) {
        try {
            const r = await fetch(`./icones/icon-radiolala-${size}.png`, { cache: 'no-store' })
            lines.push(`icône ${size}px : ${r.ok ? 'OK' : 'erreur ' + r.status}`)
        } catch (e) {
            lines.push(`icône ${size}px : erreur (${e.message})`)
        }
    }
    if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        lines.push(`Service Worker : ${regs.length > 0 ? regs.length + ' enregistré(s)' : 'aucun'}`)
    } else {
        lines.push(`Service Worker : non supporté`)
    }
    if ('caches' in window) {
        const keys = await caches.keys()
        lines.push(`Caches : ${keys.length > 0 ? keys.join(', ') : 'aucun'}`)
    }
    lines.push('')
    lines.push(`Prompt installation natif : ${canInstall.value ? 'disponible' : 'non disponible'}`)
    lines.push(`iOS Safari : ${isIOS ? 'oui' : 'non'}`)
    lines.push(`Lancé en mode app : ${isStandalone.value ? 'oui' : 'non'}`)
    lines.push('')
    lines.push(`User Agent :`)
    lines.push(navigator.userAgent)
    alertDialog({
        title: 'Diagnostic PWA',
        message: lines.map(l => l === '' ? '<br>' : l).join('<br>'),
        html: true
    })
}
</script>
