import { createApp } from 'vue'
import Vant from 'vant'
import { ConfigProvider } from 'vant'
import 'vant/lib/index.css'
import '@/styles/vant.css'
import '@/styles/vant-variables.css'
import '@/styles/vant-classes-changed.css'
import '@/styles/tailwind.css'
import '@/styles/main.css'

import App from './App.vue'

createApp(App)
  .use(Vant)
  .use(ConfigProvider)
  .mount('#app')
