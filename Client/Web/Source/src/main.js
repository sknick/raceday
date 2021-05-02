import { createApp } from "vue"

import App from "./app.vue"
import Store from "./store.js"
import router from './router'


const app = createApp(App).use(router)
app.use(Store)
app.mount("#app")
