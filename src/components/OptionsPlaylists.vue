<template>
    <div id="divPlaylists" class="text-center text-warning animate__animated animate__fadeIn">
        <p class="bg-warning-subtle border-bottom border-warning-subtle fw-bold h5 mb-4 py-4 text-warning-emphasis">Playlists</p>

        <h6 class="text-warning-emphasis text-break">{{ currentPlaylist?.name }}</h6>
        <p class="small">{{ radios?.length }} radios</p>

        <!--  Liste des playlists -->
        <div class="list-group m-3 text-start">
            <div v-for="(playlist, id) in playlistes" :key="id"
                class="list-group-item list-group-item-action border-warning-subtle text-warning-emphasis bg-gradient "
                :class="{ 'list-group-item-warning fw-bold': playlist === currentPlaylist }"
            >
                <!-- Nom -->
                <div class="d-flex"
                    data-bs-toggle="collapse"
                    :data-bs-target="'#'+id"
                    aria-expanded="false"
                    :aria-controls="id"
                >
                    <div class="flex-fill" style="cursor: pointer;">
                        {{ playlist.name }}
                    </div>
                    <div class="small text-nowrap">
                        <span class="badge rounded-pill bg-success ms-2 me-1 small">{{ playlist.radios ? playlist.radios.length : 0 }}</span>
                    </div>
                </div>

                <!-- Collapse boutons -->
                <div :id="id" class="collapse">
                    <div class="d-flex align-items-center justify-content-evenly fs-5">
                        <i class="bi bi-pencil-square " type="button" @click.stop="editPlaylistName(id)" title="Renommer "></i>
                        <i class="bi bi-copy" type="button" @click.stop="duplicateList(id)" title="Dupliquer"></i>

                        <span v-if="playlist != currentPlaylist">
                            <i class="bi bi-box-arrow-in-right" type="button" @click.stop="loadPlaylist(id)" title="Utiliser"></i>
                            <i v-if="playlist.radios.length > 0" class="bi bi-box-arrow-in-up ms-2" type="button" @click.stop="fusionnerPlaylists(id)" title="Ajouter"></i>
                        </span>

                        <button v-if="playlist != currentPlaylist" class="btn p-0" type="button" @click.stop="deletePlaylist(id)" title="Supprimer">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ENVOYER -->
        <div class="card m-3 mt-5 border-0">
            <div class="btn btn-outline-warning py-2 w-100 bg-gradient" data-bs-toggle="collapse"
                data-bs-target="#divAddlist" aria-expanded="false" aria-controls="divAddlist"
                title="Ajouter une liste" @click="store.toggleClasses(['active', 'card-header'], $event)">
                Ajouter une liste
            </div>
            <div id="divAddlist" class="collapse bg-warning-subtle border border-warning rounded-bottom border-top-0">
                <div class="card-body list-group text-warning-emphasis px-3">
                    <button type="button" class="btn btn-warning my-2 bg-warning bg-opacity-50" @click="newEmptyList" title="Ajouter une nouvelle liste vide">
                        <i class="bi bi-plus-circle me-2"></i>Liste vide
                    </button>
                    <button class="btn btn-warning my-2 bg-warning bg-opacity-50" @click="reinitList" title="Re-télécharger la liste initiale">
                        <i class="bi bi-arrow-counterclockwise me-2"></i>Liste initiale
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGlobalStore } from '@/store/globalStore'
import { useToast } from '@/composables/useToast'
import { useDialog } from '@/composables/useDialog'

const store = useGlobalStore()
const { showToast } = useToast()
const { confirm, promptDialog } = useDialog()

const playlistes = computed(() => store.playlistes)
const currentPlaylist = computed(() => {
    const id = store.options.currentPlaylist
    return id && playlistes.value[id] ? playlistes.value[id] : {}
})
const radios = computed(() => currentPlaylist.value.radios || [])

function duplicateList(id) {
    const newListId = 'l' + Date.now()
    store.playlistes[newListId] = {
        name: store.playlistes[id].name + ' (copie)',
        date: Date.now(),
        radios: store.playlistes[id].radios
    }
    showToast(`Liste <strong>${store.playlistes[id].name}</strong> dupliquée`, 'success')
}

function newEmptyList() {
    const newId = 'l' + Date.now()
    store.playlistes[newId] = {
        date: Date.now(),
        name: "Liste vide",
        radios: []
    }
    showToast(`Une nouvelle liste vide a été ajoutée.`, 'success')
}

const reinitList = async () => {
    try {
        const module = await import('@/assets/listeInitiale.json')
        store.playlistes['l01'] = module.default['l01']
        showToast(`La liste initiale a été ajoutée ou mise à jour.`, 'success')
    } catch (error) {
        console.error('Erreur lors du chargement de listeInitiale.json:', error)
        showToast(`Échec du chargement de la liste initiale.`, 'danger')
    }
}

function loadPlaylist(playlistId) {
    const pl = store.playlistes[playlistId]
    if (pl && pl.radios) {
        store.updateOption('currentPlaylist', playlistId)
        showToast(`La playlist "<strong>${pl.name}</strong>" a été mise en place.`, 'success')
    }
}

async function deletePlaylist(playlistId) {
    const leNom = store.playlistes[playlistId].name
    const ok = await confirm({
        title: 'Supprimer la playlist',
        message: `Voulez-vous vraiment supprimer la playlist "${leNom}" ?`,
        confirmLabel: 'Supprimer',
        variant: 'danger'
    })
    if (ok) {
        delete store.playlistes[playlistId]
        showToast(`La liste "<strong>${leNom}</strong>" a été supprimée !`, 'warning')
        if (store.options.currentPlaylist === playlistId) {
            const fallbackId = Object.keys(store.playlistes)[0] ?? null
            store.updateOption('currentPlaylist', fallbackId)
        }
        store.cleanupOrphanRadioData()
    } else {
        showToast(`Suppression de "<strong>${leNom}</strong>" annulée !`, 'info')
    }
}

async function editPlaylistName(playlistId) {
    const newName = await promptDialog({
        title: 'Renommer la playlist',
        defaultValue: store.playlistes[playlistId].name,
        placeholder: 'Nom de la playlist'
    })
    if (newName && newName !== store.playlistes[playlistId].name) {
        store.playlistes[playlistId].name = newName
        showToast(`Le nom de la liste a été changé en "<strong>${newName}</strong>"`, 'success')
    } else {
        showToast('Pas de changement', 'info')
    }
}

const fusionnerPlaylists = (id) => {
    const listToAdd = store.playlistes[id]
    const listEnCours = store.playlistes[store.options.currentPlaylist]

    if (listToAdd && listToAdd.radios && listEnCours && listEnCours.radios) {
        const newRadios = listToAdd.radios.filter(radio =>
            !listEnCours.radios.some(existing => existing.id === radio.id)
        )
        listEnCours.radios = [...listEnCours.radios, ...newRadios]
        const nbrNewRadios = newRadios.length
        const nbrExistingRadios = listToAdd.radios.length - nbrNewRadios
        showToast(`La liste "${listToAdd.name}" a été fusionnée avec la liste "${listEnCours.name}".<br/>${nbrNewRadios} radios ajoutées,<br/>${nbrExistingRadios} radios déjà présentes`, 'success')
    } else {
        showToast('La fusion a échoué', 'danger')
    }
}
</script>
