import type { SeasonArc } from './types';

/** Hand-written A1 Season arcs, keyed by Season id (e.g. 'A1-S01'). */
export const A1_ARCS: Record<string, SeasonArc> = {
  // Who Are You? - online profiles and meeting people
  'A1-S01': {
    essentialQuestion: 'How can I introduce myself and ask someone the same?',
    chapters: [
      { title: 'The fake profile', question: 'Which details in these online profiles look wrong?', step: 'Recognise: read and hear a profile and spot the odd detail (gist, names and countries known from school)' },
      { title: 'What goes on a profile?', question: 'Which personal information words and numbers do I need for a profile?', step: 'Controlled: say and use the words with picture and first-language support' },
      { title: 'Am, is or are?', question: 'How do I say who I am and answer What and Where questions as chunks?', step: 'Controlled: build correct sentences with be in full sentence frames' },
      { title: 'Say hello, ask back', question: 'How do I use greeting words, introducing myself and asking someone the same?', step: 'Guided: a short greeting exchange with a partner, frames still visible' },
      { title: 'Spell it out', question: 'What do longer online profiles and a spelling of a name tell me about a person?', step: 'More input: a longer profile and a spelled-out name, find the exact details' },
      { title: 'My profile, my world', question: 'Which online profiles and personal information do I want to show in the world I chose?', step: 'Free choice: my own profile details in my own words, with the frames as a floor' },
      { title: 'Remix: who is who?', question: 'Can I use every greeting, number and question so far without help?', step: 'Fluency on known language only: quick profile questions, no frames' },
      { title: 'My profile card', question: 'How can I introduce myself and ask someone the same?', step: 'Release: the hardest task, a profile card plus a 30-second voice introduction' },
    ],
  },

  // My Room, My Stuff - rooms, gadgets and where things are
  'A1-S02': {
    essentialQuestion: 'How can I say what is in my room and where things are?',
    chapters: [
      { title: 'The vanishing charger', question: 'Where could the charger be, judging by the room in the clip?', step: 'Recognise: follow a room tour and gist of where the clues point' },
      { title: 'Room, desk, charger', question: 'Which furniture and gadget words go together in a room like this?', step: 'Controlled: say and use words that appear in the same room situation' },
      { title: 'There is, there are', question: 'How do I say what there is in a room, with a, an and plural nouns?', step: 'Controlled: build correct sentences with there is / there are' },
      { title: 'Where is it?', question: 'How do I ask where something is and answer with a place word?', step: 'Guided: ask and answer about a room with a partner' },
      { title: 'Follow the clues', question: 'What do the details in a longer room description tell me about where things are?', step: 'More input: a longer description, then place each object from the details' },
      { title: 'Design my space', question: 'What is in my own room, in the world I chose, and where is it?', step: 'Free choice: my own room, objects and colours in my own words' },
      { title: 'Remix: find it fast', question: 'Can I name the objects and say where they are without help?', step: 'Fluency on known language only: quick find-it rounds, no frames' },
      { title: 'My room tour', question: 'How can I say what is in my room and where things are?', step: 'Release: the hardest task, a voice-note tour of my room' },
    ],
  },

  // Free Time Club - hobbies and the Club Fair
  'A1-S03': {
    essentialQuestion: 'How can I talk about what I like doing and ask others?',
    chapters: [
      { title: 'Three members by Friday', question: 'Which club could each person at the Fair join?', step: 'Recognise: listen to people at the Club Fair and match each to a hobby (gist)' },
      { title: 'What do clubs do?', question: 'Which hobby, sport and music words belong to a club fair?', step: 'Controlled: say and use hobby words that go together at a fair' },
      { title: 'I like playing', question: 'How do I say what I like, love or hate doing, with present simple?', step: 'Controlled: build correct sentences with like + -ing' },
      { title: 'Ask about interests', question: 'How do I ask a classmate what they like doing and react to the answer?', step: 'Guided: a short interests exchange with a partner' },
      { title: 'Who joins which club?', question: 'What do the details of a longer club description tell me about who it suits?', step: 'More input: a longer text or recording, then choose the right club from the details' },
      { title: 'My club, my skin', question: 'Which free-time activities matter to me in the world I chose?', step: 'Free choice: my own hobbies and clubs in my own words' },
      { title: 'Remix: club speed round', question: 'Can I talk about hobbies, likes and dislikes without help?', step: 'Fluency on known language only: rapid likes and dislikes, no frames' },
      { title: 'Pitch my club', question: 'How can I talk about what I like doing and ask others?', step: 'Release: the hardest task, a 45-second pitch for a club I would start' },
    ],
  },

  // Cafe Night - food, drinks and ordering
  'A1-S04': {
    essentialQuestion: 'How can I order food and drink politely and understand the price?',
    chapters: [
      { title: 'One night, tiny budget', question: 'What are the customers asking for at the pop-up café?', step: 'Recognise: hear orders at the café counter and get the gist of who wants what' },
      { title: 'Menu and prices', question: 'Which food and drink words and prices belong on a café menu?', step: 'Controlled: say and use menu words and prices together, not a list of one kind' },
      { title: 'Some, any, I\'d like', question: 'How do I say what I want and what I have not got, with some and any?', step: 'Controlled: build correct sentences with some / any and I\'d like as a chunk' },
      { title: 'At the counter', question: 'How do I order politely and ask how much it is?', step: 'Guided: a short ordering exchange, customer and server, with a partner' },
      { title: 'Read the whole menu', question: 'What do the details of a longer menu or order tell me about the total price?', step: 'More input: a longer menu and orders, then work out what is ordered and the price' },
      { title: 'My menu, my world', question: 'What food and drink would I serve in the world I chose?', step: 'Free choice: my own menu items and prices in my own words' },
      { title: 'Remix: rush hour', question: 'Can I take and place orders at speed without help?', step: 'Fluency on known language only: a fast order round, no frames' },
      { title: 'Open the café', question: 'How can I order food and drink politely and understand the price?', step: 'Release: the hardest task, a short café role-play with my own menu' },
    ],
  },

  // A Day in My Life - daily routines and the school day
  'A1-S05': {
    essentialQuestion: 'How can I say what I do every day and at what time?',
    chapters: [
      { title: 'Whose day is better?', question: 'What does Mia do in her day, and when?', step: 'Recognise: follow a day-in-my-life vlog and get the gist of the order of events' },
      { title: 'Morning to night', question: 'Which routine verbs and times of day go together in one school day?', step: 'Controlled: say and use routine words in the order of a day, with the time' },
      { title: 'He gets up, she goes', question: 'How do I say what I and other people do, with the third-person -s?', step: 'Controlled: build correct sentences with present simple, including he / she' },
      { title: 'How often, what time?', question: 'How do I ask about someone\'s routine and say how often I do things?', step: 'Guided: ask and answer about a daily routine with a partner, with frequency adverbs' },
      { title: 'A whole timetable', question: 'What do the details of a longer school-day text tell me about a person\'s week?', step: 'More input: a longer timetable text, then pick out times and routines' },
      { title: 'My day, my world', question: 'What does a normal day look like in the world I chose?', step: 'Free choice: my own routine, times and subjects in my own words' },
      { title: 'Remix: the time check', question: 'Can I tell the time and describe a routine without help?', step: 'Fluency on known language only: rapid routine and time questions, no frames' },
      { title: 'Film my day', question: 'How can I say what I do every day and at what time?', step: 'Release: the hardest task, a short vlog script and recording of my day' },
    ],
  },

  // Family and Friends - people close to me
  'A1-S06': {
    essentialQuestion: 'How can I describe the people in my life and what they have?',
    chapters: [
      { title: 'The photo with no names', question: 'Who could be who in the family photo?', step: 'Recognise: listen to clues and match people in a photo to roles (gist)' },
      { title: 'Family and faces', question: 'Which family words and appearance words go together when I describe a person?', step: 'Controlled: say and use family, age and appearance words that co-occur in one description' },
      { title: 'Has got, has not', question: 'How do I say what people have and whose things they are?', step: 'Controlled: build correct sentences with have got and possessive \'s' },
      { title: 'Who is that?', question: 'How do I ask about a person and describe them to a partner?', step: 'Guided: a describe-and-guess exchange about people with a partner, with him / her / them' },
      { title: 'Work out who is who', question: 'What do the details of a longer description of a family tell me?', step: 'More input: a longer family description, then place each person on the tree from the details' },
      { title: 'My people, my angle', question: 'Who are the people close to me in the world I chose?', step: 'Free choice: my own family or friends in my own words' },
      { title: 'Remix: guess my friend', question: 'Can I describe any person and say what they have without help?', step: 'Fluency on known language only: a describe-and-guess round, no frames' },
      { title: 'My family tree', question: 'How can I describe the people in my life and what they have?', step: 'Release: the hardest task, a family or friends tree with a spoken description of three people' },
    ],
  },

  // Treasure Map Town - places in town and giving directions
  'A1-S07': {
    essentialQuestion: 'How can I find a place in town and give directions to it?',
    chapters: [
      { title: 'Vee\'s hidden treasure', question: 'Which route on the map do the directions describe?', step: 'Recognise: hear directions and trace the route on a map (gist)' },
      { title: 'Streets and landmarks', question: 'Which places in town, landmarks and transport words appear on one route?', step: 'Controlled: say and use place words that sit on the same map' },
      { title: 'Turn left, go along', question: 'How do I give a direction with an imperative and a movement word?', step: 'Controlled: build correct instructions with imperatives and to / along / across' },
      { title: 'Excuse me, where is...?', question: 'How do I ask where a place is and give the directions to a partner?', step: 'Guided: a short asking-and-giving exchange with a partner at a map' },
      { title: 'Read the whole route', question: 'What do the details of a longer set of directions tell me about where I end up?', step: 'More input: a longer route, then follow it and name the final place' },
      { title: 'My town, my map', question: 'Which places would I show a friend in the world I chose?', step: 'Free choice: my own map, places and route in my own words' },
      { title: 'Remix: lost in town', question: 'Can I ask for and give directions without help?', step: 'Fluency on known language only: lost-in-town rounds, no frames' },
      { title: 'Lead a friend', question: 'How can I find a place in town and give directions to it?', step: 'Release: the hardest task, a voice guide that leads a friend to a hidden place' },
    ],
  },

  // Can Do! - talents and abilities
  'A1-S08': {
    essentialQuestion: 'How can I say what I can and cannot do, and ask others?',
    chapters: [
      { title: 'The secret entry', question: 'What talents and abilities does each friend have before the show?', step: 'Recognise: hear friends talk about talents and match each to a skill (gist)' },
      { title: 'Skills and stage', question: 'Which common verbs of action, sports and performing arts go with a talent show?', step: 'Controlled: say and use words that belong to one stage situation' },
      { title: 'Can and can\'t', question: 'How do I talk about ability, what I can and cannot do, so the vowel carries the meaning?', step: 'Controlled: build correct sentences with can / can\'t, listening for the vowel' },
      { title: 'Can you...? Help me', question: 'How do I ask what someone can do, and ask for or give help (asking and giving)?', step: 'Guided: a short ability-and-help exchange with a partner' },
      { title: 'And, but, a longer act', question: 'What do the details of a longer text about skills tell me, with simple linking ideas?', step: 'More input and linking: a longer text with and / but, find who can and cannot do what' },
      { title: 'My talent, my skin', question: 'Which talents and abilities do I want to show in the world I chose?', step: 'Free choice: my own talents in my own words, with linking' },
      { title: 'Remix: the talent quiz', question: 'Can I talk about abilities and link two ideas without help?', step: 'Fluency on known language only: a rapid ability quiz, no frames' },
      { title: 'My talent card', question: 'How can I say what I can and cannot do, and ask others?', step: 'Release: the hardest task, a talent card with one demonstration' },
    ],
  },

  // Market Day - clothes, shopping and money
  'A1-S09': {
    essentialQuestion: 'How can I ask the price and say which thing I want to buy?',
    chapters: [
      { title: 'Ten pounds to spend', question: 'What does Ava want to buy at the vintage market, and for how much?', step: 'Recognise: hear stall chatter and get the gist of items and prices' },
      { title: 'Stalls, sizes, prices', question: 'Which clothes, sizes and money words go together at a market stall?', step: 'Controlled: say and use clothes, size and money words that share one stall' },
      { title: 'This one, those ones', question: 'How do I point to things and say which one I mean with this / that / these / those?', step: 'Controlled: build correct sentences with demonstratives, near and far' },
      { title: 'How much is it?', question: 'How do I ask how much something is and say what I want to buy?', step: 'Guided: a short buyer-and-seller exchange with a partner' },
      { title: 'Compare the stalls', question: 'What do the details of a longer market text tell me about the best price?', step: 'More input: prices and sizes across several stalls, choose the best offer' },
      { title: 'My stall, my world', question: 'What would I sell or buy in the market of the world I chose?', step: 'Free choice: my own stall, items and prices in my own words' },
      { title: 'Remix: bargain round', question: 'Can I buy and sell with prices without help?', step: 'Fluency on known language only: a fast shopping round, teens and tens, no frames' },
      { title: 'Open the stall', question: 'How can I ask the price and say which thing I want to buy?', step: 'Release: the hardest task, a market role-play, buying and selling with prices' },
    ],
  },

  // Right Now - what is happening now: a live stream
  'A1-S10': {
    essentialQuestion: 'How can I say what is happening right now and ask about it?',
    chapters: [
      { title: 'Going live', question: 'What is happening in the town square right now?', step: 'Recognise: watch a live stream and get the gist of what people are doing' },
      { title: 'Square, weather, crowd', question: 'Which action, weather and event words appear in one live scene?', step: 'Controlled: say and use words that fit the same live situation' },
      { title: 'She is dancing', question: 'How do I say what is happening at this moment with present continuous?', step: 'Controlled: build correct sentences with am / is / are + -ing' },
      { title: 'What, where, why?', question: 'How do I ask and answer wh-questions about what is going on?', step: 'Guided: ask and answer wh-questions about a scene with a partner' },
      { title: 'The whole broadcast', question: 'What do the details of a longer live commentary tell me?', step: 'More input: a longer commentary, then answer who, what, where and when from the details' },
      { title: 'My stream, my angle', question: 'What would I commentate on in the world I chose?', step: 'Free choice: my own live scene in my own words' },
      { title: 'Remix: breaking news', question: 'Can I describe a scene and ask about it without help?', step: 'Fluency on known language only: a quick-fire live describe round, no frames' },
      { title: 'On air, right now', question: 'How can I say what is happening right now and ask about it?', step: 'Release: the hardest task, a 60-second live commentary clip' },
    ],
  },

  // Plan the Weekend - days, dates, times and invitations
  'A1-S11': {
    essentialQuestion: 'How can I invite someone, and accept or say no with a day and time?',
    chapters: [
      { title: 'The gaps in the plan', question: 'Which day, time and place are missing from Mia\'s message?', step: 'Recognise: read and hear a message with gaps and find what is missing (gist)' },
      { title: 'Days, dates, tickets', question: 'Which day, date and weekend activity words go together in a plan?', step: 'Controlled: say and use day, date and weekend words from one plan' },
      { title: 'I want to, I need to', question: 'How do I say what I want and need to do, at a time or on a day?', step: 'Controlled: build correct sentences with want / need + to and in / on / at' },
      { title: 'Are you free on Saturday?', question: 'How do I invite someone and accept or politely decline, giving a day and time?', step: 'Guided: a short invitation exchange with a partner, accept and decline' },
      { title: 'A busy week', question: 'What do the details of a longer chat tell me about who is free and when?', step: 'More input: a longer chat about several plans, then find a day that works' },
      { title: 'My weekend, my world', question: 'What would I plan for a weekend in the world I chose?', step: 'Free choice: my own plan, invitation and reply in my own words' },
      { title: 'Remix: no time to lose', question: 'Can I make a plan, invite and reply without help?', step: 'Fluency on known language only: a fast invite-and-reply round, no frames' },
      { title: 'The weekend plan chat', question: 'How can I invite someone, and accept or say no with a day and time?', step: 'Release: the hardest task, a weekend plan chat that invites a friend and replies' },
    ],
  },

  // Lost and Found - belongings, whose is it and describing objects
  'A1-S12': {
    essentialQuestion: 'How can I describe a lost object, say whose it is and give it back?',
    chapters: [
      { title: 'The box with no labels', question: 'Which object in the lost-and-found box does each person describe?', step: 'Recognise: hear descriptions and match them to objects in the box (gist)' },
      { title: 'Bags, watches, sizes', question: 'Which belongings, materials and shape words go together in one description?', step: 'Controlled: say and use belonging, material and shape words that share one object' },
      { title: 'A bag, an old watch', question: 'How do I name my things with a, an, the and plurals?', step: 'Controlled: build correct noun phrases with articles and regular and irregular plurals' },
      { title: 'Whose is it?', question: 'How do I ask whose something is and answer with me, him, her, us or them?', step: 'Guided: a short whose-is-it exchange with a partner using object pronouns' },
      { title: 'Match owner to object', question: 'What do the details of a longer lost-property description tell me about the owner?', step: 'More input: a longer report, then decide whose object it is from the details' },
      { title: 'My belongings, my angle', question: 'What belongings would I describe in the world I chose?', step: 'Free choice: my own object and description in my own words' },
      { title: 'Remix: claim it back', question: 'Can I describe and return an object without help?', step: 'Fluency on known language only: a describe-and-return round, no frames' },
      { title: 'File the report', question: 'How can I describe a lost object, say whose it is and give it back?', step: 'Release: the hardest task, a lost-property report as a short spoken role-play, with the A1 level check' },
    ],
  },
};
