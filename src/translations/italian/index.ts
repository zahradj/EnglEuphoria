import { navTranslations } from './nav';
import { dashboardUITranslations } from './dashboardUI';
import { placementTranslations } from './placement';
import { authUiTranslations } from './authUi';
import { parentReportTranslations } from './parentReport';
import { waitingRoomTranslations } from './waitingRoom';
import { pushNotificationsTranslations } from './pushNotifications';
import { lessonsPageTranslations } from './lessonsPage';
import { lessonResumeTranslations } from './lessonResume';
import { classroomMediaTranslations } from './classroomMedia';
import { studentScreensTranslations } from './studentScreens';
import { academyLessonsTranslations } from './academyLessons';
import { academyPlayerTranslations } from './academyPlayer';

export const italianTranslations = {
  ...placementTranslations,
  ...navTranslations,
  ...dashboardUITranslations,
  ...authUiTranslations,
  ...parentReportTranslations,
  ...waitingRoomTranslations,
  ...pushNotificationsTranslations,
  ...lessonsPageTranslations,
  ...lessonResumeTranslations,
  ...classroomMediaTranslations,
  ...studentScreensTranslations,
  ...academyLessonsTranslations,
  ...academyPlayerTranslations,
  welcome: "Benvenuto",
  all: "Tutti",
};
