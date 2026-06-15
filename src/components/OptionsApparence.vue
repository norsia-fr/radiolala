<template>
                        <div id="collapseApparence" class="text-center text-secondary animate__animated animate__fadeIn">

                                <p class="bg-secondary-subtle border-bottom border-secondary-subtle fw-bold h5 mb-4 py-4 text-secondary-emphasis">Apparence</p>


                                <!-- Thèmes -->
                                <div class="card mb-3 border-0 px-3">
                                    <div class="btn btn-outline-secondary py-1 w-100" :aria-expanded="false"
                                        data-bs-toggle="collapse" data-bs-target="#collapseThemes" aria-controls="collapseThemes"
                                        title="Thèmes" @click="store.toggleClasses(['active', 'card-header'], $event)">
                                        Thèmes
                                    </div>
                                    <div id="collapseThemes" class="collapse bg-secondary-subtle border border-1 border-top-0 border-secondary-subtle rounded-bottom">
                                        <div class="card-body small">
                                            <p class="text-start mb-2">Appliquer un thème :</p>
                                            <div class="d-flex flex-wrap gap-1 justify-content-start mb-3">
                                                <button v-for="theme in store.themes" :key="theme.id"
                                                    type="button"
                                                    class="btn btn-sm btn-outline-secondary position-relative"
                                                    @click="applyThemeAction(theme.id)"
                                                    :title="theme.builtin ? `Thème prédéfini : ${theme.name}` : `Thème personnel : ${theme.name}`">
                                                    {{ theme.name }}
                                                    <i v-if="!theme.builtin" class="bi bi-person-fill ms-1 opacity-50" style="font-size: 0.7rem"></i>
                                                </button>
                                            </div>

                                            <hr class="my-2">

                                            <!-- Thème aléatoire -->
                                            <button type="button" class="btn btn-sm btn-outline-secondary w-100 mb-3" @click="applyRandomTheme">
                                                <i class="bi bi-shuffle me-1"></i>Thème aléatoire
                                            </button>

                                            <!-- Sauvegarder le thème actuel -->
                                            <p class="text-start mb-2">Sauvegarder le thème actuel :</p>
                                            <div class="input-group input-group-sm mb-3">
                                                <input v-model="newThemeName" type="text" class="form-control" placeholder="Nom du thème" maxlength="30" @keyup.enter="saveCurrentTheme">
                                                <button type="button" class="btn btn-success" @click="saveCurrentTheme" :disabled="!newThemeName.trim()">
                                                    <i class="bi bi-floppy"></i>
                                                </button>
                                            </div>

                                            <!-- Gérer les thèmes persos -->
                                            <div v-if="store.themesPersos.length" class="text-start">
                                                <p class="mb-1 text-muted">Thèmes personnels :</p>
                                                <div v-for="theme in store.themesPersos" :key="theme.id"
                                                    class="d-flex align-items-center gap-1 mb-1">
                                                    <span class="flex-grow-1 text-truncate" :title="theme.name">{{ theme.name }}</span>
                                                    <button type="button" class="btn btn-sm btn-outline-secondary" @click="askRename(theme)" title="Renommer">
                                                        <i class="bi bi-pencil"></i>
                                                    </button>
                                                    <button type="button" class="btn btn-sm"
                                                        :class="pendingDeleteThemeId === theme.id ? 'btn-danger' : 'btn-outline-danger'"
                                                        @click="confirmDeleteTheme(theme.id)"
                                                        :title="pendingDeleteThemeId === theme.id ? 'Cliquez à nouveau pour confirmer' : 'Supprimer'">
                                                        <i :class="['bi', pendingDeleteThemeId === theme.id ? 'bi-exclamation-triangle-fill' : 'bi-trash']"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Couleurs -->
                                <div class="card mb-3 border-0 px-3">
                                    <div class="btn btn-outline-secondary py-1 w-100" :aria-expanded="false"
                                        data-bs-toggle="collapse" data-bs-target="#collapseCouleurs" aria-controls="collapseCouleurs"
                                        title="Couleurs" @click="store.toggleClasses(['active', 'card-header'], $event)">
                                        Couleurs
                                    </div>
                                    <div id="collapseCouleurs" class="collapse bg-secondary-subtle border border-1 border-top-0 border-secondary-subtle rounded-bottom text-start">
                                        <div class="card-body small">

                                            <!-- Page -->
                                            <div class="d-flex align-items-center mb-3">
                                                <input id="bgColor" type="color" class="me-3" :value="options.bgColor"
                                                    @input="updateOptions('bgColor', $event.target.value)" />
                                                <label for="bgColor">Fond de la page</label>
                                            </div>

                                            <!-- Bloc titre -->
                                            <p class="fw-bold mb-1">Bloc titre</p>
                                            <div class="d-flex align-items-center mb-2">
                                                <input type="color" id="bg-title-color" class="me-3"
                                                    :value="options.playerBgColor"
                                                    @input="updateOptions('playerBgColor', $event.target.value)" />
                                                <label for="bg-title-color">Fond du bloc</label>
                                            </div>
                                            <div class="d-flex align-items-center mb-2">
                                                <input type="color" id="playerElmtsColor" class="me-3"
                                                    :value="options.playerElmtsColor"
                                                    @input="updateOptions('playerElmtsColor', $event.target.value)" />
                                                <label for="playerElmtsColor">Éléments du titre</label>
                                            </div>
                                            <div class="d-flex align-items-center mb-3">
                                                <input type="color" id="playerTitleColor" class="me-3"
                                                    :value="options.playerTitleColor"
                                                    @input="updateOptions('playerTitleColor', $event.target.value)" />
                                                <label for="playerTitleColor">Titre</label>
                                            </div>

                                            <!-- Boutons play/stop -->
                                            <p class="fw-bold mb-1">Boutons Play/Stop</p>
                                            <div class="d-flex align-items-center mb-2">
                                                <input id="playPause-color" type="color" class="me-2"
                                                    :value="options.playerBtnPlayColor"
                                                    @input="updateOptions('playerBtnPlayColor', $event.target.value)">
                                                <label for="playPause-color" class="me-3">Play : fond</label>
                                                <input id="play-icon-color" type="color" class="me-2"
                                                    :value="options.playerBtnPlayIconColor"
                                                    @input="updateOptions('playerBtnPlayIconColor', $event.target.value)">
                                                <label for="play-icon-color">icone</label>
                                            </div>
                                            <div class="d-flex align-items-center mb-3">
                                                <input type="color" id="stop-color" class="me-2"
                                                    :value="options.playerBtnStopColor"
                                                    @input="updateOptions('playerBtnStopColor', $event.target.value)">
                                                <label for="stop-color" class="me-3">Stop : fond</label>
                                                <input id="stop-icon-color" type="color" class="me-2"
                                                    :value="options.playerBtnStopIconColor"
                                                    @input="updateOptions('playerBtnStopIconColor', $event.target.value)">
                                                <label for="stop-icon-color">icone</label>
                                            </div>

                                            <!-- Liste des radios -->
                                            <p class="fw-bold mb-1">Liste des radios</p>
                                            <!-- Couleur de fond des radios -->
                                            <div class="input-group input-group-sm my-3">
                                                <label for="radiosBgColor" class="input-group-text text-nowrap">Fond de toutes les radios</label>
                                                <input type="color" id="radiosBgColor" v-model="listRadioBgColor" class="form-control form-control-color flex-grow-0" style="width: 3rem" />
                                                <button class="btn btn-outline-secondary" type="button" @click="changeAllRadioBgColor(listRadioBgColor)">Appliquer</button>
                                            </div>

                                            <!-- Couleur automatique des noms -->
                                            <div class="input-group input-group-sm my-3">
                                                <label class="input-group-text text-nowrap" for="nameAutoMode">Couleur des noms</label>
                                                <select id="nameAutoMode" class="form-select" :value="options.listNameAutoColorMode"
                                                    @change="updateOptions('listNameAutoColorMode', $event.target.value)">
                                                    <option value="adapted">Auto — adaptée au fond</option>
                                                    <option value="bw">Auto — noir & blanc</option>
                                                </select>
                                            </div>
                                            <button type="button" class="btn btn-sm btn-outline-secondary w-100 mb-3" @click="resetAllNameColors"
                                                title="Efface les couleurs de nom personnalisées (modale) de toutes les radios et dossiers de la liste">
                                                Repasser tous les noms en automatique
                                            </button>

                                            <!-- Palettes -->
                                            <div class="card mb-3 border-0 px-0">
                                                <div class="btn btn-outline-secondary py-1 w-100" :aria-expanded="false"
                                                    data-bs-toggle="collapse" data-bs-target="#collapsePalettes" aria-controls="collapsePalettes"
                                                    title="Palettes de couleurs"
                                                    @click="store.toggleClasses(['active', 'card-header'], $event)">
                                                    Palettes
                                                </div>
                                                <div id="collapsePalettes" class="collapse bg-secondary-subtle border border-1 border-top-0 border-secondary-subtle rounded-bottom">
                                                    <div class="card-body small">
                                                        <div class="input-group input-group-sm mb-2">
                                                            <label class="input-group-text" for="paletteOrder">Application</label>
                                                            <select id="paletteOrder" class="form-select" :value="options.paletteApplyOrder" @change="updateOptions('paletteApplyOrder', $event.target.value)">
                                                                <option value="order">Dans l'ordre</option>
                                                                <option value="reverse">Ordre inverse</option>
                                                                <option value="random">Aléatoire</option>
                                                            </select>
                                                        </div>

                                                        <p class="text-start mb-2">Palettes disponibles :</p>
                                                        <div v-for="palette in store.palettes" :key="palette.id" class="mb-2"
                                                            :class="{ 'border border-secondary rounded p-1 bg-body-tertiary': optionsOpenId === palette.id }">
                                                            <div class="d-flex align-items-center gap-1">
                                                                <!-- Swatches preview : player puis liste -->
                                                                <div v-if="palette.player" class="d-flex flex-shrink-0 border" style="height: 1.25rem; border-radius: 0.2rem; overflow: hidden;" title="Couleurs du player">
                                                                    <div v-for="k in PLAYER_PREVIEW_KEYS" :key="k" :style="{ backgroundColor: palette.player[k], width: '0.45rem' }"></div>
                                                                </div>
                                                                <div class="d-flex flex-shrink-0 border" style="height: 1.25rem; border-radius: 0.2rem; overflow: hidden;" title="Couleurs de la liste">
                                                                    <div v-for="(c, i) in palette.colors" :key="i" :style="{ backgroundColor: c, width: '0.7rem' }"></div>
                                                                </div>
                                                                <!-- Nom -->
                                                                <span class="flex-grow-1 text-truncate ms-1" :title="palette.builtin ? `Palette prédéfinie : ${palette.name}` : `Palette personnelle : ${palette.name}`">
                                                                    {{ palette.name }}
                                                                </span>
                                                                <!-- Appliquer -->
                                                                <button type="button" class="btn btn-sm btn-outline-secondary"
                                                                    @click="applyPaletteAction(palette.id)"
                                                                    title="Appliquer cette palette">
                                                                    <i class="bi bi-magic"></i>
                                                                </button>
                                                                <!-- Options (palettes perso uniquement) -->
                                                                <button v-if="!palette.builtin" type="button" class="btn btn-sm"
                                                                    :class="optionsOpenId === palette.id ? 'btn-secondary' : 'btn-outline-secondary'"
                                                                    @click="togglePaletteOptions(palette.id)"
                                                                    title="Options de la palette">
                                                                    <i class="bi bi-gear"></i>
                                                                </button>
                                                            </div>

                                                            <!-- Panneau d'options de la palette -->
                                                            <div v-if="optionsOpenId === palette.id" class="d-flex flex-wrap gap-1 mt-2">
                                                                <template v-if="!palette.builtin">
                                                                    <button type="button" class="btn btn-sm"
                                                                        :class="editingColorsId === palette.id ? 'btn-secondary' : 'btn-outline-secondary'"
                                                                        @click="toggleEditColors(palette.id)">
                                                                        <i class="bi bi-palette me-1"></i>Couleurs
                                                                    </button>
                                                                    <button type="button" class="btn btn-sm btn-outline-secondary" @click="askRenamePalette(palette)">
                                                                        <i class="bi bi-pencil me-1"></i>Renommer
                                                                    </button>
                                                                    <button type="button" class="btn btn-sm"
                                                                        :class="pendingDeletePaletteId === palette.id ? 'btn-danger' : 'btn-outline-danger'"
                                                                        @click="confirmDeletePalette(palette.id)">
                                                                        <i :class="['bi', 'me-1', pendingDeletePaletteId === palette.id ? 'bi-exclamation-triangle-fill' : 'bi-trash']"></i>{{ pendingDeletePaletteId === palette.id ? 'Confirmer ?' : 'Supprimer' }}
                                                                    </button>
                                                                </template>
                                                            </div>

                                                            <!-- Éditeur de couleurs (palette perso), libellés visibles -->
                                                            <template v-if="optionsOpenId === palette.id && editingColorsId === palette.id">
                                                                <p class="fw-bold mb-1 mt-2" style="font-size: 0.75rem">Couleurs de la liste</p>
                                                                <div class="row row-cols-2 g-1">
                                                                    <div v-for="(c, i) in palette.colors" :key="i" class="col d-flex align-items-center gap-1">
                                                                        <input type="color" :value="c"
                                                                            @input="store.updatePaletteColor(palette.id, i, $event.target.value)"
                                                                            class="form-control form-control-color form-control-sm p-0 flex-shrink-0" style="width: 1.8rem; height: 1.4rem" />
                                                                        <span style="font-size: 0.7rem">Couleur {{ i + 1 }}</span>
                                                                    </div>
                                                                </div>
                                                                <template v-if="palette.player">
                                                                    <p class="fw-bold mb-1 mt-2" style="font-size: 0.75rem">Couleurs du player</p>
                                                                    <div class="row row-cols-2 g-1">
                                                                        <div v-for="(label, k) in PLAYER_COLOR_LABELS" :key="k" class="col d-flex align-items-center gap-1">
                                                                            <input type="color" :value="palette.player[k]"
                                                                                @input="store.updatePalettePlayerColor(palette.id, k, $event.target.value)"
                                                                                class="form-control form-control-color form-control-sm p-0 flex-shrink-0" style="width: 1.8rem; height: 1.4rem" />
                                                                            <span class="text-truncate" style="font-size: 0.7rem" :title="label">{{ label }}</span>
                                                                        </div>
                                                                    </div>
                                                                </template>
                                                            </template>
                                                        </div>

                                                        <hr class="my-2">

                                                        <p class="text-start mb-2">Enregistrer les couleurs actuelles :</p>
                                                        <button type="button" class="btn btn-sm btn-success w-100" @click="extractFromPlaylist">
                                                            <i class="bi bi-eyedropper me-1"></i>Couleurs actuelles (player + liste)
                                                        </button>

                                                        <hr class="my-2">

                                                        <p class="text-start mb-2">Générer une palette :</p>
                                                        <!-- Barres de couleurs cliquables (liste puis player), appliquées en direct -->
                                                        <div class="d-flex border mb-1" style="height: 1.75rem; border-radius: 0.2rem; overflow: hidden;">
                                                            <input v-for="(c, i) in genColors" :key="i" type="color" :value="c"
                                                                @input="editGenColor(i, $event.target.value)"
                                                                :title="`Couleur ${i + 1} de la liste (cliquer pour modifier)`"
                                                                style="flex: 1; height: 100%; border: 0; padding: 0; cursor: pointer;" />
                                                        </div>
                                                        <div class="d-flex border mb-2" style="height: 1.1rem; border-radius: 0.2rem; overflow: hidden;">
                                                            <input v-for="(label, k) in PLAYER_COLOR_LABELS" :key="k" type="color" :value="genPlayer[k]"
                                                                @input="editGenPlayerColor(k, $event.target.value)"
                                                                :title="`${label} (cliquer pour modifier)`"
                                                                style="flex: 1; height: 100%; border: 0; padding: 0; cursor: pointer;" />
                                                        </div>
                                                        <!-- Couleur principale + mode -->
                                                        <div class="d-flex align-items-center gap-2 mb-2">
                                                            <input type="color" :value="genBaseColor" @input="setGenBase($event.target.value)" class="form-control form-control-color flex-grow-0" style="width: 3rem" title="Couleur principale" />
                                                            <select :value="genHarmony" @change="setGenHarmony($event.target.value)" class="form-select form-select-sm">
                                                                <option v-for="harmo in HARMONIES" :key="harmo.id" :value="harmo.id">{{ harmo.name }}</option>
                                                            </select>
                                                        </div>
                                                        <button type="button" class="btn btn-sm btn-outline-secondary w-100 mb-2" @click="applyRandomPalette">
                                                            <i class="bi bi-shuffle me-1"></i>Palette aléatoire
                                                        </button>
                                                        <button type="button" class="btn btn-sm btn-success w-100" @click="saveGeneratedPalette">
                                                            <i class="bi bi-floppy me-1"></i>Enregistrer cette palette
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                <hr>

                                <!-- Bloc titre -->
                                <div class="card mb-3 border-0 px-3">
                                    <div id="optionsBlocTitre" class="btn btn-outline-secondary py-1 w-100"
                                        :aria-expanded="false" data-bs-toggle="collapse"
                                        data-bs-target="#collapseOptionsBlocTitre" aria-controls="collapseOptionsBlocTitre"
                                        title="Options bloc titre"
                                        @click="store.toggleClasses(['active', 'card-header'], $event)">
                                        Bloc titre
                                    </div>
                                    <div id="collapseOptionsBlocTitre"
                                        class="collapse bg-secondary-subtle border border-1 border-top-0 border-secondary-subtle rounded-bottom">
                                        <div class="card-body">

                                            <div class="list-group-item small mb-3">
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" role="switch"
                                                        id="playerCoinsArrondis"
                                                        :checked="options.playerCoinsArrondis"
                                                        @change="updateOptions('playerCoinsArrondis', $event.target.checked)" />
                                                    <label class="form-check-label"
                                                        :class="{'fw-bold': options.playerCoinsArrondis}"
                                                        for="playerCoinsArrondis">
                                                        Coins du bloc arrondis
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div class="list-group-item small mb-3">
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" role="switch"
                                                        id="playerBgGradient"
                                                        :checked="options.playerBgGradient"
                                                        @change="updateOptions('playerBgGradient', $event.target.checked)" />
                                                    <label class="form-check-label"
                                                        :class="{'fw-bold': options.playerBgGradient}"
                                                        for="playerBgGradient">
                                                        Dégradé en fond
                                                    </label>
                                                </div>
                                            </div>

                                            
                                            <!-- Police -->
                                            <div class="card small">
                                                <div class="card-body">
                                                    <!-- font family -->
                                                    <div class="d-flex align-items-center mb-3">
                                                        <span class="me-3">Police</span>
                                                        <select id="playerFontFamily" class="form-select form-select-sm"
                                                            :value="options.playerFontFamily"
                                                            @change="updateOptions('playerFontFamily', $event.target.value)">
                                                            <option value="Arial, sans-serif"
                                                                style="font-family: 'Arial', sans-serif;">Arial</option>
                                                            <option value="Verdana, sans-serif"
                                                                style="font-family: 'Verdana', sans-serif;">Verdana</option>
                                                            <option value="Times New Roman, serif"
                                                                style="font-family: 'Times New Roman', Times, serif;">Times New
                                                                Roman</option>
                                                            <option value="Georgia, serif"
                                                                style="font-family: 'Georgia', serif;">Georgia</option>
                                                            <option value="Courier New, monospace"
                                                                style="font-family: 'Courier New', Courier, monospace;">Courier
                                                                New</option>
                                                            <hr />
                                                            <option v-for="police in listePolice" :key="police" :value="police"
                                                                :style="`font-family: ${police}`">
                                                                {{ police }}
                                                            </option>
                                                        </select>
                                                    </div>
                                                    <!-- font size -->
                                                    <div class="d-flex align-items-center mb-3 justify-content-between">
                                                        <label for="playerFontSize" class="me-2">Taille</label>
                                                        <input id="playerFontSize" type="range" class="w-100" min="0" max="5"
                                                            step="0.1" :value="options.playerFontSize"
                                                            @input="updateOptions('playerFontSize', $event.target.value)"
                                                            @touchstart="handleSliderTouchStart" />
                                                        <span class="ms-2 text-nowrap">
                                                            {{ options.playerFontSize ? Number(options.playerFontSize).toFixed(1) : "1.1" }} rem
                                                        </span>
                                                    </div>
                                                    <!-- font bold -->
                                                    <p class="form-check form-switch mb-3">
                                                        <label for="playerFontBold" class="form-check-label me-3"
                                                            :class="{ 'fw-bold': options.playerFontBold }">
                                                            Titre en gras
                                                        </label>
                                                        <input id="playerFontBold" type="checkbox" class="form-check-input"
                                                            :checked="options.playerFontBold"
                                                            @input="updateOptions('playerFontBold', $event.target.checked)" />
                                                    </p>
                                                </div>
                                            </div>

                                            <!-- Boutons Play/Stop -->
                                            <div class="card small mt-3">
                                                <div class="card-body">
                                                    <p class="fw-bold mb-2">Boutons Play/Stop</p>
                                                    <!-- Boutons en bas -->
                                                    <div class="form-check form-switch mb-2 small">
                                                        <input id="playerBtnsBottom" class="form-check-input" type="checkbox"
                                                            role="switch" :checked="options.playerBtnsBottom"
                                                            @input="updateOptions('playerBtnsBottom', $event.target.checked)" />
                                                        <label class="form-check-label" :class="{ 'fw-bold': options.playerBtnsBottom }"
                                                            for="playerBtnsBottom">
                                                            Placer les boutons en bas
                                                        </label>
                                                    </div>
                                                    <!-- Haut des Btns arrondi -->
                                                    <div class="form-check form-switch mb-2 small">
                                                        <input id="formes3" class="form-check-input" type="checkbox" role="switch"
                                                            :checked="options.playerBtnsTopRounded"
                                                            @input="updateOptions('playerBtnsTopRounded', $event.target.checked)" />
                                                        <label class="form-check-label"
                                                            :class="{ 'fw-bold': options.playerBtnsTopRounded }" for="formes3">
                                                            Haut des boutons courbé
                                                        </label>
                                                    </div>
                                                    <!-- Play à droite -->
                                                    <div class="form-check form-switch mb-2 small">
                                                        <input id="btnPlayAtEnd" type="checkbox" class="form-check-input" role="switch"
                                                            :checked="options.playerBtnPlayAtEnd"
                                                            @input="updateOptions('playerBtnPlayAtEnd', $event.target.checked)" />
                                                        <label class="form-check-label"
                                                            :class="{ 'fw-bold': options.playerBtnPlayAtEnd }" for="btnPlayAtEnd">
                                                            Bouton Play à droite
                                                        </label>
                                                    </div>
                                                    <!-- Coins arrondis -->
                                                    <div class="form-check form-switch mb-2 small">
                                                        <input id="coinsArrondisBtnsPS" type="checkbox" class="form-check-input"
                                                            role="switch" :checked="options.playerBtnsRounded"
                                                            @input="updateOptions('playerBtnsRounded', $event.target.checked)" />
                                                        <label class="form-check-label"
                                                            :class="{ 'fw-bold': options.playerBtnsRounded }" for="coinsArrondisBtnsPS">
                                                            Coins des boutons arrondis
                                                        </label>
                                                    </div>
                                                    <!-- Hauteur btns play/stop -->
                                                    <div class="d-flex align-items-center mb-2 small">
                                                        <label class="form-label m-0 me-2">Hauteur des boutons: </label>
                                                        <span class="h6 mb-0">{{ options.playerBtnsHeight }}</span>
                                                        <input @touchstart="handleSliderTouchStart" type="range" class="ms-2 flex-fill" min="0" max="5" step="1"
                                                            :value="options.playerBtnsHeight ? options.playerBtnsHeight : '1'"
                                                            @input="updateOptions('playerBtnsHeight', $event.target.value)"
                                                            list="steplistBtnsHeight" />
                                                        <datalist id="steplistBtnsHeight">
                                                            <option>0</option>
                                                            <option>1</option>
                                                            <option>2</option>
                                                            <option>3</option>
                                                            <option>4</option>
                                                            <option>5</option>
                                                        </datalist>
                                                    </div>
                                                    <!-- Taille des icones -->
                                                    <div class="d-flex align-items-center mb-4 small">
                                                        <label class="form-label m-0 me-2">Taille des icones: </label>
                                                        <span class="h6 mb-0">{{ options.playerBtnsIconsSize }}</span>
                                                        <input @touchstart="handleSliderTouchStart" type="range" class="ms-2 flex-fill" min="1" max="5" step="1"
                                                            :value="options.playerBtnsIconsSize ? options.playerBtnsIconsSize : '1'"
                                                            @input="updateOptions('playerBtnsIconsSize', $event.target.value)"
                                                            list="steplistIconPPSize" />
                                                        <datalist id="steplistIconPPSize">
                                                            <option>1</option>
                                                            <option>2</option>
                                                            <option>3</option>
                                                            <option>4</option>
                                                            <option>5</option>
                                                        </datalist>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <!-- Liste -->
                                <div class="card mb-3 border-0 px-3">
                                    <div id="btnOptionsListe" class="btn btn-outline-secondary py-1 w-100"
                                        :aria-expanded="false" data-bs-toggle="collapse" data-bs-target="#collapseOptionsListe"
                                        aria-controls="collapseOptionsListe" title="Options de la liste des radios"
                                        @click="store.toggleClasses(['active', 'card-header'], $event)">
                                        Liste des radios
                                    </div>
                                    <div id="collapseOptionsListe" class="collapse bg-secondary-subtle border border-1 border-top-0 border-secondary-subtle rounded-bottom text-start">
                                        <div class="card-body small">

                                            <!-- Coins arrondis -->
                                            <div class="form-check form-switch mb-2">
                                                <label class="form-check-label" :class="{ 'fw-bold': options.listRadioRounded }" for="formes1">
                                                    Coins des radios arrondis
                                                </label>
                                                <input id="formes1" 
                                                    class="form-check-input" 
                                                    type="checkbox" 
                                                    role="switch" 
                                                    :checked="options.listRadioRounded" 
                                                    @input="updateOptions('listRadioRounded', $event.target.checked)" 
                                                >
                                            </div>

                                            <!-- Dégradé en fond -->
                                            <div class="form-check form-switch mb-2">
                                                <label class="form-check-label" :class="{ 'fw-bold': options.listRadioGradient }" for="formes2">
                                                    Dégradé en fond
                                                </label>
                                                <input id="formes2"
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    role="switch"
                                                    :checked="options.listRadioGradient"
                                                    @input="updateOptions('listRadioGradient', $event.target.checked)"
                                                >
                                            </div>

                                            <!-- Pleine largeur ou pas -->
                                            <div class="form-check form-switch mb-2">
                                                <label class="form-check-label" :class="{ 'fw-bold': options.listFullWidth }"
                                                    for="choixPleineLargeur">
                                                    Utiliser la pleine largeur de l'écran
                                                </label>
                                                <input class="form-check-input" type="checkbox" role="switch"
                                                    id="choixPleineLargeur" :checked="options.listFullWidth"
                                                    @input="updateOptions('listFullWidth', $event.target.checked)">
                                            </div>

                                            <!-- Centrer les noms des radios -->
                                            <div class="form-check form-switch mb-2">
                                                <label class="form-check-label"
                                                    :class="{ 'fw-bold': options.listRadioNameCenter }" for="centrerNomsRadios">
                                                    Centrer les noms des radios
                                                </label>
                                                <input class="form-check-input" type="checkbox" role="switch"
                                                    id="centrerNomsRadios" :checked="options.listRadioNameCenter"
                                                    @input="updateOptions('listRadioNameCenter', $event.target.checked)">
                                            </div>

                                            <!-- (i) Invisible -->
                                            <div class="form-check form-switch mb-2">
                                                <label class="form-check-label" :class="{ 'fw-bold': options.listRadioIMasked }"
                                                    for="masquerI">
                                                    <i class="bi bi-info-circle"></i> invisible
                                                </label>
                                                <input class="form-check-input" type="checkbox" role="switch" id="masquerI"
                                                    :checked="options.listRadioIMasked"
                                                    @input="updateOptions('listRadioIMasked', $event.target.checked)">
                                            </div>

                                            <!-- Liste invisible -->
                                            <div class="form-check form-switch mb-2">
                                                <label class="form-check-label" :class="{ 'fw-bold': options.listHidden }"
                                                    for="masquerListe">
                                                    Liste invisible
                                                </label>
                                                <input class="form-check-input" type="checkbox" role="switch" id="masquerListe"
                                                    :checked="options.listHidden"
                                                    @input="updateOptions('listHidden', $event.target.checked)">
                                            </div>

                                            <!-- Espace entre radios -->
                                            <div class="d-flex align-items-center mb-2">
                                                <label class="form-label m-0 me-2">Espace inter-radios: </label>
                                                <span class="h6 mb-0">{{ options.listRadioMargin }}</span>
                                                <input type="range" id="listSpaceInput" class="ms-2 flex-fill" min="0" max="5"
                                                    step="1" :value="options.listRadioMargin"
                                                    @input="updateOptions('listRadioMargin', $event.target.value)"
                                                    @touchstart="handleSliderTouchStart"
                                                    list="steplistRadioSpace"
                                                >
                                                <datalist id="steplistRadioSpace">
                                                    <option value="0" title="0" label="0">0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                </datalist>
                                            </div>

                                            <!-- Hauteur des blocs radio -->
                                            <div class="d-flex align-items-center mb-3">
                                                <label for="radioHeightInput" class="form-label m-0 me-2">Hauteur des blocs:e
                                                </label>
                                                <span class="h6 mb-0">{{ options.listRadioPadding ? options.listRadioPadding :
                                                    '1' }}</span>
                                                <input id="radioHeightInput" type="range" class="ms-2 flex-fill" min="0" max="5"
                                                    step="1" :value="options.listRadioPadding ? options.listRadioPadding : '1'"
                                                    @input="updateOptions('listRadioPadding', $event.target.value)"
                                                    @touchstart="handleSliderTouchStart"
                                                    list="steplistRadioHeight">
                                                <datalist id="steplistRadioHeight">
                                                    <option>0</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                </datalist>
                                            </div>

                                            <!-- Police -->
                                            <div class="card">
                                                <div class="card-body">
                                                    <!-- font family -->
                                                    <div class="d-flex align-items-center mb-3">
                                                        <span class="me-3">Police</span>
                                                        <select class="form-select form-select-sm"
                                                            :value="options.listRadioNameFont"
                                                            @change="updateOptions('listRadioNameFont', $event.target.value)">
                                                            <option value="Arial, sans-serif"
                                                                style="font-family: 'Arial', sans-serif;">Arial</option>
                                                            <option value="Verdana, sans-serif"
                                                                style="font-family: 'Verdana', sans-serif;">Verdana</option>
                                                            <option value="Times New Roman, serif"
                                                                style="font-family: 'Times New Roman', Times, serif;">Times New
                                                                Roman</option>
                                                            <option value="Georgia, serif"
                                                                style="font-family: 'Georgia', serif;">Georgia</option>
                                                            <option value="Courier New, monospace"
                                                                style="font-family: 'Courier New', Courier, monospace;">Courier
                                                                New</option>
                                                            <hr>
                                                            <option v-for="police in listePolice" :key="police" :value="police"
                                                                :style="`font-family: ${police}`">
                                                                {{ police }}
                                                            </option>
                                                        </select>
                                                    </div>
                                                    <!-- font size -->
                                                    <div class="d-flex align-items-center mb-3 justify-content-between">
                                                        <label for="listFontSize" class="me-2">Taille</label>
                                                        <input id="listFontSize" type="range" class="w-100" min="0.5" max="4"
                                                            step="0.1" :value="options.listRadioNameSize"
                                                            @input="updateOptions('listRadioNameSize', $event.target.value)"
                                                            @touchstart="handleSliderTouchStart" />
                                                        <span class="ms-2 text-nowrap">
                                                            {{ options.listRadioNameSize ?
                                                            Number(options.listRadioNameSize).toFixed(1) : 1 }} rem
                                                        </span>
                                                    </div>

                                                    <!-- letter spacing -->
                                                    <div class="d-flex align-items-center mb-3 justify-content-between">
                                                        <label for="listLetterSpacing" class="me-2 text-nowrap">Interlettrage</label>
                                                        <input id="listLetterSpacing" type="range" class="w-100" min="0" max="1"
                                                            step="0.05" :value="options.listRadioNameLetterSpacing"
                                                            @input="updateOptions('listRadioNameLetterSpacing', $event.target.value)"
                                                            @touchstart="handleSliderTouchStart" />
                                                        <span class="ms-2 text-nowrap">
                                                            {{ Number(options.listRadioNameLetterSpacing || 0).toFixed(2) }} em
                                                        </span>
                                                    </div>


                                                    <!-- font bold : noms (radios) et dossiers, indépendants -->
                                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                                        <span>Gras :</span>
                                                        <div class="btn-group btn-group-sm" role="group" aria-label="Mettre en gras les noms / dossiers">
                                                            <input type="checkbox" class="btn-check" id="boldRadios" autocomplete="off"
                                                                :checked="options.listRadioNameBold"
                                                                @change="updateOptions('listRadioNameBold', $event.target.checked)">
                                                            <label class="btn btn-outline-secondary" for="boldRadios">Noms</label>
                                                            <input type="checkbox" class="btn-check" id="boldFolders" autocomplete="off"
                                                                :checked="options.listFolderNameBold"
                                                                @change="updateOptions('listFolderNameBold', $event.target.checked)">
                                                            <label class="btn btn-outline-secondary" for="boldFolders">Dossiers</label>
                                                        </div>
                                                    </div>
                                                    <!-- Shadows -->
                                                    <div class="form-check form-switch">
                                                        <label class="form-check-label"
                                                        :class="{ 'text-shadows-1': options.listRadioNameShadows }"
                                                        for="switchListFontShadows">
                                                        Ombre
                                                        </label>
                                                        <input class="form-check-input" type="checkbox" role="switch"
                                                        id="switchListFontShadows"
                                                        @change="updateOptions('listRadioNameShadows', $event.target.checked)"
                                                        :checked="options.listRadioNameShadows">
                                                    </div>
                                                </div>
                                            </div>


                                        </div>
                                    </div>

                                </div>

                                <!-- Avancé -->
                                <div class="card mb-3 border-0 px-3 mt-5">
                                    <p class="text-center">{{ Object.keys(store.options).length }} options</p>
                                </div>


                            </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGlobalStore } from '@/store/globalStore'
