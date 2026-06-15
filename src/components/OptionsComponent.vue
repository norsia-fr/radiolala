<template>
    <div>
        <!-- ******* Offcanvas Options *********** -->
        <div id="offcanvasOptions" ref="offcanvasOptionsRef" class="offcanvas offcanvas-start"  data-bs-scroll="true" data-bs-backdrop="false"
            tabindex="-1" aria-labelledby="offcanvasOptions" :data-bs-theme="optionsDark ? 'dark' : 'light'" :style="{ opacity: optionsOpacity ? optionsOpacity : 1 }">
                <!-- ******* Header *********** -->
                <div class="offcanvas-header bg-secondary-subtle p-0 justify-content-between border-bottom border-dark-subtle">

                    <div>
                        <!-- Bouton pour basculer theme light/dark -->
                        <button id="btnTheme" class="btn" type="button" title="Thème" @click.stop="toggleOptionsDark">
                            <i class="fw-bold" :class="optionsDark ? 'bi bi-sun-fill' : 'bi bi-moon-fill'"></i>
                        </button>
                        <!-- Bouton pour changer l'opacité des options -->
                        <button id="btnOptionsOpacity" class="btn" type="button" title="Opacité" @click.stop="changeOptionsOpacity">
                            <i class="fw-bold bi bi-transparency"></i>
                            <!-- <span class="badge bg-dark-subtle text-dark rounded-pill">{{ optionsOpacity !== 1 ? optionsOpacity : '' }}</span> -->
                        </button>
                    </div>
                        
                    <div class="h4 offcanvas-title py-2" id="offcanvasOptionsLabel">
                        Options
                    </div>
                    <!-- Bouton pour fermer le panneau -->
                    <button type="button" class="btn-close mx-1" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>

                <!-- ******** BOUTONS ********** -->
                <div id="optionsPlaylistBtns" class="d-flex justify-content-evenly sticky-top bg-body-tertiary shadow-sm">

                    <button id="btnReset" class="btn tab-btn tab-playlists" type="button"
                        :class="{ active: optionActive === 'divPlaylists' }"
                        title="Gérer les playlists"
                        @click.stop="optionActive = 'divPlaylists'">
                        <i class="bi bi-music-note-list fs-3"></i>
                    </button>

                    <button id="btnApparence" class="btn tab-btn tab-apparence" type="button"
                        :class="{ active: optionActive === 'collapseApparence' }"
                        title="Apparence"
                        @click.stop="optionActive = 'collapseApparence'">
                        <i class="bi bi-palette fs-3"></i>
                    </button>

                    <button id="btnPlus" class="btn tab-btn tab-plus" type="button"
                        :class="{ active: optionActive === 'divPlus' }"
                        title="Ajouter"
                        @click.stop="optionActive = 'divPlus'">
                        <i class="bi bi-plus-lg fs-3"></i>
                    </button>

                    <button id="btnReorder" class="btn tab-btn tab-reorder" type="button"
                        :class="{ active: optionActive === 'divReorder' }"
                        title="Réordonner"
                        @click.stop="optionActive = 'divReorder'">
                        <i class="bi bi-arrow-down-up fs-3"></i>
                    </button>

                    <button id="btnShare" class="btn tab-btn tab-partage" type="button"
                        :class="{ active: optionActive === 'divShare' }"
                        title="Partage"
                        @click.stop="optionActive = 'divShare'">
                        <i class="bi bi-share fs-3"></i>
                    </button>

                    <button id="btnShowCleaning" class="btn tab-btn tab-nettoyage" type="button"
                        :class="{ active: optionActive === 'divCleaning' }"
                        title="Nettoyage"
                        @click.stop="optionActive = 'divCleaning'">
                        <i class="bi bi-trash fs-3"></i>
                    </button>

                </div>

                <!-- ******** Collapses ********* -->
                <div class="offcanvas-body p-0">
                    <div id="accordionOptions" class="pb-3">

                        <!-- Playlists -->
                        <OptionsPlaylists v-if="optionActive === 'divPlaylists'" />

                        <!-- Apparence -->
                        <OptionsApparence v-if="optionActive === 'collapseApparence'" />
                        
                        <!-- Plus -->
                        <OptionsPlus v-if="optionActive === 'divPlus'" />

                        <!-- Reorder -->
                        <OptionsReorder v-if="optionActive === 'divReorder'" />

                        <!-- Partage -->
                        <OptionsPartage v-if="optionActive === 'divShare'" />

                        <!-- Nettoyage -->
                        <OptionsNettoyage v-if="optionActive === 'divCleaning'" />

                    </div>
                </div>

            
                <!-- ******** Footer ************ -->
                <div class="offcanvas-footer text-bg-dark mt-auto">
                    <PwaPanel />
                    <div class="row m-0 align-items-center text-secondary">
                        <div class="col-3 p-0">
                            <button class="btn btn-dark rounded-0 text-secondary" type="button" data-bs-toggle="offcanvas"
                                href="#offcanvasVersion" role="button" aria-expanded="false"
                                data-bs-target="#offcanvasVersion" aria-controls="offcanvasVersion"
                                title="Infos de version">v{{ appVersion }}
                            </button>

                        </div>
                        <div class="col-6 text-center">
                            <p class="small m-0">
                                <i class="bi bi-code"></i> with <i class="bi bi-heart-fill"></i> by <a href="#" target="_blank"
                                    class="link-offset-2 link-underline-info link-underline-opacity-0 link-underline-opacity-75-hover text-secondary">Norsia</a>
                            </p>
                        </div>
                        <div class="col-3 text-end">
                            <!-- <p class="small m-0 "><i class="bi bi-question-circle"></i></p> -->
                            <button class="btn btn-dark rounded-0 text-secondary" type="button" data-bs-toggle="offcanvas"
                                href="#offcanvasDoc" role="button" aria-expanded="false" data-bs-target="#offcanvasDoc"
                                aria-controls="offcanvasDoc" title="Foire Aux Questions">
                                <i class="bi bi-question-circle"></i>
                            </button>
                        </div>
                    </div>

                </div>

        </div>

        <VersionOffcanvas />


        <DocOffcanvas />

    </div>
