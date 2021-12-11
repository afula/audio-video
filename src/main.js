import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { createRouter, createWebHashHistory } from 'vue-router'
import 'element-plus/dist/index.css'
import Home from './components/Home.vue'
import Main from './components/Main.vue'
import App from './App.vue'

const routes = [{
        path: '/',
        component: Main
    },
    {
        path: '/home/:videoUrl',
        name: 'home',
        component: Home
    },
]


const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHashHistory(),
    routes, // short for `routes: routes`
})
const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.mount('#app')