import { useToast } from '@/composables/useToast'
import { useDialog } from '@/composables/useDialog'
import { generatePalette, HARMONIES, playerColorsFromBase, hslToHex } from '@/utils/paletteGenerator'
import { randomTheme } from '@/utils/themeGenerator'

const store = useGlobalStore()
const { showToast } = useToast()
const { promptDialog } = useDialog()

const options = computed(() => store.options)
const listePolice = ['Anita', 'Appopaint', 'Barlow', 'Boogaloo', 'Budmo', 'Conthrax', 'Fredoka', 'Merriweather', 'Rochester', 'Mirza', 'SourceSans']
const listRadioBgColor = ref('#f8f9fa')

function updateOptions(id, val) {
    store.updateOption(id, val)
    if (id === 'bgColor') {
        document.body.style.backgroundColor = val
    }
}

const changeAllRadioBgColor = (color) => {
    const updated = store.radios.map(radio => ({ ...radio, color }))
    store.playlistes[store.options.currentPlaylist].radios = updated
}

const resetAllNameColors = () => {
    const updated = store.radios.map(radio => ({ ...radio, nomColor: '' }))
    store.playlistes[store.options.currentPlaylist].radios = updated
    showToast('Tous les noms sont repassés en couleur automatique', 'info')
}

const handleSliderTouchStart = (event) => {
    event.stopPropagation()
}

