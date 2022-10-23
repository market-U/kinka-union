import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import CardMakerView from "../views/CardMakerView.vue";
import UniMakerView from "../views/UniMakerView.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    redirect: "/card/kinka",
  },
  {
    path: "/card/:type",
    name: "home",
    component: CardMakerView,
  },
  {
    path: "/uni",
    name: "uni",
    component: UniMakerView,
  },
  {
    path: "/card/uni",
    redirect: "/uni",
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
