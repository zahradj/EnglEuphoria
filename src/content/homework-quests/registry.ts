import { questLines, type HomeworkQuest, type QuestVoice } from './types';
import { QUEST_MAGIC_CASTLE_U9L1 } from './magic-castle-u9l1';
import { QUEST_MAGIC_CASTLE_U9L2 } from './magic-castle-u9l2';
import { QUEST_MAGIC_CASTLE_U9L3 } from './magic-castle-u9l3';
import { QUEST_COLOR_CARNIVAL_U2L1 } from './color-carnival-u2l1';
import { QUEST_WELCOME_TOWN_U1L1 } from './welcome-town-u1l1';
import { QUEST_RAINBOW_MEADOW_U2L2 } from './rainbow-meadow-u2l2';
import { QUEST_SHAPE_TOWN_U2L3 } from './shape-town-u2l3';
import { QUEST_QUESTION_PARTY_U2L4 } from './question-party-u2l4';
import { QUEST_SHELLY_U2L5 } from './shelly-u2l5';
import { QUEST_TREASURE_HUNT_U2L6 } from './treasure-hunt-u2l6';
import { QUEST_TOY_BOX_U3L1 } from './toy-box-u3l1';
import { QUEST_LEO_STAR_U1L5 } from './leo-star-u1l5';
import { QUEST_FOREST_HELLOS_U1L1 } from './forest-hellos-u1l1';
import { QUEST_NAME_CARNIVAL_U1L2 } from './name-carnival-u1l2';
import { QUEST_HOW_ARE_YOU_U1L3 } from './how-are-you-u1l3';
import { QUEST_BIRTHDAY_U1L4 } from './birthday-u1l4';
import { QUEST_TROPHY_TRAIL_U1L6 } from './trophy-trail-u1l6';
import { QUEST_TOY_SHELF_U3L2 } from './toy-shelf-u3l2';
import { QUEST_KITE_PARK_U3L3 } from './kite-park-u3l3';
import { QUEST_SHOW_TELL_U3L4 } from './show-tell-u3l4';
import { QUEST_TIDY_UP_U3L5 } from './tidy-up-u3l5';
import { QUEST_TOY_FAIR_U3L6 } from './toy-fair-u3l6';
import { QUEST_DANCE_CLASS_U4L1 } from './dance-class-u4l1';
import { QUEST_PANCAKE_FACE_U4L2 } from './pancake-face-u4l2';
import { QUEST_BEACH_DAY_U4L3 } from './beach-day-u4l3';
import { QUEST_FAMILY_HOME_U5L1 } from './family-home-u5l1';
import { QUEST_FEELINGS_CLASS_WT_U1L2 } from './feelings-class-wt-u1l2';
import { QUEST_LISTEN_GREET_WT_U1L3 } from './listen-greet-wt-u1l3';
import { QUEST_MEET_FRIEND_WT_U1L4 } from './meet-friend-wt-u1l4';
import { QUEST_MY_DAY_A2_U1L1 } from './my-day-a2-u1l1';
import { QUEST_MY_WEEK_A2_U1L2 } from './my-week-a2-u1l2';
import { QUEST_YESTERDAY_A2_U1L3 } from './yesterday-a2-u1l3';
import { QUEST_JUNGLE_FRIENDS_A1_U2L1 } from './jungle-friends-a1-u2l1';
import { QUEST_MONSTER_GARDEN_U4L4 } from './monster-garden-u4l4';
import { QUEST_ANIMAL_PARK_U4L5 } from './animal-park-u4l5';
import { QUEST_SPACE_STATION_U4L6 } from './space-station-u4l6';
import { QUEST_FAMILY_PHOTO_U5L2 } from './family-photo-u5l2';
import { QUEST_COTTAGE_VISIT_U5L3 } from './cottage-visit-u5l3';
import { QUEST_FAMILY_TREE_U5L4 } from './family-tree-u5l4';
import { QUEST_DAY_WITH_DAD_U5L5 } from './day-with-dad-u5l5';
import { QUEST_FAMILY_SHOW_U5L6 } from './family-show-u5l6';
import { QUEST_HOUSE_TOUR_U6L1 } from './house-tour-u6l1';
import { QUEST_MOVING_DAY_U6L2 } from './moving-day-u6l2';

/** Every Homework Quest, by id (also the URL /homework-quest/<id>). */
export const HOMEWORK_QUESTS: Record<string, HomeworkQuest> = Object.fromEntries(
  [QUEST_MAGIC_CASTLE_U9L1, QUEST_MAGIC_CASTLE_U9L2, QUEST_MAGIC_CASTLE_U9L3, QUEST_COLOR_CARNIVAL_U2L1, QUEST_WELCOME_TOWN_U1L1, QUEST_RAINBOW_MEADOW_U2L2, QUEST_SHAPE_TOWN_U2L3, QUEST_QUESTION_PARTY_U2L4, QUEST_SHELLY_U2L5, QUEST_TREASURE_HUNT_U2L6, QUEST_TOY_BOX_U3L1, QUEST_LEO_STAR_U1L5,
  QUEST_FOREST_HELLOS_U1L1, QUEST_NAME_CARNIVAL_U1L2, QUEST_HOW_ARE_YOU_U1L3, QUEST_BIRTHDAY_U1L4, QUEST_TROPHY_TRAIL_U1L6, QUEST_TOY_SHELF_U3L2, QUEST_KITE_PARK_U3L3, QUEST_SHOW_TELL_U3L4, QUEST_TIDY_UP_U3L5, QUEST_TOY_FAIR_U3L6, QUEST_DANCE_CLASS_U4L1, QUEST_PANCAKE_FACE_U4L2, QUEST_BEACH_DAY_U4L3, QUEST_FAMILY_HOME_U5L1, QUEST_FEELINGS_CLASS_WT_U1L2, QUEST_LISTEN_GREET_WT_U1L3, QUEST_MEET_FRIEND_WT_U1L4, QUEST_MY_DAY_A2_U1L1, QUEST_MY_WEEK_A2_U1L2, QUEST_YESTERDAY_A2_U1L3, QUEST_JUNGLE_FRIENDS_A1_U2L1, QUEST_MONSTER_GARDEN_U4L4, QUEST_ANIMAL_PARK_U4L5, QUEST_SPACE_STATION_U4L6, QUEST_FAMILY_PHOTO_U5L2, QUEST_COTTAGE_VISIT_U5L3, QUEST_FAMILY_TREE_U5L4, QUEST_DAY_WITH_DAD_U5L5, QUEST_FAMILY_SHOW_U5L6, QUEST_HOUSE_TOUR_U6L1, QUEST_MOVING_DAY_U6L2,
].map((q) => [q.id, q]),
);

export const getHomeworkQuest = (id: string): HomeworkQuest | null => HOMEWORK_QUESTS[id] ?? null;

/** The quest that practises a scene lesson (registry key, e.g. 'castle-rich-9-1'). */
export const questForLesson = (lessonKey: string): HomeworkQuest | null =>
  Object.values(HOMEWORK_QUESTS).find((q) => q.lessonKey === lessonKey) ?? null;

/** Every line every quest can say — recorded by scripts/generate-voice-cache.mjs. */
export function allQuestLines(): [QuestVoice, string][] {
  return Object.values(HOMEWORK_QUESTS).flatMap(questLines);
}