// ============================================================
// Palettes
// ============================================================
const pendingDeletePaletteId = ref(null)
let pendingDeletePaletteTimer = null

const applyPaletteAction = (paletteId) => {
    const palette = store.palettes.find(p => p.id === paletteId)
    if (!palette) return
    store.applyPalette(paletteId)
    showToast(`Palette "<strong>${palette.name}</strong>" appliquée`, 'info')
}

const askRenamePalette = async (palette) => {
    const next = await promptDialog({ title: 'Renommer la palette', defaultValue: palette.name, placeholder: 'Nom de la palette' })
    if (next && next.trim() && next.trim() !== palette.name) {
        store.renamePalette(palette.id, next)
        showToast(`Palette renommée en "<strong>${next.trim()}</strong>"`, 'info')
    }
}

const confirmDeletePalette = (id) => {
    if (pendingDeletePaletteId.value === id) {
        store.deletePalette(id)
        pendingDeletePaletteId.value = null
        clearTimeout(pendingDeletePaletteTimer)
        showToast(`Palette supprimée`, 'warning')
        return
    }
    pendingDeletePaletteId.value = id
    clearTimeout(pendingDeletePaletteTimer)
    pendingDeletePaletteTimer = setTimeout(() => { pendingDeletePaletteId.value = null }, 3000)
}

