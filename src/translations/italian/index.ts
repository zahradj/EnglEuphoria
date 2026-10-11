import { navTranslations } from './nav';
import { dashboardUITranslations } from './dashboardUI';
import { placementTranslations } from './placement';
import { authUiTranslations } from './authUi';
import { waitingRoomTranslations } from './waitingRoom';
import { lessonsPageTranslations } from './lessonsPage';
import { academyLessonsTranslations } from './academyLessons';

export const italianTranslations = {
  ...placementTranslations,
  ...navTranslations,
  ...dashboardUITranslations,
  ...authUiTranslations,
  ...waitingRoomTranslations,
  ...lessonsPageTranslations,
  ...academyLessonsTranslations,
  welcome: "Benvenuto",
  all: "Tutti",
};
