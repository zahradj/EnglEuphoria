import { navTranslations } from './nav';
import { dashboardUITranslations } from './dashboardUI';
import { placementTranslations } from './placement';

export const turkishTranslations = {
  ...placementTranslations,
  ...navTranslations,
  ...dashboardUITranslations,
  welcome: "Hoş geldiniz",
  all: "Hepsi",
};