const extractFromPlaylist = async () => {
    const name = await promptDialog({ title: 'Nouvelle palette', message: 'Donnez un nom à la palette (couleurs du player + de la liste) :', placeholder: 'Nom de la palette' })
    if (!name || !name.trim()) return
    const created = store.saveCurrentAsPalette(name.trim())
    if (created) showToast(`Palette "<strong>${created.name}</strong>" créée (couleurs actuelles)`, 'success')
    else showToast('Impossible de créer la palette', 'warning')
}

// Aperçu compact des couleurs player d'une palette (sous-ensemble représentatif)
const PLAYER_PREVIEW_KEYS = ['bgColor', 'playerBgColor', 'playerTitleColor', 'playerBtnPlayColor', 'playerBtnStopColor']
// Libellés (tooltips) pour l'édition des couleurs player d'une palette perso
const PLAYER_COLOR_LABELS = {
    bgColor: 'Fond de la page',
    playerBgColor: 'Fond du bloc titre',
    playerElmtsColor: 'Éléments du titre',
    playerTitleColor: 'Titre',
    playerBtnPlayColor: 'Play : fond',
    playerBtnPlayIconColor: 'Play : icone',
    playerBtnStopColor: 'Stop : fond',
    playerBtnStopColorInactif: 'Stop : fond (inactif)',
    playerBtnStopIconColor: 'Stop : icone',
    playerBtnStopIconColorInactif: 'Stop : icone (inactif)'
}

