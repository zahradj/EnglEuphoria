import { navTranslations } from './nav';
import { dashboardUITranslations } from './dashboardUI';
import { placementTranslations } from './placement';
import { authUiTranslations } from './authUi';
import { waitingRoomTranslations } from './waitingRoom';
import { lessonsPageTranslations } from './lessonsPage';

export const italianTranslations = {
  ...placementTranslations,
  ...navTranslations,
  ...dashboardUITranslations,
  ...authUiTranslations,
  ...waitingRoomTranslations,
  ...lessonsPageTranslations,
  welcome: "Benvenuto",
  all: "Tutti",
};
