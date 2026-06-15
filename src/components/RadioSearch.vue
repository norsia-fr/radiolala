<template>
  <div class="radio-search w-100">

    <!-- Barre de recherche -->
    <div class="input-group mt-2">
      <input id="recherche" 
        type="text" 
        class="form-control border border-success" 
        placeholder="Rechercher" 
        v-model="searchTerm"
        @keyup.enter="searchRadios"
        >
      <button class="btn btn-success" type="button" @click="searchRadios"><i class="bi-search"></i></button>
      <button class="btn btn-success" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFilters"
        aria-expanded="false" aria-controls="collapseFilters">
        <i class="bi-filter"></i>
      </button>
    </div>

    <!-- Filtres -->
    <div class="collapse" id="collapseFilters">
      <div class="card card-body rounded-top-0 border-top-0 small"> 

        <!-- Limite -->
         <div class="d-flex text-start">

           <select id="selectLimite" class="bg-transparent border-0 me-1 p-0" aria-label="Choix limite" @change="changeLimite">
             <option value="10" selected>10</option>
             <option value="20">20</option>
             <option value="30">30</option>
             <option value="40">40</option>
             <option value="50">50</option>
             <option value="100">100</option>
            </select>

            <label for="selectLimite" class="flex-grow-1">
                résultats maxi
            </label>

        </div>

        <!-- Par pays -->
        <div class="input-group mt-2 align-items-baseline">
          <div class="form-check form-switch text-start mb-0">
            <label for="toggleSelectPays" class="form-check-label me-3 text-success" :class="{ 'fw-bold': parPays }">Par pays:</label>
            <input type="checkbox" class="form-check-input" id="toggleSelectPays" @change="toggleParPays">
            </div>
          <select class="form-select form-select-sm border-0 p-0 ps-2" aria-label="Choix pays" v-model="pays">
            <option value="" selected>Pays</option>
            <option v-for="(nom,code) in countries" :key="code" :value="code">
              {{ nom }}
            </option>
          </select>

        </div>

        <!-- Par langue -->
        <div class="input-group mt-2 align-items-baseline">

          <div class="form-check form-switch text-start mb-0">
            <label for="toggleSelectLangue" class="form-check-label me-3 text-success" :class="{ 'fw-bold': parLangue }">Par langue:</label>
            <input type="checkbox" class="form-check-input" id="toggleSelectLangue" @change="toggleParLangue">
          </div>
          <select class="form-select form-select-sm border-0 p-0 ps-2" aria-label="Choix langue" v-model="langue">
            <option value="" selected>Langue</option>
            <option v-for="(langue, code) in langues" :key="code" :value="code">
              {{ langue }}
            </option>
          </select>

        </div>

        <!-- Par genre -->
        <div class="input-group mt-2 align-items-baseline">
          <div class="form-check form-switch text-start mb-0">
            <label for="toggleSelectGenre" class="form-check-label me-2 text-success" :class="{ 'fw-bold': parGenre }">Par genre</label>
            <input type="checkbox" class="form-check-input" id="toggleSelectGenre" @change="toggleParGenre">
          </div>
          <select class="form-select form-select-sm border-0 p-0 ps-2" aria-label="Choix genre" v-model="genre">
            <option value="" selected>Genre</option>
            <option v-for="(tag) in tags" :key="tag" :value="tag">
              {{ tag }}
            </option>
          </select>
        </div>

        <!-- Https seulement-->
         <div class="form-check form-switch mt-2 text-start">
           <label for="toggleSelectHttps" class="form-check-label me-3" :class="{ 'fw-bold': searchHttps }">https seulement</label>
           <input type="checkbox" class="form-check-input" id="toggleSelectHttps" @change="toggleHttps">
         </div>


      </div>
    </div>

    <!-- Résultats de recherche -->
     <div v-if="searchResults.length > 0"  class="text-center mt-3">

       <ul class="search-results list-group mt-3 list-group-flush text-start">
        <div class="text-center fw-bold mb-2">{{ searchResults.length }} résultats</div>
        
        <li v-for="result in searchResults" :key="result.stationuuid" class="search-result-item list-group-item p-1">
          <div class="d-flex small align-items-start">
            <!-- Btn play radio  -->
            <button 
            :class="['bi-play-circle-fill btn p-0 me-2 pt-2', { 'text-success': audioTemp && audioTemp.src === result.url_resolved  }]" 
            @click="testRadio(result, $event)"
            title="Tester la radio"
            >
            </button>
              
            <!-- Collapse Infos radio  -->
            <div class="flex-grow-1" data-bs-toggle="collapse" :data-bs-target="'#rezid' + result.stationuuid">
                <p class="fw-bold m-0">{{ result.name }}</p>
              <p class="small m-0">{{ result.countrycode }}, {{ result.codec }} {{ result.bitrate }}<span v-if="!result.url_resolved.startsWith('https')" class=" m-0 text-danger">, <i class="bi bi-exclamation-triangle"></i> http</span></p>
            
              <ul :id="'rezid' + result.stationuuid" class="collapse small list-unstyled text-break">
                <li class="d-flex">
                  <span class="fw-bold text-nowrap me-1">Flux: </span>
                  <a class="text-decoration-none flex-grow-1" :href="result.url_resolved" target="_blank" rel="noopener noreferrer">{{ result.url_resolved }}</a>
                </li>
                <li class=""><span class="fw-bold">Site: </span>{{ result.homepage }}</li>
                <li class=""><span class="fw-bold">Pays: </span>{{ result.country }}</li>
                <li class=""><span class="fw-bold">Langue: </span>{{ result.language }}</li>
                <li class=""><span class="fw-bold">Tags: </span>{{ result.tags }}</li>
                <li class=""><span class="fw-bold">Vérifiée le: </span>{{ result.lastchangetime }}</li>
              </ul>             

            </div>
            
            <!-- Btn ajouter radio -->
            <button v-if="result && !isRadioInList(result.stationuuid)" 
            class="bi-plus-circle-fill btn p-0 me-2 pt-2" 
            @click.stop="store.addRadio(result)"
            >
            </button>
            <i v-else class="bi-check-circle-fill text-success btn btn-check p-0 me-2 pt-2"></i> 

          </div>
        </li>
        
      </ul>
      <hr>
    </div>
  
    <div v-else-if="nbrResults === 0" class="text-center mt-3">
      <ul class="list-group list-group-flush mt-3">
      <div class="text-center fw-bold mb-2">Aucune radio trouvée</div>
      <!-- TODO: ajouter "pour la recherche de:" avec la recherche effectuée -->
      </ul>
    </div>

  </div>
  
  <!-- Infos API -->

        <div class="text-start p-3">
          
          <p v-if="!searchUrl" class="mb-1 text-success small">
            <i class="bi bi-info-circle h4 text-success me-2"></i>Lancer une recherche interrogera <a href="https://de1.api.radio-browser.info" class="text-decoration-none" target="_blank">l'API de Radio-browser.com</a>.
          </p>
          <p v-else class="text-break text-success-emphasis small">
            <i class="bi bi-info-circle h4 text-success me-2"></i>Url utilisée pour cette recherche :<br/>
            <a class="text-decoration-none text-success" :href=searchUrl target="_blank">{{ searchUrl }}</a>
          </p>
        </div>


  <!-- Infos https -->
  <div v-if="!searchHttps && searchUrl" class="alert alert-warning border border-5 border-bottom-0 border-end-0 border-top-0 border-warning mb-5 w-100 rounded animate__animated animate__fadeInLeft small text-start" style="outline: 1px solid #f1a733;">
    <i class="bi-exclamation h4 text-warning position-absolute top-0 end-0"></i>
    <a class="text-decoration-none text-warning-emphasis stretched-link text-center pt-3" role="button" data-bs-toggle="collapse" href="#collapseInfosHttps" aria-expanded="false" aria-controls="collapseInfosHttps">
       <span class="m-0 text-danger fw-bold"><i class="bi bi-exclamation-triangle"></i> http</span> indique un flux non sécurisé.
    </a>
    <div class="collapse border-top border-warning mt-3 pt-3" id="collapseInfosHttps">
      <p class="small">
        Pour des raisons de sécurité les navigateurs modernes bloquent les flux non sécurisés. <br/>
        Il est fort probable que par conséquent votre navigateur n'en autorise pas la lecture depuis Radiolala.
      </p>
        <p class="small">
          Pour contourner ce probleme vous pouvez ouvrir le flux dans un nouvel onglet en cliquant sur le lien visible dans les infos de la radio. <br/>
          Vous pouvez aussi tenter de la lire en en modifiant manuellement l'url en ajoutant le 's' de 'https' depuis la fenêtre modale des infos de la radio après l'avoir ajoutée à la liste; mais cela ne fonctionnera que si le flux de la radio est aussi disponible en https.<br/>
          Il est aussi techniquement possible d'autoriser votre navigateur à lire les "mixed content".<br/>
        </p>
        <p class="small">
          Pour plus d'infos, voir <a href="https://developer.mozilla.org/fr/docs/Web/Security/Mixed_content" target="_blank">ici</a>.
        </p>
    </div>
  </div>


