import { createApp } from 'vue'
import { Lazyload, Popup, Swipe, SwipeItem } from 'vant'
import 'vant/lib/index.css'
import './styles.css'
import App from './App.vue'
import router from './router'

createApp(App)
  .use(Lazyload, { lazyComponent: true })
  .use(Popup)
  .use(Swipe)
  .use(SwipeItem)
  .use(router)
  .mount('#app')
