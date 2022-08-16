export interface CardType {
  organization_type: string;
  bird_type: string;
  assets: {
    default_photo: string;
    card_bg: string;
    logo: string;
    frame?: string;
  };
  colors: {
    card_info_font: string;
    default_photo_bg: string;
    title_font: string;
  };
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}
