<template>
  <v-app>
    <v-app-bar app color="primary" dark>
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
    <v-main>
      <div class="pa-4">
        <v-alert border="left" colored-border type="info" elevation="2">
          <v-card-text>{{ $t("messages.location_moved") }}</v-card-text>
          <v-card-text
            ><a href="https://lively-coast-02dbaee00.3.azurestaticapps.net/">
              https://lively-coast-02dbaee00.3.azurestaticapps.net/
            </a></v-card-text
          >
        </v-alert>
      </div>
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
  private menuItems: CardType[] = [MODEL.kinka, MODEL.buncho, MODEL.hatchan, MODEL.uni];
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
