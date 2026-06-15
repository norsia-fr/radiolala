<template>
    <div id="offcanvasVersion" class="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false"
        tabindex="-1" aria-labelledby="offcanvasVersion" :data-bs-theme="optionsDark ? 'dark' : 'light'">
        <!-- Header -->
        <div class="offcanvas-header bg-secondary-subtle border-bottom border-dark-subtle">
            <img :src="favicon" alt="favicon" height="32" class="me-2">
            <div class="h4 offcanvas-title" id="offcanvasVersionLabel">Changelog</div>
            <button type="button" class="btn-close" aria-label="Close" data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasOptions" aria-controls="offcanvasOptions"></button>
        </div>

        <!-- Body : nouveautes.md rendu en HTML -->
        <div class="offcanvas-body nouveautes-md" v-html="nouveautesHtml"></div>

        <!-- Contacts -->
        <div class="offcanvas-footer bg-body-secondary py-1 text-center border-top border-dark-subtle">
            <div class="btn-group contacts" style="font-size: 0.8rem;">
                <button class="btn py-0" title="Matrix">
                    <a href="https://matrix.to/#/#radiolala:matrix.org" target="_blank"><img :src="matrixpng" height="16"/></a>
                </button>

                <button class="btn py-0 opacity-50" title="Github">
                    <a href="https://github.com/norsia-fr/radiolala" target="_blank"><i class="bi bi-github me-2"></i></a>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import { useGlobalStore } from '@/store/globalStore'
import nouveautesMd from '@/assets/nouveautes.md'

const store = useGlobalStore()
const optionsDark = computed(() => store.options.optionsDark)
const nouveautesHtml = computed(() => marked.parse(nouveautesMd))

const favicon = new URL('@/assets/favicon.ico', import.meta.url).href
const matrixpng = new URL('@/assets/logos/matrixNoir.png', import.meta.url).href
</script>

<style scoped>
.nouveautes-md :deep(h1) { font-size: 1.25rem; margin-top: 0; }
.nouveautes-md :deep(h2) { font-size: 1.1rem; margin-top: 1.5rem; padding-bottom: 0.25rem; border-bottom: 1px solid var(--bs-border-color); }
.nouveautes-md :deep(h3) { font-size: 1rem; margin-top: 1rem; opacity: 0.85; }
.nouveautes-md :deep(hr) { opacity: 0.2; }
.nouveautes-md :deep(ul) { padding-left: 1.25rem; }
.nouveautes-md :deep(li) { font-size: 0.875rem; line-height: 1.4; }
.nouveautes-md :deep(blockquote) { border-left: 3px solid var(--bs-secondary); padding-left: 0.75rem; opacity: 0.75; font-size: 0.85rem; }
.nouveautes-md :deep(code) { font-size: 0.8rem; padding: 0.1rem 0.3rem; background: var(--bs-secondary-bg); border-radius: 0.2rem; }
.nouveautes-md :deep(a) { color: var(--bs-link-color); }
</style>
