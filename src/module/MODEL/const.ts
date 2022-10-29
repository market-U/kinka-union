import { CardType } from "./types";
export const kinka: CardType = {
  organization_type: "union",
  bird_type: "kinka",
  component: "card/",
  assets: {
    card_bg: "cardBG.png",
    default_photo: "dot_kinka.png",
    logo: "logo_kinka.png",
  },
  colors: {
    card_info_font: "#4a2d13",
    default_photo_bg: "#ffc107",
    title_font: "#fff",
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
  component: "card/",
  assets: {
    card_bg: "cardBG_bun.png",
    default_photo: "dot_bun.png",
    logo: "logo_bun.png",
  },
  colors: {
    card_info_font: "#666",
    default_photo_bg: "#ff9999",
    title_font: "#fff",
  },
  theme: {
    primary: "#F3614F",
    secondary: "#ff9999",
    accent: "#282828",
  },
} as const;

export const hatchan: CardType = {
  organization_type: "hatchan_fan_club",
  bird_type: "hatchan",
  component: "card/",
  assets: {
    card_bg: "cardBG_hatsuki.png",
    default_photo: "dot_hatsuki.png",
    overlay: "frame_hatsuki.png",
  },
  colors: {
    card_info_font: "#6c4228",
    default_photo_bg: "#72c4ba",
    title_font: "#6c4228",
  },
  layout: {
    title_pr: "160px",
  },
  theme: {
    primary: "#72c4ba",
    secondary: "#ff7272",
    accent: "#282828",
  },
} as const;

export const uni: CardType = {
  organization_type: "kaiwai",
  bird_type: "uni",
  component: "",
  assets: {
    card_bg: "cardBG_hatsuki.png",
    default_photo: "unikinka.png",
    overlay: "frame_hatsuki.png",
  },
  colors: {
    card_info_font: "#2b3a68",
    default_photo_bg: "#5881e2",
    title_font: "#2b3a68",
  },
  layout: {
    title_pr: "160px",
  },
  theme: {
    primary: "#5881e2",
    secondary: "#f6e528",
    accent: "#e97878",
  },
} as const;
