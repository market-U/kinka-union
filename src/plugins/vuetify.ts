import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#ff9800",
        secondary: "#ffc107",
        accent: "#795548",
        error: "#ff5722",
        warning: "#8bc34a",
        info: "#00bcd4",
        success: "#3f51b5",
      },
    },
  },
});