// Panneau d'options d'une palette (déplié via l'engrenage, un seul à la fois)
const optionsOpenId = ref(null)
const togglePaletteOptions = (id) => {
    optionsOpenId.value = optionsOpenId.value === id ? null : id
    editingColorsId.value = null
}

// Édition des couleurs d'une palette perso (déplie un éditeur sous les options)
const editingColorsId = ref(null)
const toggleEditColors = (id) => {
    editingColorsId.value = editingColorsId.value === id ? null : id
}

// Générateur de palettes : couleur principale + harmonie -> couleurs de la
// liste ET du player, appliquées en direct à chaque interaction (barres
// cliquables, couleur principale, mode, aléatoire). « Enregistrer » fige
// exactement ce qui est affiché.
const genBaseColor = ref('#3b82f6')
const genHarmony = ref('analogous')
const genColors = ref(generatePalette(genBaseColor.value, genHarmony.value))
const genPlayer = ref(playerColorsFromBase(genBaseColor.value, genHarmony.value))

const applyGen = () => {
    store.applyPaletteData({ player: genPlayer.value, colors: genColors.value })
}
const regenerate = () => {
    genColors.value = generatePalette(genBaseColor.value, genHarmony.value)
    genPlayer.value = playerColorsFromBase(genBaseColor.value, genHarmony.value)
    applyGen()
}
const setGenBase = (color) => { genBaseColor.value = color; regenerate() }
const setGenHarmony = (h) => { genHarmony.value = h; regenerate() }
const editGenColor = (i, color) => { genColors.value[i] = color; applyGen() }
const editGenPlayerColor = (k, color) => { genPlayer.value[k] = color; applyGen() }

