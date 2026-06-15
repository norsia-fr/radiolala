<template>
    <div id="offcanvasDoc" class="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false"
        tabindex="-1" aria-labelledby="offcanvasDocLabel" :data-bs-theme="optionsDark ? 'dark' : 'light'">
        <div class="offcanvas-header bg-secondary-subtle border-bottom border-dark-subtle">
            <h5 class="offcanvas-title" id="offcanvasDocLabel">Documentation</h5>
            <button type="button" class="btn-close" aria-label="Close" data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasOptions" aria-controls="offcanvasOptions"></button>
        </div>
        <div class="offcanvas-body">
            <header class="text-center">
                <h2 class="conthrax mt-2 text-shadows-1">Radiolala</h2>
                <p class="courier small">Radios player minimaliste personnalisable</p>
            </header>
            <hr>
            <div id="docu" class="mt-4 accordion accordion-flush">
                <p>Radiolala est conçu pour une expérience d’écoute simple et intuitive, tout en offrant de nombreuses possibilités de personnalisation.</p>

                <div class="accordion-item">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#prise-en-main" aria-expanded="false" aria-controls="prise-en-main">
                        <h4>1. Prise en main</h4>
                    </button>
                    <section id="prise-en-main" class="accordion-collapse collapse" data-bs-parent="#docu">
                        <h5>Accès à l'application</h5>
                        <ul>
                            <li>
                                <strong>Installation :</strong> Radiolala est une appli web. Il suffit de visiter <a href="https://norsia-fr.github.io/radiolala" target="_blank">la page de démo</a> pour l'utiliser, mais il vous est aussi possible de l'installer sur votre appareil pour l'utiliser comme une application classique. Quand votre navigateur le permet, un bouton <em>Installer Radiolala</em> apparaît en bas du panneau Options.
                            </li>
                            <li>
                                <strong>Lancement :</strong> Une fois installée, vous pouvez lancer l'application depuis votre écran d'accueil, ou votre bureau, en cliquant sur l'icone de Radiolala.
                            </li>
                        </ul>
                        <h5>Navigation dans l'interface</h5>
                        <ul>
                            <li><strong>Liste des radios :</strong> Parcourez les radios disponibles via une interface épurée.</li>
                            <li><strong>Mode Drag & Drop :</strong> Activez le mode drag pour réorganiser vos radios.</li>
                            <li><strong>Fusion de playlists :</strong> Combinez des playlists pour créer une liste personnalisée.</li>
                        </ul>
                    </section>
                </div>

                <div class="accordion-item">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#fonctions-principales" aria-expanded="false" aria-controls="fonctions-principales">
                        <h4>2. Fonctions principales</h4>
                    </button>
                    <section id="fonctions-principales" class="accordion-collapse collapse" data-bs-parent="#docu">
                        <h5>Lecture d'une radio</h5>
                        <ul>
                            <li>Cliquez sur une radio pour lancer sa diffusion.</li>
                            <li>Cliquer de nouveau sur la radio en lecture permet de la mettre en pause.</li>
                        </ul>

                        <h5>Contrôle du volume</h5>
                        <p>Utilisez le curseur de volume pour ajuster l'intensité sonore. Vos préférences sont sauvegardées automatiquement.</p>

                        <h5>Personnalisation</h5>
                        <ul>
                            <li>
                                <strong>Thème et apparence :</strong> Basculez du mode clair au mode sombre depuis le panneau des options en cliquant sur l'icone <button id="btnThemeDoc" class="btn" type="button" title="Thème" @click.stop="toggleOptionsDark"><i class="fw-bold" :class="optionsDark ? 'bi bi-sun-fill' : 'bi bi-moon-fill'"></i></button> située en haut à gauche du panneau des options.
                            </li>
                            <li><strong>Options avancées :</strong> Modifiez couleurs, polices et autres réglages pour adapter l'interface à vos goûts.</li>
                        </ul>
                    </section>
                </div>

                <div class="accordion-item">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#configuration" aria-expanded="false" aria-controls="configuration">
                        <h4>3. Configuration et sauvegarde</h4>
                    </button>
                    <section id="configuration" class="accordion-collapse collapse" data-bs-parent="#docu">
                        <h5>Options de personnalisation</h5>
                        <p>
                            Dans le menu Options, vous pouvez réinitialiser les paramètres ou les personnaliser selon vos préférences.
                            Toutes vos modifications sont enregistrées automatiquement dans votre navigateur.
                        </p>
                        <h5>Sauvegarde</h5>
                        <p>
                            Les paramètres, playlists et autres préférences sont sauvegardés et restaurés lors de votre prochaine visite.
                        </p>
                    </section>
                </div>

                <div class="accordion-item">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#assistance" aria-expanded="false" aria-controls="assistance">
                        <h4>4. Assistance</h4>
                    </button>
                    <section id="assistance" class="accordion-collapse collapse" data-bs-parent="#docu">
                        <p>
                            En cas de difficultés ou pour toute question contactez le support de votre service informatique via le formulaire en ligne de commande de repas à domicile adoré.
                        </p>
                    </section>
                </div>
            </div>
        </div>
        <div class="offcanvas-footer bg-dark border-top border-dark-subtle text-center">
            <p class="text-dark">Je t'aime</p>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGlobalStore } from '@/store/globalStore'
import { useToast } from '@/composables/useToast'

const store = useGlobalStore()
const { showToast } = useToast()

const optionsDark = computed(() => store.options.optionsDark)

function toggleOptionsDark() {
    const newVal = !store.options.optionsDark
    store.options.optionsDark = newVal
    showToast(`Mode <strong>${newVal ? 'sombre' : 'clair'}</strong> activé`, 'info')
}
</script>
