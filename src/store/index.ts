import { MODEL } from "@/module";
import { CardType } from "@/module/MODEL";
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    title: "",
    cardType: MODEL.kinka,
  },
  getters: {},
  mutations: {
    setTitle(state, title: string) {
      state.title = title;
    },
    setCardType(state, cardType: CardType) {
      state.cardType = cardType;
    },
  },
  actions: {},
  modules: {},
});