const applyRandomPalette = () => {
    genBaseColor.value = hslToHex(Math.floor(Math.random() * 360), 50 + Math.random() * 30, 45 + Math.random() * 15)
    genHarmony.value = HARMONIES[Math.floor(Math.random() * HARMONIES.length)].id
    regenerate()
}

const saveGeneratedPalette = async () => {
    const defaultName = HARMONIES.find(h => h.id === genHarmony.value)?.name || 'Générée'
    const name = await promptDialog({ title: 'Nouvelle palette', message: 'Donnez un nom à la palette générée :', defaultValue: defaultName, placeholder: 'Nom de la palette' })
    if (!name || !name.trim()) return
    const created = store.savePalette({ name: name.trim(), colors: [...genColors.value], player: { ...genPlayer.value } })
    if (created) showToast(`Palette "<strong>${created.name}</strong>" créée`, 'success')
}

// ============================================================
// Thèmes
// ============================================================
const newThemeName = ref('')
const pendingDeleteThemeId = ref(null)
let pendingDeleteThemeTimer = null

const applyThemeAction = (themeId) => {
    store.applyTheme(themeId)
    const theme = store.themes.find(t => t.id === themeId)
    if (theme) showToast(`Thème "<strong>${theme.name}</strong>" appliqué`, 'info')
}

