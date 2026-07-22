import { navTranslations } from './nav';
import { dashboardUITranslations } from './dashboardUI';
import { placementTranslations } from './placement';

export const italianTranslations = {
  ...placementTranslations,
  ...navTranslations,
  ...dashboardUITranslations,
  welcome: "Benvenuto",
  all: "Tutti",
};
