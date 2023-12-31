<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon v-on:click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-card-title class="welcome text-truncate">
        <div>{{ welcomeMessage }}</div>
      </v-card-title>
      <v-spacer></v-spacer>
      <!-- <v-btn href="https://twitter.com/okigirl25" target="_blank" text>
        <span class="mr-2" v-show="!mobile"></span>
        <v-icon>mdi-twitter</v-icon>
      </v-btn> -->
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-on="on" v-bind="attrs" icon>
            <v-icon>mdi-translate</v-icon>
          </v-btn>
        </template>
        <v-list dense rounded>
          <v-list-item-group v-model="selectedLocaleIndex" color="primary" mandatory>
            <v-list-item v-for="l in availableLocales" :key="l" @click="changeLocale(l)">
              <!-- <v-list-item-icon>
                <v-icon>mdi-check</v-icon>
              </v-list-item-icon> -->
              <v-list-item-content>
                <v-list-item-title> {{ $t("lang", l) }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" temporary fixed width="280px">
      <v-list>
        <v-list-item-group color="primary">
          <v-list-item v-for="item in menuItems" :key="`${item.bird_type}`" :to="`/${item.component}${item.bird_type}`">
            <v-list-item-icon
              ><v-img :src="require(`@/assets/${item.assets.default_photo}`)" width="40px"
            /></v-list-item-icon>
            <v-list-item-title>{{
              $t(`organization.${item.organization_type}.name`, { msg: $t(`bird.${item.bird_type}`).toString() })
            }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <template v-slot:append>
        <v-list-item href="https://twitter.com/okigirl25" target="_blank">
          <v-list-item-title>
            <v-icon color="light-blue" class="mr-1">mdi-twitter</v-icon>
            created by でこがーるさん
            <v-icon class="ml-1" dense>mdi-open-in-new</v-icon>
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Murecho:wght@300;500&display=swap");
.welcome {
  font-family: "Murecho", sans-serif;
}
</style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { MODEL } from "./module";
import { CardType } from "./module/MODEL";

@Component
export default class App extends Vue {
  private selectedLocaleIndex = 0;
  private drawer = false;
  private menuItems: CardType[] = [MODEL.kinka, MODEL.buncho, MODEL.hatchan, MODEL.uni, MODEL.ema];
  get mobile(): boolean {
    return this.$vuetify.breakpoint.mobile;
  }
  private changeLocale(locale: string) {
    this.$i18n.locale = locale;
  }
  get availableLocales(): string[] {
    return this.$i18n.availableLocales;
  }
  get welcomeMessage(): string {
    return this.$t("common.welcome_msg", {
      msg: this.$t(`organization.${this.$store.state.cardType.organization_type}.name`, {
        msg: this.$t(`bird.${this.$store.state.cardType.bird_type}`),
      }),
    }).toString();
  }
  created() {
    const i = this.$i18n.availableLocales.indexOf(this.$i18n.locale);
    this.selectedLocaleIndex = i;
  }
}
</script>
