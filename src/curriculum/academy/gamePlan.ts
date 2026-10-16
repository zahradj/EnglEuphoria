// Games shortlist per Season (owner rule 2026-10-16: "also from the 171 games list" + a video-game mechanic per Season, 2026-10-14).
// STEP 0 of docs/academy-lesson-creation-protocol.md: a shortlist from the catalogue (docs/academy-games-catalog.md, ids 1-171) chosen by the
// Season's structures and theme, plus ONE video-game mechanic (docs/academy-video-game-mechanics.md) and the signature game.
// It is NOT the internet search: every lesson still does the deep search (>= 5 candidates, >= 3 source families, alignment test) when it is created.
// Self-contained: imports nothing outside src/curriculum/academy/.

export interface SeasonGamePlan {
  /** catalogue ids (1-171), each listed for the Season's CEFR level; the lesson picks from these and adds new finds */
  catalogue: readonly number[];
  /** the video-game mechanic borrowed for the Season (exact name in docs/academy-video-game-mechanics.md) */
  mechanic: string;
  /** what the student does in English with that mechanic */
  does: string;
  /** the Season's signature game (a catalogue id) and how it is dressed */
  signature: number;
  signatureNote: string;
  /** always 'catalogue shortlist': the per-lesson internet search is still to be done when each lesson is created */
  research: 'catalogue shortlist';
}

const g = (catalogue: number[], mechanic: string, does: string, signature: number, signatureNote: string): SeasonGamePlan => ({
  catalogue, mechanic, does, signature, signatureNote, research: 'catalogue shortlist',
});

