import { createApp } from 'vue'
import { Lazyload, Popup } from 'vant'
import 'vant/lib/index.css'
import './styles.css'
import App from './App.vue'

createApp(App).use(Lazyload, { lazyComponent: true }).use(Popup).mount('#app')
