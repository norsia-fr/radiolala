<template>
    <div class="d-flex align-items-center">

        <!-- Btn drag -->
        <i v-show="store.isDragging"
            class="bi bi-grip-vertical me-2 animate__animated animate__fadeInLeft animate__faster"></i>

        <!-- Btn info -->
        <i v-show="!store.isDragging" type="button" class="bi bi-info-circle" style="z-index: 1"
            :class="{ 'opacity-0': options.listRadioIMasked, 'opacity-25': !options.listRadioIMasked }"
            data-bs-toggle="modal" data-bs-target="#radioModal" @click.stop="store.openInfoModal(radio)">
        </i>

        <!-- Haut parleur (uniquement sur la radio active) -->
         <svg v-show="speakerVisible" :class="{ playing: isPlaying }" class="bi bi-volume-up-fill ms-2 speaker" width="25" height="25" fill="currentColor" version="1.1" viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg">
            <path d="m5.717 1.56a0.5 0.5 0 0 1 0.283 0.45v8a0.5 0.5 0 0 1-0.812 0.39l-2.363-1.89h-2.325a0.5 0.5 0 0 1-0.5-0.5v-4a0.5 0.5 0 0 1 0.5-0.5h2.325l2.363-1.89a0.5 0.5 0 0 1 0.529-0.06" class="hpblock"></path>
            <path d="M 7.707,9.192 A 4.5,4.5 0 0 0 9.025,6.01 4.5,4.5 0 0 0 7.707,2.828 L 7,3.535 A 3.5,3.5 0 0 1 8.025,6.01 3.5,3.5 0 0 1 7,8.485 Z" class="hp0"></path>
            <path d="m9.121 10.61a6.48 6.48 0 0 0 1.904-4.596 6.48 6.48 0 0 0-1.904-4.596l-0.707 0.707a5.48 5.48 0 0 1 1.611 3.889 5.48 5.48 0 0 1-1.61 3.89z" class="hp1"></path>
            <path d="m10.54 12.02a8.47 8.47 0 0 0 2.49-6.01 8.47 8.47 0 0 0-2.49-6.01l-0.708 0.707a7.48 7.48 0 0 1 2.197 5.303c0 2.071-0.84 3.946-2.197 5.303z" class="hp2"></path>
        </svg>

        <!-- Nom radio -->
        <p class="text-break m-0 w-100"
            :class="{ 'fw-bold': options.listRadioNameBold, 'text-center w-100': options.listRadioNameCenter, 'ms-4': !options.listRadioNameCenter && !speakerVisible, 'ms-2': !options.listRadioNameCenter && speakerVisible, 'text-shadows-2': options.listRadioNameShadows }"
            :style="{ fontSize: store.options.listRadioNameSize + 'rem', fontFamily: options.listRadioNameFont, letterSpacing: (store.options.listRadioNameLetterSpacing || 0) + 'em', color: nameColorResolved }">
            {{ props.radio.nom }}
        </p>
        <!-- Btn drag -->
        <i v-show="store.isDragging"
            class="bi bi-grip-vertical me-2 animate__animated animate__fadeInRight animate__faster"></i>

    </div>
</template>

<script setup>
import { computed, defineProps, inject } from 'vue'
import { useGlobalStore } from '../store/globalStore'
import { storeToRefs } from 'pinia'
import { autoNameColor } from '@/utils/paletteGenerator'

const store = useGlobalStore()
const { options } = storeToRefs(store)
// Radio active = celle pilotée par le player (même source que la surbrillance
// .active de la ligne dans RadioPlayer), plus fiable que store.options.currentRadio.
const { currentRadio, isPlaying } = inject('player')
const props = defineProps({
    radio: Object,
    // Couleur du nom imposée par le parent (radio en dossier). undefined = utiliser
    // la couleur propre de la radio ; null = hériter (laisser le contraste du parent).
    nameColor: { type: [String, null], default: undefined }
})

// Couleur du nom : imposée par le parent (radio en dossier), sinon la couleur
// manuelle (nomColor, modale), sinon automatique — toujours lisible sur le fond.
const nameColorResolved = computed(() => {
    if (props.nameColor !== undefined) return props.nameColor || undefined
    if (props.radio.nomColor) return props.radio.nomColor
    return autoNameColor(props.radio.color, options.value.listNameAutoColorMode)
})

// Haut-parleur affiché sur la radio sélectionnée (le cône, lecture ou non).
const speakerVisible = computed(() => props.radio.id === currentRadio.value?.id)
</script>