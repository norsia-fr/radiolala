import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import 'bootstrap/dist/css/bootstrap.css'
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/css.css'

window.bootstrap = bootstrap

const app = createApp(App)
app.use(createPinia())
app.mount('#app')

console.log.apply(window.console, [
    "\n %c %c ✰ Radiolala ✰ %c %c  Minimalist Radio Player by Norsia  \n\n",
    "background: #000000; padding:5px 0;font-size:2em",
    "color: #000000; background: #ffdf3d; padding:5px 0;font-size:2em",
    "background: #000000; padding:5px 0;font-size:2em",
    "color:white;background: #2e7c94; padding:5px 0; text-shadow:1ox 1px 2px black;font-size:2em"
])

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .catch(err => console.error('Service Worker registration failed:', err))
  })
}
