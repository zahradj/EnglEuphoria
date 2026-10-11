import { navTranslations } from './nav';
import { dashboardUITranslations } from './dashboardUI';
import { placementTranslations } from './placement';
import { authUiTranslations } from './authUi';
import { waitingRoomTranslations } from './waitingRoom';
import { pushNotificationsTranslations } from './pushNotifications';
import { lessonsPageTranslations } from './lessonsPage';
import { academyLessonsTranslations } from './academyLessons';

export const turkishTranslations = {
  ...placementTranslations,
  ...navTranslations,
  ...dashboardUITranslations,
  ...authUiTranslations,
  ...waitingRoomTranslations,
  ...pushNotificationsTranslations,
  ...lessonsPageTranslations,
  ...academyLessonsTranslations,
  welcome: "Hoş geldiniz",
  all: "Hepsi",
};
