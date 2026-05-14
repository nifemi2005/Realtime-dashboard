import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { setupStores } from './stores/setup'

const app = createApp(App)

app.use(createPinia())
setupStores() // ← new: subscribe stores to the WebSocket

app.mount('#app')
