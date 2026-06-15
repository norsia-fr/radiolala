<template>
    <div id="divCleaning" class="text-center text-danger animate__animated animate__fadeIn">
        <p class="bg-danger-subtle border-bottom border-danger-subtle fw-bold h5 mb-4 py-4 text-danger-emphasis">Nettoyage</p>
        <div class="px-3">
            <!-- Clear -->
            <div class="card mt-3 border-0">
                <div class="btn btn-outline-danger py-1 w-100" data-bs-toggle="collapse"
                    data-bs-target="#divClearlist" aria-expanded="false" aria-controls="divClearlist"
                    title="Vider liste" @click="store.toggleClasses(['active', 'card-header'], $event)">
                    <i class="bi bi-trash pe-2"></i>Vider la liste actuelle
                </div>
                <div class="collapse bg-danger-subtle rounded-bottom" id="divClearlist">
                    <div class="card-body text-center text-danger-emphasis">
                        <p class="fw-bold text-danger">Le voulez-vous vraiment ?</p>
                        <p>Cela videra la liste actuelle de toutes les radios qu'elle contient.</p>
                        <button class="btn btn-danger mt-2" @click="clearList">Oui je le veux !</button>
                    </div>
                </div>
            </div>
            <!-- Clear playlistes -->
            <div class="card mt-3 border-0">
                <div class="btn btn-outline-danger py-1 w-100" data-bs-toggle="collapse"
                    data-bs-target="#divResetListes" aria-expanded="false" aria-controls="divResetListes"
                    title="Vider liste" @click="store.toggleClasses(['active', 'card-header'], $event)">
                    <i class="bi bi-trash pe-2"></i>Supprimer toutes les listes
                </div>
                <div class="collapse bg-danger-subtle rounded-bottom" id="divResetListes">
                    <div class="card-body text-center text-danger-emphasis">
                        <p class="fw-bold text-danger">Le voulez-vous vraiment ?</p>
                        <p>Cela supprimera toutes les listes et re-téléchargera la liste initiale.</p>
                        <button class="btn btn-danger mt-2" @click="resetLists">Oui, je le veux !</button>
                    </div>
                </div>
            </div>

            <!-- Réinitialiser les options -->
            <div class="card mt-3 border-0">
                <div class="btn btn-outline-danger py-1 w-100" data-bs-toggle="collapse"
                    data-bs-target="#divResetOptions" aria-expanded="false" aria-controls="divResetOptions"
                    title="Vider liste" @click="store.toggleClasses(['active', 'card-header'], $event)">
                    <i class="bi bi-trash pe-2"></i>Réinitialiser les options
                </div>
                <div class="collapse bg-danger-subtle rounded-bottom" id="divResetOptions">
                    <div class="card-body text-center text-danger-emphasis">
                        <p class="fw-bold text-danger">Le voulez-vous vraiment ?</p>
                        <p>Cela supprimera toutes les options personnalisées et utilisera les options initiales.</p>
                        <button class="btn btn-danger mt-2" @click="resetOptions">Oui, je le veux !</button>
                    </div>
                </div>
            </div>

            <div class="card mt-3 border-0">
                <div class="btn btn-outline-warning py-1 w-100" data-bs-toggle="collapse"
                    data-bs-target="#divResetSW" aria-expanded="false" aria-controls="divResetSW"
                    title="Réinitialiser le cache de l'application" @click="store.toggleClasses(['active', 'card-header'], $event)">
                    <i class="bi bi-arrow-clockwise pe-2"></i>Réinitialiser le cache de l'application
                </div>
                <div class="collapse bg-warning-subtle rounded-bottom" id="divResetSW">
                    <div class="card-body text-center text-warning-emphasis">
                        <p class="fw-bold text-warning-emphasis">Vider le cache et désinscrire le service worker ?</p>
                        <p>Vos playlists et options sont <strong>conservées</strong>. Utile si l'installation ne se déclenche pas, si la mise à jour ne s'applique pas, ou en cas de bug d'affichage persistant. La page se rechargera ensuite.</p>
                        <button class="btn btn-warning mt-2" @click="resetServiceWorker">Oui, réinitialiser</button>
                    </div>
                </div>
            </div>

            <div class="card mt-3 border-0">
                <div class="btn btn-outline-danger py-1 w-100" data-bs-toggle="collapse"
                    data-bs-target="#divDeleteAll" aria-expanded="false" aria-controls="divDeleteAll"
                    title="Tout supprimer" @click="store.toggleClasses(['active', 'card-header'], $event)">
                    <i class="bi bi-trash pe-2"></i>Réinitialisation complète
                </div>
                <div class="collapse bg-danger-subtle rounded-bottom" id="divDeleteAll">
                    <div class="card-body text-center text-danger-emphasis">
                        <p class="fw-bold text-danger">Le voulez-vous vraiment ?</p>
                        <p>Cela supprimera toutes les options personnalisées ainsi que toutes les listes !</p>
                        <p>L'état initial sera restauré.</p>
                        <button class="btn btn-danger mt-2" @click="deleteAll">Oui je le veux !</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useGlobalStore } from '@/store/globalStore'
import { useToast } from '@/composables/useToast'
import { useDialog } from '@/composables/useDialog'

const store = useGlobalStore()
const { showToast } = useToast()
const { confirm } = useDialog()

function clearList() {
    store.playlistes[store.options.currentPlaylist].radios = []
}

const resetLists = async () => {
    await store.initializePlaylistes(true)
    showToast('Les listes ont été réinitialisées', 'info')
}

const resetOptions = () => {
    store.initializeOptions(true)
    showToast('Les options ont été réinitialisées', 'info')
}

async function deleteAll() {
    const ok = await confirm({
        title: 'Réinitialisation complète',
        message: 'Voulez-vous vraiment tout supprimer et repartir à zéro ?',
        confirmLabel: 'Tout supprimer',
        variant: 'danger'
    })
    if (ok) {
        localStorage.clear()
        store.$reset()
        showToast('Auto-destruction !', 'warning')
        window.location.reload()
    } else {
        showToast('Désintégration annulée !', 'info')
    }
}

const resetServiceWorker = async () => {
    try {
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations()
            await Promise.all(registrations.map(r => r.unregister()))
        }
        if ('caches' in window) {
            const keys = await caches.keys()
            await Promise.all(keys.map(k => caches.delete(k)))
        }
        showToast(`Cache vidé, rechargement…`, 'info')
        setTimeout(() => window.location.reload(), 800)
    } catch (e) {
        console.error(e)
        showToast(`Erreur : ${e.message}`, 'danger')
    }
}
</script>