</template>

<script setup>
import { ref } from 'vue';
import { useEventListener } from '@vueuse/core';
import { useGlobalStore } from '@/store/globalStore';
import { useDialog } from '@/composables/useDialog';
import searchJson from '@/assets/search.json'

const store = useGlobalStore();
const { alertDialog } = useDialog();
const audioTemp = ref(null);
const searchTerm = ref('');
const searchResults = ref([]);
const nbrResults = ref('0');
const limiteRecherche = ref('10');
const parPays = ref(false);
const pays = ref('');
const parLangue = ref(false);
const langue = ref('');
const parGenre = ref(false);
const genre = ref('');
const searchHttps = ref(false);
const searchUrl = ref('');
const countries = searchJson.pays;
const langues = searchJson.langues;
const tags = searchJson.tags;

const toggleParPays = (event) => {
  parPays.value = event.target.checked;
};

const toggleParLangue = (event) => {
  parLangue.value = event.target.checked;
};

const toggleParGenre = (event) => {
  parGenre.value = event.target.checked;
};

const changeLimite = (event) => {
  limiteRecherche.value = event.target.value;
};

const toggleHttps = (event) => {
  searchHttps.value = event.target.checked;
};

// rechercher
const searchRadios = async () => {
  let url = `https://de1.api.radio-browser.info/json/stations/search?name=${searchTerm.value}&hidebroken=true`;

  if (parPays.value && pays.value) {
    url += `&countrycode=${pays.value}`;
  }
  if (parLangue.value && langue.value) {
    url += `&language=${langue.value}`;
  }
  if (parGenre.value && genre.value) {
    url += `&tag=${genre.value}`;
  }
  if (limiteRecherche.value) {
    url += `&limit=${limiteRecherche.value}`;
  }
  if (searchHttps.value) {
    url += `&is_https=true`;
  }

  searchUrl.value = url;

  try {
    const response = await fetch(url);
    const data = await response.json();
    nbrResults.value = data.length;
    searchResults.value = data;
  } catch (error) {
    console.error('Erreur lors de la recherche des radios:', error);
  }
};

