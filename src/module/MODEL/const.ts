import { CardType } from "./types";
export const kinka: CardType = {
  organization_type: "union",
  bird_type: "kinka",
  assets: {
    card_bg: "cardBG.png",
    default_photo: "dot_kinka.png",
  },
  colors: {
    card_info_font: "#4a2d13",
    default_photo_bg: "#ffc107",
  },
  theme: {
    primary: "#ff9800",
    secondary: "#ffc107",
    accent: "#4a2d13",
  },
} as const;

export const buncho: CardType = {
  organization_type: "rengo",
  bird_type: "buncho",
  assets: {
    card_bg: "cardBG_bun.png",
    default_photo: "dot_kinka.png",
  },
  colors: {
    card_info_font: "#666",
    default_photo_bg: "#ff9999",
  },
  theme: {
    primary: "#F3614F",
    secondary: "#ff9999",
    accent: "#666",
  },
} as const;
