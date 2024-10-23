export interface CardType {
  organization_type: string;
  bird_type: string;
  component: string;
  assets: {
    default_photo: string;
    card_bg: ReadonlyArray<string>;
    logo?: string;
    overlay?: string;
  };
  colors: {
    card_info_font: string;
    default_photo_bg: string;
    title_font: string;
  };
  layout?: {
    title_pr?: string;
  };
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}
