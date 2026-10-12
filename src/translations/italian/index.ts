import { navTranslations } from './nav';
import { dashboardUITranslations } from './dashboardUI';
import { placementTranslations } from './placement';
import { authUiTranslations } from './authUi';
import { parentReportTranslations } from './parentReport';
import { waitingRoomTranslations } from './waitingRoom';
import { pushNotificationsTranslations } from './pushNotifications';
import { lessonsPageTranslations } from './lessonsPage';
import { academyLessonsTranslations } from './academyLessons';

export const italianTranslations = {
  ...placementTranslations,
  ...navTranslations,
  ...dashboardUITranslations,
  ...authUiTranslations,
  ...parentReportTranslations,
  ...waitingRoomTranslations,
  ...pushNotificationsTranslations,
  ...lessonsPageTranslations,
  ...academyLessonsTranslations,
  welcome: "Benvenuto",
  all: "Tutti",
};