</template>

<script setup>
import { computed, ref, defineExpose } from 'vue'
import DocOffcanvas from './DocOffcanvas.vue'
import VersionOffcanvas from './VersionOffcanvas.vue'
import OptionsReorder from './OptionsReorder.vue'
import OptionsPlus from './OptionsPlus.vue'
import OptionsNettoyage from './OptionsNettoyage.vue'
import OptionsPartage from './OptionsPartage.vue'
import OptionsPlaylists from './OptionsPlaylists.vue'
import OptionsApparence from './OptionsApparence.vue'
import PwaPanel from './PwaPanel.vue'
import { useGlobalStore } from '@/store/globalStore'
import { useToast } from '@/composables/useToast'
import pkg from '../../package.json'

const store = useGlobalStore()

const appVersion = pkg.version

const offcanvasOptionsRef = ref(null)
defineExpose({
  offcanvasOptionsRef
})

// Accès aux options depuis le store
const options = computed(() => store.options)
const optionActive = ref('divPlaylists')
const optionsOpacity = computed(() => options.value.optionsOpacity)
const optionsDark = computed(() => options.value.optionsDark)

const { showToast } = useToast()

function toggleOptionsDark() {
    const newVal = !options.value.optionsDark
    store.updateOption('optionsDark', newVal)
    showToast(`Mode <strong>${newVal ? 'sombre' : 'clair'}</strong> activé`, 'info')
}

const changeOptionsOpacity = () => {
    const optionsOpacityTmp = optionsOpacity.value === 1 ? 0.75 : 1
    store.updateOption('optionsOpacity', optionsOpacityTmp)
}
</script>


