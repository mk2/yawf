import Vue from "vue"
import VueRouter from "vue-router"
Vue.use(VueRouter)

import App from "./app.vue"
import Top from "./top.vue"
import About from "./about.vue"

const router = new VueRouter({
  mode: "history",
  routes: [{ path: "/", component: Top }, { path: "/about", component: About }]
})

new Vue({
  el: "#app",
  router,
  render: h => h(App)
})
