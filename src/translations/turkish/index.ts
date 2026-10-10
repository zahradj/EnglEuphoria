import { navTranslations } from './nav';
import { dashboardUITranslations } from './dashboardUI';
import { placementTranslations } from './placement';
import { authUiTranslations } from './authUi';
import { waitingRoomTranslations } from './waitingRoom';
import { lessonsPageTranslations } from './lessonsPage';

export const turkishTranslations = {
  ...placementTranslations,
  ...navTranslations,
  ...dashboardUITranslations,
  ...authUiTranslations,
  ...waitingRoomTranslations,
  ...lessonsPageTranslations,
  welcome: "Hoş geldiniz",
  all: "Hepsi",
};
