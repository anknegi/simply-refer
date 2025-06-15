import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Vue Router configuration
import { createPinia } from 'pinia'; // Import createPinia
import './assets/main.css'; // Basic global CSS

const app = createApp(App);
const pinia = createPinia(); // Create Pinia instance

app.use(router);
app.use(pinia); // Use Pinia instead of Vuex

app.mount('#app');