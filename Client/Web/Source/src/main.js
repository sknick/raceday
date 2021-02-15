import { createApp } from "vue"

import App from "./app.vue"
import Store from "./store.js"


const app = createApp(App)
app.use(Store)
app.mount("#app")