const applyRandomTheme = () => {
    const t = randomTheme(listePolice)
    for (const [k, v] of Object.entries(t)) updateOptions(k, v)
    showToast('Thème aléatoire appliqué — sauvegardez-le s\'il vous plaît !', 'info')
}

const saveCurrentTheme = () => {
    const name = newThemeName.value.trim()
    if (!name) return
    const created = store.saveCurrentAsTheme(name)
    if (created) {
        newThemeName.value = ''
        showToast(`Thème "<strong>${created.name}</strong>" sauvegardé`, 'success')
    }
}

const askRename = async (theme) => {
    const next = await promptDialog({ title: 'Renommer le thème', defaultValue: theme.name, placeholder: 'Nom du thème' })
    if (next && next.trim() && next.trim() !== theme.name) {
        store.renameTheme(theme.id, next)
        showToast(`Thème renommé en "<strong>${next.trim()}</strong>"`, 'info')
    }
}

const confirmDeleteTheme = (id) => {
    if (pendingDeleteThemeId.value === id) {
        store.deleteTheme(id)
        pendingDeleteThemeId.value = null
        clearTimeout(pendingDeleteThemeTimer)
        showToast(`Thème supprimé`, 'warning')
        return
    }
    pendingDeleteThemeId.value = id
    clearTimeout(pendingDeleteThemeTimer)
    pendingDeleteThemeTimer = setTimeout(() => { pendingDeleteThemeId.value = null }, 3000)
}
</script>

<style scoped>
select:focus,
input:focus {
    box-shadow: none !important;
    border-color: rgb(222, 226, 230) !important;
}
</style>