/** Keyed by Season id. All 80 Seasons written (2026-10-16). C1 draws on catalogue ids 172-183 (docs/research/academy-c1-games-research.md). */
export const SEASON_GAMES: Record<string, SeasonGamePlan> = {
  'A1-S01': g([109, 71, 23, 47, 89], 'Dialogue tree', 'Chooses and says introductions (name, age, country); the reply shows whether it sounded friendly', 109, 'Digital Avatar & Bio: builds an avatar and says its profile aloud'),
  'A1-S02': g([28, 15, 40, 6, 62], 'Loot and crafting', 'Collects furniture and objects by name and places each with in / on / under', 28, 'Preposition Maps as a room builder'),
  'A1-S03': g([17, 7, 51, 65, 3], 'Maze collector', 'Collects only the activities a character likes and says “I like … / I don’t like …” at each', 51, '20 Questions about a club member'),
  'A1-S04': g([12, 123, 55, 112, 38], 'Shop / trading sim', 'Orders and serves with “I’d like … / Would you like …?”', 123, 'Cafe Tycoon with polite orders'),
  'A1-S05': g([79, 29, 87, 17, 54], 'Quest log + clue unlock', 'Completes a day of routine quests, each one a sentence with he / she / it + -s', 79, 'Diary Streak of a character’s day'),
  'A1-S06': g([160, 5, 103, 63, 71], 'Skill tree', 'Unlocks the branches of a family tree by describing each person (has got, ’s)', 160, 'Guess Who? with family photos'),
  'A1-S07': g([126, 45, 127, 28, 165], 'Maze collector', 'Follows spoken and written imperatives through a map to collect the treasure', 126, 'Treasure Map Navigator'),
  'A1-S08': g([52, 8, 65, 20, 22], 'Skill tree', 'Unlocks a can-do skill each time it is shown and said (“I can … but I can’t …”)', 52, 'Charades with a describe option'),
  'A1-S09': g([12, 123, 42, 47, 157], 'Sequence memory', 'Repeats growing sequences of prices and numbers (13 / 30) with this / that / these / those', 12, 'Vocabulary Shop Sim with price sequences'),
  'A1-S10': g([52, 62, 29, 53, 17], 'Detective board', 'Collects evidence of what people are doing right now and asks wh-questions with be', 53, 'Pictionary with “What are you doing?”'),
  'A1-S11': g([164, 73, 111, 79, 137], 'Board quest', 'Answers to climb a board of weekend plans (want / need to; in / on / at)', 164, 'Snakes and Ladders Quest of a weekend plan'),
  'A1-S12': g([125, 37, 63, 111, 15], 'Dialogue tree', 'Describes a lost object to the desk NPC and chooses replies (a / an / the, it / them)', 125, 'Mystery Object Box at the lost-property desk'),
  'A2-S01': g([79, 71, 21, 50, 18], 'Detective board', 'Collects witness statements about last weekend and places them on a timeline in the past simple', 50, 'Two Truths and a Lie about last weekend'),
  'A2-S02': g([127, 119, 29, 170, 55], 'Dialogue tree', 'Handles travel trouble by choosing and saying past simple questions and answers', 119, 'Branching Story: a trip that goes wrong'),
  'A2-S03': g([65, 25, 1, 12, 104], 'Boss fight (rounds with a weak spot)', 'Wins gadget rounds by comparing two devices with -er, more … than and the best', 25, 'Would You Rather: gadgets'),
  'A2-S04': g([114, 103, 105, 57, 119], 'Skill tree', 'Unlocks a dream by planning it (be going to) and saying why', 114, 'Travel Itinerary Planner'),
  'A2-S05': g([55, 8, 52, 18, 37], 'Dialogue tree', 'Gives advice to a patient NPC with should / shouldn’t and too / enough', 55, 'Role-play Cards: at the doctor'),
  'A2-S06': g([38, 26, 20, 66, 17], 'Tower defence', 'Places the right rule word (must / mustn’t / have to) to stop a rule-breaker', 26, 'Grammar Tower Defense with house-rules signs'),
  'A2-S07': g([112, 123, 4, 7, 122], 'Loot and crafting', 'Collects food items and crafts a recipe card using much / many / a few / a lot of', 122, 'Survival Crafting: a recipe'),
  'A2-S08': g([127, 45, 48, 126, 156], 'Stepping stones', 'Crosses a map by choosing the right preposition or transport phrase', 127, 'Lost in a City'),
  'A2-S09': g([25, 66, 64, 119, 43], 'Board quest', 'Climbs a board of predictions and offers with will / won’t', 66, 'Opinion Line about the future'),
  'A2-S10': g([116, 118, 33, 44, 21], 'Escape room', 'Reads and hears storm clues (was / were + -ing) and uses so / because to open the locks', 116, 'Escape Room: the storm night'),
  'A2-S11': g([59, 105, 8, 162, 55], 'Skill tree', 'Unlocks a dream job by describing how a person works (adverbs of manner)', 59, 'Interview the Expert'),
  'A2-S12': g([114, 108, 66, 119, 25], 'Quest log + clue unlock', 'Completes planning quests with let’s / shall we / how about + -ing', 108, 'Poster / Infographic for an event'),
  'A2-S13': g([55, 12, 48, 112, 123], 'Stealth (quiet path)', 'Picks the polite request (Could you / Can I / May I) to pass each “guard”', 55, 'Role-play Cards: asking politely'),
  'A2-S14': g([71, 18, 44, 116, 118], 'Detective board', 'Spots the unsafe or fake message and says why, using somebody / nothing and the present continuous', 71, 'Chat Message Sim with a fake message'),
  'B1-S01': g([169, 170, 171, 50, 21], 'Achievement log / trophy case', 'Earns a trophy for each experience told with ever / never / been and the past participle', 171, 'Trophy Forge'),
  'B1-S02': g([21, 120, 58, 9, 50], 'Quest log + clue unlock', 'Travels between then and now and says what used to be different', 120, 'Time Traveller Quest'),
  'B1-S03': g([59, 21, 135, 71, 25], 'Speedrun vs own best', 'Repeats a route of for / since / how long questions against his or her own best', 59, 'Interview the Expert with how-long questions'),
  'B1-S04': g([35, 115, 39, 46, 67], 'Rhythm lane', 'Taps the stress and rhythm of a news report while saying present perfect headlines and past simple details', 115, 'News Bulletin Broadcast'),
  'B1-S05': g([24, 26, 25, 119, 17], 'Tower defence', 'Builds if-chains (zero and first conditional) to stop a wave of problems', 24, 'Conditionals Chain'),
  'B1-S06': g([25, 119, 64, 66, 56], 'Dialogue tree', 'Chooses and defends an unreal choice (If I were you …, I would …)', 119, 'Branching Story: what if'),
  'B1-S07': g([27, 31, 39, 122, 98], 'Loot and crafting', 'Follows a product’s journey and says it in the passive (is made, was built)', 122, 'Survival Crafting: made in the world'),
  'B1-S08': g([60, 117, 61, 23, 125], 'Dialogue tree', 'Asks and answers about people and things with who / which / that / where', 60, 'Information Gap Puzzle: who’s who'),
  'B1-S09': g([117, 61, 118, 121, 125], 'Detective board', 'Connects clues and says how sure it is (must / might / can’t)', 117, 'Detective Case File'),
  'B1-S10': g([114, 119, 57, 55, 105], 'Board quest', 'Climbs a board of arrangements (present continuous) and promises (will)', 114, 'Travel Itinerary Planner with promises'),
  'B1-S11': g([56, 66, 107, 10, 17], 'Skill tree', 'Designs and defends a learning machine with gerund and infinitive patterns', 107, 'Design-a-Game: a learning machine'),
  'B1-S12': g([48, 44, 124, 41, 67], 'Stealth (quiet path)', 'Picks the polite indirect question and reports what was said (backshift)', 48, 'Phone Call Role Play'),
  'B1-S13': g([33, 34, 119, 21, 72], 'Quest log + clue unlock', 'Unlocks the next scene by saying which of two past events happened first (past perfect)', 33, 'Interactive Fiction: before the storm'),
  'B1-S14': g([25, 24, 113, 75, 66], 'Skill tree', 'Unlocks wish-list branches by saying what he or she wishes were different', 75, 'Six-Word Story: a wish'),
  'B1-S15': g([55, 73, 56, 114, 66], 'Dialogue tree', 'Handles a study-abroad conversation using mustn’t / don’t have to and although / while', 55, 'Role-play Cards: the exchange office'),
  'B1-S16': g([67, 59, 50, 35, 110], 'Rhythm lane', 'Taps rising and falling tags (confirm or ask) while hosting a mini show', 67, 'Podcast Host'),
  'B1-S17': g([116, 77, 32, 71, 117], 'Escape room', 'Reads and hears reviews and chats (so … that, such … that, -self) to open the locks', 116, 'Escape Room: click with care'),
  'B1-S18': g([123, 112, 64, 55, 10], 'Shop / trading sim', 'Runs a first-pay budget with enough / too / few / little', 123, 'Cafe Tycoon with a budget'),
  'B2-S01': g([57, 59, 135, 71, 25], 'Achievement log / trophy case', 'Earns a trophy for each progress report told with the present perfect continuous (How long have you been …-ing?)', 59, 'Interview the Expert about a long project'),
  'B2-S02': g([119, 33, 24, 25, 113], 'Dialogue tree', 'Replays a choice and says what would have happened if (third conditional) and what he or she wishes had happened', 119, 'Branching Story: what might have been'),
  'B2-S03': g([27, 18, 31, 46, 77], 'Tower defence', 'Places the right passive form (tense + be + participle) to stop an error', 27, 'Transform the Sentence: passive power'),
  'B2-S04': g([41, 124, 61, 44, 67], 'Stealth (quiet path)', 'Reports questions and commands politely (asked if, told me to) to pass each checkpoint', 61, 'Alibi: reporting what each witness said'),
  'B2-S05': g([117, 113, 59, 74, 25], 'Detective board', 'Adds extra information about each suspect with non-defining clauses and commas', 117, 'Detective Case File: who is he anyway?'),
  'B2-S06': g([119, 33, 117, 61, 56], 'Quest log + clue unlock', 'Unlocks each clue by judging a past choice (should have, could have, must have)', 33, 'Interactive Fiction: could have, should have'),
  'B2-S07': g([114, 107, 64, 56, 66], 'Skill tree', 'Unlocks a future skill by predicting what will be happening and what will have happened', 107, 'Design-a-Game: the future city'),
  'B2-S08': g([56, 66, 32, 78, 77], 'Dialogue tree', 'Chooses hedged or direct replies and concedes a point (however, despite, whereas)', 66, 'Opinion Line with hedging'),
  'B2-S09': g([55, 108, 112, 67, 25], 'Shop / trading sim', 'Arranges services (have / get something done) and asks indirect questions', 55, 'Role-play Cards: getting it done'),
  'B2-S10': g([56, 24, 64, 25, 55], 'Board quest', 'Climbs a board of bargains and conditions (unless, as long as, provided that)', 24, 'Conditionals Chain: the bargain'),
  'B2-S11': g([18, 10, 20, 4, 92], 'Maze collector', 'Collects the right pattern (remember to / remembering) and avoids the wrong one', 4, 'Connections with verb patterns'),
  'B2-S12': g([46, 67, 58, 57, 75], 'Rhythm lane', 'Taps the focus stress in a cleft (It was Maria that …; What I need is …)', 67, 'Podcast Host with cleft sentences'),
  'B2-S13': g([74, 75, 27, 78, 11], 'Falling-tile stacker', 'Stacks a long sentence into a compressed one with participle clauses and ellipsis', 75, 'Six-Word Story: cut the words'),
  'B2-S14': g([25, 56, 66, 11, 64], 'Stepping stones', 'Crosses by choosing the right comparison (as … as, the more … the more, so / such … that)', 66, 'Opinion Line with comparisons'),
  'B2-S15': g([41, 44, 124, 61, 67], 'Escape room', 'Hears and reads reports and opens each lock with the right reporting verb pattern', 41, 'Dictogloss of a news report'),
  'B2-S16': g([56, 66, 32, 77, 67], 'Boss fight (rounds with a weak spot)', 'Wins each round of a debate with cohesion markers and a clear signpost', 56, 'Debate Duel with signposting'),
  'B2-S17': g([59, 55, 68, 25, 145], 'Dialogue tree', 'Gives supportive advice (had better, ought to) and states a purpose (so that, in order to)', 55, 'Role-play Cards: supportive advice'),
  'B2-S18': g([114, 55, 105, 77, 66], 'Quest log + clue unlock', 'Completes the quests of a study-abroad plan with preposition + -ing', 114, 'Travel Itinerary Planner: study abroad'),
  'C1-S01': g([172, 173, 179, 181], 'Cross-examination (press / present)', 'Presses a witness statement and presents the contradicting line with a fronted negative (Never had he …, Hardly had she …)', 181, 'Cross-Examination of a witness'),
  'C1-S02': g([181, 182, 178, 183], 'Deduction log (confirm in threes)', 'Fills a log and gives a reason with an inverted conditional (Had the door been locked, …; Should you find …)', 182, 'Deduction Log with Reasons'),
  'C1-S03': g([176, 177, 180, 175], 'Detective board', 'Separates rumour from evidence and says it with It is said that / He is believed to', 176, 'Summarise-in-an-Email of a rumour'),
  'C1-S04': g([178, 183, 173, 174], 'Skill-check dialogue (curated voices)', 'Chooses the formal advice voice and says it with I suggest that he go / I would rather', 183, 'Voice-Option Dialogue'),
  'C1-S05': g([177, 176, 178, 179], 'Falling-tile stacker', 'Stacks verb phrases into compact noun phrases for an academic text', 177, 'Explain It Simply, with noun phrases'),
  'C1-S06': g([179, 172, 174, 173], 'Rhythm lane', 'Taps the stress of fronted and emphatic structures (What matters is …; Not only … but)', 179, 'Pecha Kucha, Six Slides'),
  'C1-S07': g([182, 181, 176, 175], 'Deduction log (confirm in threes)', 'Logs what happened first with Having done … and states the main clause', 182, 'Deduction Log with Reasons'),
  'C1-S08': g([180, 183, 182, 173], 'Skill-check dialogue (curated voices)', 'Chooses the hedged or stance voice (admittedly, arguably, ostensibly) and sees the effect', 180, 'Irony or Sincere? and stance'),
  'C1-S09': g([178, 183, 174, 176], 'Stealth (quiet path)', 'Picks the right register to pass each formal “guard” (email, interview, meeting)', 178, 'Register Shift Rewrite'),
  'C1-S10': g([173, 172, 174, 181], 'Boss fight (rounds with a weak spot)', 'Wins each round with a concession (Granted, …; Much as I …; Strange as it may seem)', 173, 'Concede & Challenge Ladder'),
  'C1-S11': g([183, 182, 175, 180], 'Dialogue tree', 'Judges a past choice with needn’t have / was to / be bound to and sees the character’s reaction', 183, 'Voice-Option Dialogue: judging a choice'),
  'C1-S12': g([177, 178, 176, 179], 'Loot and crafting', 'Collects exact collocations and crafts a precise phrase for each situation', 177, 'Explain It Simply with exact collocations'),
  'C1-S13': g([176, 177, 174, 175], 'Quest log + clue unlock', 'Unlocks each quest by mediating a text or an idea between two worlds', 176, 'Summarise-in-an-Email (mediation)'),
  'C1-S14': g([172, 173, 179, 174], 'Boss fight (rounds with a weak spot)', 'Wins each round of a persuasion duel using a rule of three, a rhetorical question and parallelism', 172, 'Quick Debate Cards'),
  'C1-S15': g([180, 183, 178, 182], 'Skill-check dialogue (curated voices)', 'Chooses the ironic or understated voice and explains the clue', 180, 'Irony or Sincere?'),
  'C1-S16': g([179, 176, 177, 174, 175], 'Achievement log / trophy case', 'Earns a trophy for each portfolio piece with clear signposting', 179, 'Pecha Kucha, Six Slides (the capstone talk)'),
  'C1-S17': g([172, 173, 175, 177, 181], 'Board quest', 'Climbs a board of whatever / however and the more … the more arguments about climate choices', 175, 'Student-led Seminar Questions'),
  'C1-S18': g([179, 174, 176, 183], 'Skill tree', 'Unlocks a final skill by using absolute and participle phrases in a confident close', 174, 'Fishbowl for Two'),
};

export function gamePlanFor(seasonId: string): SeasonGamePlan | undefined {
  return SEASON_GAMES[seasonId];
}

export const SEASON_GAMES_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
