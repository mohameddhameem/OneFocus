import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import envUtil from './services/envUtil'

// Validate environment variables
envUtil.validateEnv();

createApp(App).mount('#app')