const testRadio = (radio, event) => {
  event.stopPropagation();
  // Si une instance audio existe déjà, on l'arrête
  if (audioTemp.value) {
    audioTemp.value.pause();
    audioTemp.value.currentTime = 0;
    audioTemp.value.src = "";
  }

  // Créer une nouvelle instance Audio
  audioTemp.value = new Audio(radio.url_resolved);
  audioTemp.value.play().catch((error) => {
    // AbortError = lecture interrompue par un nouveau test ou un arrêt (pause/src
    // vidé avant que play() ait résolu) : c'est volontaire, pas une vraie erreur.
    if (error?.name === 'AbortError') return;
    alertDialog({ title: 'Erreur audio', message: `Impossible de lire ce flux : ${error?.message ?? error}`, variant: 'danger' });
  });
};

const stopRadio = () => {
  if (audioTemp.value) {
    audioTemp.value.pause();
    audioTemp.value.currentTime = 0;
    audioTemp.value.src = "";
    audioTemp.value = null;
  }
};

const handleClick = () => {
  // Appeler stopRadio uniquement si l'audio est en cours de lecture
  if (audioTemp.value && !audioTemp.value.paused) {
    stopRadio();
  }
};

// radio est déjà dans la liste
const isRadioInList = (lid) => {
  return store.radios.some(radio => radio.id === lid);
};

const handleKeydown = (event) => {
  if (event.key === 'Escape') handleClick();
};

useEventListener(document, 'keydown', handleKeydown);
useEventListener(document, 'click', handleClick);
</script>


<style scoped>
select.selectLimite {
  width: fit-content;
}

select.selectLimite:focus,
select.selectLimite:focus-visible,
#recherche:focus,
#recherche:focus-visible {
  box-shadow: none;
  outline: none;
  border: initial;
}
</style>
