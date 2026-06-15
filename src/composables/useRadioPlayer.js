import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEventListener } from '@vueuse/core'
import { useGlobalStore } from '@/store/globalStore'

export function useRadioPlayer() {
    const audio = ref(null)
    const isPlaying = ref(false)
    const isLoading = ref(false)
    const isPaused = ref(false)
    const isStopping = ref(false)
    const isError = ref(false)
    const httpFallbackUrl = ref(null)
    const currentTime = ref(0)
    const currentRadio = ref(null)
    const audioDuration = ref(NaN)

    const isFiniteAudio = computed(() => Number.isFinite(audioDuration.value) && audioDuration.value > 0)

    const store = useGlobalStore()

    let pendingHttpUrl = null
    let intentionalStop = false
    let fadeInterval = null
    let fadeOriginalVolume = null

    const clearFade = (restoreVolume) => {
        if (fadeInterval) {
            clearInterval(fadeInterval)
            fadeInterval = null
        }
        if (restoreVolume && audio.value && fadeOriginalVolume !== null) {
            audio.value.volume = fadeOriginalVolume
        }
        fadeOriginalVolume = null
        isStopping.value = false
    }

    useEventListener(audio, 'playing', () => {
        isPlaying.value = true
        isLoading.value = false
        isPaused.value = false
        isError.value = false
    })
    useEventListener(audio, 'pause', () => {
        isPaused.value = true
        isPlaying.value = false
        isLoading.value = false
    })
    useEventListener(audio, 'waiting', () => {
        isLoading.value = true
    })
    useEventListener(audio, 'abort', () => {
        isLoading.value = false
        isPlaying.value = false
        isPaused.value = false
    })
    useEventListener(audio, 'error', () => {
        if (intentionalStop) {
            intentionalStop = false
            return
        }
        isLoading.value = false
        isPlaying.value = false
        isPaused.value = false
        isError.value = true
        httpFallbackUrl.value = pendingHttpUrl
        pendingHttpUrl = null
    })
    useEventListener(audio, 'ended', () => {
        isLoading.value = false
        isPlaying.value = false
        isPaused.value = false
    })
    useEventListener(audio, 'timeupdate', () => {
        currentTime.value = audio.value.currentTime
    })
    useEventListener(audio, 'loadedmetadata', () => {
        audioDuration.value = audio.value?.duration ?? NaN
    })
    useEventListener(audio, 'durationchange', () => {
        audioDuration.value = audio.value?.duration ?? NaN
    })
    useEventListener(audio, 'emptied', () => {
        audioDuration.value = NaN
    })

    onMounted(() => {
        audio.value = new Audio()
        audio.value.volume = store.options.volume ? store.options.volume : 1
    })

    onUnmounted(() => {
        if (audio.value) {
            audio.value.pause()
            audio.value = null
        }
    })

    const play = (radio) => {
        if (!audio.value) return

        // Annule un fade-out en cours (protection double-clic ou reprise post-stop)
        if (isStopping.value) {
            clearFade(true)
            // L'audio joue toujours en coulisses, rien d'autre à faire
            return
        }

        if (isLoading.value) return

        isError.value = false
        httpFallbackUrl.value = null
        pendingHttpUrl = null

        if (isPaused.value && currentRadio.value?.id === radio.id) {
            audio.value.play()
            return
        }

        let url = radio.flux
        if (window.location.protocol === 'https:' && url && url.startsWith('http:')) {
            pendingHttpUrl = url
            url = url.replace('http:', 'https:')
        }

        // Volume enregistré pour cette radio : on l'applique et on met à jour
        // le volume effectif (qui devient le nouveau "volume courant" — si la
        // prochaine radio n'a pas de volume enregistré, elle gardera celui-ci)
        const savedVolume = store.options.radioVolumes?.[radio.id]
        if (typeof savedVolume === 'number' && !Number.isNaN(savedVolume)) {
            audio.value.volume = savedVolume
            store.options.volume = String(savedVolume)
        }

        currentRadio.value = radio
        audio.value.src = url
        audio.value.play()
    }

    const pause = () => {
        audio.value?.pause()
    }

    const stop = (fadeOutMs = 500) => {
        if (!audio.value) return
        const target = audio.value

        const hardStop = () => {
            intentionalStop = true
            target.pause()
            target.currentTime = 0
            target.src = ''
            isError.value = false
            httpFallbackUrl.value = null
            pendingHttpUrl = null
        }

        // Pas de son à fader (loading en cours, déjà à l'arrêt) : stop net
        if (fadeOutMs <= 0 || !isPlaying.value) {
            clearFade(false)
            hardStop()
            return
        }

        // Annule un éventuel fade précédent puis lance le nouveau
        clearFade(true)

        fadeOriginalVolume = target.volume
        isStopping.value = true
        const totalSteps = Math.max(1, Math.round(fadeOutMs / 25))
        const stepIntervalMs = fadeOutMs / totalSteps
        const stepVolume = fadeOriginalVolume / totalSteps
        let stepCount = 0

        fadeInterval = setInterval(() => {
            stepCount++
            target.volume = Math.max(0, fadeOriginalVolume - stepVolume * stepCount)
            if (stepCount >= totalSteps) {
                const restoredVolume = fadeOriginalVolume
                clearInterval(fadeInterval)
                fadeInterval = null
                hardStop()
                target.volume = restoredVolume
                fadeOriginalVolume = null
                isStopping.value = false
            }
        }, stepIntervalMs)
    }

    return {
        isPlaying,
        isLoading,
        isPaused,
        isStopping,
        isError,
        isFiniteAudio,
        httpFallbackUrl,
        play,
        pause,
        stop,
        currentTime,
        currentRadio,
        audio
    }
}
