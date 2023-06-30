import Vue from "vue";
import App from "./AppPages.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import VueI18n from "vue-i18n";

Vue.config.productionTip = false;
Vue.use(VueI18n);
const locale = window.navigator.language.slice(0, 2);
export const i18n = new VueI18n({
  locale,
  fallbackLocale: "en",
  messages: {
    ja: require("./assets/messages/ja.json"),
    en: require("./assets/messages/en.json"),
  },
});

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
